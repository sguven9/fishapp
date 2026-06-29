import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  FlatList, Pressable, Platform, Alert
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS } from '../theme/colors';

const MAP_TYPES = [
  { id: 'standard', label: 'NORMAL' },
  { id: 'satellite', label: 'HYBRID' },
  { id: 'hybrid', label: 'SATELLITE' },
  { id: 'terrain', label: 'TERRAIN' },
];

const CAMERA_MODES = [
  { id: 'free', label: 'Free mode', desc: 'Map stays still regardless of your movements. To enter Free mode, move map with finger', icon: '⊞' },
  { id: 'lock', label: 'Lock mode', desc: 'Your location is centered in the screen', icon: '⊡' },
  { id: 'rotate', label: 'Rotate mode', desc: 'Lock mode with rotating map', icon: '🧭' },
];

export default function MapScreen({ navigation }) {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [cameraMode, setCameraMode] = useState('lock');
  const [mapType, setMapType] = useState('standard');
  const [showBasemap, setShowBasemap] = useState(false);
  const [showCameraInfo, setShowCameraInfo] = useState(false);

  useEffect(() => {
    let sub;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 1 },
        (loc) => {
          setLocation(loc.coords);
          setSpeed(loc.coords.speed || 0);
          setHeading(loc.coords.heading || 0);
          if (cameraMode !== 'free' && mapRef.current) {
            mapRef.current.animateCamera({
              center: { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
              heading: cameraMode === 'rotate' ? (loc.coords.heading || 0) : 0,
            });
          }
        }
      );
    })();
    return () => sub?.remove();
  }, [cameraMode]);

  const compassDirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
  const headingDir = compassDirs[Math.round(heading / 45) % 8];

  return (
    <View style={styles.container}>
      {/* Compass bar */}
      <View style={styles.compassBar}>
        <Text style={styles.compassText}>
          {'|    '.repeat(8).split('').map((c, i) => c)}
          N    NE    E    SE    S    SW    W    NW    N
        </Text>
        <View style={styles.compassInfo}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.compassData}>
            <Text style={styles.compassLabel}>Course over ground</Text>
            <Text style={styles.compassValue}>{Math.round(heading)}° {headingDir}</Text>
          </View>
          <View style={styles.compassData}>
            <Text style={styles.compassLabel}>Heading</Text>
            <Text style={styles.compassValue}>{Math.round(heading)}° E</Text>
          </View>
        </View>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType={mapType}
        showsUserLocation
        showsCompass={false}
        initialRegion={
          location
            ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
            : { latitude: 38.4192, longitude: 27.1287, latitudeDelta: 0.5, longitudeDelta: 0.5 }
        }
        onTouchStart={() => { if (cameraMode !== 'free') setCameraMode('free'); }}
      />

      {/* Right toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={[styles.toolBtn, mapType === 'satellite' && styles.toolBtnActive]} onPress={() => setShowBasemap(true)}>
          <Text style={styles.toolIcon}>◆</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => {}}>
          <Text style={styles.toolIcon}>⊟</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => setShowCameraInfo(!showCameraInfo)}
        >
          <Text style={styles.toolIcon}>
            {cameraMode === 'rotate' ? '🧭' : cameraMode === 'lock' ? '⊡' : '⊞'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Camera modes info */}
      {showCameraInfo && (
        <View style={styles.cameraInfo}>
          <Text style={styles.cameraTitle}>Camera modes</Text>
          {CAMERA_MODES.map(m => (
            <TouchableOpacity
              key={m.id}
              style={styles.cameraModeRow}
              onPress={() => { setCameraMode(m.id); setShowCameraInfo(false); }}
            >
              <Text style={[styles.cameraModeIcon, cameraMode === m.id && { color: COLORS.primary }]}>{m.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cameraModeName, cameraMode === m.id && { color: COLORS.primary }]}>{m.label}</Text>
                <Text style={styles.cameraModeDesc}>{m.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.hideBtn} onPress={() => setShowCameraInfo(false)}>
            <Text style={styles.hideBtnText}>HIDE</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Speed display */}
      <View style={styles.speedBar}>
        <Text style={styles.speedText}>{speed.toFixed(1)} m/s</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => {}}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Basemap modal */}
      <Modal visible={showBasemap} transparent animationType="slide" onRequestClose={() => setShowBasemap(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowBasemap(false)} />
        <View style={styles.basemapSheet}>
          <Text style={styles.basemapTitle}>Basemap</Text>
          <View style={styles.basemapGrid}>
            {MAP_TYPES.map(mt => (
              <TouchableOpacity
                key={mt.id}
                style={[styles.basemapItem, mapType === mt.id && styles.basemapItemActive]}
                onPress={() => { setMapType(mt.id); setShowBasemap(false); }}
              >
                <View style={[styles.basemapThumb, { backgroundColor: mt.id === 'satellite' ? '#1a3a1a' : mt.id === 'hybrid' ? '#000' : mt.id === 'terrain' ? '#c8e6c9' : '#e3f2fd' }]} />
                <Text style={styles.basemapLabel}>{mt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nightBg },
  compassBar: { backgroundColor: COLORS.nightBg, paddingTop: 4, paddingBottom: 4 },
  compassText: { color: COLORS.white, fontSize: 10, paddingHorizontal: 8, opacity: 0.6 },
  compassInfo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4 },
  menuIcon: { color: COLORS.white, fontSize: 22, marginRight: 16 },
  compassData: { flex: 1, alignItems: 'center' },
  compassLabel: { color: '#aaa', fontSize: 11 },
  compassValue: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  map: { flex: 1 },
  toolbar: {
    position: 'absolute',
    right: 12,
    top: 90,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  toolBtn: { padding: 12, alignItems: 'center' },
  toolBtnActive: { backgroundColor: COLORS.primary, borderRadius: 8 },
  toolIcon: { fontSize: 22 },
  cameraInfo: {
    position: 'absolute',
    left: 12,
    top: 90,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: 280,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  cameraTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12 },
  cameraModeRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  cameraModeIcon: { fontSize: 20, marginRight: 12, marginTop: 2 },
  cameraModeName: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  cameraModeDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  hideBtn: { alignSelf: 'flex-end', marginTop: 4 },
  hideBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  speedBar: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: { color: COLORS.white, fontSize: 32, fontWeight: 'bold' },
  addBtn: {
    position: 'absolute',
    right: 16,
    backgroundColor: COLORS.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  addBtnText: { fontSize: 24, color: COLORS.primary, fontWeight: 'bold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  basemapSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 40,
  },
  basemapTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  basemapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  basemapItem: { width: '22%', alignItems: 'center' },
  basemapItemActive: {},
  basemapThumb: { width: 70, height: 70, borderRadius: 8, marginBottom: 4, borderWidth: 2, borderColor: 'transparent' },
  basemapLabel: { fontSize: 11, color: COLORS.text, textAlign: 'center', fontWeight: '600' },
});
