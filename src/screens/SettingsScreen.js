import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert
} from 'react-native';
import { Storage } from '../utils/storage';
import { COLORS } from '../theme/colors';

function SettingRow({ icon, label, subtitle, onPress, rightElement }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress && !rightElement}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightElement || (onPress ? <Text style={styles.rowArrow}>›</Text> : null)}
    </TouchableOpacity>
  );
}

function SettingSection({ title, children }) {
  return (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    units: 'metric',
    lengthUnit: 'cm',
    weightUnit: 'kg',
    mapType: 'normal',
    notifications: true,
  });

  useEffect(() => {
    Storage.getSettings().then(setSettings);
  }, []);

  const save = async (updates) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await Storage.saveSettings(newSettings);
  };

  const showPicker = (title, options, current, key) => {
    Alert.alert(title, '', options.map(opt => ({
      text: opt.label + (opt.value === current ? ' ✓' : ''),
      onPress: () => save({ [key]: opt.value }),
    })).concat([{ text: 'Cancel', style: 'cancel' }]));
  };

  const unitLabel = settings.units === 'metric' ? 'Metric (km, m, kg, °C)' : 'Imperial (mi, ft, lb, °F)';
  const mapLabel = { normal: 'Normal', satellite: 'Satellite', hybrid: 'Hybrid' }[settings.mapType] || 'Normal';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SettingSection>
        <SettingRow
          icon="📏"
          label="Measurement units"
          subtitle={unitLabel}
          onPress={() => showPicker('Measurement units', [
            { label: 'Metric (km, m, kg, °C)', value: 'metric' },
            { label: 'Imperial (mi, ft, lb, °F)', value: 'imperial' },
          ], settings.units, 'units')}
        />
      </SettingSection>

      <SettingSection>
        <SettingRow
          icon="🗺️"
          label="Maps"
          subtitle={`Default map: ${mapLabel}`}
          onPress={() => showPicker('Map type', [
            { label: 'Normal', value: 'normal' },
            { label: 'Satellite', value: 'satellite' },
            { label: 'Hybrid', value: 'hybrid' },
          ], settings.mapType, 'mapType')}
        />
      </SettingSection>

      <SettingSection>
        <SettingRow
          icon="⚙️"
          label="Other"
          onPress={() => Alert.alert('Other settings', 'Additional settings coming soon')}
        />
      </SettingSection>

      <SettingSection>
        <SettingRow
          icon="🔔"
          label="Notifications"
          subtitle={settings.notifications ? 'Enabled' : 'Disabled'}
          rightElement={
            <Switch
              value={settings.notifications}
              onValueChange={(v) => save({ notifications: v })}
              trackColor={{ true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          }
        />
      </SettingSection>

      <SettingSection>
        <SettingRow
          icon="👤"
          label="Account"
          subtitle="Manage account & profile"
          onPress={() => navigation?.navigate('Account')}
        />
      </SettingSection>

      <SettingSection title="Data">
        <SettingRow
          icon="🗑️"
          label="Clear all data"
          subtitle="Delete all locations and catches"
          onPress={() => Alert.alert('Clear data', 'This will delete all your locations and catches. Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear', style: 'destructive',
              onPress: async () => {
                await Storage.saveLocations([]);
                await Storage.saveCatches([]);
                Alert.alert('Done', 'All data cleared.');
              }
            }
          ])}
        />
      </SettingSection>

      <Text style={styles.version}>Fish App v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingVertical: 12 },
  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingBottom: 4,
    letterSpacing: 0.5,
  },
  sectionCard: { backgroundColor: COLORS.white },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowIcon: { fontSize: 22, width: 36 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, color: COLORS.text },
  rowSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  rowArrow: { fontSize: 20, color: COLORS.textSecondary },
  version: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 16,
    marginBottom: 32,
  },
});
