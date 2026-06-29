import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ScrollView, Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Storage } from '../utils/storage';
import { COLORS } from '../theme/colors';

function NewCatchModal({ visible, onClose, onSave }) {
  const [name, setName] = useState('');
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(null);
  const [date] = useState(new Date());

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Error', 'Please enter a catch name'); return; }
    onSave({ name: name.trim(), length, weight, note, photo, date: date.toISOString() });
    setName(''); setLength(''); setWeight(''); setNote(''); setPhoto(null);
  };

  const formatDate = (d) => {
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Today at ${time}` : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ` at ${time}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalCancel}>✕</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>New catch</Text>
            <TouchableOpacity onPress={handleSave}><Text style={styles.modalSave}>✓</Text></TouchableOpacity>
          </View>
          <View style={styles.modalHeaderBody}>
            <Text style={styles.catchNameLabel}>Catch name</Text>
            <TextInput
              style={styles.catchNameInput}
              placeholder="Enter catch name"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={name}
              onChangeText={setName}
            />
          </View>
          <ScrollView style={styles.modalBody}>
            <TouchableOpacity style={styles.fieldRow} onPress={pickPhoto}>
              <Text style={styles.fieldIcon}>📷</Text>
              {photo ? (
                <Image source={{ uri: photo }} style={{ width: 48, height: 48, borderRadius: 6 }} />
              ) : (
                <Text style={styles.fieldPlaceholder}>Add photos</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.fieldRow}>
              <Text style={styles.fieldIcon}>📍</Text>
              <Text style={styles.fieldPlaceholder}>Select fishing location</Text>
              <Text style={styles.fieldArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldIcon}>🐟</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Add length (cm)"
                placeholderTextColor={COLORS.textSecondary}
                value={length}
                onChangeText={setLength}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldIcon}>⚖️</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Add weight (kg)"
                placeholderTextColor={COLORS.textSecondary}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity style={styles.fieldRow}>
              <Text style={styles.fieldIcon}>🕐</Text>
              <Text style={styles.fieldValue}>{formatDate(date)}</Text>
              <Text style={styles.fieldArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldIcon}>📋</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Add note"
                placeholderTextColor={COLORS.textSecondary}
                value={note}
                onChangeText={setNote}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function CatchesScreen() {
  const [catches, setCatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  useFocusEffect(useCallback(() => {
    Storage.getCatches().then(setCatches);
  }, []));

  const handleSave = async (data) => {
    const c = await Storage.addCatch(data);
    setCatches(prev => [c, ...prev]);
    setShowModal(false);
    Alert.alert('', 'Catch added!', [{ text: 'VIEW', onPress: () => {} }, { text: 'OK' }]);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Delete this catch?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await Storage.deleteCatch(id);
          setCatches(prev => prev.filter(c => c.id !== id));
        }
      }
    ]);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday ? `Today at ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderGrid = ({ item }) => (
    <TouchableOpacity style={styles.gridItem} onLongPress={() => handleDelete(item.id)}>
      {item.photo ? (
        <Image source={{ uri: item.photo }} style={styles.gridImg} />
      ) : (
        <View style={styles.gridImgPlaceholder}>
          <Text style={styles.gridFishIcon}>🐟</Text>
        </View>
      )}
      <View style={styles.gridOverlay}>
        <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.gridDate}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderList = ({ item }) => (
    <TouchableOpacity style={styles.listItem} onLongPress={() => handleDelete(item.id)}>
      {item.photo ? (
        <Image source={{ uri: item.photo }} style={styles.listImg} />
      ) : (
        <View style={styles.listImgPlaceholder}>
          <Text style={{ fontSize: 30 }}>🐟</Text>
        </View>
      )}
      <View style={styles.listInfo}>
        <Text style={styles.listName}>{item.name}</Text>
        <Text style={styles.listDate}>{formatDate(item.createdAt)}</Text>
        {item.length ? <Text style={styles.listMeta}>📏 {item.length} cm</Text> : null}
        {item.weight ? <Text style={styles.listMeta}>⚖️ {item.weight} kg</Text> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {catches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🐟</Text>
          <Text style={styles.emptyText}>No catches yet</Text>
          <Text style={styles.emptySubtext}>Tap 🐟+ to add a catch</Text>
        </View>
      ) : (
        <FlatList
          data={catches}
          keyExtractor={i => i.id}
          renderItem={viewMode === 'grid' ? renderGrid : renderList}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          contentContainerStyle={{ padding: 4, paddingBottom: 80 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>🐟+</Text>
      </TouchableOpacity>

      <NewCatchModal visible={showModal} onClose={() => setShowModal(false)} onSave={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: 16, opacity: 0.3 },
  emptyText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: COLORS.textLight, fontSize: 13, marginTop: 6 },
  gridItem: { flex: 1, margin: 4, borderRadius: 10, overflow: 'hidden', height: 160, elevation: 2 },
  gridImg: { width: '100%', height: '100%' },
  gridImgPlaceholder: { width: '100%', height: '100%', backgroundColor: '#d0d0d0', alignItems: 'center', justifyContent: 'center' },
  gridFishIcon: { fontSize: 48, opacity: 0.4 },
  gridOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', padding: 8 },
  gridName: { color: COLORS.white, fontWeight: 'bold', fontSize: 13 },
  gridDate: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  listItem: { flexDirection: 'row', backgroundColor: COLORS.white, marginHorizontal: 8, marginVertical: 4, borderRadius: 10, overflow: 'hidden', elevation: 1 },
  listImg: { width: 80, height: 80 },
  listImgPlaceholder: { width: 80, height: 80, backgroundColor: '#d0d0d0', alignItems: 'center', justifyContent: 'center' },
  listInfo: { flex: 1, padding: 12 },
  listName: { fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  listDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  listMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  fab: {
    position: 'absolute', bottom: 24, right: 16,
    backgroundColor: COLORS.primary, width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', elevation: 6,
  },
  fabText: { fontSize: 22 },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '85%' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 8,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  modalCancel: { color: COLORS.white, fontSize: 20, padding: 4 },
  modalTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  modalSave: { color: COLORS.white, fontSize: 24, padding: 4 },
  modalHeaderBody: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingBottom: 20 },
  catchNameLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 },
  catchNameInput: { color: COLORS.white, fontSize: 22, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.5)', paddingBottom: 8 },
  modalBody: { paddingTop: 4, paddingBottom: 20 },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  fieldIcon: { fontSize: 22, width: 36 },
  fieldPlaceholder: { flex: 1, color: COLORS.textSecondary, fontSize: 15, fontStyle: 'italic' },
  fieldInput: { flex: 1, fontSize: 15, color: COLORS.text },
  fieldValue: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  fieldArrow: { color: COLORS.textSecondary, fontSize: 18 },
});
