import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { COLORS } from '../theme/colors';

export default function AboutScreen() {
  const features = [
    { icon: '🗺️', title: 'Navigation Map', desc: 'GPS map with nautical chart support, course and heading display' },
    { icon: '📍', title: 'Fishing Locations', desc: 'Save and organize your favorite fishing spots with GPS coordinates' },
    { icon: '🐟', title: 'Catch Log', desc: 'Record your catches with photos, weight, length and notes' },
    { icon: '🌤️', title: 'Weather', desc: 'Detailed 7-day weather forecast with hourly data' },
    { icon: '🌊', title: 'Waves & Marine', desc: 'Wave height, period, direction and sea temperature' },
    { icon: '📈', title: 'Tides', desc: 'Tide predictions with high/low tide times and chart' },
    { icon: '🌙', title: 'Solunar', desc: 'Moon phase and sun/moon times for optimal fishing' },
    { icon: '📅', title: 'Fish Activity', desc: 'Solunar-based fish activity forecast to plan your trips' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appIcon}>🎣</Text>
        <Text style={styles.appName}>Fish App</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
        <Text style={styles.appDesc}>
          Your complete fishing companion. Plan your trips with weather forecasts, tides, solunar data and keep track of all your catches.
        </Text>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Features</Text>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.dataSection}>
        <Text style={styles.sectionTitle}>Data Sources</Text>
        <View style={styles.dataCard}>
          <Text style={styles.dataRow}>🌤️ Weather: <Text style={styles.dataSource}>Open-Meteo (open-meteo.com)</Text></Text>
          <Text style={styles.dataRow}>🌊 Marine: <Text style={styles.dataSource}>Open-Meteo Marine API</Text></Text>
          <Text style={styles.dataRow}>📈 Tides: <Text style={styles.dataSource}>Astronomical calculation</Text></Text>
          <Text style={styles.dataRow}>🌙 Solunar: <Text style={styles.dataSource}>SunCalc library</Text></Text>
          <Text style={styles.dataRow}>🗺️ Maps: <Text style={styles.dataSource}>React Native Maps</Text></Text>
        </View>
      </View>

      <View style={styles.linksSection}>
        <TouchableOpacity style={styles.link} onPress={() => Linking.openURL('https://open-meteo.com')}>
          <Text style={styles.linkText}>🌐 Open-Meteo Weather API</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link}>
          <Text style={styles.linkText}>📄 Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link}>
          <Text style={styles.linkText}>📋 Terms of Service</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.copyright}>© 2026 Fish App. All rights reserved.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  appIcon: { fontSize: 64, marginBottom: 8 },
  appName: { color: COLORS.white, fontSize: 28, fontWeight: 'bold' },
  appVersion: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12 },
  appDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  featuresSection: { margin: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  featureIcon: { fontSize: 24, marginRight: 12, marginTop: 2 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  featureDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, lineHeight: 17 },
  dataSection: { margin: 16, marginTop: 0 },
  dataCard: { backgroundColor: COLORS.white, borderRadius: 10, padding: 16, elevation: 1 },
  dataRow: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  dataSource: { color: COLORS.primary, fontWeight: '500' },
  linksSection: { margin: 16, marginTop: 0 },
  link: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
  },
  linkText: { color: COLORS.primary, fontSize: 14, fontWeight: '500' },
  copyright: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 32,
  },
});
