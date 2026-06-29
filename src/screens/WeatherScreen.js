import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, FlatList, Alert
} from 'react-native';
import * as Location from 'expo-location';
import { fetchWeather, getWeatherIcon, getWeatherLabel, windDirection } from '../utils/api';
import { Storage } from '../utils/storage';
import { COLORS } from '../theme/colors';

const DAY_TABS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const CHART_TABS = ['🌤️', '🌧️', '💨', '⚖️'];

function LocationPickerModal({ visible, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { geocodeCity } = await import('../utils/api');
      const r = await geocodeCity(query);
      setResults(r);
    } catch (e) {}
    setLoading(false);
  };

  const useCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const loc = await Location.getCurrentPositionAsync({});
    onSelect({ name: 'Current location', latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <TouchableOpacity onPress={onClose}><Text style={styles.pickerCancel}>✕</Text></TouchableOpacity>
          <View style={styles.pickerSearchWrap}>
            <TextInput
              style={styles.pickerSearch}
              placeholder="Search city..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={search}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity onPress={onClose}><Text style={styles.pickerConfirm}>✓</Text></TouchableOpacity>
        </View>
        <View style={styles.pickerBody}>
          <TouchableOpacity style={styles.currentLocBtn} onPress={useCurrentLocation}>
            <Text style={styles.currentLocIcon}>🎯</Text>
            <Text style={styles.currentLocText}>Find my current location</Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator color={COLORS.primary} style={{ margin: 20 }} />}
          {results.map((r, i) => (
            <TouchableOpacity key={i} style={styles.resultItem} onPress={() => onSelect(r)}>
              <Text style={styles.resultIcon}>📍</Text>
              <Text style={styles.resultName}>{r.name}, {r.country}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

export default function WeatherScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [chartTab, setChartTab] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const loadWeather = async (loc) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(loc.latitude, loc.longitude);
      setWeather(data);
    } catch (e) {
      setError('Failed to load weather data');
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
          const [geo] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          loc = {
            name: geo?.city || geo?.district || 'Current',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
        } else {
          loc = { name: 'Istanbul', latitude: 41.0082, longitude: 28.9784 };
        }
        await Storage.saveForecastLocation(loc);
      }
      setLocation(loc);
      loadWeather(loc);
    })();
  }, []);

  const handleLocationSelect = async (loc) => {
    setShowPicker(false);
    const newLoc = { name: loc.name, latitude: loc.latitude, longitude: loc.longitude };
    setLocation(newLoc);
    await Storage.saveForecastLocation(newLoc);
    loadWeather(newLoc);
  };

  const getDayLabel = (i) => {
    if (!weather?.daily?.time) return DAY_TABS[i];
    const d = new Date(weather.daily.time[i]);
    if (i === 0) return 'TODAY';
    return DAY_TABS[d.getDay()];
  };

  const getDayDate = (i) => {
    if (!weather?.daily?.time) return '';
    const d = new Date(weather.daily.time[i]);
    return d.getDate().toString();
  };

  const getHourlyData = () => {
    if (!weather?.hourly) return [];
    const now = new Date();
    const dayDate = weather.daily?.time?.[selectedDay];
    if (!dayDate) return [];
    const dayStr = dayDate.split('T')[0] || dayDate;
    return weather.hourly.time
      .map((t, i) => ({ time: t, temp: weather.hourly.temperature_2m[i], code: weather.hourly.weather_code[i], wind: weather.hourly.wind_speed_10m[i], rain: weather.hourly.precipitation[i] }))
      .filter(h => h.time.startsWith(dayStr));
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (error) return <View style={styles.center}><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={() => loadWeather(location)} style={styles.retryBtn}><Text style={styles.retryText}>Retry</Text></TouchableOpacity></View>;

  const c = weather?.current;
  const daily = weather?.daily;
  const hourly = getHourlyData();

  return (
    <View style={styles.container}>
      {/* Day selector */}
      <View style={styles.daySelector}>
        {Array.from({ length: 7 }).map((_, i) => (
          <TouchableOpacity key={i} style={[styles.dayTab, selectedDay === i && styles.dayTabActive]} onPress={() => setSelectedDay(i)}>
            <Text style={[styles.dayNum, selectedDay === i && styles.dayTextActive]}>{getDayDate(i)}</Text>
            <Text style={[styles.dayName, selectedDay === i && styles.dayTextActive]}>{getDayLabel(i)}</Text>
            {daily?.weather_code?.[i] !== undefined && (
              <Text style={styles.dayIcon}>{getWeatherIcon(daily.weather_code[i])}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll}>
        {selectedDay === 0 && c && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Current conditions</Text>
              <TouchableOpacity style={styles.locationBadge} onPress={() => setShowPicker(true)}>
                <Text style={styles.locationBadgeIcon}>📍</Text>
                <Text style={styles.locationBadgeText}>{location?.name}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.currentRow}>
              <View style={styles.tempBlock}>
                <Text style={styles.tempMain}>{Math.round(c.temperature_2m)}°</Text>
                <Text style={styles.weatherIcon}>{getWeatherIcon(c.weather_code)}</Text>
                <View style={styles.tempRange}>
                  <Text style={styles.tempMax}>{Math.round(daily?.temperature_2m_max?.[0] ?? c.temperature_2m)}°</Text>
                  <Text style={styles.tempMin}>{Math.round(daily?.temperature_2m_min?.[0] ?? (c.temperature_2m - 6))}°</Text>
                </View>
              </View>
              <View style={styles.statsBlock}>
                <StatRow icon="🌂" label="Precipitation" value={`${c.precipitation} mm/h`} />
                <StatRow icon="⚖️" label="Air pressure" value={`${Math.round(c.surface_pressure)} hPa ↑`} />
                <StatRow icon="💧" label="Humidity" value={`${c.relative_humidity_2m}%`} />
                <StatRow icon="☀️" label="UV Index" value={c.uv_index <= 2 ? 'Low' : c.uv_index <= 5 ? 'Moderate' : c.uv_index <= 7 ? 'High' : 'Very High'} />
              </View>
            </View>
          </View>
        )}

        {/* Chart type tabs */}
        <View style={styles.card}>
          <View style={styles.chartTabs}>
            {CHART_TABS.map((t, i) => (
              <TouchableOpacity key={i} style={[styles.chartTab, chartTab === i && styles.chartTabActive]} onPress={() => setChartTab(i)}>
                <Text style={styles.chartTabIcon}>{t}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.chartLabel}>{['Temperature', 'Precipitation', 'Wind', 'Pressure'][chartTab]}</Text>
          </View>
          <View style={styles.chartUnit}>
            <Text style={styles.chartUnitText}>{['°C', 'mm', 'm/s', 'hPa'][chartTab]}</Text>
          </View>
          {hourly.length > 0 && (
            <View style={styles.miniChart}>
              {hourly.slice(0, 8).map((h, i) => {
                const val = [h.temp, h.rain * 10, h.wind, 0][chartTab];
                const icon = getWeatherIcon(h.code);
                const time = h.time.split('T')[1]?.substring(0, 5) || h.time.substring(11, 16);
                return (
                  <View key={i} style={styles.hourCol}>
                    <Text style={styles.hourVal}>{Math.round(val)}°</Text>
                    <Text style={styles.hourIcon}>{icon}</Text>
                    <Text style={styles.hourTime}>{time}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Wind */}
        {selectedDay === 0 && c && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current wind</Text>
            <View style={styles.windRow}>
              <View style={styles.windTurbine}>
                <Text style={styles.windTurbineIcon}>🌬️</Text>
                <Text style={styles.windBeaufort}>{c.wind_speed_10m < 1.5 ? 'Calm' : c.wind_speed_10m < 3.4 ? 'Light breeze' : c.wind_speed_10m < 5.5 ? 'Gentle breeze' : 'Moderate breeze'}</Text>
              </View>
              <View style={styles.windStats}>
                <WindStat label="Wind bearing" value={`${Math.round(c.wind_direction_10m)}° ${windDirection(c.wind_direction_10m)}`} />
                <WindStat label="Wind speed" value={`${c.wind_speed_10m} m/s`} />
                <WindStat label="Wind gusts" value={`${c.wind_gusts_10m} m/s`} />
              </View>
            </View>
          </View>
        )}

        {/* Attribution */}
        <View style={styles.attribution}>
          <Text style={styles.attributionText}>🍎 Weather data by Open-Meteo</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.locationFab} onPress={() => setShowPicker(true)}>
        <Text style={styles.locationFabIcon}>📍</Text>
      </TouchableOpacity>

      <LocationPickerModal visible={showPicker} onClose={() => setShowPicker(false)} onSelect={handleLocationSelect} />
    </View>
  );
}

function StatRow({ icon, label, value }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

function WindStat({ label, value }) {
  return (
    <View style={styles.windStat}>
      <Text style={styles.windStatLabel}>{label}</Text>
      <Text style={styles.windStatValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: COLORS.error, marginBottom: 16 },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: COLORS.white, fontWeight: 'bold' },
  daySelector: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 6 },
  dayTab: { flex: 1, alignItems: 'center', paddingVertical: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  dayTabActive: { borderBottomColor: COLORS.white },
  dayNum: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 'bold' },
  dayName: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  dayTextActive: { color: COLORS.white },
  dayIcon: { fontSize: 14 },
  scroll: { flex: 1 },
  card: { margin: 12, backgroundColor: COLORS.white, borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationBadgeIcon: { fontSize: 14 },
  locationBadgeText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  currentRow: { flexDirection: 'row' },
  tempBlock: { alignItems: 'center', flex: 1 },
  tempMain: { fontSize: 52, fontWeight: '300', color: COLORS.text },
  weatherIcon: { fontSize: 40, marginVertical: 4 },
  tempRange: { flexDirection: 'row', gap: 12 },
  tempMax: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  tempMin: { fontSize: 15, color: COLORS.textSecondary },
  statsBlock: { flex: 1.2, paddingLeft: 8 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statIcon: { fontSize: 18, width: 28 },
  statLabel: { fontSize: 11, color: COLORS.textSecondary },
  statValue: { fontSize: 13, fontWeight: '500', color: COLORS.text },
  chartTabs: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  chartTab: { paddingHorizontal: 10, paddingVertical: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  chartTabActive: { borderBottomColor: COLORS.primary },
  chartTabIcon: { fontSize: 20 },
  chartLabel: { flex: 1, textAlign: 'right', color: COLORS.textSecondary, fontSize: 12 },
  chartUnit: { marginBottom: 8 },
  chartUnitText: { color: COLORS.textSecondary, fontSize: 11 },
  miniChart: { flexDirection: 'row', justifyContent: 'space-around' },
  hourCol: { alignItems: 'center' },
  hourVal: { fontSize: 13, fontWeight: 'bold', color: COLORS.text },
  hourIcon: { fontSize: 18, marginVertical: 2 },
  hourTime: { fontSize: 11, color: COLORS.textSecondary },
  windRow: { flexDirection: 'row', alignItems: 'center' },
  windTurbine: { flex: 1, alignItems: 'center' },
  windTurbineIcon: { fontSize: 48 },
  windBeaufort: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  windStats: { flex: 1.5 },
  windStat: { marginBottom: 8 },
  windStatLabel: { fontSize: 12, color: COLORS.textSecondary },
  windStatValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  attribution: { alignItems: 'center', padding: 12 },
  attributionText: { color: COLORS.textSecondary, fontSize: 12 },
  locationFab: {
    position: 'absolute', top: 8, right: 16,
    backgroundColor: COLORS.primary, width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  locationFabIcon: { fontSize: 20 },
  // Picker
  pickerContainer: { flex: 1, backgroundColor: COLORS.background },
  pickerHeader: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
    paddingTop: 48, paddingHorizontal: 16, paddingBottom: 12,
  },
  pickerCancel: { color: COLORS.white, fontSize: 20, padding: 8 },
  pickerSearchWrap: { flex: 1, marginHorizontal: 8 },
  pickerSearch: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, color: COLORS.white, fontSize: 15,
  },
  pickerConfirm: { color: COLORS.white, fontSize: 24, padding: 8 },
  pickerBody: { flex: 1 },
  currentLocBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary, margin: 16, borderRadius: 30,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  currentLocIcon: { fontSize: 20, marginRight: 10 },
  currentLocText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  resultIcon: { fontSize: 18, marginRight: 12 },
  resultName: { fontSize: 15, color: COLORS.text },
});
