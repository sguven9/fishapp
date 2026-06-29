import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native';
import * as Location from 'expo-location';
import { getSolunarData, getWeekDays, formatDayLabel } from '../utils/solunarCalc';
import { Storage } from '../utils/storage';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

function MoonPhaseVisual({ phase }) {
  // Simple moon visual using background gradient
  const illumination = Math.sin(phase * Math.PI * 2);
  const size = 80;
  return (
    <View style={[styles.moonCircle, {
      backgroundColor: illumination > 0 ? '#B0BEC5' : '#546E7A',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    }]}>
      <Text style={styles.moonEmoji}>
        {phase < 0.0625 ? '🌑' :
         phase < 0.1875 ? '🌒' :
         phase < 0.3125 ? '🌓' :
         phase < 0.4375 ? '🌔' :
         phase < 0.5625 ? '🌕' :
         phase < 0.6875 ? '🌖' :
         phase < 0.8125 ? '🌗' :
         phase < 0.9375 ? '🌘' : '🌑'}
      </Text>
    </View>
  );
}

function SunDial({ sunData }) {
  return (
    <View style={styles.sunDialContainer}>
      <View style={styles.sunDialCircle}>
        <View style={styles.sunDialInner}>
          <Text style={styles.sunDialDayLabel}>Day</Text>
          <Text style={styles.sunDialDayDur}>{sunData.dayLength}</Text>
          <Text style={styles.sunDialNightLabel}>Night</Text>
          <Text style={styles.sunDialNightDur}>{sunData.nightLength}</Text>
        </View>
        <Text style={styles.sunIcon}>☀️</Text>
      </View>
      <Text style={[styles.dialLabel, styles.dialTop]}>Solar Noon{'\n'}{sunData.solarNoon}</Text>
      <Text style={[styles.dialLabel, styles.dialBottom]}>Midnight{'\n'}{sunData.midnight}</Text>
      <View style={styles.dialLeftCol}>
        <Text style={styles.dialSideLabel}>Sunrise</Text>
        <Text style={styles.dialSideTime}>{sunData.rise}</Text>
        <Text style={styles.dialSideLabel}>Dawn</Text>
        <Text style={styles.dialSideTime}>{sunData.dawn}</Text>
      </View>
      <View style={styles.dialRightCol}>
        <Text style={styles.dialSideLabel}>Sunset</Text>
        <Text style={styles.dialSideTime}>{sunData.set}</Text>
        <Text style={styles.dialSideLabel}>Dusk</Text>
        <Text style={styles.dialSideTime}>{sunData.dusk}</Text>
      </View>
    </View>
  );
}

function MoonChart({ moonData }) {
  // Simple arc chart for moon
  return (
    <View style={styles.moonChartContainer}>
      <View style={styles.moonArc}>
        <Text style={styles.moonArcSetTime}>Moonset{'\n'}{moonData.set}</Text>
        <View style={styles.moonArcLine} />
        <Text style={styles.moonArcRiseTime}>Moonrise{'\n'}{moonData.rise}</Text>
      </View>
      <Text style={styles.moonArcIcon}>🌙</Text>
    </View>
  );
}

export default function SolunarScreen() {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [solunarData, setSolunarData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(3);

  const weekDays = getWeekDays();

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
      const data = getSolunarData(loc.latitude, loc.longitude, weekDays[selectedDay]);
      setSolunarData(data);
      setLoading(false);
    })();
  }, []);

  const handleDayChange = (i) => {
    setSelectedDay(i);
    if (location) {
      const data = getSolunarData(location.latitude, location.longitude, weekDays[i]);
      setSolunarData(data);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const { moon, sun } = solunarData;

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
        {/* Moon card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Moon</Text>
            <Text style={styles.locationBadge}>📍 {location?.name}</Text>
          </View>
          <View style={styles.moonSection}>
            <MoonPhaseVisual phase={moon.phase} />
            <Text style={styles.moonPhaseName}>{moon.phaseName}</Text>
          </View>
          <View style={styles.moonStats}>
            <MoonStatItem label="Distance" value={`${moon.distance?.toLocaleString() || 0} km`} />
            <MoonStatItem label="Illumination" value={`${moon.illumination}%`} />
            <MoonStatItem label="Age" value={`${moon.age} days`} />
          </View>
          <MoonChart moonData={moon} />
        </View>

        {/* Sun card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sun</Text>
          <SunDial sunData={sun} />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.calFab}>
        <Text style={styles.calFabIcon}>📅</Text>
      </TouchableOpacity>
    </View>
  );
}

function MoonStatItem({ label, value }) {
  return (
    <View style={styles.moonStatItem}>
      <Text style={styles.moonStatLabel}>{label}</Text>
      <Text style={styles.moonStatValue}>{value}</Text>
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
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  locationBadge: { fontSize: 13, color: COLORS.text },
  moonSection: { alignItems: 'center', paddingVertical: 12 },
  moonCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  moonEmoji: { fontSize: 56 },
  moonPhaseName: { fontSize: 16, fontStyle: 'italic', color: COLORS.text, fontWeight: '600' },
  moonStats: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border },
  moonStatItem: { alignItems: 'center' },
  moonStatLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  moonStatValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  moonChartContainer: { marginTop: 16, alignItems: 'center', height: 100 },
  moonArc: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%', paddingBottom: 12 },
  moonArcSetTime: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'left' },
  moonArcLine: { flex: 1, height: 2, backgroundColor: COLORS.primary, marginHorizontal: 8, marginBottom: 8 },
  moonArcRiseTime: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'right' },
  moonArcIcon: { fontSize: 24, position: 'absolute', bottom: 16, right: 30 },
  // Sun dial
  sunDialContainer: { height: 280, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  sunDialCircle: {
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 3, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EEF5FF',
  },
  sunDialInner: { alignItems: 'center' },
  sunDialDayLabel: { fontSize: 14, color: COLORS.text },
  sunDialDayDur: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  sunDialNightLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 8 },
  sunDialNightDur: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  sunIcon: { position: 'absolute', fontSize: 28, right: -14, top: '40%' },
  dialLabel: { position: 'absolute', alignSelf: 'center', textAlign: 'center', fontSize: 11, color: COLORS.textSecondary },
  dialTop: { top: 8 },
  dialBottom: { bottom: 8 },
  dialLeftCol: { position: 'absolute', left: 8, top: '35%' },
  dialRightCol: { position: 'absolute', right: 8, top: '35%' },
  dialSideLabel: { fontSize: 11, color: COLORS.textSecondary },
  dialSideTime: { fontSize: 13, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  calFab: {
    position: 'absolute', bottom: 24, right: 16,
    backgroundColor: COLORS.primary, width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', elevation: 6,
  },
  calFabIcon: { fontSize: 24 },
});
