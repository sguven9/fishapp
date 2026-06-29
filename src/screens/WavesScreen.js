import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native';
import * as Location from 'expo-location';
import { fetchMarine, windDirection } from '../utils/api';
import { Storage } from '../utils/storage';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48;
const CHART_HEIGHT = 120;

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const WAVE_TABS = ['≈', '~', '🌊'];
const WAVE_LABELS = ['Waves', 'Swell', 'Wind waves'];

function WaveChart({ data, color = COLORS.primary }) {
  if (!data || data.length === 0) return null;
  const vals = data.map(d => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 0.5;

  return (
    <View style={[styles.chartContainer, { height: CHART_HEIGHT + 40 }]}>
      <View style={styles.chartBg}>
        {[0.4, 0.7, 1.0].map((v, i) => (
          <View key={i} style={[styles.chartGridLine, { bottom: v * (CHART_HEIGHT - 20) }]}>
            <Text style={styles.chartYLabel}>{(min + v * range).toFixed(1)} m</Text>
          </View>
        ))}
        <View style={styles.chartLineArea}>
          {data.slice(0, 24).map((d, i, arr) => {
            const barH = ((d.value - min) / range) * (CHART_HEIGHT * 0.75) + 10;
            const isMarked = d.marked;
            return (
              <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                {isMarked && (
                  <View style={[styles.markedBubble, { bottom: barH + 2 }]}>
                    <Text style={styles.markedText}>◀ {d.value.toFixed(1)} m</Text>
                  </View>
                )}
                <View style={[styles.chartBar, { height: barH, backgroundColor: color + '60' }]} />
              </View>
            );
          })}
        </View>
        <View style={styles.chartXLabels}>
          {['4:00', '8:00', '12:00', '16:00', '20:00'].map((t, i) => (
            <Text key={i} style={styles.chartXLabel}>{t}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function WavesScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marine, setMarine] = useState(null);
  const [location, setLocation] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [waveTab, setWaveTab] = useState(0);

  const loadMarine = async (loc) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMarine(loc.latitude, loc.longitude);
      setMarine(data);
    } catch (e) {
      setError('Marine data unavailable for this location. Try a coastal location.');
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      let loc = await Storage.getForecastLocation();
      if (!loc) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          const [geo] = await Location.reverseGeocodeAsync(pos.coords);
          loc = { name: geo?.city || 'Current', latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } else {
          loc = { name: 'Istanbul', latitude: 41.0082, longitude: 28.9784 };
        }
      }
      setLocation(loc);
      loadMarine(loc);
    })();
  }, []);

  const getDayLabel = (i) => {
    if (!marine?.daily?.time) return WEEK_DAYS[i];
    const d = new Date(marine.daily.time[i]);
    if (i === 0) return 'TODAY';
    return WEEK_DAYS[d.getDay()];
  };

  const getDayDate = (i) => {
    if (!marine?.daily?.time) return (i + 1).toString();
    return new Date(marine.daily.time[i]).getDate().toString();
  };

  const getHourlyWaveData = () => {
    if (!marine?.hourly) return [];
    const dayDate = marine?.daily?.time?.[selectedDay];
    if (!dayDate) return [];
    const dayStr = (dayDate.split('T')[0] || dayDate);
    return marine.hourly.time
      .map((t, i) => ({
        time: t,
        value: marine.hourly.wave_height?.[i] ?? 0,
        swell: marine.hourly.swell_wave_height?.[i] ?? 0,
        marked: i % 24 === 4 || i % 24 === 12 || i % 24 === 20,
      }))
      .filter(h => h.time.startsWith(dayStr));
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (error) return (
    <View style={styles.center}>
      <Text style={styles.waveEmoji}>🌊</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={() => loadMarine(location)} style={styles.retryBtn}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const c = marine?.current;
  const hourlyData = getHourlyWaveData();

  return (
    <View style={styles.container}>
      {/* Day selector */}
      <View style={styles.daySelector}>
        {Array.from({ length: 7 }).map((_, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.dayTab, selectedDay === i && styles.dayTabActive]}
            onPress={() => setSelectedDay(i)}
          >
            <Text style={[styles.dayNum, selectedDay === i && styles.dayTextActive]}>{getDayDate(i)}</Text>
            <Text style={[styles.dayLabel, selectedDay === i && styles.dayTextActive]}>{getDayLabel(i)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll}>
        {/* Current sea conditions */}
        {selectedDay === 0 && c && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Current sea conditions</Text>
              <Text style={styles.locationBadge}>📍 {location?.name}</Text>
            </View>
            <View style={styles.currentRow}>
              <View style={styles.seaTempBlock}>
                <Text style={styles.seaTempIcon}>🌡️</Text>
                <View>
                  <Text style={styles.seaTempLabel}>Sea temperature</Text>
                  <Text style={styles.seaTempValue}>{Math.round(c.sea_surface_temperature || 20)}°</Text>
                </View>
              </View>
              <View style={styles.dividerV} />
              <View style={styles.seaCurrentBlock}>
                <Text style={styles.seaCurrentLabel}>Sea current</Text>
                <Text style={styles.seaCurrentValue}>{(c.ocean_current_velocity || 0).toFixed(1)} m/s</Text>
                <Text style={styles.seaCurrentDir}>
                  {Math.round(c.ocean_current_direction || 0)}° {windDirection(c.ocean_current_direction || 0)} ▶
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Wave data card */}
        <View style={styles.card}>
          <View style={styles.waveTypeTabs}>
            {WAVE_TABS.map((t, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.waveTypeTab, waveTab === i && styles.waveTypeTabActive]}
                onPress={() => setWaveTab(i)}
              >
                <Text style={styles.waveTypeIcon}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.waveMain}>
            <View style={styles.waveVisual}>
              <Text style={styles.waveVisualIcon}>〰〰〰〰〰{'\n'}〰〰〰〰〰</Text>
              <Text style={styles.waveMainLabel}>{WAVE_LABELS[waveTab]}</Text>
              <Text style={styles.waveHeight}>{(c?.wave_height || 0).toFixed(1)} m</Text>
            </View>
            <View style={styles.waveStats}>
              <View style={styles.waveStat}>
                <Text style={styles.waveStatIcon}>⏱️</Text>
                <Text style={styles.waveStatLabel}>Period</Text>
                <Text style={styles.waveStatValue}>{Math.round(c?.wave_period || 0)} s</Text>
              </View>
              <View style={styles.waveStat}>
                <Text style={styles.waveStatIcon}>🧭</Text>
                <Text style={styles.waveStatLabel}>Direction</Text>
                <Text style={styles.waveStatValue}>
                  {Math.round(c?.wave_direction || 0)}° {windDirection(c?.wave_direction || 0)} ◀
                </Text>
              </View>
            </View>
          </View>

          {/* Chart */}
          <WaveChart
            data={hourlyData.map((d, i) => ({
              value: waveTab === 0 ? d.value : d.swell,
              marked: i % 8 === 4,
            }))}
            color={COLORS.primary}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  waveEmoji: { fontSize: 48, marginBottom: 16 },
  errorText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: COLORS.white, fontWeight: 'bold' },
  daySelector: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 6 },
  dayTab: { flex: 1, alignItems: 'center', paddingVertical: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  dayTabActive: { borderBottomColor: COLORS.white },
  dayNum: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 'bold' },
  dayLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  dayTextActive: { color: COLORS.white },
  scroll: { flex: 1 },
  card: { margin: 12, backgroundColor: COLORS.white, borderRadius: 12, padding: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  locationBadge: { fontSize: 13, color: COLORS.text },
  currentRow: { flexDirection: 'row', alignItems: 'center' },
  seaTempBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  seaTempIcon: { fontSize: 28 },
  seaTempLabel: { fontSize: 12, color: COLORS.textSecondary },
  seaTempValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  dividerV: { width: 1, height: 50, backgroundColor: COLORS.border, marginHorizontal: 12 },
  seaCurrentBlock: { flex: 1 },
  seaCurrentLabel: { fontSize: 12, color: COLORS.textSecondary },
  seaCurrentValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  seaCurrentDir: { fontSize: 12, color: COLORS.primary },
  waveTypeTabs: { flexDirection: 'row', marginBottom: 12 },
  waveTypeTab: { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  waveTypeTabActive: { borderBottomColor: COLORS.primary },
  waveTypeIcon: { fontSize: 22 },
  waveMain: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  waveVisual: { flex: 1, alignItems: 'center' },
  waveVisualIcon: { color: '#90CAF9', fontSize: 14, textAlign: 'center', lineHeight: 18 },
  waveMainLabel: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  waveHeight: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, marginTop: 4 },
  waveStats: { flex: 1 },
  waveStat: { marginBottom: 12 },
  waveStatIcon: { fontSize: 18 },
  waveStatLabel: { fontSize: 11, color: COLORS.textSecondary },
  waveStatValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  chartContainer: { marginTop: 8 },
  chartBg: { height: CHART_HEIGHT + 20, backgroundColor: '#EEF5FF', borderRadius: 8, overflow: 'hidden' },
  chartGridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
  chartYLabel: { position: 'absolute', left: 4, top: -8, color: COLORS.textSecondary, fontSize: 9 },
  chartLineArea: { position: 'absolute', bottom: 20, left: 4, right: 4, top: 0, flexDirection: 'row', alignItems: 'flex-end' },
  markedBubble: { position: 'absolute', backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, zIndex: 10 },
  markedText: { color: COLORS.white, fontSize: 9, fontWeight: 'bold' },
  chartBar: { width: '90%', borderRadius: 2, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  chartXLabels: { position: 'absolute', bottom: 0, left: 8, right: 8, flexDirection: 'row', justifyContent: 'space-around' },
  chartXLabel: { color: COLORS.textSecondary, fontSize: 9 },
});
