import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LOCATIONS: 'fishapp_locations',
  CATCHES: 'fishapp_catches',
  SETTINGS: 'fishapp_settings',
  FORECAST_LOCATION: 'fishapp_forecast_location',
};

export const Storage = {
  async getLocations() {
    const data = await AsyncStorage.getItem(KEYS.LOCATIONS);
    return data ? JSON.parse(data) : [];
  },
  async saveLocations(locations) {
    await AsyncStorage.setItem(KEYS.LOCATIONS, JSON.stringify(locations));
  },
  async addLocation(location) {
    const locations = await Storage.getLocations();
    const newLocation = { ...location, id: Date.now().toString(), createdAt: new Date().toISOString() };
    locations.unshift(newLocation);
    await Storage.saveLocations(locations);
    return newLocation;
  },
  async deleteLocation(id) {
    const locations = await Storage.getLocations();
    await Storage.saveLocations(locations.filter(l => l.id !== id));
  },

  async getCatches() {
    const data = await AsyncStorage.getItem(KEYS.CATCHES);
    return data ? JSON.parse(data) : [];
  },
  async saveCatches(catches) {
    await AsyncStorage.setItem(KEYS.CATCHES, JSON.stringify(catches));
  },
  async addCatch(catchItem) {
    const catches = await Storage.getCatches();
    const newCatch = { ...catchItem, id: Date.now().toString(), createdAt: new Date().toISOString() };
    catches.unshift(newCatch);
    await Storage.saveCatches(catches);
    return newCatch;
  },
  async deleteCatch(id) {
    const catches = await Storage.getCatches();
    await Storage.saveCatches(catches.filter(c => c.id !== id));
  },

  async getSettings() {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      units: 'metric',
      lengthUnit: 'cm',
      weightUnit: 'kg',
      mapType: 'normal',
      notifications: true,
    };
  },
  async saveSettings(settings) {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  async getForecastLocation() {
    const data = await AsyncStorage.getItem(KEYS.FORECAST_LOCATION);
    return data ? JSON.parse(data) : null;
  },
  async saveForecastLocation(location) {
    await AsyncStorage.setItem(KEYS.FORECAST_LOCATION, JSON.stringify(location));
  },
};
