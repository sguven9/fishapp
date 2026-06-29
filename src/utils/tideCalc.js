import SunCalc from 'suncalc';

// Simplified tidal calculation using M2, S2, N2 constituents
// Produces a realistic-looking tide curve based on astronomical data
export function calculateTides(lat, lon, date = new Date()) {
  const tides = [];
  const msPerDay = 86400000;

  for (let dayOffset = -1; dayOffset <= 30; dayOffset++) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() + dayOffset);

    const hourlyHeights = [];
    for (let h = 0; h <= 24; h += 0.25) {
      const t = new Date(dayStart.getTime() + h * 3600000);
      hourlyHeights.push({ time: h, height: tideHeight(lat, lon, t) });
    }

    // Find highs and lows
    const dayHighLow = [];
    for (let i = 1; i < hourlyHeights.length - 1; i++) {
      const prev = hourlyHeights[i - 1].height;
      const curr = hourlyHeights[i].height;
      const next = hourlyHeights[i + 1].height;
      if (curr > prev && curr > next) {
        dayHighLow.push({ type: 'high', time: hourlyHeights[i].time, height: curr });
      } else if (curr < prev && curr < next) {
        dayHighLow.push({ type: 'low', time: hourlyHeights[i].time, height: curr });
      }
    }

    tides.push({ date: new Date(dayStart), highLow: dayHighLow, hourly: hourlyHeights });
  }

  return tides;
}

function tideHeight(lat, lon, time) {
  const moon = SunCalc.getMoonPosition(time, lat, lon);
  const moonIllum = SunCalc.getMoonIllumination(time);
  const sun = SunCalc.getPosition(time, lat, lon);

  // M2 constituent: lunar semi-diurnal (~12.42h period)
  const M2_period = 12.4206012 * 3600000;
  const t = time.getTime();
  const moonPhaseAngle = moonIllum.angle;
  const M2 = Math.cos((2 * Math.PI * t) / M2_period + moon.azimuth);

  // S2 constituent: solar semi-diurnal (~12h period)
  const S2_period = 12 * 3600000;
  const S2 = 0.46 * Math.cos((2 * Math.PI * t) / S2_period + sun.azimuth);

  // N2: lunar elliptical variation
  const N2_period = 12.6583473 * 3600000;
  const N2 = 0.19 * Math.cos((2 * Math.PI * t) / N2_period + moon.azimuth * 0.9);

  // K1: lunisolar diurnal
  const K1_period = 23.9344696 * 3600000;
  const K1 = 0.14 * Math.cos((2 * Math.PI * t) / K1_period);

  // Spring/neap modulation from moon phase
  const springNeap = 0.9 + 0.1 * Math.cos(moonIllum.phase * 2 * Math.PI);

  const baseAmplitude = 0.06; // meters - adjusted for Mediterranean-like location
  const height = baseAmplitude * springNeap * (M2 + S2 + N2 + K1);

  return Math.round(height * 100) / 100;
}

export function getTodayTideInfo(lat, lon) {
  const now = new Date();
  const tides = calculateTides(lat, lon, now);
  const today = tides.find(t =>
    t.date.toDateString() === now.toDateString()
  ) || tides[1];

  const currentHeight = tideHeight(lat, lon, now);
  const nextHour = tideHeight(lat, lon, new Date(now.getTime() + 3600000));
  const trend = nextHour > currentHeight ? 'rising' : 'falling';

  const nextExtreme = today.highLow.find(hl => {
    const hlTime = new Date(today.date);
    hlTime.setHours(Math.floor(hl.time), (hl.time % 1) * 60, 0, 0);
    return hlTime > now;
  });

  let timeToNext = null;
  if (nextExtreme) {
    const hlTime = new Date(today.date);
    hlTime.setHours(Math.floor(nextExtreme.time), (nextExtreme.time % 1) * 60, 0, 0);
    const diff = hlTime - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    timeToNext = `${h} h ${m} min`;
  }

  const tidal_current = Math.round((nextHour - currentHeight) * 100) / 0.0001;

  return {
    current: currentHeight,
    trend,
    timeToNext,
    nextExtremeType: nextExtreme?.type || null,
    highLow: today.highLow,
    hourly: today.hourly,
    tidalCurrent: Math.round(tidal_current * 100) / 100,
  };
}
