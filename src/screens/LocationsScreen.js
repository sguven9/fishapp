import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, Pressable, ScrollView, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Storage } from '../utils/storage';
import { COLORS } from '../theme/colors';

const LOCATION_ICONS = ['🚫🐟', '🎣', '⚓', '🏖️', '🏝️', '🌊', '🐠', '🦈', '🦞', '🦀'];

const TABS = ['LOCATIONS', 'TROTLINES', 'TROLLINGS'];

function NewLocationModal({ visible, onClose, onSave }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎣');
  const [gpsLat, setGpsLat] = useState('');
  const [gpsLon, setGpsLon] = useState('');
  const [accuracy, setAccuracy] = useState(null);
  const [searching, setSearching] = useState(false);

  const getCurrentLocation = async () => {
    setSearching(true);
    setGpsLat('');
    setGpsLon('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setSearching(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
      const lat = loc.coords.latitude;
      const lon = loc.coords.longitude;
      setGpsLat(lat.toFixed(5));
      setGpsLon(lon.toFixed(5));
      setAccuracy(Math.round(loc.coords.accuracy));
    } catch (e) {
      Alert.alert('Error', 'Could not get location');
    }
    setSearching(false);
  };

  useEffect(() => {
    if (visible) getCurrentLocation();
  }, [visible]);

  const handleSave = () => {
    if (!gpsLat || !gpsLon) { Alert.alert('Error', 'Location not set'); return; }
    const autoName = name.trim() || new Date().toLocaleDateString('tr-TR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).replace(/\s/g, '_').replace(/:/g, '_');
    onSave({ name: autoName, icon, latitude: parseFloat(gpsLat), longitude: parseFloat(gpsLon) });
    setName('');
    setGpsLat('');
    setGpsLon('');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalCancel}>✕</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>New location</Text>
          <TouchableOpacity onPress={handleSave}><Text style={styles.modalSave}>✓</Text></TouchableOpacity>
        </View>
        <View style={styles.modalHeaderBody}>
          <TouchableOpacity style={styles.iconPicker}>
            <Text style={styles.selectedIcon}>{icon}</Text>
            <Text style={styles.iconArrow}>▼</Text>
          </TouchableOpacity>
          <View style={styles.nameInputWrap}>
            <Text style={styles.nameLabel}>Location name</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Auto-generated if empty"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={name}
              onChangeText={setName}
              selectionColor={COLORS.white}
            />
          </View>
        </View>

        <ScrollView style={styles.modalBody}>
          <View style={styles.coordCard}>
            <View style={styles.coordHeader}>
              <Text style={styles.coordHeaderIcon}>📍</Text>
              <Text style={styles.coordTitle}>Location coordinates</Text>
              <TouchableOpacity style={styles.coordMenu}><Text>⋮</Text></TouchableOpacity>
            </View>
            {searching ? (
              <View style={styles.searchingRow}>
                <ActivityIndicator color={COLORS.primary} size="large" />
                <Text style={styles.searchingText}>Searching...</Text>
              </View>
            ) : (
              <>
                <View style={styles.coordRow}>
                  <Text style={styles.coordLabel}>Latitude</Text>
                  <View style={styles.coordInputs}>
                    <TextInput style={styles.coordInput} value={gpsLat.split('.')[0] || ''} keyboardType="numeric" onChangeText={v => setGpsLat(v + (gpsLat.includes('.') ? '.' + gpsLat.split('.')[1] : ''))} />
                    <TextInput style={[styles.coordInput, { flex: 2 }]} value={gpsLat.split('.')[1] || ''} keyboardType="numeric" onChangeText={v => setGpsLat((gpsLat.split('.')[0] || '0') + '.' + v)} />
                  </View>
                  <TouchableOpacity style={styles.gpsFab} onPress={getCurrentLocation}>
                    <Text style={styles.gpsFabIcon}>🎯</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.coordRow}>
                  <Text style={styles.coordLabel}>Longitude</Text>
                  <View style={styles.coordInputs}>
                    <TextInput style={styles.coordInput} value={gpsLon.split('.')[0] || ''} keyboardType="numeric" onChangeText={v => setGpsLon(v + (gpsLon.includes('.') ? '.' + gpsLon.split('.')[1] : ''))} />
                    <TextInput style={[styles.coordInput, { flex: 2 }]} value={gpsLon.split('.')[1] || ''} keyboardType="numeric" onChangeText={v => setGpsLon((gpsLon.split('.')[0] || '0') + '.' + v)} />
                  </View>
                </View>
                {accuracy !== null && (
                  <Text style={styles.accuracyText}>GPS accuracy {accuracy} m</Text>
                )}
              </>
            )}
          </View>

          <TouchableOpacity style={styles.addCatchBtn}>
            <Text style={styles.addCatchIcon}>🐟+</Text>
            <Text style={styles.addCatchText}>Add catch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addNoteBtn}>
            <Text style={styles.addNoteIcon}>📋</Text>
            <Text style={styles.addNoteText}>Add note</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function LocationsScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTip, setShowTip] = useState(true);

  useFocusEffect(useCallback(() => {
    Storage.getLocations().then(setLocations);
  }, []));

  const handleSave = async (data) => {
    const loc = await Storage.addLocation(data);
    setLocations(prev => [loc, ...prev]);
    setShowModal(false);
    Alert.alert('', 'Location added successfully!');
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Delete this location?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await Storage.deleteLocation(id);
          setLocations(prev => prev.filter(l => l.id !== id));
        }
      }
    ]);
  };

  const renderLocation = ({ item }) => (
    <TouchableOpacity style={styles.locationItem} onLongPress={() => handleDelete(item.id)}>
      <View style={styles.locationIcon}><Text style={styles.locationIconText}>{item.icon || '🎣'}</Text></View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationDate}>{new Date(item.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</Text>
      </View>
      <View style={styles.locationMeta}>
        <Text style={styles.locationDist}>0 m</Text>
        <Text style={styles.locationCatches}>🐟 {item.catches?.length || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab, i) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === i && styles.tabActive]} onPress={() => setActiveTab(i)}>
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 0 && (
        <>
          {showTip && (
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>📍 Location</Text>
              <Text style={styles.tipBody}>Location can be saved using GPS or manually by entering the coordinates. You can also add catches to your locations.</Text>
              <View style={styles.tipActions}>
                <TouchableOpacity style={styles.watchBtn}>
                  <Text style={styles.ytIcon}>▶</Text>
                  <Text style={styles.watchText}>WATCH VIDEO</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTip(false)}>
                  <Text style={styles.hideText}>HIDE</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {locations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No saved locations</Text>
              <Text style={styles.emptySubtext}>Tap 📍+ to add a location</Text>
            </View>
          ) : (
            <FlatList
              data={locations}
              keyExtractor={i => i.id}
              renderItem={renderLocation}
              contentContainerStyle={{ paddingBottom: 80 }}
            />
          )}
        </>
      )}
      {activeTab !== 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No {TABS[activeTab].toLowerCase()}</Text>
          <Text style={styles.emptySubtext}>Tap + to add</Text>
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>📍+</Text>
      </TouchableOpacity>

      <NewLocationModal visible={showModal} onClose={() => setShowModal(false)} onSave={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.primary },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.white },
  tabText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  tabTextActive: { color: COLORS.white },
  tipCard: { margin: 12, backgroundColor: COLORS.white, borderRadius: 8, padding: 16, elevation: 2 },
  tipTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  tipBody: { fontSize: 13, color: COLORS.text, lineHeight: 19 },
  tipActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  watchBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ytIcon: { backgroundColor: '#FF0000', color: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, fontSize: 12 },
  watchText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  hideText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: COLORS.textLight, fontSize: 13, marginTop: 6 },
  locationItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  locationIcon: {
    width: 48, height: 48, borderRadius: 10, backgroundColor: '#FFEBEE',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  locationIconText: { fontSize: 24 },
  locationInfo: { flex: 1 },
  locationName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  locationDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  locationMeta: { alignItems: 'flex-end' },
  locationDist: { fontSize: 13, color: COLORS.textSecondary },
  locationCatches: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  fab: {
    position: 'absolute', bottom: 24, right: 16,
    backgroundColor: COLORS.primary, width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', elevation: 6,
  },
  fabText: { fontSize: 22 },
  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingTop: 48, paddingHorizontal: 20, paddingBottom: 8,
  },
  modalCancel: { color: COLORS.white, fontSize: 20, padding: 4 },
  modalTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  modalSave: { color: COLORS.white, fontSize: 24, padding: 4 },
  modalHeaderBody: {
    backgroundColor: COLORS.primary, flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20,
  },
  iconPicker: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  selectedIcon: { fontSize: 36 },
  iconArrow: { color: COLORS.white, fontSize: 12, marginLeft: 2 },
  nameInputWrap: { flex: 1 },
  nameLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 },
  nameInput: { color: COLORS.white, fontSize: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.5)', paddingBottom: 4 },
  modalBody: { flex: 1 },
  coordCard: {
    margin: 12, backgroundColor: COLORS.white, borderRadius: 12,
    padding: 16, elevation: 2,
  },
  coordHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  coordHeaderIcon: { fontSize: 18, marginRight: 8 },
  coordTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  coordMenu: { padding: 4 },
  searchingRow: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  searchingText: { color: COLORS.primary, marginTop: 8, fontSize: 14 },
  coordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  coordLabel: { width: 80, fontSize: 13, color: COLORS.textSecondary },
  coordInputs: { flex: 1, flexDirection: 'row', gap: 8 },
  coordInput: {
    flex: 1, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    fontSize: 16, color: COLORS.text, paddingBottom: 4,
  },
  gpsFab: {
    marginLeft: 8, backgroundColor: COLORS.primary,
    width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
  },
  gpsFabIcon: { fontSize: 22 },
  accuracyText: { color: COLORS.textSecondary, fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  addCatchBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white,
    marginHorizontal: 12, borderRadius: 12, marginTop: 8,
  },
  addCatchIcon: { fontSize: 22, marginRight: 12 },
  addCatchText: { color: COLORS.primary, fontSize: 15 },
  addNoteBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white,
    marginHorizontal: 12, borderRadius: 12, marginTop: 8,
  },
  addNoteIcon: { fontSize: 22, marginRight: 12 },
  addNoteText: { color: COLORS.textSecondary, fontSize: 15 },
});
