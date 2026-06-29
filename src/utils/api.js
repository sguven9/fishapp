const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';
const MARINE_API = 'https://marine-api.open-meteo.com/v1/marine';
const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';

export async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,weather_code,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,relative_humidity_2m,uv_index',
    hourly: 'temperature_2m,precipitation,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
    wind_speed_unit: 'ms',
    timezone: 'auto',
    forecast_days: 7,
  });
  const res = await fetch(`${OPEN_METEO}?${params}`);
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}

export async function fetchMarine(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'wave_height,wave_direction,wave_period,ocean_current_velocity,ocean_current_direction,sea_surface_temperature',
    hourly: 'wave_height,wave_direction,wave_period,swell_wave_height',
    daily: 'wave_height_max,wave_period_max',
    timezone: 'auto',
    forecast_days: 7,
  });
  const res = await fetch(`${MARINE_API}?${params}`);
  if (!res.ok) throw new Error('Marine fetch failed');
  return res.json();
}

export async function geocodeCity(query) {
  const params = new URLSearchParams({ name: query, count: 5, language: 'en', format: 'json' });
  const res = await fetch(`${GEO_API}?${params}`);
  if (!res.ok) throw new Error('Geocode failed');
  const data = await res.json();
  return data.results || [];
}

export function getWeatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 99) return '⛈️';
  return '🌤️';
}

export function getWeatherLabel(code) {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Fog';
  if (code <= 55) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export function windDirection(degrees) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(degrees / 22.5) % 16];
}
