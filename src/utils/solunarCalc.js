import SunCalc from 'suncalc';

export function getSolunarData(lat, lon, date = new Date()) {
  const moonTimes = SunCalc.getMoonTimes(date, lat, lon);
  const moonIllum = SunCalc.getMoonIllumination(date);
  const moonPos = SunCalc.getMoonPosition(date, lat, lon);
  const sunTimes = SunCalc.getTimes(date, lat, lon);
  const sunPos = SunCalc.getPosition(date, lat, lon);

  const moonPhaseNames = [
    'New Moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous',
    'Full Moon', 'Waning gibbous', 'Last quarter', 'Waning crescent',
  ];
  const phaseIndex = Math.floor((moonIllum.phase + 0.0625) * 8) % 8;
  const phaseName = moonPhaseNames[phaseIndex];

  const moonDistanceKm = Math.round(moonPos.distance * 6371);
  const illuminationPct = Math.round(moonIllum.fraction * 1000) / 10;
  const ageDays = Math.round(moonIllum.phase * 29.53 * 10) / 10;

  const dayLength = (sunTimes.sunset - sunTimes.sunrise) / 3600000;
  const nightLength = 24 - dayLength;

  const solarNoon = sunTimes.solarNoon;
  const solarNoonStr = formatTime(solarNoon);

  const sunriseStr = formatTime(sunTimes.sunrise);
  const sunsetStr = formatTime(sunTimes.sunset);
  const dawnStr = formatTime(sunTimes.dawn);
  const duskStr = formatTime(sunTimes.dusk);
  const midnightStr = '00:00';

  let moonriseStr = moonTimes.rise ? formatTime(moonTimes.rise) : '--:--';
  let moonsetStr = moonTimes.set ? formatTime(moonTimes.set) : '--:--';

  return {
    moon: {
      phase: moonIllum.phase,
      phaseName,
      illumination: illuminationPct,
      age: ageDays,
      distance: moonDistanceKm,
      rise: moonriseStr,
      set: moonsetStr,
      riseTime: moonTimes.rise,
      setTime: moonTimes.set,
    },
    sun: {
      rise: sunriseStr,
      set: sunsetStr,
      dawn: dawnStr,
      dusk: duskStr,
      solarNoon: solarNoonStr,
      dayLength: formatDuration(dayLength * 3600000),
      nightLength: formatDuration(nightLength * 3600000),
      midnight: midnightStr,
    },
  };
}

function formatTime(date) {
  if (!date || isNaN(date)) return '--:--';
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatDuration(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h} h ${m} min`;
}

export function getWeekDays(date = new Date()) {
  const days = [];
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export function formatDayLabel(date) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return 'TODAY';
  return days[date.getDay()];
}
