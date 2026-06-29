import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../theme/colors';
import MapScreen from '../screens/MapScreen';
import LocationsScreen from '../screens/LocationsScreen';
import CatchesScreen from '../screens/CatchesScreen';
import WeatherScreen from '../screens/WeatherScreen';
import TidesScreen from '../screens/TidesScreen';
import WavesScreen from '../screens/WavesScreen';
import SolunarScreen from '../screens/SolunarScreen';
import FishActivityScreen from '../screens/FishActivityScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import PremiumScreen from '../screens/PremiumScreen';
import AccountScreen from '../screens/AccountScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function DrawerItem({ icon, label, count, onPress, active }) {
  return (
    <TouchableOpacity
      style={[styles.drawerItem, active && styles.drawerItemActive]}
      onPress={onPress}
    >
      <Text style={styles.drawerIcon}>{icon}</Text>
      <Text style={[styles.drawerLabel, active && styles.drawerLabelActive]}>{label}</Text>
      {count !== undefined && (
        <Text style={styles.drawerCount}>{count}</Text>
      )}
    </TouchableOpacity>
  );
}

function CustomDrawerContent(props) {
  const { navigation, state } = props;
  const currentRoute = state.routeNames[state.index];
  const nav = (screen) => { navigation.navigate(screen); };

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.appName}>🎣 Fish App</Text>
        <TouchableOpacity style={styles.trialBtn} onPress={() => nav('Premium')}>
          <Text style={styles.trialIcon}>⭐</Text>
          <Text style={styles.trialText}>Start 7-Day Free Trial</Text>
          <Text style={styles.trialArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <DrawerItem icon="🗺️" label="Map" active={currentRoute === 'Map'} onPress={() => nav('Map')} />
      <DrawerItem icon="📍" label="Locations" count={0} active={currentRoute === 'Locations'} onPress={() => nav('Locations')} />
      <DrawerItem icon="🐟" label="Catches" count={0} active={currentRoute === 'Catches'} onPress={() => nav('Catches')} />

      <Text style={styles.sectionLabel}>Forecasts</Text>
      <DrawerItem icon="📅" label="Fish activity" active={currentRoute === 'FishActivity'} onPress={() => nav('FishActivity')} />
      <DrawerItem icon="🌊" label="Waves" active={currentRoute === 'Waves'} onPress={() => nav('Waves')} />
      <DrawerItem icon="📈" label="Tides" active={currentRoute === 'Tides'} onPress={() => nav('Tides')} />
      <DrawerItem icon="🌤️" label="Weather" active={currentRoute === 'Weather'} onPress={() => nav('Weather')} />
      <DrawerItem icon="🌙" label="Solunar" active={currentRoute === 'Solunar'} onPress={() => nav('Solunar')} />

      <View style={styles.divider} />
      <DrawerItem icon="⚙️" label="Settings" active={currentRoute === 'Settings'} onPress={() => nav('Settings')} />
      <DrawerItem icon="ℹ️" label="About" active={currentRoute === 'About'} onPress={() => nav('About')} />
    </DrawerContentScrollView>
  );
}

function DrawerNav() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
        drawerStyle: { backgroundColor: COLORS.white, width: 280 },
      }}
    >
      <Drawer.Screen name="Map" component={MapScreen} options={{ title: 'Map', headerShown: false }} />
      <Drawer.Screen name="Locations" component={LocationsScreen} options={{
        headerRight: () => (
          <View style={{ flexDirection: 'row', marginRight: 8 }}>
            <TouchableOpacity style={{ padding: 8 }}><Text style={{ color: '#fff', fontSize: 20 }}>⬇️</Text></TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }}><Text style={{ color: '#fff', fontSize: 20 }}>⋮</Text></TouchableOpacity>
          </View>
        ),
      }} />
      <Drawer.Screen name="Catches" component={CatchesScreen} options={{
        headerRight: () => (
          <View style={{ flexDirection: 'row', marginRight: 8 }}>
            <TouchableOpacity style={{ padding: 8 }}><Text style={{ color: '#fff', fontSize: 20 }}>▦</Text></TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }}><Text style={{ color: '#fff', fontSize: 20 }}>⋮</Text></TouchableOpacity>
          </View>
        ),
      }} />
      <Drawer.Screen name="FishActivity" component={FishActivityScreen} options={{ title: 'Fish Activity' }} />
      <Drawer.Screen name="Waves" component={WavesScreen} />
      <Drawer.Screen name="Tides" component={TidesScreen} />
      <Drawer.Screen name="Weather" component={WeatherScreen} />
      <Drawer.Screen name="Solunar" component={SolunarScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
    </Drawer.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Drawer" component={DrawerNav} />
      <Stack.Screen name="Premium" component={PremiumScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Account" component={AccountScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: { flex: 1 },
  drawerHeader: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 10, marginBottom: 8 },
  appName: { color: COLORS.white, fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  trialBtn: {
    backgroundColor: '#FFC107',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  trialIcon: { fontSize: 18, marginRight: 8 },
  trialText: { flex: 1, fontWeight: 'bold', color: '#212121', fontSize: 14 },
  trialArrow: { color: '#212121', fontSize: 20 },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  drawerItemActive: { backgroundColor: '#E3F2FD' },
  drawerIcon: { fontSize: 20, marginRight: 16, width: 28, textAlign: 'center' },
  drawerLabel: { flex: 1, fontSize: 15, color: COLORS.text },
  drawerLabelActive: { color: COLORS.primary, fontWeight: '600' },
  drawerCount: { color: COLORS.textSecondary, fontSize: 14 },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    letterSpacing: 0.5,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
});
