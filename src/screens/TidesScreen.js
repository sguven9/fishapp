import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native';
import * as Location from 'expo-location';
import { calculateTides, getTodayTideInfo } from '../utils/tideCalc';
import { Storage } from '../utils/storage';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48;
const CHART_HEIGHT = 160;

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function TideChart({ hourly }) {
  if (!hourly || hourly.length === 0) return null;
  const heights = hourly.map(h => h.height);
  const min = Math.min(...heights);
  const max = Math.max(...heights);
  const range = max - min || 0.1;
  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;

  const points = hourly.map((h, i) => {
    const x = (i / (hourly.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - ((h.height - min) / range) * (CHART_HEIGHT * 0.8) - CHART_HEIGHT * 0.1;
    return `${x},${y}`;
  }).join(' ');

  // Current position
  const nowIdx = Math.min(Math.floor(nowHour / 24 * hourly.length), hourly.length - 1);
  const nowX = (nowIdx / (hourly.length - 1)) * CHART_WIDTH;
  const nowY = CHART_HEIGHT - ((heights[nowIdx] - min) / range) * (CHART_HEIGHT * 0.8) - CHART_HEIGHT * 0.1;

  return (
    <View style={{ height: CHART_HEIGHT + 30, marginBottom: 8 }}>
      <View style={{ position: 'relative' }}>
        {/* Simple SVG-like chart using View */}
        <View style={styles.chartArea}>
          {hourly.filter((_, i) => i % 16 === 0).map((h, i, arr) => (
            <View key={i} style={[styles.chartBar, {
              left: (i / Math.max(arr.length - 1, 1)) * CHART_WIDTH,
              height: ((h.height - min) / range) * (CHART_HEIGHT * 0.8) + CHART_HEIGHT * 0.1,
              bottom: 0,
            }]} />
          ))}
        </View>
        {/* Y-axis labels */}
        {[max, (max + min) / 2, min].map((v, i) => (
          <Text key={i} style={[styles.chartYLabel, { top: i * (CHART_HEIGHT * 0.4) }]}>
            {v.toFixed(2)} m
          </Text>
        ))}
        {/* Current time marker */}
        <View style={[styles.nowMarker, { left: nowX }]}>
          <View style={styles.nowDot} />
        </View>
        {/* X-axis labels */}
        <View style={styles.chartXAxis}>
          {['04:00', '08:00', '12:00', '16:00', '20:00'].map((t, i) => (
            <Text key={i} style={styles.chartXLabel}>{t}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function TidesScreen() {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [tideInfo, setTideInfo] = useState(null);
  const [allTides, setAllTides] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [viewMode, setViewMode] = useState('daily'); // daily | overview

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
      const tides = calculateTides(loc.latitude, loc.longitude);
      setAllTides(tides);
      const info = getTodayTideInfo(loc.latitude, loc.longitude);
      setTideInfo(info);
      setLoading(false);
    })();
  }, []);

  const getWeekDays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i - 3);
      return d;
    });
  };

  const getDayLabel = (d) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dc = new Date(d);
    dc.setHours(0, 0, 0, 0);
    if (dc.getTime() === today.getTime()) return 'TODAY';
    return WEEK_DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
  };

  const getMonthGroups = () => {
    const groups = {};
    allTides.slice(1, 32).forEach(td => {
      const m = td.date.getMonth();
      if (!groups[m]) groups[m] = [];
      groups[m].push(td);
    });
    return groups;
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const weekDays = getWeekDays();
  const selDate = weekDays[selectedDay];
  const selTides = allTides.find(t => t.date.toDateString() === selDate.toDateString()) || allTides[1];

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* View mode toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewBtn, viewMode === 'daily' && styles.viewBtnActive]}
          onPress={() => setViewMode('daily')}
        >
          <Text style={styles.viewBtnIcon}>≡</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewBtn, viewMode === 'overview' && styles.viewBtnActive]}
          onPress={() => setViewMode('overview')}
        >
          <Text style={styles.viewBtnIcon}>▦</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationBtn} onPress={() => {}}>
          <Text style={styles.locationBtnIcon}>📍</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'daily' && (
        <>
          {/* Day selector */}
          <View style={styles.daySelector}>
            {weekDays.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dayTab, selectedDay === i && styles.dayTabActive]}
                onPress={() => setSelectedDay(i)}
              >
                <Text style={[styles.dayNum, selectedDay === i && styles.dayTextActive]}>{d.getDate()}</Text>
                <Text style={[styles.dayLabel, selectedDay === i && styles.dayTextActive]}>{getDayLabel(d)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.scroll}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.locationBadge}>📍 {location?.name}</Text>
              </View>

              {/* Chart */}
              <TideChart hourly={selTides?.hourly || []} />

              {/* Fishing icon */}
              <View style={styles.fishIconRow}>
                <Text style={styles.fishIcon}>🎣</Text>
              </View>

              {/* Tide stats */}
              <View style={styles.tideStats}>
                <View style={styles.tideStat}>
                  <Text style={styles.tideStatLabel}>Next low tide</Text>
                  <Text style={styles.tideStatValue}>{tideInfo?.timeToNext || '--'}</Text>
                </View>
                <View style={styles.tideStatCenter}>
                  <Text style={styles.tideStatLabel}>Tide right now</Text>
                  <Text style={styles.tideNowValue}>{tideInfo?.current?.toFixed(2)} m</Text>
                  <Text style={styles.tideTrend}>
                    {tideInfo?.trend === 'rising' ? '⬆️ Rising' : '⬇️ Falling'}
                  </Text>
                </View>
                <View style={styles.tideStat}>
                  <Text style={styles.tideStatLabel}>Tidal current</Text>
                  <Text style={styles.tideStatValue}>{tideInfo?.tidalCurrent?.toFixed(1) || '0'} cm/h</Text>
                </View>
              </View>

              {/* High/Low tide times */}
              {selTides?.highLow && (
                <View style={styles.hlRow}>
                  <View style={styles.hlCol}>
                    <Text style={styles.hlTitle}>Low tide</Text>
                    {selTides.highLow.filter(hl => hl.type === 'low').slice(0, 2).map((hl, i) => (
                      <Text key={i} style={styles.hlTime}>
                        <Text style={styles.hlTimeBold}>{formatTime(hl.time)}</Text>
                        {'  '}{hl.height.toFixed(2)} m
                      </Text>
                    ))}
                  </View>
                  <View style={styles.hlCol}>
                    <Text style={styles.hlTitle}>High tide</Text>
                    {selTides.highLow.filter(hl => hl.type === 'high').slice(0, 2).map((hl, i) => (
                      <Text key={i} style={styles.hlTime}>
                        <Text style={styles.hlTimeBold}>{formatTime(hl.time)}</Text>
                        {'  '}{hl.height.toFixed(2)} m
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </>
      )}

      {viewMode === 'overview' && (
        <ScrollView style={styles.scroll}>
          {Object.entries(getMonthGroups()).map(([month, days]) => (
            <View key={month} style={styles.overviewSection}>
              <View style={styles.overviewHeader}>
                <Text style={styles.overviewMaxLow}>MAX LOW</Text>
                <Text style={styles.overviewMonth}>{MONTHS[parseInt(month)]}</Text>
                <Text style={styles.overviewMaxHigh}>MAX HIGH</Text>
              </View>
              {days.map((td, i) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isToday = td.date.toDateString() === today.toDateString();
                const maxH = td.highLow.length > 0 ? Math.max(...td.highLow.filter(h => h.type === 'high').map(h => h.height)) : 0;
                const minH = td.highLow.length > 0 ? Math.min(...td.highLow.filter(h => h.type === 'low').map(h => h.height)) : 0;
                const dayName = WEEK_DAYS[td.date.getDay() === 0 ? 6 : td.date.getDay() - 1];
                return (
                  <View key={i} style={[styles.overviewRow, isToday && styles.overviewRowToday]}>
                    <Text style={[styles.overviewLow, isToday && styles.overviewWhiteText]}>{minH.toFixed(2)} m</Text>
                    <View style={styles.overviewBar}>
                      <Text style={[styles.overviewDayText, isToday && styles.overviewWhiteText]}>
                        {isToday ? 'Today' : `${td.date.getDate()} ${dayName}`}
                      </Text>
                    </View>
                    <Text style={[styles.overviewHigh, isToday && styles.overviewWhiteText]}>{maxH.toFixed(2)} m</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.calFab}>
        <Text style={styles.calFabIcon}>📅</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  viewToggle: { flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingBottom: 8 },
  viewBtn: { padding: 8, borderRadius: 4, marginLeft: 4 },
  viewBtnActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  viewBtnIcon: { color: COLORS.white, fontSize: 18 },
  locationBtn: { padding: 8, marginLeft: 4 },
  locationBtnIcon: { fontSize: 20 },
  daySelector: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingBottom: 8 },
  dayTab: { flex: 1, alignItems: 'center', paddingVertical: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  dayTabActive: { borderBottomColor: COLORS.white },
  dayNum: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 'bold' },
  dayLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  dayTextActive: { color: COLORS.white },
  scroll: { flex: 1 },
  card: { margin: 12, backgroundColor: COLORS.white, borderRadius: 12, padding: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  locationBadge: { color: COLORS.text, fontSize: 13, fontWeight: '500' },
  chartArea: { height: CHART_HEIGHT, position: 'relative', marginBottom: 4, backgroundColor: '#EEF5FF', borderRadius: 4 },
  chartBar: { position: 'absolute', width: 8, backgroundColor: COLORS.tideBlue, borderRadius: 2 },
  chartYLabel: { position: 'absolute', left: 4, color: COLORS.textSecondary, fontSize: 10 },
  nowMarker: { position: 'absolute', bottom: 0, top: 0, width: 2, backgroundColor: 'transparent' },
  nowDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary, position: 'absolute', bottom: 20, marginLeft: -5 },
  chartXAxis: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  chartXLabel: { color: COLORS.textSecondary, fontSize: 10 },
  fishIconRow: { alignItems: 'center', marginVertical: 4 },
  fishIcon: { fontSize: 24 },
  tideStats: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border },
  tideStat: { flex: 1, alignItems: 'center' },
  tideStatCenter: { flex: 1.2, alignItems: 'center' },
  tideStatLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  tideStatValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  tideNowValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  tideTrend: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
  hlRow: { flexDirection: 'row', marginTop: 12 },
  hlCol: { flex: 1 },
  hlTitle: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 },
  hlTime: { fontSize: 13, color: COLORS.text, marginBottom: 4 },
  hlTimeBold: { fontWeight: 'bold' },
  overviewSection: { margin: 12, backgroundColor: COLORS.white, borderRadius: 12, overflow: 'hidden', elevation: 2 },
  overviewHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#f5f5f5' },
  overviewMonth: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  overviewMaxLow: { fontSize: 11, color: COLORS.textSecondary },
  overviewMaxHigh: { fontSize: 11, color: COLORS.textSecondary },
  overviewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  overviewRowToday: { backgroundColor: '#E53935' },
  overviewLow: { width: 60, fontSize: 12, color: COLORS.textSecondary },
  overviewBar: { flex: 1, alignItems: 'center' },
  overviewDayText: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  overviewHigh: { width: 60, fontSize: 12, color: COLORS.textSecondary, textAlign: 'right' },
  overviewWhiteText: { color: COLORS.white },
  calFab: {
    position: 'absolute', bottom: 24, right: 16,
    backgroundColor: COLORS.primary, width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', elevation: 6,
  },
  calFabIcon: { fontSize: 24 },
});
