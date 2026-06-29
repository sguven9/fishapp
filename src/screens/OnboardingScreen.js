import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, Animated
} from 'react-native';
import { COLORS } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    bg: COLORS.white,
    titleColor: COLORS.primary,
    textColor: '#333',
    title: 'Save and find fishing\nlocations',
    desc: 'Save fishing locations, record trolling paths, measure distances and navigate to your saved locations',
    illustration: '🗺️🐟⚓',
    illustrationBg: '#e8f4fd',
    dots: '● ○ ○ ○ ○',
  },
  {
    id: '2',
    bg: COLORS.primary,
    titleColor: COLORS.white,
    textColor: COLORS.white,
    title: 'Fish activity forecast',
    desc: 'Check when fish are the most active during the day and get notified before next high fish activity',
    illustration: '87',
    illustrationBg: 'rgba(255,255,255,0.1)',
    dots: '○ ● ○ ○ ○',
  },
  {
    id: '3',
    bg: COLORS.white,
    titleColor: COLORS.primary,
    textColor: '#333',
    title: 'Tides & weather\nforecasts',
    desc: 'Plan your fishing trips using tide prediction, marine, weather forecast and solunar data',
    illustration: '🌤️🌊',
    illustrationBg: '#f5f5f5',
    dots: '○ ○ ● ○ ○',
  },
  {
    id: '4',
    bg: COLORS.primary,
    titleColor: COLORS.white,
    textColor: COLORS.white,
    title: 'Winds & wave data',
    desc: 'Check out accurate wind, wave data and water temperature',
    illustration: '🌊💨',
    illustrationBg: 'rgba(255,255,255,0.1)',
    dots: '○ ○ ○ ● ○',
  },
  {
    id: '5',
    bg: COLORS.white,
    titleColor: COLORS.primary,
    textColor: '#333',
    title: 'Personal catch log',
    desc: 'Log your catches and keep them for yourself. Privacy comes first.',
    illustration: '📷🐟📋',
    isLast: true,
    illustrationBg: '#f5f5f5',
    dots: '○ ○ ○ ○ ●',
  },
];

function Slide({ item, onStart }) {
  const isBlue = item.bg === COLORS.primary;
  return (
    <View style={[styles.slide, { backgroundColor: item.bg, width }]}>
      <Text style={[styles.slideTitle, { color: item.titleColor }]}>{item.title}</Text>

      <View style={[styles.illustrationCircle, { backgroundColor: item.illustrationBg }]}>
        {item.id === '2' ? (
          <View style={styles.activityScore}>
            <View style={styles.scoreBorder}>
              <Text style={styles.scoreNumber}>{item.illustration}</Text>
              <Text style={styles.scoreStars}>★★★</Text>
            </View>
            <View style={styles.scoreLine}>
              <View style={styles.scoreLineWave} />
            </View>
          </View>
        ) : (
          <View style={styles.phoneMock}>
            <View style={[styles.phoneMockScreen, { backgroundColor: isBlue ? 'rgba(255,255,255,0.15)' : '#e8f4fd' }]}>
              <Text style={styles.phoneEmoji}>{item.illustration}</Text>
            </View>
          </View>
        )}
      </View>

      <Text style={[styles.slideDesc, { color: item.textColor }]}>{item.desc}</Text>

      <View style={styles.dotsRow}>
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.dot, item.id === s.id && styles.dotActive, { backgroundColor: isBlue ? COLORS.white : COLORS.primary }]} />
        ))}
      </View>

      {item.isLast && (
        <TouchableOpacity style={styles.startBtn} onPress={onStart}>
          <Text style={styles.startBtnText}>LET'S GO FISHING</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function OnboardingScreen({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef(null);

  const handleViewableChange = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onFinish();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <Slide item={item} onStart={onFinish} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableChange}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />
      {currentIndex < SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={onFinish}>
          <Text style={[styles.skipText, { color: SLIDES[currentIndex].bg === COLORS.primary ? COLORS.white : COLORS.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    paddingBottom: 40,
    minHeight: height,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 36,
  },
  illustrationCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  phoneMock: {
    width: 130,
    height: 220,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#455a64',
    backgroundColor: '#37474f',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneMockScreen: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneEmoji: { fontSize: 48, textAlign: 'center' },
  activityScore: { alignItems: 'center', width: '100%' },
  scoreBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.white,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreNumber: { fontSize: 32, fontWeight: 'bold', color: COLORS.white },
  scoreStars: { fontSize: 16, color: COLORS.white },
  scoreLine: {
    width: 200,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreLineWave: {
    width: 180,
    height: 2,
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
  slideDesc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    opacity: 0.85,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.3,
  },
  dotActive: { opacity: 1, width: 20, borderRadius: 4 },
  startBtn: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  startBtnText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  skipBtn: {
    position: 'absolute',
    top: 52,
    right: 24,
    padding: 8,
  },
  skipText: { fontSize: 15, fontWeight: '500' },
});
