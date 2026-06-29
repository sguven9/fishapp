import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, ImageBackground
} from 'react-native';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function PremiumScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  return (
    <View style={styles.container}>
      <ScrollView bounces={false}>
        {/* Hero section */}
        <View style={styles.hero}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restoreBtn}>
            <Text style={styles.restoreText}>Restore</Text>
          </TouchableOpacity>

          <Text style={styles.heroTitle}>Start Your 7-Day FREE{'\n'}Trial</Text>

          <View style={styles.heroCenter}>
            <View style={styles.fishCircle}>
              {['🐟', '🐠', '🦈', '🐡', '🦑', '🐙', '🦐', '🐚'].map((f, i) => (
                <Text key={i} style={[styles.floatingFish, { transform: [{ rotate: `${i * 45}deg` }, { translateX: 80 }] }]}>{f}</Text>
              ))}
              <View style={styles.scoreCircle}>
                <Text style={styles.heroScore}>95</Text>
              </View>
            </View>
          </View>

          <Text style={styles.catchMoreTitle}>Catch More Fish</Text>
          <Text style={styles.catchMoreDesc}>Know exactly when fish are most active.</Text>

          <View style={styles.waveIllustration}>
            <Text style={styles.waveText}>〰〰🐟〰〰〰〰〰〰〰{'\n'}〰〰〰〰〰🐟〰〰〰〰</Text>
          </View>
          <Text style={styles.perfectWater}>Find the Perfect Water Conditions</Text>
        </View>

        {/* Plans section */}
        <View style={styles.plansSection}>
          <Text style={styles.selectPlanText}>
            Select a plan to start your free trial. You can change plans or cancel anytime
          </Text>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>58% OFF</Text>
            </View>
            <View style={styles.planRow}>
              <View>
                <Text style={styles.planName}>Yearly</Text>
                <Text style={styles.planSub}>7 days free, then ₺399,99/year</Text>
              </View>
              <Text style={styles.planPrice}>₺33,33/month</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.planRow}>
              <View>
                <Text style={styles.planName}>Monthly</Text>
                <Text style={styles.planSub}>₺79,99/month</Text>
              </View>
              <Text style={styles.planPrice}>₺79,99/month</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.subscribeBtn}>
            <Text style={styles.subscribeBtnText}>Try free and subscribe</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Cancel anytime. Payment will be charged to your account at confirmation of purchase.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  backBtn: { position: 'absolute', top: 52, left: 20, padding: 8 },
  backText: { color: COLORS.white, fontSize: 15 },
  restoreBtn: { position: 'absolute', top: 52, right: 20, padding: 8 },
  restoreText: { color: COLORS.white, fontSize: 15 },
  heroTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  heroCenter: { marginBottom: 24, alignItems: 'center', justifyContent: 'center', height: 160 },
  fishCircle: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  floatingFish: { position: 'absolute', fontSize: 16 },
  scoreCircle: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: '#FFC107',
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroScore: { color: COLORS.white, fontSize: 32, fontWeight: 'bold' },
  catchMoreTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  catchMoreDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 20 },
  waveIllustration: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 12,
  },
  waveText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', lineHeight: 22 },
  perfectWater: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  plansSection: { padding: 20, backgroundColor: COLORS.white },
  selectPlanText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 19,
  },
  planCard: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  planCardSelected: { borderColor: COLORS.primary, backgroundColor: '#EEF5FF' },
  planBadge: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 3,
    alignItems: 'center',
  },
  planBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  planName: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  planSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  planPrice: { fontSize: 15, fontWeight: 'bold', color: COLORS.white },
  subscribeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  subscribeBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  termsText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
