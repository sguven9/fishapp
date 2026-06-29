import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';
import { getSolunarData, getWeekDays, formatDayLabel } from '../utils/solunarCalc';
import { fetchWeather } from '../utils/api';
import { Storage } from '../utils/storage';
import { COLORS } from '../theme/colors';

function ActivityBar({ label, value, color, max = 100 }) {
  return (
    <View style={styles.actBar}>
      <Text style={styles.actBarLabel}>{label}</Text>
      <View style={styles.actBarTrack}>
        <View style={[styles.actBarFill, { width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.actBarValue}>{Math.round(value)}%</Text>
    </View>
  );
}

function RatingStars({ rating, max = 5 }) {
  return (
    <View style={styles.stars}>
      {Array.from({ length: max }).map((_, i) => (
        <Text key={i} style={[styles.star, i < Math.round(rating) && styles.starActive]}>★</Text>
      ))}
    </View>
  );
}

export default function FishActivityScreen() {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [solunar, setSolunar] = useState(null);
  const [weather, setWeather] = useState(null);
  const [selectedDay, setSelectedDay] = useState(3);

  const weekDays = getWeekDays();

  const calculateActivity = (sol, wx) => {
    if (!sol) return { overall: 50, moon: 50, weather: 50, pressure: 50, rating: 3 };
    const moonScore = sol.moon.illumination;
    const phaseBonus = sol.moon.phase > 0.45 && sol.moon.phase < 0.55 ? 20 :
      (sol.moon.phase < 0.05 || sol.moon.phase > 0.95) ? 15 : 0;
    const moonActivity = Math.min(100, moonScore + phaseBonus);
    const pressureScore = wx ? (wx.current?.surface_pressure > 1010 ? 70 : 40) : 60;
    const weatherScore = wx ? (wx.current?.precipitation < 0.5 ? 75 : 35) : 60;
    const overall = (moonActivity * 0.4 + pressureScore * 0.35 + weatherScore * 0.25);
    return {
      overall: Math.round(overall),
      moon: Math.round(moonActivity),
      weather: Math.round(weatherScore),
      pressure: Math.round(pressureScore),
      rating: Math.min(5, Math.max(1, Math.round(overall / 20))),
    };
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
      const sol = getSolunarData(loc.latitude, loc.longitude, weekDays[selectedDay]);
      setSolunar(sol);
      try {
        const wx = await fetchWeather(loc.latitude, loc.longitude);
        setWeather(wx);
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const handleDayChange = (i) => {
    setSelectedDay(i);
    if (location) {
      const sol = getSolunarData(location.latitude, location.longitude, weekDays[i]);
      setSolunar(sol);
    }
  };

  const activity = calculateActivity(solunar, weather);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const getActivityLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 45) return 'Average';
    return 'Poor';
  };

  const getActivityColor = (score) => {
    if (score >= 80) return '#2E7D32';
    if (score >= 65) return '#1565C0';
    if (score >= 45) return '#E65100';
    return '#B71C1C';
  };

  return (
    <View style={styles.container}>
      {/* Day selector */}
      <View style={styles.daySelector}>
        {weekDays.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.dayTab, selectedDay === i && styles.dayTabActive]}
            onPress={() => handleDayChange(i)}
          >
            <Text style={[styles.dayNum, selectedDay === i && styles.dayTextActive]}>{d.getDate()}</Text>
            <Text style={[styles.dayLabel, selectedDay === i && styles.dayTextActive]}>{formatDayLabel(d)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll}>
        {/* Overall rating */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Fish activity</Text>
            <Text style={styles.locationBadge}>📍 {location?.name}</Text>
          </View>
          <View style={styles.overallSection}>
            <View style={[styles.overallCircle, { borderColor: getActivityColor(activity.overall) }]}>
              <Text style={[styles.overallScore, { color: getActivityColor(activity.overall) }]}>{activity.overall}%</Text>
              <Text style={styles.overallLabel}>{getActivityLabel(activity.overall)}</Text>
            </View>
            <View style={styles.overallDetails}>
              <Text style={styles.ratingLabel}>Overall rating</Text>
              <RatingStars rating={activity.rating} />
              <Text style={styles.overallDesc}>
                {activity.overall >= 65
                  ? '🎣 Great day for fishing! Moon phase and conditions are favorable.'
                  : '🎣 Average conditions. Fishing possible but not peak activity.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Activity factors */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity factors</Text>
          <ActivityBar label="🌙 Moon phase" value={activity.moon} color="#5C6BC0" />
          <ActivityBar label="🌤️ Weather" value={activity.weather} color={COLORS.primary} />
          <ActivityBar label="⚖️ Pressure" value={activity.pressure} color="#00897B" />
        </View>

        {/* Solunar times */}
        {solunar && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Solunar periods</Text>
            <View style={styles.solunarGrid}>
              <SolunarPeriod icon="🌕" label="Major period 1" time={solunar.moon.rise} dur="2 h" quality={85} />
              <SolunarPeriod icon="🌕" label="Major period 2" time={solunar.moon.set} dur="2 h" quality={80} />
              <SolunarPeriod icon="🌑" label="Minor period 1" time={solunar.sun.rise} dur="1 h" quality={60} />
              <SolunarPeriod icon="🌑" label="Minor period 2" time={solunar.sun.set} dur="1 h" quality={55} />
            </View>
          </View>
        )}

        {/* Moon info */}
        {solunar && (
          <View style={styles.card}>
            <View style={styles.moonInfoRow}>
              <Text style={styles.moonEmoji}>
                {solunar.moon.phase < 0.5 ? '🌔' : '🌖'}
              </Text>
              <View style={styles.moonInfoText}>
                <Text style={styles.moonPhaseName}>{solunar.moon.phaseName}</Text>
                <Text style={styles.moonDetail}>🌙 Moonrise: {solunar.moon.rise}</Text>
                <Text style={styles.moonDetail}>🌙 Moonset: {solunar.moon.set}</Text>
                <Text style={styles.moonDetail}>💡 Illumination: {solunar.moon.illumination}%</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SolunarPeriod({ icon, label, time, dur, quality }) {
  return (
    <View style={styles.solunarPeriod}>
      <Text style={styles.solunarIcon}>{icon}</Text>
      <Text style={styles.solunarLabel}>{label}</Text>
      <Text style={styles.solunarTime}>{time}</Text>
      <Text style={styles.solunarDur}>{dur}</Text>
      <View style={styles.solunarQualityBar}>
        <View style={[styles.solunarQualityFill, { width: `${quality}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  daySelector: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 6 },
  dayTab: { flex: 1, alignItems: 'center', paddingVertical: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  dayTabActive: { borderBottomColor: COLORS.white },
  dayNum: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 'bold' },
  dayLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  dayTextActive: { color: COLORS.white },
  scroll: { flex: 1 },
  card: { margin: 12, backgroundColor: COLORS.white, borderRadius: 12, padding: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12 },
  locationBadge: { fontSize: 13, color: COLORS.text },
  overallSection: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  overallCircle: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 4, alignItems: 'center', justifyContent: 'center',
  },
  overallScore: { fontSize: 22, fontWeight: 'bold' },
  overallLabel: { fontSize: 11, color: COLORS.textSecondary },
  overallDetails: { flex: 1 },
  ratingLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  stars: { flexDirection: 'row', marginBottom: 8 },
  star: { fontSize: 18, color: '#E0E0E0' },
  starActive: { color: '#FFC107' },
  overallDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  actBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  actBarLabel: { width: 120, fontSize: 13, color: COLORS.text },
  actBarTrack: { flex: 1, height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, marginHorizontal: 8 },
  actBarFill: { height: '100%', borderRadius: 4 },
  actBarValue: { width: 36, fontSize: 12, color: COLORS.textSecondary, textAlign: 'right' },
  solunarGrid: { gap: 12 },
  solunarPeriod: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  solunarIcon: { fontSize: 18, width: 24 },
  solunarLabel: { flex: 1, fontSize: 13, color: COLORS.text },
  solunarTime: { fontSize: 13, fontWeight: 'bold', color: COLORS.text, width: 50 },
  solunarDur: { fontSize: 12, color: COLORS.textSecondary, width: 32 },
  solunarQualityBar: { width: 60, height: 6, backgroundColor: '#f0f0f0', borderRadius: 3 },
  solunarQualityFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  moonInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  moonEmoji: { fontSize: 48 },
  moonInfoText: { flex: 1 },
  moonPhaseName: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginBottom: 6 },
  moonDetail: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 3 },
});
