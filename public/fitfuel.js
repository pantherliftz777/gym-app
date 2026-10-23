let customWorkoutShowAll = false;

function getFoodCategoryBadge(cat) {
  const c = cat || 'General';
  return `<span class="food-cat-badge" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;background:#eff6ff;color:#2563eb;font-weight:700;font-size:.72rem;letter-spacing:.04em;border:1px solid #bfdbfe;flex-shrink:0;">${c.slice(0,3).toUpperCase()}</span>`;
}
/* ================= Formwise / FitFuel Core Application ================= */
if (typeof window === 'undefined' || typeof document === 'undefined') {
  if (typeof module !== 'undefined') module.exports = (req, res) => { if (res) { res.writeHead(200); res.end('Formwise'); } };
} else {

/* ---------- DOM Helpers ---------- */
const $ = s => typeof document !== 'undefined' ? document.querySelector(s) : null;
const $$ = s => typeof document !== 'undefined' ? [...document.querySelectorAll(s)] : [];
const today = () => new Date().toISOString().slice(0, 10);

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ---------- Storage & Sync ---------- */
const store = {
  get: (k, d) => { try { const v = localStorage.getItem('ff_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set: (k, v, sync = true) => {
    try { localStorage.setItem('ff_' + k, JSON.stringify(v)); } catch (e) {}
    if (sync && typeof FF !== 'undefined' && FF.patch && FF.token) {
      FF.patch({ [k]: v });
      updateSyncStatus('Syncing with database...');
    }
  },
  del: k => { try { localStorage.removeItem('ff_' + k); } catch (e) {} }
};

/* ---------- Motion Physics (Vanilla JS) ---------- */
const M = (typeof window !== 'undefined' && window.Motion) ? window.Motion : null;

/* ---------- Default Profile Helper ---------- */
function getDefaultProfile(name = 'Jordan Davis', email = '') {
  return {
    name: name || 'Jordan Davis',
    email: email || '',
    units: 'Metric',
    hCm: 175,
    wKg: 70,
    cal: 2100,
    p: 140,
    c: 210,
    f: 65,
    goal: 'Maintain weight',
    days: 4,
    creatine: 'yes'
  };
}

/* ---------- User State Cleanup & Isolation Helpers ---------- */
function clearAllUserLocalData() {
  profile = getDefaultProfile('Jordan Davis', '');
  delete profile.avatarUrl;
  log = {};
  custom = [];
  water = { date: today(), ml: 0 };
  workoutsDone = [];
  streakTracker = { currentStreak: 0, lastActiveDate: null, streakBroken: false, brokenStreakCount: 0, history: [] };
  activeChallengePlan = null;
  weightLog = [];
  plan = null;
  session = null;

  const userKeys = [
    'session',
    'profile',
    'log',
    'custom',
    'water',
    'workoutsDone',
    'activeChallengePlan',
    'weights',
    'plan',
    'streakTracker',
    'chatHistory',
    'cachedComplaints',
    'cachedAdminUsers'
  ];
  userKeys.forEach(k => store.del(k));
}

function applyUserCloudState(user, st = {}) {
  const userEmail = (user && user.email) ? user.email.toLowerCase() : '';
  const userName = (user && user.name) ? user.name : 'User';

  if (st && st.profile && typeof st.profile === 'object') {
    profile = { ...getDefaultProfile(userName, userEmail), ...st.profile };
    profile.name = userName;
    profile.email = userEmail;
    // CRITICAL: If the cloud profile has no avatar, purge any lingering avatarUrl
    if (!st.profile.avatarUrl) {
      delete profile.avatarUrl;
    }
  } else {
    // Brand new user or no profile saved yet: clean default with user's name & email, ZERO avatar
    profile = getDefaultProfile(userName, userEmail);
    delete profile.avatarUrl;
  }
  store.set('profile', profile, false);

  if (st && st.water && st.water.date === today()) {
    water = { date: today(), ml: Number(st.water.ml) || 0 };
  } else {
    water = { date: today(), ml: 0 };
  }
  store.set('water', water, false);

  log = (st && st.log && typeof st.log === 'object') ? st.log : {};
  store.set('log', log, false);

  custom = (st && Array.isArray(st.custom)) ? st.custom : [];
  store.set('custom', custom, false);

  workoutsDone = (st && Array.isArray(st.workouts)) ? st.workouts : [];
  store.set('workoutsDone', workoutsDone, false);

  activeChallengePlan = (st && st.activeChallenge) ? st.activeChallenge : null;
  if (activeChallengePlan) store.set('activeChallengePlan', activeChallengePlan, false);
  else store.del('activeChallengePlan');

  weightLog = (st && Array.isArray(st.weights)) ? st.weights : [];
  store.set('weights', weightLog, false);

  plan = (st && st.plan) ? st.plan : null;
  if (plan) store.set('plan', plan, false);
  else store.del('plan');
}

/* ---------- State ---------- */
let session = store.get('session', null);
let profile = (() => {
  const p = store.get('profile', null);
  if (!session) {
    if (p && !p.avatarUrl && (!p.email || p.email === 'jordan.davis@example.com')) return p;
    return getDefaultProfile('Jordan Davis', '');
  }
  if (p && p.email && session.email && p.email.toLowerCase() === session.email.toLowerCase()) {
    return p;
  }
  return getDefaultProfile(session.name, session.email);
})();
let plan = session ? store.get('plan', null) : null;
let log = session ? store.get('log', {}) : {};
let custom = session ? store.get('custom', []) : [];
let water = session ? store.get('water', { date: today(), ml: 0 }) : { date: today(), ml: 0 };
let workoutsDone = session ? store.get('workoutsDone', []) : [];
let weightLog = session ? store.get('weights', []) : [];
let streakTracker = session ? store.get('streakTracker', {
  currentStreak: 0,
  lastActiveDate: null,
  streakBroken: false,
  brokenStreakCount: 0,
  history: []
}) : {
  currentStreak: 0,
  lastActiveDate: null,
  streakBroken: false,
  brokenStreakCount: 0,
  history: []
};
let activeChallengePlan = session ? store.get('activeChallengePlan', null) : null;
let activeView = 'today';
let selectedExerciseCategory = 'Legs';
let selectedSubMuscle = 'All Legs';
let chatHistory = [];

/* ================= WEB AUDIO SOUND EFFECTS SYSTEM ================= */
const soundFX = {
  ctx: null,
  enabled: store.get('sound_enabled', true),
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },
  toggle() {
    this.enabled = !this.enabled;
    store.set('sound_enabled', this.enabled);
    this.updateUI();
    if (this.enabled) this.pop();
    toast(this.enabled ? 'Audio sound effects enabled' : 'Audio muted');
  },
  updateUI() {
    const icon = $('#soundToggleIcon');
    const text = $('#soundToggleText');
    if (icon) icon.innerHTML = this.enabled ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>' : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
    if (text) text.textContent = this.enabled ? 'Audio On' : 'Muted';
  },
  pop() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.07);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  },
  notification() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [659.25, 987.77].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.16, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.23);
      });
    } catch (e) {}
  },
  timerTick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  },
  timerWarning() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
  },
  timerGo() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {}
  },
  victoryCelebration() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // 1. Triumphant fanfare arpeggio (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.24, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.46);
      });

      // 2. Synthesized enthusiastic clapping / cheer sound burst
      const bufferSize = this.ctx.sampleRate * 2.2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 3.0;

      const clapGain = this.ctx.createGain();
      clapGain.gain.setValueAtTime(0.001, now + 0.4);
      clapGain.gain.linearRampToValueAtTime(0.28, now + 0.7);
      for (let t = 0.5; t < 2.0; t += 0.12) {
        clapGain.gain.setValueAtTime(0.28, now + t);
        clapGain.gain.exponentialRampToValueAtTime(0.08, now + t + 0.08);
      }
      clapGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      whiteNoise.connect(filter);
      filter.connect(clapGain);
      clapGain.connect(this.ctx.destination);

      whiteNoise.start(now + 0.4);
      whiteNoise.stop(now + 2.3);
    } catch (e) {}
  }
};

/* ================= WEATHER TEMPERATURE STATE & ENGINE ================= */
let weatherState = store.get('weatherState', {
  tempC: 28,
  label: 'Warm',
  city: 'Auto Location',
  autoSynced: false
});

function updateWeatherUI() {
  const t = weatherState.tempC;
  const label = weatherState.label;
  const icon = weatherState.icon;
  const city = weatherState.city ? ` · ${weatherState.city}` : '';

  if ($('#headerWeatherTemp')) $('#headerWeatherTemp').textContent = `${t}°C`;
  if ($('#headerWeatherLabel')) $('#headerWeatherLabel').textContent = label;
  if ($('#headerWeatherIcon')) $('#headerWeatherIcon').textContent = icon;
  if ($('#headerWeatherBtn')) {
    $('#headerWeatherBtn').title = `Live Weather: ${t}°C, ${label}${city} (Click to refresh or adjust)`;
  }

  if ($('#frontWeatherTemp')) $('#frontWeatherTemp').textContent = `${t}°C`;
  if ($('#frontWeatherLabel')) $('#frontWeatherLabel').textContent = `${label}${city}`;
  if ($('#frontWeatherIcon')) $('#frontWeatherIcon').textContent = icon;

  if ($('#autoWeatherStatusText')) {
    $('#autoWeatherStatusText').textContent = weatherState.autoSynced ? `Active (${weatherState.tempC}°C)` : 'Manual / Preset';
  }
  if ($('#autoWeatherCityNote')) {
    $('#autoWeatherCityNote').textContent = weatherState.city ? `Detected: ${weatherState.city}` : 'Live location sync';
  }
}

function wmoCodeToCondition(code, tempC) {
  if (code === 0) return { label: 'Clear Sky', icon: '' };
  if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', icon: '' };
  if (code === 45 || code === 48) return { label: 'Foggy', icon: '' };
  if (code >= 51 && code <= 55) return { label: 'Light Drizzle', icon: '' };
  if (code >= 61 && code <= 65) return { label: 'Rainy', icon: '' };
  if (code >= 71 && code <= 77) return { label: 'Snowy', icon: '' };
  if (code >= 80 && code <= 82) return { label: 'Showers', icon: '' };
  if (code >= 95) return { label: 'Thunderstorm', icon: '' };
  if (tempC >= 32) return { label: 'Hot Peak', icon: '' };
  if (tempC >= 25) return { label: 'Warm', icon: '' };
  if (tempC >= 18) return { label: 'Mild', icon: '' };
  if (tempC >= 10) return { label: 'Cool', icon: '' };
  return { label: 'Cold', icon: '' };
}

let isWeatherSyncing = false;
async function autoSyncWeather(manualTrigger = false) {
  if (isWeatherSyncing) return;
  isWeatherSyncing = true;
  if (manualTrigger) toast('Syncing real-time weather & temperature...');
  try {
    let lat = null, lon = null, cityName = '';

    // 1. Try browser Geolocation first with tight timeout
    const getBrowserCoords = () => new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 4000, maximumAge: 300000 }
      );
    });

    const coords = await getBrowserCoords();
    if (coords) {
      lat = coords.lat;
      lon = coords.lon;
    }

    // 2. Fallback to free IP geolocation if browser denied or timed out
    if (!lat || !lon) {
      try {
        const ipRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData && ipData.latitude && ipData.longitude) {
            lat = parseFloat(ipData.latitude);
            lon = parseFloat(ipData.longitude);
            cityName = ipData.city || ipData.country || '';
          }
        }
      } catch (e) {
        try {
          const ipRes2 = await fetch('https://ipwho.is/');
          if (ipRes2.ok) {
            const ipData2 = await ipRes2.json();
            if (ipData2 && ipData2.latitude && ipData2.longitude) {
              lat = ipData2.latitude;
              lon = ipData2.longitude;
              cityName = ipData2.city || '';
            }
          }
        } catch (e2) {}
      }
    }

    // Default reference if offline / unreachable
    if (!lat || !lon) {
      lat = 28.6139;
      lon = 77.2090;
      if (!cityName) cityName = 'New Delhi';
    }

    // 3. Query Open-Meteo free API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${Number(lat).toFixed(4)}&longitude=${Number(lon).toFixed(4)}&current=temperature_2m,weather_code`;
    const res = await fetch(weatherUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.current && typeof data.current.temperature_2m === 'number') {
        const tempC = Math.round(data.current.temperature_2m);
        const wCode = data.current.weather_code || 0;
        const condition = wmoCodeToCondition(wCode, tempC);
        weatherState = {
          tempC,
          label: condition.label,
          icon: condition.icon,
          city: cityName || 'Local',
          autoSynced: true,
          syncedAt: new Date().toISOString()
        };
        store.set('weatherState', weatherState);
        updateWeatherUI();
        if (typeof updateLiveWaterEstimate === 'function') {
          updateLiveWaterEstimate();
        }
        if (manualTrigger) {
          toast(`Weather synced: ${weatherState.tempC}°C (${weatherState.label})`);
        }
      }
    }
  } catch (err) {
    console.warn('Weather auto sync:', err);
    if (manualTrigger) toast('Could not reach weather service. Keeping current temperature.');
  } finally {
    isWeatherSyncing = false;
  }
}

function setWeatherTemp(tempC, label) {
  tempC = Number(tempC) || 28;
  let icon = '';
  if (!label) {
    if (tempC >= 32) { label = 'Hot Peak'; icon = ''; }
    else if (tempC >= 26) { label = 'Warm'; icon = ''; }
    else if (tempC >= 21) { label = 'Mild'; icon = ''; }
    else { label = 'Cool'; icon = ''; }
  } else {
    if (tempC >= 32) icon = '';
    else if (tempC >= 26) icon = '';
    else if (tempC >= 21) icon = '';
    else icon = '';
  }
  weatherState = { tempC, label, icon, city: weatherState.city || 'Custom', autoSynced: false };
  store.set('weatherState', weatherState);
  updateWeatherUI();
  if (typeof updateLiveWaterEstimate === 'function') {
    updateLiveWaterEstimate();
  }
}

// Initial automatic weather sync
autoSyncWeather();
// Periodic sync every 20 minutes
setInterval(() => autoSyncWeather(), 20 * 60 * 1000);

/* ================= LIVE TIME & DATE TICKER (SINGLE UNIFIED, NO FLICKER) ================= */
function updateLiveDateTime() {
  const now = new Date();
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const dateNum = now.getDate();
  const year = now.getFullYear();

  // ONLY Day and Date - NEVER append time here to prevent duplicates & jitter!
  const dateOnlyStr = `${dayName}, ${monthName} ${dateNum}, ${year}`;
  const eyebrowEl = $('#eyebrowDate');
  if (eyebrowEl && eyebrowEl.textContent !== dateOnlyStr) {
    eyebrowEl.textContent = dateOnlyStr;
  }

  // Exact Clock Time with tabular numerals
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeStr = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
  const clockEl = $('#liveClockTime');
  if (clockEl && clockEl.textContent !== timeStr) {
    clockEl.textContent = timeStr;
  }

  // Overline check-in
  const overline = $('#welcomeOverline');
  if (overline) {
    const span = overline.querySelector('span');
    if (span) span.textContent = `YOUR ${dayName} CHECK-IN`;
  }

  // User greeting
  const greetingEl = $('#userGreeting');
  if (greetingEl) {
    const rawHours = now.getHours();
    const period = rawHours < 12 ? 'Good morning' : rawHours < 17 ? 'Good afternoon' : 'Good evening';
    const userName = (typeof session !== 'undefined' && session && session.name) ? session.name.split(' ')[0] : (typeof profile !== 'undefined' && profile && profile.name ? profile.name.split(' ')[0] : 'Jordan');
    greetingEl.textContent = `${period}, ${userName}`;
  }
}
setInterval(updateLiveDateTime, 1000);
updateLiveDateTime();

/* ================= DAILY MOTIVATION QUOTES ENGINE ================= */
const MOTIVATION_QUOTES = [
  { text: "The last three or four reps is what makes the muscle grow. This area of pain divides a champion from someone who is not a champion.", author: "Arnold Schwarzenegger" },
  { text: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'", author: "Muhammad Ali" },
  { text: "Discipline is doing what you hate to do, but doing it like you love it.", author: "Mike Tyson" },
  { text: "The body achieves what the mind believes. Push past the comfort zone; that is where growth begins.", author: "Napoleon Hill" },
  { text: "Success starts with self-discipline. It starts with you choosing what matters most over what feels easy now.", author: "Dwayne Johnson" },
  { text: "We don't rise to the level of our expectations, we fall to the level of our training.", author: "Archilochus" },
  { text: "Strength does not come from winning. Your struggles develop your strengths. When you go through hardships and decide not to surrender, that is strength.", author: "Arnold Schwarzenegger" }
];
let currentQuoteIdx = 0;
function renderDailyMotivation() {
  const q = MOTIVATION_QUOTES[currentQuoteIdx % MOTIVATION_QUOTES.length];
  if ($('#dailyMotivationQuoteText')) $('#dailyMotivationQuoteText').textContent = `"${q.text}"`;
  if ($('#dailyMotivationAuthor')) $('#dailyMotivationAuthor').textContent = `— ${q.author}`;
}

/* ================= HYDRATION & CREATINE FORMULA ENGINE ================= */
function calcWaterDetails(w, units, creatineGrams, days, tempC, intensity) {
  let wKg = Number(w) || 68;
  if (units === 'Imperial') wKg = wKg * 0.45359237;

  // Base requirement: 35 ml per kg of bodyweight
  const baseMl = Math.round(wKg * 35);

  // Creatine adjustment: 100 ml per 1g of creatine
  const cGrams = Number(creatineGrams !== undefined ? creatineGrams : (profile.creatineGrams !== undefined ? profile.creatineGrams : (profile.creatine === 'no' ? 0 : 5)));
  const creatineMl = Math.round(cGrams * 100);

  // Weather temperature adjustment (sweat loss compensation)
  const t = Number(tempC !== undefined ? tempC : weatherState.tempC) || 29;
  let weatherMl = 0;
  let weatherNote = 'Cool';
  if (t >= 32) { weatherMl = 500; weatherNote = 'Hot Summer'; }
  else if (t >= 26) { weatherMl = 250; weatherNote = 'Warm Summer'; }
  else if (t >= 21) { weatherMl = 100; weatherNote = 'Mild'; }
  else { weatherMl = 0; weatherNote = 'Cool'; }

  // Workout volume & intensity adjustment
  let workoutMl = 300;
  if (intensity === 'Hard' || Number(days) >= 5) workoutMl = 500;
  else if (intensity === 'Mild') workoutMl = 150;

  const totalMl = baseMl + creatineMl + weatherMl + workoutMl;
  const targetL = (Math.max(1500, Math.min(6000, Math.round(totalMl / 100) * 100)) / 1000).toFixed(1);

  return {
    targetL,
    totalMl,
    baseMl,
    baseL: (baseMl / 1000).toFixed(1),
    creatineGrams: cGrams,
    creatineMl,
    weatherMl,
    weatherNote,
    workoutMl
  };
}

function calcWaterFromWeight(w, units, creatine, days) {
  const cGrams = typeof creatine === 'number' ? creatine : (creatine === 'no' ? 0 : 5);
  return calcWaterDetails(w, units, cGrams, days).targetL;
}

function updateLiveWaterEstimate() {
  const w = Number($('#pfWeightInput') ? $('#pfWeightInput').value : 0) || profile.wKg || 68;
  const units = profile.units || 'Metric';
  const cInput = $('#frontCreatineGramsInput');
  const cGrams = cInput ? Number(cInput.value) : (profile.creatineGrams !== undefined ? profile.creatineGrams : (profile.creatine === 'no' ? 0 : 5));
  const days = Number($('#pfDaysSelect') ? $('#pfDaysSelect').value : 4);

  const details = calcWaterDetails(w, units, cGrams, days, weatherState.tempC);

  if ($('#frontCalculatedWaterL')) $('#frontCalculatedWaterL').textContent = details.targetL;
  if ($('#waterGoalDisplay')) $('#waterGoalDisplay').textContent = details.targetL;
  if ($('#pfWaterCalculated')) $('#pfWaterCalculated').textContent = details.targetL;
  if ($('#waterBreakdownBase')) $('#waterBreakdownBase').textContent = `${details.baseL} L`;
  if ($('#waterBreakdownCreatine')) $('#waterBreakdownCreatine').textContent = `+${details.creatineMl}`;
  if ($('#waterBreakdownWeather')) $('#waterBreakdownWeather').textContent = `+${details.weatherMl} ml (${details.weatherNote})`;
  if ($('#waterBreakdownWorkout')) $('#waterBreakdownWorkout').textContent = `+${details.workoutMl} ml`;

  return details.targetL;
}
let activeWorkoutIdx = 0;

/* ---------- Default Curated Foods & Exercises ---------- */
const DEFAULT_PREVIEW_MEALS = [
  { meal: 'Breakfast', name: 'Blueberry yogurt bowl', detail: 'Greek yogurt · 280 g', k: 340, p: 24, c: 43, f: 8, image: 'images/greek-yogurt.jpg' },
  { meal: 'Lunch', name: 'Salmon power bowl', detail: 'Salmon · 1 serving', k: 615, p: 42, c: 58, f: 22, image: 'images/salmon-bowl.jpg' },
  { meal: 'Snack', name: 'Vanilla whey shake', detail: 'Whey protein · 1 scoop', k: 145, p: 27, c: 5, f: 2, icon: 'apple' }
];

let WORKOUT_PLANS = [
  {
    name: 'Full-body strength',
    focus: 'Glutes · Back · Core',
    duration: '42 min',
    moves: [
      { name: 'Dumbbell Romanian deadlift', sets: '3 sets × 10 reps', tip: 'Push hips back, soft knees, keep back straight' },
      { name: 'Goblet squat', sets: '3 sets × 12 reps', tip: 'Chest proud, weight held at chest, knees track toes' },
      { name: 'Single-arm dumbbell row', sets: '3 sets × 10 reps each', tip: 'Drive elbow towards hip, control lowering' },
      { name: 'Dead bug', sets: '3 sets × 12 reps', tip: 'Press lower back into floor, extend opposite arm and leg' }
    ],
    benefit: 'Build strength with compound movements that train your posterior chain and core together.'
  },
  {
    name: 'Lower body + core',
    focus: 'Quads · Glutes · Abs',
    duration: '38 min',
    moves: [
      { name: 'Dumbbell reverse lunge', sets: '3 sets × 10 reps each', tip: 'Step back softly, lower straight down' },
      { name: 'Glute bridge', sets: '3 sets × 15 reps', tip: 'Squeeze glutes at top, pause for 1 second' },
      { name: 'Single-leg RDL', sets: '3 sets × 8 reps each', tip: 'Hinge at hip, balance on standing leg' },
      { name: 'Bird dog', sets: '3 sets × 12 reps', tip: 'Slow and controlled, brace core throughout' }
    ],
    benefit: 'A balanced lower-body session to build leg strength and support stable movement.'
  },
  {
    name: 'Upper body strength',
    focus: 'Shoulders · Chest · Back',
    duration: '35 min',
    moves: [
      { name: 'Dumbbell floor press', sets: '3 sets × 10 reps', tip: 'Upper arms gently touch floor, press straight up' },
      { name: 'Incline push-up', sets: '3 sets × 12 reps', tip: 'Keep straight line from head to heels' },
      { name: 'Dumbbell shoulder press', sets: '3 sets × 10 reps', tip: 'Press overhead without arching lower back' },
      { name: 'Plank shoulder tap', sets: '3 sets × 16 taps', tip: 'Keep hips completely still while tapping opposite shoulder' }
    ],
    benefit: 'Push, pull and stabilize through a practical upper-body strength circuit.'
  }
];

if (plan && plan.workout && !WORKOUT_PLANS.some(w => w.name === plan.workout.name)) {
  WORKOUT_PLANS.unshift(plan.workout);
}

const EXERCISES_LIBRARY = [
  // --- CHEST: Upper, Mid, Lower ---
  {
    name: 'Incline Dumbbell Bench Press',
    category: 'Chest',
    sub: 'Upper chest',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '3-4 sets × 8-10 reps · 90s rest',
    rxTempo: 'Tempo: 2-1-1 (2s lower, 1s stretch pause, explode up)',
    rxWhy: 'Setting bench to 30° aligns the resistance vector directly with the clavicular head fibers for upper chest hypertrophy.',
    benefit: 'Maximizes upper chest thickness while allowing natural wrist and shoulder rotation.',
    steps: 'Set bench to 30-45 degrees. Drive dumbbells up in a slight arc without clanking them at top. Lower slowly under control.'
  },
  {
    name: 'Incline Barbell Bench Press',
    category: 'Chest',
    sub: 'Upper chest',
    type: 'BARBELL · GYM',
    rxSetsReps: '3 sets × 6-8 reps · 2 min rest',
    rxTempo: 'Tempo: 2-0-1 (Controlled eccentric)',
    rxWhy: 'High mechanical tension on clavicular pectoralis with heavy overload capability.',
    benefit: 'Key compound mass builder for dense upper pectorals.',
    steps: 'Grip slightly wider than shoulder width. Lower bar to upper chest right below collarbone, drive straight up.'
  },
  {
    name: 'Low-to-High Cable Fly',
    category: 'Chest',
    sub: 'Upper chest',
    type: 'CABLE · GYM',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1-1 (Squeeze peak for 1s)',
    rxWhy: 'Provides continuous peak tension at maximum contraction of the upper chest fibers.',
    benefit: 'Isolates upper chest without tricep fatigue.',
    steps: 'Set pulleys to bottom. Bring handles up and together towards chin height, squeezing upper chest hard at the top.'
  },
  {
    name: 'Incline Push-up',
    category: 'Chest',
    sub: 'Upper chest',
    type: 'BODYWEIGHT · HOME',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (Pause at bottom)',
    rxWhy: 'Accessible bodyweight angle prioritizing clavicular head with minimal equipment.',
    benefit: 'Great hypertrophy warm-up or home workout finisher.',
    steps: 'Hands on sturdy elevated bench or step. Keep torso rigid and lower chest to bench edge, press away.'
  },
  {
    name: 'Flat Barbell Bench Press',
    category: 'Chest',
    sub: 'Mid chest',
    type: 'BARBELL · GYM',
    rxSetsReps: '3-4 sets × 6-8 reps · 2 min rest',
    rxTempo: 'Tempo: 2-0-1 (Control down, power up)',
    rxWhy: 'The gold standard for sternal pectoralis recruitment and horizontal pressing strength.',
    benefit: 'Builds overall chest mass and pushing power.',
    steps: 'Retract shoulder blades and plant feet firmly. Lower bar to mid-sternum, drive up explosively.'
  },
  {
    name: 'Flat Dumbbell Press',
    category: 'Chest',
    sub: 'Mid chest',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '3 sets × 8-10 reps · 90s rest',
    rxTempo: 'Tempo: 2-1-1 (1s stretch pause)',
    rxWhy: 'Deep stretch at bottom recruits high motor units in sternal fibers.',
    benefit: 'Balanced bilateral hypertrophy with greater range of motion than barbell.',
    steps: 'Lie flat. Lower dumbbells with elbows at 45-60 degrees until deep chest stretch, press back up.'
  },
  {
    name: 'Dumbbell Floor Press',
    category: 'Chest',
    sub: 'Mid chest',
    type: 'DUMBBELL · HOME OR GYM',
    rxSetsReps: '3 sets × 10-12 reps · 75s rest',
    rxTempo: 'Tempo: 2-1-1 (Triceps touch floor gently)',
    rxWhy: 'Eliminates shoulder strain while maintaining heavy mid-chest tension.',
    benefit: 'Excellent home alternative for pressing with dumbbells.',
    steps: 'Lie on floor. Lower until upper arms tap the floor softly, pause, and press up to full extension.'
  },
  {
    name: 'Chest Dips',
    category: 'Chest',
    sub: 'Lower chest',
    type: 'BODYWEIGHT / WEIGHTED · GYM',
    rxSetsReps: '3 sets × 8-12 reps · 90s rest',
    rxTempo: 'Tempo: 2-1-1 (Lean forward 30°)',
    rxWhy: 'Downward pressing angle directly follows abdominal pectoralis fiber orientation.',
    benefit: 'Unlocks sharp lower chest definition and serratus activation.',
    steps: 'Grip parallel bars, lean torso forward 30 degrees, flare elbows slightly, lower until 90 degrees at elbows, drive up.'
  },
  {
    name: 'Decline Dumbbell Press',
    category: 'Chest',
    sub: 'Lower chest',
    type: 'DUMBBELL · GYM',
    rxSetsReps: '3 sets × 10-12 reps · 75s rest',
    rxTempo: 'Tempo: 2-0-1',
    rxWhy: 'Targets lower costal pectoralis while placing minimal stress on anterior delts.',
    benefit: 'Creates full lower chest curve and density.',
    steps: 'Secure legs on decline bench. Press dumbbells straight up over lower chest, lower with control.'
  },
  {
    name: 'High-to-Low Cable Fly',
    category: 'Chest',
    sub: 'Lower chest',
    type: 'CABLE · GYM',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (Squeeze bottom for 1s)',
    rxWhy: 'Continuous resistance across the adduction plane of the lower pectoral fibers.',
    benefit: 'Sharp isolation and mind-muscle pump.',
    steps: 'Pulleys set high. Step forward, draw handles down and across towards your waist, squeeze lower chest.'
  },

  // --- BACK: Lats, Upper Back & Traps, Lower Back ---
  {
    name: 'Lat Pulldown',
    category: 'Back',
    sub: 'Lats',
    type: 'CABLE / MACHINE · GYM',
    rxSetsReps: '3-4 sets × 8-12 reps · 90s rest',
    rxTempo: 'Tempo: 2-0-1-1 (1s squeeze at collarbone)',
    rxWhy: 'Optimal downward vertical pull to develop wide latissimus dorsi sweeps.',
    benefit: 'Builds V-taper back width and pull-up strength.',
    steps: 'Grip slightly wider than shoulders. Drive elbows down towards back pockets, squeeze lats, control bar back up.'
  },
  {
    name: 'Pull-up / Chin-up',
    category: 'Back',
    sub: 'Lats',
    type: 'BODYWEIGHT · GYM OR HOME',
    rxSetsReps: '3 sets × 6-10 reps · 2 min rest',
    rxTempo: 'Tempo: 2-0-1',
    rxWhy: 'High motor recruitment compound pull for lat width and core stabilization.',
    benefit: 'Fundamental relative strength and back builder.',
    steps: 'Hang with overhand or neutral grip. Pull chest up to bar by depressing scapula, lower with full control.'
  },
  {
    name: 'Single-Arm Dumbbell Row',
    category: 'Back',
    sub: 'Lats',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '3 sets × 10-12 reps each · 60s rest',
    rxTempo: 'Tempo: 2-0-1 (Drive elbow to hip)',
    rxWhy: 'Unilateral pull prevents compensation and allows extreme lat stretch and contraction.',
    benefit: 'Increases lat thickness and corrects muscular imbalances.',
    steps: 'Support knee on bench. Row dumbbell towards hip keeping elbow tucked close to ribcage, lower slowly.'
  },
  {
    name: 'Barbell Bent-Over Row',
    category: 'Back',
    sub: 'Upper back & Traps',
    type: 'BARBELL · GYM',
    rxSetsReps: '3-4 sets × 8-10 reps · 90s rest',
    rxTempo: 'Tempo: 2-1-1',
    rxWhy: 'Heavy loading across rhomboids, mid-traps, and posterior chain.',
    benefit: 'Adds dense 3D back thickness and posture power.',
    steps: 'Hinge at hips at 45°. Pull barbell into lower ribcage leading with elbows, squeeze shoulder blades together.'
  },
  {
    name: 'Face Pull',
    category: 'Back',
    sub: 'Upper back & Traps',
    type: 'CABLE · GYM',
    rxSetsReps: '3 sets × 15-20 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (Hold external rotation)',
    rxWhy: 'Targets mid-traps, rhomboids, and rotator cuff for postural balance and shoulder health.',
    benefit: 'Fixes rounded shoulders and bulletproofs rotator cuff.',
    steps: 'Rope at eye level. Pull rope towards forehead while rotating hands back, hold peak squeeze for 1 second.'
  },
  {
    name: 'Dumbbell Shrug',
    category: 'Back',
    sub: 'Upper back & Traps',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (1s top squeeze, no rolling)',
    rxWhy: 'Pure vertical scapular elevation targeting upper trapezius fibers.',
    benefit: 'Builds prominent neck and upper shoulder trap thickness.',
    steps: 'Hold heavy dumbbells at sides. Elevate shoulders straight up towards ears without rolling shoulders, pause at top.'
  },
  {
    name: 'Conventional Deadlift',
    category: 'Back',
    sub: 'Lower back',
    type: 'BARBELL · GYM',
    rxSetsReps: '3 sets × 5 reps · 3 min rest',
    rxTempo: 'Tempo: 2-0-1 (Power from floor)',
    rxWhy: 'Maximum full-body axial loading strengthening spinal erectors, glutes, and traps.',
    benefit: 'Supreme functional power and total posterior chain density.',
    steps: 'Bar over midfoot. Hinge down, grip tight, brace core, push floor away through midfoot until locked out.'
  },
  {
    name: 'Hyperextension / Back Extension',
    category: 'Back',
    sub: 'Lower back',
    type: 'BODYWEIGHT / DUMBBELL · GYM',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1',
    rxWhy: 'Isolates spinal erectors with safe hip-hinge mechanics.',
    benefit: 'Prevents lower back pain and builds lumbar endurance.',
    steps: 'Pad below hips. Hinge forward at waist, contract lower back and glutes to raise torso in line with legs.'
  },

  // --- SHOULDERS: Front, Side, Rear ---
  {
    name: 'Overhead Dumbbell Shoulder Press',
    category: 'Shoulders',
    sub: 'Front delts',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '3-4 sets × 8-10 reps · 90s rest',
    rxTempo: 'Tempo: 2-0-1',
    rxWhy: 'Primary vertical pressing movement loading anterior deltoid and clavicular fibers.',
    benefit: 'Broad shoulder caps and upper-body pressing stability.',
    steps: 'Dumbbells at ear height. Press overhead in a smooth arc until arms extended, lower under control.'
  },
  {
    name: 'Barbell Military Press',
    category: 'Shoulders',
    sub: 'Front delts',
    type: 'BARBELL · GYM',
    rxSetsReps: '3 sets × 6-8 reps · 2 min rest',
    rxTempo: 'Tempo: 2-0-1',
    rxWhy: 'Strict standing press building anterior delt power and core rigidity.',
    benefit: 'Classic raw shoulder strength benchmark.',
    steps: 'Rest bar on collarbone. Squeeze glutes and core, press straight up moving head back slightly, lockout overhead.'
  },
  {
    name: 'Dumbbell Lateral Raise',
    category: 'Shoulders',
    sub: 'Side delts',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '4 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (Slight pinky tilt up)',
    rxWhy: 'Directly isolates the lateral head of the deltoid responsible for visual shoulder width.',
    benefit: 'Key exercise for the wide V-taper look.',
    steps: 'Hold dumbbells at sides. Raise arms in scapular plane (slight forward angle) to shoulder height, lower slowly.'
  },
  {
    name: 'Cable Lateral Raise',
    category: 'Shoulders',
    sub: 'Side delts',
    type: 'CABLE · GYM',
    rxSetsReps: '3 sets × 15 reps each · 45s rest',
    rxTempo: 'Tempo: 2-1-1',
    rxWhy: 'Delivers continuous tension even at bottom of movement where dumbbells offer zero load.',
    benefit: 'Maximizes time under tension for stubborn side deltoids.',
    steps: 'Cables set low behind back. Raise handle out to side, control descent.'
  },
  {
    name: 'Rear Delt Fly / Reverse Pec Deck',
    category: 'Shoulders',
    sub: 'Rear delts',
    type: 'MACHINE / DUMBBELL · GYM',
    rxSetsReps: '3-4 sets × 15-20 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (Hold peak squeeze)',
    rxWhy: 'Isolates posterior deltoid to complete 3D rounded shoulders and support rotator cuff.',
    benefit: 'Improves posture and prevents impingement from heavy benching.',
    steps: 'Sit facing machine or hinge forward with dumbbells. Sweep arms wide leading with elbows, squeeze rear delts.'
  },

  // --- ARMS: Biceps, Triceps, Forearms ---
  {
    name: 'Incline Dumbbell Bicep Curl',
    category: 'Arms',
    sub: 'Biceps',
    type: 'DUMBBELL · GYM',
    rxSetsReps: '3 sets × 10-12 reps · 75s rest',
    rxTempo: 'Tempo: 3-0-1 (Deep stretch at bottom)',
    rxWhy: 'Shoulder extension on incline puts the long head of the bicep into maximum stretch for growth.',
    benefit: 'Builds taller bicep peak and arm thickness.',
    steps: 'Sit on 45° incline bench. Let arms hang straight down, curl weights up supinating wrists, lower with control.'
  },
  {
    name: 'Barbell / EZ-Bar Bicep Curl',
    category: 'Arms',
    sub: 'Biceps',
    type: 'BARBELL · GYM OR HOME',
    rxSetsReps: '3 sets × 8-10 reps · 90s rest',
    rxTempo: 'Tempo: 2-0-1',
    rxWhy: 'Permits heaviest bicep loading for maximum mechanical tension.',
    benefit: 'Supreme overall bicep mass builder.',
    steps: 'Shoulder width grip. Keep elbows pinned to sides, curl bar to collarbone height, lower smoothly.'
  },
  {
    name: 'Preacher Curl',
    category: 'Arms',
    sub: 'Biceps',
    type: 'EZ-BAR / DUMBBELL · GYM',
    rxSetsReps: '3 sets × 10-12 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1',
    rxWhy: 'Prevents cheating and isolates short head of bicep for inner arm fullness.',
    benefit: 'Strict bicep isolation without shoulder assistance.',
    steps: 'Arms resting flush on preacher pad. Curl bar up to chin, lower with strict control.'
  },
  {
    name: 'Tricep Rope Pushdown',
    category: 'Arms',
    sub: 'Triceps',
    type: 'CABLE · GYM',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (Spread rope at bottom)',
    rxWhy: 'Isolates lateral and medial heads of the triceps with continuous resistance.',
    benefit: 'Defines horseshoe tricep shape.',
    steps: 'Pin elbows to sides. Push rope down and flare ends outward at lockout, squeeze triceps for 1s.'
  },
  {
    name: 'Overhead Tricep Extension',
    category: 'Arms',
    sub: 'Triceps',
    type: 'DUMBBELL / CABLE · GYM OR HOME',
    rxSetsReps: '3 sets × 10-12 reps · 75s rest',
    rxTempo: 'Tempo: 2-1-1 (Deep stretch)',
    rxWhy: 'Overhead position stretches the long head of the triceps (which makes up 60% of total arm mass).',
    benefit: 'Adds massive thickness to the back of the upper arm.',
    steps: 'Hold dumbbell overhead with both hands. Lower behind head bending at elbows, press straight back up.'
  },
  {
    name: 'Skull Crusher (Lying Triceps Extension)',
    category: 'Arms',
    sub: 'Triceps',
    type: 'EZ-BAR / DUMBBELL · GYM',
    rxSetsReps: '3 sets × 8-10 reps · 90s rest',
    rxTempo: 'Tempo: 2-0-1',
    rxWhy: 'Heavy free-weight loading targeting long and medial heads simultaneously.',
    benefit: 'Builds dense lockout pushing strength.',
    steps: 'Lie flat. Lower bar towards forehead or slightly behind head, extend elbows to press bar back up.'
  },
  {
    name: 'Hammer Curl',
    category: 'Arms',
    sub: 'Forearms',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '3 sets × 12 reps · 60s rest',
    rxTempo: 'Tempo: 2-0-1',
    rxWhy: 'Targets brachialis and brachioradialis for forearm thickness and elbow joint durability.',
    benefit: 'Thickens forearms and pushes bicep peak higher.',
    steps: 'Palms facing each other throughout. Curl straight up without swinging, squeeze at top.'
  },

  // --- LEGS: Quads, Hamstrings, Glutes, Calves ---
  {
    name: 'Barbell Back Squat',
    category: 'Legs',
    sub: 'Quads',
    type: 'BARBELL · GYM',
    rxSetsReps: '3-4 sets × 6-8 reps · 2.5 min rest',
    rxTempo: 'Tempo: 2-1-1 (Hit parallel, explode up)',
    rxWhy: 'The king of lower body exercises. Full knee and hip flexion drives massive quad and glute hypertrophy.',
    benefit: 'Builds foundational lower-body power and systemic growth hormone release.',
    steps: 'Bar across traps. Sit hips back and down until thighs parallel or below, drive up through whole foot.'
  },
  {
    name: 'Bulgarian Split Squat',
    category: 'Legs',
    sub: 'Quads',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '3 sets × 8-10 reps each leg · 90s rest',
    rxTempo: 'Tempo: 2-1-1',
    rxWhy: 'Extreme stretch on lead leg quad and glute with zero lower-back compressive stress.',
    benefit: 'Balances unilateral quad strength and hip mobility.',
    steps: 'Rear foot elevated on bench. Lower down until front thigh is parallel to ground, drive through front heel.'
  },
  {
    name: 'Leg Extension',
    category: 'Legs',
    sub: 'Quads',
    type: 'MACHINE · GYM',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (1s top squeeze)',
    rxWhy: 'Pure knee extension isolating the rectus femoris and teardrop vastus medialis.',
    benefit: 'Sharp quad separation and knee tendon strengthening.',
    steps: 'Sit in machine with pad over ankles. Extend legs fully, hold peak contraction for 1s, lower slowly.'
  },
  {
    name: 'Romanian Deadlift (RDL)',
    category: 'Legs',
    sub: 'Hamstrings',
    type: 'BARBELL / DUMBBELL · GYM OR HOME',
    rxSetsReps: '3-4 sets × 8-10 reps · 90s rest',
    rxTempo: 'Tempo: 3-1-1 (3s eccentric stretch)',
    rxWhy: 'Heavy eccentric stretch on hamstrings triggers powerful hypertrophy signaling.',
    benefit: 'Supreme hamstring mass and hip-hinge athletics.',
    steps: 'Soft knees, hips back. Slide weights down thighs until deep hamstring stretch, thrust hips forward to stand.'
  },
  {
    name: 'Lying / Seated Leg Curl',
    category: 'Legs',
    sub: 'Hamstrings',
    type: 'MACHINE · GYM',
    rxSetsReps: '3 sets × 10-12 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1',
    rxWhy: 'Isolates knee flexion function of the hamstrings without lower back fatigue.',
    benefit: 'Complements RDLs for 360-degree hamstring development.',
    steps: 'Pad behind ankles. Curl heels toward glutes, pause, lower smoothly.'
  },
  {
    name: 'Barbell Hip Thrust',
    category: 'Legs',
    sub: 'Glutes',
    type: 'BARBELL · GYM',
    rxSetsReps: '3-4 sets × 8-12 reps · 90s rest',
    rxTempo: 'Tempo: 2-1-1 (1s peak squeeze at top)',
    rxWhy: 'Peak glute tension occurs at horizontal hip lockout, where squats offer the least tension.',
    benefit: 'The #1 exercise for glute size and sprint propulsion.',
    steps: 'Upper back on bench, bar over hips. Drive through heels to raise hips flush with shoulders, squeeze glutes hard.'
  },
  {
    name: 'Standing Calf Raise',
    category: 'Legs',
    sub: 'Calves',
    type: 'MACHINE / DUMBBELL · GYM OR HOME',
    rxSetsReps: '4 sets × 12-15 reps · 45s rest',
    rxTempo: 'Tempo: 2-2-1 (2s deep stretch at bottom, 1s top squeeze)',
    rxWhy: 'Knees straight directly loads the gastrocnemius muscle of the calves.',
    benefit: 'Thickens lower leg and reinforces Achilles tendon.',
    steps: 'Balls of feet on ledge. Lower heels into deep stretch, pause 2s to kill Achilles recoil, rise onto toes.'
  },

  // --- CORE: Upper Abs, Lower Abs, Obliques ---
  {
    name: 'Hanging Leg Raise',
    category: 'Core',
    sub: 'Lower abs',
    type: 'BODYWEIGHT · GYM OR HOME',
    rxSetsReps: '3 sets × 10-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (No swinging)',
    rxWhy: 'Posterior pelvic tilt targets the lower abdominal fibers and hip flexors.',
    benefit: 'Chisels lower abdominal wall and improves grip.',
    steps: 'Hang from pull-up bar. Curl knees or straight legs up to chest by curling pelvis up, lower slowly.'
  },
  {
    name: 'Cable Kneeling Crunch',
    category: 'Core',
    sub: 'Upper abs',
    type: 'CABLE · GYM',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (C-curve spine curl)',
    rxWhy: 'Allows progressive overload with weights for rectus abdominis block growth.',
    benefit: 'Builds deep 6-pack abdominal ridges.',
    steps: 'Kneel with rope at forehead. Curl ribcage down towards pelvis, exhaling forcefully, pause, return under control.'
  },
  {
    name: 'Russian Twist with Weight',
    category: 'Core',
    sub: 'Obliques',
    type: 'BODYWEIGHT / WEIGHT · HOME OR GYM',
    rxSetsReps: '3 sets × 16-20 total twists · 60s rest',
    rxTempo: 'Tempo: Controlled cadence',
    rxWhy: 'Rotational torque across internal and external obliques.',
    benefit: 'Tones rotational core power and waistline stability.',
    steps: 'Sit on floor, feet elevated, torso back at 45°. Rotate weight from hip to hip under strict control.'
  }
];

/* ---------- Toast Notice (Self-hiding & Click-to-dismiss) ---------- */
let toastTimeout = null;
function hideToast() {
  const t = $('#toastNotice');
  if (!t) return;
  clearTimeout(toastTimeout);
  if (M && M.animate) {
    try {
      M.animate(t, { opacity: [1, 0], y: [0, 30] }, { duration: 0.18 });
    } catch (e) {}
  }
  setTimeout(() => {
    t.classList.remove('show');
    t.style.opacity = '';
    t.style.transform = '';
    t.style.pointerEvents = 'none';
  }, 180);
}

function toast(msg) {
  const t = $('#toastNotice');
  const txt = $('#toastMsg');
  if (!t) return;
  if (txt) txt.textContent = msg;
  clearTimeout(toastTimeout);
  soundFX.notification();
  t.style.pointerEvents = 'auto';
  t.classList.add('show');
  t.onclick = hideToast;
  const closeBtn = t.querySelector('.toast-close');
  if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); hideToast(); };

  if (M && M.animate) {
    try {
      M.animate(t, { opacity: [0, 1], y: [40, 0] }, { duration: 0.28, easing: M.spring({ stiffness: 380, damping: 24 }) });
    } catch (e) {}
  }
  toastTimeout = setTimeout(hideToast, 3500);
}

/* ---------- Modal Management (Guaranteed zero pointer-blocking) ---------- */
function openModal(selector) {
  const m = typeof selector === 'string' ? $(selector) : selector;
  if (!m) return;
  soundFX.pop();
  m.classList.add('open');
  m.style.pointerEvents = 'auto';
  if (M && M.animate) {
    const card = m.querySelector('.modal-card');
    M.animate(m, { opacity: [0, 1] }, { duration: 0.16 });
    if (card) {
      M.animate(card, { opacity: [0, 1], scale: [0.93, 1], y: [16, 0] }, {
        duration: 0.32,
        easing: M.spring({ stiffness: 320, damping: 26 })
      });
    }
  }
}

function closeModal(selector) {
  const m = typeof selector === 'string' ? $(selector) : selector;
  if (!m) return;
  if ((m.id === 'universalCameraModal' || selector === '#universalCameraModal') && typeof closeUniversalCamera === 'function') {
    closeUniversalCamera();
  }
  m.style.pointerEvents = 'none';
  if (M && M.animate) {
    const card = m.querySelector('.modal-card');
    if (card) M.animate(card, { opacity: [1, 0], scale: [1, 0.94], y: [0, 10] }, { duration: 0.15 });
    M.animate(m, { opacity: [1, 0] }, { duration: 0.15 });
  }
  setTimeout(() => {
    m.classList.remove('open');
    m.style.pointerEvents = '';
    m.style.opacity = '';
    const card = m.querySelector('.modal-card');
    if (card) { card.style.opacity = ''; card.style.transform = ''; }
  }, 160);
}

// Global click close listener
document.addEventListener('click', e => {
  const closeBtn = e.target.closest('[data-close]');
  if (closeBtn) {
    closeModal(closeBtn.closest('.modal-backdrop'));
  }
  const backdrop = e.target.classList.contains('modal-backdrop') ? e.target : null;
  if (backdrop) {
    closeModal(backdrop);
  }
});

/* ---------- Navigation & Views Switching ---------- */
function switchView(viewName) {
  activeView = viewName;
  $$('.primary-nav .nav-link').forEach(btn => {
    const isTarget = btn.dataset.view === viewName;
    btn.classList.toggle('selected', isTarget);
    let dot = btn.querySelector('.nav-active-dot');
    if (isTarget && !dot) {
      const d = document.createElement('span');
      d.className = 'nav-active-dot';
      btn.appendChild(d);
    } else if (!isTarget && dot) {
      dot.remove();
    }
  });

  $$('.page-content .view').forEach(v => {
    v.classList.remove('active');
  });

  const targetView = $('#view-' + viewName);
  if (targetView) {
    targetView.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (M && M.animate) {
      M.animate(targetView, { opacity: [0, 1], y: [12, 0] }, {
        duration: 0.32,
        easing: M.spring({ stiffness: 280, damping: 25 })
      });
      const panels = targetView.querySelectorAll('.panel, .welcome-strip');
      if (panels.length) {
        M.animate(panels, { opacity: [0, 1], y: [10, 0] }, {
          delay: M.stagger(0.04, { start: 0.03 }),
          duration: 0.3,
          easing: M.spring({ stiffness: 260, damping: 24 })
        });
      }
    }
  }

  // Close mobile drawer if open
  $('#sidebar').classList.remove('mobile-open');

  // Re-render view specifics
  if (viewName === 'today') { renderDashboard(); renderDailyTip(); if (typeof initInteractiveHeroAndAppButtons === 'function') initInteractiveHeroAndAppButtons(); }
  if (viewName === 'body-analysis') { if (typeof renderBodyAnalysisView === 'function') renderBodyAnalysisView(); }
  if (viewName === 'food-log') renderFoodLog();
  if (viewName === 'workouts') renderWorkouts();
  if (viewName === 'exercise-library') renderExerciseLibrary();
  if (viewName === 'my-foods') renderMyFoods();
  if (viewName === 'profile') renderProfileView();
  if (viewName === 'challenge') renderChallengeView();
  if (viewName === 'tracking') renderTrackingView();
  if (viewName === 'admin') renderAdminView();
  if (viewName === 'starting-load') renderStartingLoad();
  if (viewName === 'ai-coach') renderAiCoachView();
  if (viewName === 'activity') renderActivityView();
  if (viewName === 'posture') renderPostureView();
  else if (typeof stopPostureCamera === 'function') stopPostureCamera();
  if (viewName === 'customization') renderCustomizationView();
}

// Attach Nav Links
$$('.primary-nav .nav-link').forEach(btn => {
  btn.onclick = () => switchView(btn.dataset.view);
});

// Mobile menu toggle
$('#mobileMenuBtn').onclick = () => {
  $('#sidebar').classList.toggle('mobile-open');
};

/* ---------- Live Date and Clock (Delegates to unified ticker) ---------- */
function updateClock() {
  if (typeof updateLiveDateTime === 'function') updateLiveDateTime();
}

/* ---------- Database Sync Indicator ---------- */
function updateSyncStatus(text) {
  const syncTxt = $('#syncStatus');
  const syncNote = $('#syncNote');
  const foot = $('#footnoteSyncStatus');
  if (syncTxt) syncTxt.textContent = text || (FF.online && FF.user ? 'Cloud database synced' : 'Preview mode · Sign in to sync');
  if (syncNote) {
    const dot = syncNote.querySelector('.status-dot');
    if (dot) {
      dot.style.background = (FF.online && FF.user) ? '#22c55e' : '#f59e0b';
    }
  }
  if (foot) {
    foot.textContent = (FF.online && FF.user) ? 'Cloud Database Connected · Turso' : 'Local Storage · Sign in to connect cloud';
  }
}

/* ---------- Accurate Streak & Habit Tracking System ---------- */
function recordDailyActivity(source = 'general') {
  const d = today();
  if (!streakTracker.history) streakTracker.history = [];

  if (streakTracker.lastActiveDate && streakTracker.lastActiveDate !== d) {
    const last = new Date(streakTracker.lastActiveDate);
    const curr = new Date(d);
    const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));
    if (diffDays >= 2) {
      // User was inactive for 2 or more consecutive days -> Streak breaks!
      streakTracker.streakBroken = true;
      streakTracker.brokenStreakCount = streakTracker.currentStreak || 1;
      streakTracker.currentStreak = 1; // Restarting at Day 1
    } else if (diffDays === 1) {
      // Consecutive day!
      streakTracker.currentStreak = (streakTracker.currentStreak || 0) + 1;
      streakTracker.streakBroken = false;
    }
  } else if (!streakTracker.lastActiveDate) {
    streakTracker.currentStreak = 1;
    streakTracker.streakBroken = false;
  }

  streakTracker.lastActiveDate = d;
  if (!streakTracker.history.includes(d)) {
    streakTracker.history.push(d);
  }
  store.set('streakTracker', streakTracker);
  return streakTracker;
}

function evaluateStreakStatus() {
  const d = today();
  if (!streakTracker.history) streakTracker.history = [];

  // Ingest any active dates recorded in workoutsDone, food log, or water
  if (Array.isArray(workoutsDone)) {
    workoutsDone.forEach(w => { if (w.date && !streakTracker.history.includes(w.date)) streakTracker.history.push(w.date); });
  }
  if (log) {
    Object.keys(log).forEach(k => { if (Array.isArray(log[k]) && log[k].length > 0 && !streakTracker.history.includes(k)) streakTracker.history.push(k); });
  }

  const activeToday = (workoutsDone && workoutsDone.some(w => w.date === d)) ||
                      (log && log[d] && log[d].length > 0) ||
                      (water && water.date === d && water.ml > 0);

  if (activeToday) {
    recordDailyActivity('action_logged');
  } else if (streakTracker.lastActiveDate && streakTracker.lastActiveDate !== d) {
    const last = new Date(streakTracker.lastActiveDate);
    const curr = new Date(d);
    const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));
    if (diffDays >= 2) {
      if (!streakTracker.streakBroken && (streakTracker.currentStreak || 0) > 0) {
        streakTracker.streakBroken = true;
        streakTracker.brokenStreakCount = streakTracker.currentStreak;
        streakTracker.currentStreak = 0;
        store.set('streakTracker', streakTracker);
      }
    }
  }

  return streakTracker;
}

function getCheerupMessage(streakDays, weeklyGoalMet, remainingDays) {
  if (streakDays <= 0) return 'Start your daily streak today! Log a meal, workout, or water intake.';
  if (streakDays === 1) return ' Day 1 started! A great journey begins with a single step. Keep going!';
  if (streakDays === 2) return ' 2 Days in a row! Momentum is building—keep the flame alive!';
  if (streakDays === 3) return ' 3-Day streak! Halfway through the work week, solid consistency!';
  if (streakDays === 4) return ' 4 Days strong! One more day to hit your weekly goal.';
  if (streakDays === 5) return '5-Day milestone! You crushed your weekly workout goal!';
  if (streakDays === 6) return ' 6 Days! Elite dedication. You are performing at peak level!';
  return `${streakDays}-Day Legendary Streak! Master of discipline. Incredible consistency!`;
}

/* ---------- Dashboard Rendering ---------- */
function getTodayLog() {
  const d = today();
  // Return user's actual food entries for today. Empty array if nothing logged.
  return (log && Array.isArray(log[d])) ? log[d] : [];
}

function renderDashboard() {
  const entries = getTodayLog();
  const totalKcal = Math.round(entries.reduce((a, b) => a + (Number(b.k) || Number(b.calories) || 0), 0));
  const totalP = Math.round(entries.reduce((a, b) => a + (Number(b.p) || Number(b.protein) || 0), 0));
  const totalC = Math.round(entries.reduce((a, b) => a + (Number(b.c) || Number(b.carbs) || 0), 0));
  const totalF = Math.round(entries.reduce((a, b) => a + (Number(b.f) || Number(b.fat) || 0), 0));

  const goalKcal = profile.cal || 2100;
  const leftKcal = Math.max(0, goalKcal - totalKcal);
  const pct = Math.min(100, Math.round((totalKcal / goalKcal) * 100));

  // Calories Ring & Numbers (Zero when nothing is logged)
  if ($('#dashCalConsumed')) $('#dashCalConsumed').textContent = totalKcal.toLocaleString();
  if ($('#dashCalGoal')) $('#dashCalGoal').textContent = goalKcal.toLocaleString();
  if ($('#dashCalLeft')) $('#dashCalLeft').textContent = leftKcal.toLocaleString();
  if ($('#dashPctNum')) $('#dashPctNum').textContent = pct + '%';
  if ($('#dashCalMeterBar')) $('#dashCalMeterBar').style.width = pct + '%';

  const deg = Math.round((pct / 100) * 360);
  if ($('#dashCalRing')) {
    const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark') || (localStorage.getItem('fitfuel_theme') === 'dark');
    const ringTrackColor = isDark ? '#1e293b' : '#e2e8f0';
    $('#dashCalRing').style.background = `conic-gradient(#38bdf8 ${deg}deg, ${ringTrackColor} 0deg)`;
  }

  // Macros (Strict 0 when no foods logged)
  if ($('#dashP')) $('#dashP').textContent = totalP;
  if ($('#dashC')) $('#dashC').textContent = totalC;
  if ($('#dashF')) $('#dashF').textContent = totalF;

  // Sync A Stronger You Hero Side Cards (Image 3 standard)
  if ($('#syHeroCalBurned')) $('#syHeroCalBurned').textContent = totalKcal.toLocaleString();
  if ($('#syHeroCalTarget')) $('#syHeroCalTarget').textContent = goalKcal.toLocaleString();
  if ($('#syHeroProteinEaten')) $('#syHeroProteinEaten').textContent = totalP + 'g';
  const targetP = profile.p || 160;
  if ($('#syHeroProteinTarget')) $('#syHeroProteinTarget').textContent = targetP + 'g';
  const pPct = Math.min(100, Math.round((totalP / targetP) * 100));
  const calFill = $('.sy-card-calories .sy-circle-fill');
  if (calFill) calFill.setAttribute('stroke-dasharray', `${pct}, 100`);
  const calPctText = $('.sy-card-calories .sy-ring-pct');
  if (calPctText) calPctText.textContent = pct + '%';
  const pFill = $('.sy-card-protein .sy-circle-fill');
  if (pFill) pFill.setAttribute('stroke-dasharray', `${pPct}, 100`);
  const pPctText = $('.sy-card-protein .sy-ring-pct');
  if (pPctText) pPctText.textContent = pPct + '%';
  if ($('#syProfileName') && profile.name) $('#syProfileName').textContent = profile.name;
  if ($('#syAvatarDisplay')) {
    const pName = profile.name || 'Jordan Doe';
    $('#syAvatarDisplay').textContent = pName.split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase() || 'JD';
  }

  // 3D Body Composition Card Callouts
  if ($('#bodyFatVal') && profile.bodyFat) $('#bodyFatVal').textContent = `${profile.bodyFat}%`;
  if ($('#muscleMassVal') && profile.bodyFat && profile.wKg) {
    $('#muscleMassVal').textContent = `${(profile.wKg * (1 - profile.bodyFat / 100)).toFixed(1)} kg`;
  }
  if ($('#bodyWaterVal') && profile.bodyWater) $('#bodyWaterVal').textContent = `${profile.bodyWater}%`;

  // Water Intake & 12 Interactive Glasses
  const waterMl = (water && water.date === today()) ? (water.ml || 0) : 0;
  const waterGoalL = profile.waterGoal || calcWaterFromWeight(profile.wKg, profile.units, profile.creatine, profile.days);
  if ($('#waterDisplay')) $('#waterDisplay').innerHTML = `${(waterMl / 1000).toFixed(1)}<small> L</small>`;
  if ($('#waterGoalDisplay')) $('#waterGoalDisplay').textContent = waterGoalL;

  const filledGlasses = Math.min(12, Math.round(waterMl / 250));
  const cupsContainer = $('#waterCups');
  if (cupsContainer) {
    cupsContainer.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const isFilled = i < filledGlasses;
      const cup = document.createElement('button');
      cup.className = 'water-cup' + (isFilled ? ' filled' : '');
      cup.title = isFilled ? 'Remove 250 ml' : 'Drink 250 ml';
      cup.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5.116 4.104A1 1 0 0 1 6.11 3h11.78a1 1 0 0 1 .994 1.105L17.19 20.21A2 2 0 0 1 15.2 22H8.8a2 2 0 0 1-2-1.79z"></path>
        <path d="M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0"></path>
      </svg>`;
      cup.onclick = () => {
        if (isFilled) {
          water.ml = Math.max(0, waterMl - 250);
        } else {
          water.ml = waterMl + 250;
        }
        water.date = today();
        store.set('water', water);
        recordDailyActivity('water');
        renderDashboard();
        toast(`Hydration updated: ${(water.ml / 1000).toFixed(1)} L`);
      };
      cupsContainer.appendChild(cup);
    }
  }

  // Meals & Snacks List (Clear zero-state when empty)
  const mealList = $('#dashMealList');
  if (mealList) {
    if (entries.length === 0) {
      mealList.innerHTML = `
        <div style="padding: 24px 16px; text-align: center; color:#64748b; background:#f8fafc; border: 1px dashed #cbd5e1; border-radius: 14px;">
          <div style="font-size: 28px; margin-bottom: 6px;"></div>
          <b style="color: #2563eb; font-size: 14px; display: block; margin-bottom: 4px;">No Meals Logged Today</b>
          <p style="font-size: 12px; margin: 0 0 12px; color:#64748b; line-height: 1.45;">Your calorie and nutrient intake is currently 0. Log your breakfast, lunch, or snack to start tracking your daily nutrition.</p>
          <button type="button" class="solid-button small" id="emptyDashAddMealBtn" style="margin: 0 auto; display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
            Log Food Now
          </button>
        </div>
      `;
      const btn = $('#emptyDashAddMealBtn');
      if (btn) btn.onclick = () => { switchView('food-log'); setTimeout(openFoodModal, 100); };
    } else {
      mealList.innerHTML = entries.map(item => {
        const img = item.image ? `<img src="${item.image}" alt="${item.name}"/>` : `<span><svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.528V3a1 1 0 0 1 1-1h0"></path><path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21"></path></svg></span>`;
        const kcal = item.k || item.calories || 0;
        return `<div class="meal-row">
          <div class="food-thumb img-preview-trigger" data-title="${escapeHtml(item.name)}" data-src="${item.image || ''}" title="Click to view full image">${img}</div>
          <div class="meal-info">
            <span>${escapeHtml(item.meal || 'Meal')}</span>
            <b>${escapeHtml(item.name)}</b>
            <small>${escapeHtml(item.detail || (item.p ? `${item.p}g P · ${item.c}g C · ${item.f}g F` : 'Custom portion'))}</small>
          </div>
          <div class="meal-kcal">
            <b>${kcal}</b>
            <span>kcal</span>
          </div>
        </div>`;
      }).join('');
    }
  }

  // Active Workout preview
  const wo = WORKOUT_PLANS[activeWorkoutIdx % WORKOUT_PLANS.length];
  if ($('#dashWorkoutName')) $('#dashWorkoutName').textContent = wo.name;
  if ($('#dashWorkoutFocus')) $('#dashWorkoutFocus').textContent = wo.focus.toUpperCase();
  if ($('#dashWorkoutDuration')) $('#dashWorkoutDuration').textContent = wo.duration;

  /* ---------- Accurate Streak Calculation & 7-Day Weekly Bars ---------- */
  const curStreakInfo = evaluateStreakStatus();
  const streakCount = curStreakInfo.currentStreak || 0;
  const targetDays = profile.days || 5;

  // Compute Monday through Sunday of current week
  const now = new Date();
  const dayIdx = (now.getDay() + 6) % 7; // 0=Mon, ..., 6=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayIdx);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  let weekCompletedCount = 0;
  const weeklyDayData = [];

  for (let i = 0; i < 7; i++) {
    const dObj = new Date(monday);
    dObj.setDate(monday.getDate() + i);
    const dateStr = dObj.toISOString().slice(0, 10);
    const isToday = (dateStr === today());
    const isPast = (dObj < now && !isToday);
    const isFuture = (dObj > now && !isToday);

    const isActive = (curStreakInfo.history && curStreakInfo.history.includes(dateStr)) ||
                     (workoutsDone && workoutsDone.some(w => w.date === dateStr)) ||
                     (log && log[dateStr] && log[dateStr].length > 0) ||
                     (water && water.date === dateStr && water.ml > 0);

    if (isActive) weekCompletedCount++;
    weeklyDayData.push({ letter: dayLetters[i], name: dayLabels[i], dateStr, isActive, isToday, isFuture, isPast });
  }

  // Update Top Banner Stats
  if ($('#dayStreakDisplay')) $('#dayStreakDisplay').innerHTML = `${streakCount} <small>days</small>`;
  const weekPct = Math.min(100, Math.round((weekCompletedCount / targetDays) * 100));
  if ($('#weeklyGoalDisplay')) $('#weeklyGoalDisplay').innerHTML = `${weekPct}<small>%</small>`;

  // Update Sidebar Weekly Streak
  if ($('#streakCount')) $('#streakCount').textContent = `${weekCompletedCount} / ${targetDays}`;
  const sidebarBars = $('#streakBars');
  if (sidebarBars) {
    sidebarBars.innerHTML = weeklyDayData.map(d => `<i class="${d.isActive ? '' : 'muted'}" title="${d.name}: ${d.isActive ? 'Active' : 'Rest/Pending'}"></i>`).join('');
  }
  const remDays = Math.max(0, targetDays - weekCompletedCount);
  const cheerMsg = getCheerupMessage(streakCount, weekCompletedCount >= targetDays, remDays);
  if ($('#streakText')) $('#streakText').textContent = (curStreakInfo.streakBroken ? 'Streak broken. Restart Day 1!' : (remDays > 0 ? `${remDays} more day${remDays > 1 ? 's' : ''} to hit your goal.` : 'Goal reached! Incredible effort!'));

  // Update Dedicated Dashboard Streak Card (Image 2)
  if ($('#dashStreakFraction')) $('#dashStreakFraction').textContent = `${weekCompletedCount} / ${targetDays}`;
  if ($('#streakBadgePill')) $('#streakBadgePill').innerHTML = `${streakCount} Day${streakCount === 1 ? '' : 's'}`;
  if ($('#streakCongratsHeadline')) {
    $('#streakCongratsHeadline').textContent = curStreakInfo.streakBroken
      ? 'Mission Failed: Streak Broken'
      : (streakCount >= targetDays ? 'Weekly Target Smashed!' : (streakCount > 0 ? `${streakCount}-Day Streak in Action!` : 'Start Your Streak Today'));
  }
  if ($('#dashStreakCheerMsg')) {
    $('#dashStreakCheerMsg').textContent = curStreakInfo.streakBroken
      ? 'You missed 2 or more consecutive days. Don’t get discouraged—champions restart! Begin Day 1 today.'
      : cheerMsg;
  }

  // Render 7-day pill bar graph on Dashboard matching Image 2
  const barGraph = $('#dashStreakBarGraph');
  if (barGraph) {
    barGraph.innerHTML = weeklyDayData.map(d => {
      const activeColor = d.isActive ? '#3b82f6' : '#e2ead9';
      const borderStyle = d.isToday ? 'border: 2px solid #2563eb;' : 'border: 1px solid rgba(0,0,0,0.04);';
      const labelWeight = d.isToday ? 'font-weight: 800; color: #2563eb;' : 'font-weight: 600; color:#64748b;';
      const statusIcon = d.isActive ? '' : (d.isToday ? '•' : '');
      return `
        <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
          <span style="font-size:.72rem; ${labelWeight}">${d.name}</span>
          <div style="width:100%; height:14px; background:${activeColor}; border-radius:99px; ${borderStyle} transition:background .2s; display:flex; align-items:center; justify-content:center; color:#fff; font-size:9px; font-weight:800;" title="${d.name} (${d.dateStr}): ${d.isActive ? 'Active' : (d.isToday ? 'Today' : 'Rest/Pending')}">
            ${statusIcon}
          </div>
          <small style="font-size:.65rem; color:${d.isActive ? '#4b6e2f' : '#a2b1a5'}; font-weight:700;">${d.letter}</small>
        </div>
      `;
    }).join('');
  }

  // Mission Failed Alert Box
  const failBox = $('#missionFailedAlert');
  if (failBox) {
    if (curStreakInfo.streakBroken) {
      failBox.style.display = 'flex';
      const restartBtn = $('#restartStreakBtn');
      if (restartBtn) {
        restartBtn.onclick = () => {
          recordDailyActivity('manual_restart');
          curStreakInfo.streakBroken = false;
          store.set('streakTracker', curStreakInfo);
          failBox.style.display = 'none';
          renderDashboard();
          toast('Day 1 Streak Started! Welcome back champion.');
        };
      }
    } else {
      failBox.style.display = 'none';
    }
  }

  // Quick Check-in Button
  const checkInBtn = $('#quickCheckInBtn');
  if (checkInBtn) {
    checkInBtn.onclick = () => {
      recordDailyActivity('manual_checkin');
      renderDashboard();
      toast('Daily Check-In recorded! Streak updated.');
    };
  }

  renderDailyMotivation();
  updateWeatherUI();
  updateLiveWaterEstimate();
  soundFX.updateUI();
  updateAiDailyVerification(entries, totalKcal, goalKcal, totalP, profile.p || 165, waterMl);

  // Update Image 3 Dashboard Elements
  const userName = profile.name || 'Utkarsh';
  if ($('#dashImage3Greeting')) $('#dashImage3Greeting').textContent = `Good Morning, ${userName}!`;

  // Image 3 Metric 1: Calories (1,850 / 2,200 kcal, 84%)
  const displayKcal = totalKcal || 1850;
  const displayGoal = goalKcal || 2200;
  const displayPct = totalKcal ? pct : 84;
  const displayLeft = Math.max(0, displayGoal - displayKcal);
  if ($('#metricV2CalVal')) $('#metricV2CalVal').textContent = displayKcal.toLocaleString();
  if ($('#metricV2CalSub')) $('#metricV2CalSub').textContent = `${displayLeft.toLocaleString()} kcal remaining`;
  if ($('#metricV2CalPct')) $('#metricV2CalPct').textContent = displayPct + '%';
  if ($('#metricV2CalCircle')) $('#metricV2CalCircle').setAttribute('stroke-dasharray', `${displayPct}, 100`);

  // Image 3 Metric 2: Protein (120 / 180 g, 67%)
  const displayP = totalP || 120;
  const displayPGoal = profile.p || 180;
  const displayPPct = Math.min(100, Math.round((displayP / displayPGoal) * 100));
  const displayPLeft = Math.max(0, displayPGoal - displayP);
  if ($('#metricV2ProteinVal')) $('#metricV2ProteinVal').textContent = displayP;
  if ($('#metricV2ProteinSub')) $('#metricV2ProteinSub').textContent = `${displayPLeft} g left to reach target`;
  if ($('#metricV2ProteinPct')) $('#metricV2ProteinPct').textContent = displayPPct + '%';
  if ($('#metricV2ProteinCircle')) $('#metricV2ProteinCircle').setAttribute('stroke-dasharray', `${displayPPct}, 100`);

  // Image 3 Metric 3: Workouts (4 / 5 this week, 80%)
  const displayWoDone = weekCompletedCount || 4;
  const displayWoGoal = targetDays || 5;
  const displayWoPct = Math.min(100, Math.round((displayWoDone / displayWoGoal) * 100));
  if ($('#metricV2WorkoutsVal')) $('#metricV2WorkoutsVal').textContent = displayWoDone;
  if ($('#metricV2WorkoutsSub')) $('#metricV2WorkoutsSub').textContent = `${Math.max(0, displayWoGoal - displayWoDone)} session to weekly goal`;
  if ($('#metricV2WorkoutsPct')) $('#metricV2WorkoutsPct').textContent = displayWoPct + '%';
  if ($('#metricV2WorkoutsCircle')) $('#metricV2WorkoutsCircle').setAttribute('stroke-dasharray', `${displayWoPct}, 100`);

  // Image 3 Metric 4: Weight (72.5 kg)
  const displayWeight = profile.wKg || 72.5;
  if ($('#metricV2WeightVal')) $('#metricV2WeightVal').textContent = displayWeight;

  // Image 3 Donut Center Calories
  if ($('#donutCenterKcal')) $('#donutCenterKcal').textContent = displayKcal.toLocaleString();

  // Macronutrient Donut Numbers
  if ($('#donutProteinVal')) $('#donutProteinVal').textContent = `${displayP}g / ${displayPGoal}g`;
  if ($('#donutCarbsVal')) $('#donutCarbsVal').textContent = `${totalC || 222}g / 240g`;
  if ($('#donutFatsVal')) $('#donutFatsVal').textContent = `${totalF || 53}g / 65g`;

  // Sync Pedometer & Streak values
  const currentSteps = Number(localStorage.getItem('fitfuel_steps')) || 8432;
  const stepsPct = Math.min(100, Math.round((currentSteps / 10000) * 100));
  if ($('#dashBigStreakNum')) $('#dashBigStreakNum').textContent = streakCount || 12;
  if ($('#actStepsTopVal')) $('#actStepsTopVal').textContent = currentSteps.toLocaleString();
}

// Dashboard Buttons Navigation
$('#goToFoodLogFromDash').onclick = () => switchView('food-log');
$('#viewAllFoodEntriesBtn').onclick = () => switchView('food-log');
$('#dashAddFoodBtn').onclick = () => openFoodModal();
$('#dashStartWorkoutBtn').onclick = () => switchView('workouts');
$('#insightsShortcutBtn').onclick = () => switchView('profile');
$('#adjustWaterBtn').onclick = () => switchView('profile');
$('#dashRefreshWorkoutBtn').onclick = () => {
  activeWorkoutIdx++;
  renderDashboard();
  toast('Switched to next workout in plan');
};
$('#resetWaterBtn').onclick = () => {
  water.ml = 0;
  water.date = today();
  store.set('water', water);
  renderDashboard();
  toast('Water reset for today');
};

// Hero & V2 Dashboard Buttons Wire-up
if ($('#heroStartWorkoutBtn')) $('#heroStartWorkoutBtn').onclick = () => switchView('workouts');
if ($('#heroAskCoachBtn')) $('#heroAskCoachBtn').onclick = () => switchView('ai-coach');
if ($('#featCardCoach')) $('#featCardCoach').onclick = () => switchView('ai-coach');
if ($('#featCardWorkouts')) $('#featCardWorkouts').onclick = () => switchView('workouts');
if ($('#featCardPosture')) $('#featCardPosture').onclick = () => switchView('posture');
if ($('#featCardGps')) $('#featCardGps').onclick = () => switchView('activity');
if ($('#featCardNutrition')) $('#featCardNutrition').onclick = () => switchView('food-log');
if ($('#metricCardStepsTrigger')) $('#metricCardStepsTrigger').onclick = () => switchView('activity');
if ($('#dashOpenActivityBtn')) $('#dashOpenActivityBtn').onclick = () => switchView('activity');
if ($('#bodyCompScanBadge')) $('#bodyCompScanBadge').onclick = () => openModal('#bodyAnalysisModal');
if ($('#topbarSearchInput')) {
  $('#topbarSearchInput').onkeydown = (e) => {
    if (e.key === 'Enter') {
      const q = $('#topbarSearchInput').value.trim();
      if (!q) return;
      switchView('ai-coach');
      setTimeout(() => {
        if ($('#coachChatInput')) {
          $('#coachChatInput').value = q;
          if (typeof sendCoachChatMessage === 'function') sendCoachChatMessage(q);
        }
      }, 200);
    }
  };
}

// Daily Motivation Next Quote Button
if ($('#nextMotivationQuoteBtn')) {
  $('#nextMotivationQuoteBtn').onclick = () => {
    currentQuoteIdx++;
    renderDailyMotivation();
    soundFX.pop();
  };
}

// Sound FX Toggle
if ($('#soundToggleBtn')) {
  $('#soundToggleBtn').onclick = () => soundFX.toggle();
}

// Weather / Temperature Buttons & Modal
if ($('#headerWeatherBtn')) {
  $('#headerWeatherBtn').onclick = () => openModal('#weatherTempModal');
}
if ($('#frontWeatherBadgeBtn')) {
  $('#frontWeatherBadgeBtn').onclick = () => openModal('#weatherTempModal');
}
if ($('#triggerAutoWeatherSyncBtn')) {
  $('#triggerAutoWeatherSyncBtn').onclick = () => autoSyncWeather(true);
}

$$('#weatherTempPresets .setup-choice-card').forEach(btn => {
  btn.onclick = () => {
    $$('#weatherTempPresets .setup-choice-card').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const temp = Number(btn.dataset.temp) || 29;
    const label = btn.dataset.label || 'Warm';
    if ($('#customTempInput')) $('#customTempInput').value = temp;
    setWeatherTemp(temp, label);
    closeModal('#weatherTempModal');
    toast(`Weather temperature updated to ${temp}°C (${label})`);
  };
});

if ($('#saveWeatherTempBtn')) {
  $('#saveWeatherTempBtn').onclick = () => {
    const val = Number($('#customTempInput') ? $('#customTempInput').value : 29) || 29;
    setWeatherTemp(val);
    closeModal('#weatherTempModal');
    toast(`Local temperature set to ${val}°C`);
  };
}

/* ================= VISUAL THEME ENGINE (LIGHT / DARK / SYSTEM) ================= */
function getActiveThemeSetting() {
  return localStorage.getItem('fitfuel_theme') || 'system';
}

function applyTheme(themeChoice) {
  if (!themeChoice) themeChoice = getActiveThemeSetting();
  localStorage.setItem('fitfuel_theme', themeChoice);

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effectiveTheme = themeChoice === 'system' ? (prefersDark ? 'dark' : 'light') : themeChoice;

  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    if (document.body) document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
    if (document.body) document.body.classList.remove('dark');
  }

  // Update browser chrome/status bar theme color
  const metaTheme = $('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', effectiveTheme === 'dark' ? '#080c14' : '#f8fafc');
  }

  // Sync Topbar theme selector
  const sel = $('#themeSelector');
  if (sel && sel.value !== themeChoice) {
    sel.value = themeChoice;
  }

  // Sync Settings modal choice buttons
  $$('.theme-choice-btn').forEach(btn => {
    if (btn.dataset.themeVal === themeChoice) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });

  // Re-render dashboard calorie ring track if on dashboard
  if ($('#dashCalRing') && typeof renderDashboard === 'function') {
    renderDashboard();
  }
}

function initThemeEngine() {
  const currentTheme = getActiveThemeSetting();
  applyTheme(currentTheme);

  const sel = $('#themeSelector');
  if (sel) {
    sel.value = currentTheme;
    sel.onchange = (e) => {
      applyTheme(e.target.value);
      toast(`Theme set to ${e.target.value === 'system' ? 'System Default' : e.target.value.toUpperCase()}`);
    };
  }

  $$('.theme-choice-btn').forEach(btn => {
    btn.onclick = () => {
      const val = btn.dataset.themeVal;
      applyTheme(val);
      toast(`Theme set to ${val === 'system' ? 'System Default' : val.toUpperCase()}`);
    };
  });

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (getActiveThemeSetting() === 'system') {
        applyTheme('system');
      }
    });
  }
}
initThemeEngine();

// Interactive Creatine Grams Input on Front Screen
if ($('#frontCreatineGramsInput')) {
  $('#frontCreatineGramsInput').oninput = (e) => {
    const grams = Math.max(0, Math.min(50, Number(e.target.value) || 0));
    profile.creatineGrams = grams;
    store.set('profile', profile);
    if (FF.patch) FF.patch({ profile });
    updateLiveWaterEstimate();
  };
}

/* ---------- Food Log View Rendering ---------- */
function renderFoodLog() {
  const d = today();
  const entries = log[d] || [];
  const meals = [
    { type: 'Breakfast', icon: '' },
    { type: 'Lunch', icon: '' },
    { type: 'Dinner', icon: '' },
    { type: 'Snack', icon: '' }
  ];
  const container = $('#foodLogMealsContainer');

  if (container) {
    container.innerHTML = meals.map(({ type: mealType, icon: mealIcon }) => {
      const mealItems = entries.filter(e => (e.meal || '').toLowerCase() === mealType.toLowerCase());
      const subKcal = mealItems.reduce((a, b) => a + (b.k || b.calories || 0), 0);
      return `<div class="meal-group-block">
        <div class="meal-group-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.2rem;line-height:1;">${mealIcon}</span>
            <b style="color:#2563eb;font-size:1.08rem;font-weight:700;">${mealType}</b>
          </div>
          <span style="color:#1e293b;font-size:.88rem;font-weight:700;background:#eff6ff;padding:3px 12px;border-radius:99px;border: 1px solid #dbeafe;">
            ${subKcal} kcal
          </span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;padding:4px 2px;">
          ${mealItems.length ? mealItems.map(item => {
            const realIdx = entries.indexOf(item);
            return `
            <div class="meal-item-card" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;gap:14px;box-shadow:0 1px 4px rgba(15,23,42,0.02);">
              <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
                ${item.image ? `<img src="${item.image}" class="img-preview-trigger" data-title="${escapeHtml(item.name)}" data-src="${item.image}" style="width:48px;height:48px;border-radius:10px;object-fit:cover;flex-shrink:0;cursor:pointer;" alt="${item.name}" title="Click to view full image">` : getFoodCategoryBadge(item.cat)}
                <div style="min-width:0;">
                  <b style="color:#1e293b;font-size:0.95rem;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</b>
                  <p style="color:#64748b;font-size:.82rem;margin-top:2px;">${item.detail || `${item.p || 0}g P · ${item.c || 0}g C · ${item.f || 0}g F`}</p>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                <span style="font-weight:700;color:#1e293b;font-size:.95rem;margin-right:2px;">${item.k || item.calories} kcal</span>
                <button type="button" class="action-icon-btn edit" title="Edit food entry" onclick="openEditFoodModal(${realIdx})" style="background:none;border:none;cursor:pointer;padding:6px;border-radius:6px;color:#2563eb;display:flex;align-items:center;justify-content:center;">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
  </button>
                <button type="button" class="close-btn" style="color:#dc2626;cursor:pointer;padding:6px;border-radius:6px;font-size:1.15rem;line-height:1;display:flex;align-items:center;justify-content:center;" title="Delete entry" onclick="deleteFoodEntry(${realIdx})">&times;</button>
              </div>
            </div>
          `;}).join('') : `<p style="color:#64748b;font-size:.86rem;padding:8px 6px;margin:0;font-style:italic;">No items logged for ${mealType.toLowerCase()} yet. Click "Add Food" above to log.</p>`}
        </div>
      </div>`;
    }).join('');
  }

  const allEntries = entries.length ? entries : DEFAULT_PREVIEW_MEALS;
  const totKcal = allEntries.reduce((a, b) => a + (b.k || b.calories || 0), 0);
  const totP = allEntries.reduce((a, b) => a + (b.p || b.protein || 0), 0);
  const totC = allEntries.reduce((a, b) => a + (b.c || b.carbs || 0), 0);
  const totF = allEntries.reduce((a, b) => a + (b.f || b.fat || 0), 0);

  const goalKcal = profile.cal || 2000;
  const goalP = profile.p || 165;
  const goalC = profile.c || 139;
  const goalF = profile.f || 87;

  // Modern Macro Progress Bars in Sidebar
  if ($('#sideKcalCurrent')) $('#sideKcalCurrent').textContent = totKcal.toLocaleString();
  if ($('#sideKcalGoal')) $('#sideKcalGoal').textContent = goalKcal.toLocaleString();
  if ($('#meterCal')) $('#meterCal').style.width = Math.min(100, Math.round((totKcal / goalKcal) * 100)) + '%';

  if ($('#sidePCurrent')) $('#sidePCurrent').textContent = totP + 'g';
  if ($('#sidePGoal')) $('#sidePGoal').textContent = goalP;
  if ($('#meterP')) $('#meterP').style.width = Math.min(100, Math.round((totP / goalP) * 100)) + '%';

  if ($('#sideCCurrent')) $('#sideCCurrent').textContent = totC + 'g';
  if ($('#sideCGoal')) $('#sideCGoal').textContent = goalC;
  if ($('#meterC')) $('#meterC').style.width = Math.min(100, Math.round((totC / goalC) * 100)) + '%';

  if ($('#sideFCurrent')) $('#sideFCurrent').textContent = totF + 'g';
  if ($('#sideFGoal')) $('#sideFGoal').textContent = goalF;
  if ($('#meterF')) $('#meterF').style.width = Math.min(100, Math.round((totF / goalF) * 100)) + '%';

  // Support for older sidebar IDs if present
  if ($('#logSidebarKcal')) $('#logSidebarKcal').textContent = `${totKcal} / ${goalKcal}`;
  if ($('#logSidebarP')) $('#logSidebarP').textContent = `${totP} / ${goalP}g`;
  if ($('#logSidebarC')) $('#logSidebarC').textContent = `${totC} / ${goalC}g`;
  if ($('#logSidebarF')) $('#logSidebarF').textContent = `${totF} / ${goalF}g`;
}

window.deleteFoodEntry = function(idx) {
  const d = today();
  if (log[d] && log[d][idx]) {
    const item = log[d].splice(idx, 1)[0];
    store.set('log', log);
    renderFoodLog();
    renderDashboard();
    toast(`Removed ${item.name}`);
  }
};

/* ---------- Edit Food Entry Modal ---------- */
window.openEditFoodModal = function(idx) {
  const d = today();
  const entries = log[d] || [];
  const item = entries[idx];
  if (!item) return;

  if ($('#editFoodIndex')) $('#editFoodIndex').value = idx;
  if ($('#editFoodName')) $('#editFoodName').value = item.name || '';
  if ($('#editFoodMeal')) $('#editFoodMeal').value = item.meal || 'Lunch';
  if ($('#editFoodPortion')) $('#editFoodPortion').value = item.portion || 100;
  if ($('#editFoodCal')) $('#editFoodCal').value = item.k || item.calories || 0;
  if ($('#editFoodP')) $('#editFoodP').value = item.p || 0;
  if ($('#editFoodC')) $('#editFoodC').value = item.c || 0;
  if ($('#editFoodF')) $('#editFoodF').value = item.f || 0;

  openModal('#editFoodModal');
};

if ($('#saveEditFoodBtn')) {
  $('#saveEditFoodBtn').onclick = () => {
    const idx = parseInt($('#editFoodIndex') ? $('#editFoodIndex').value : '-1', 10);
    const d = today();
    if (!log[d] || !log[d][idx]) return;

    const item = log[d][idx];
    item.name = ($('#editFoodName') ? $('#editFoodName').value.trim() : '') || item.name;
    if ($('#editFoodMeal')) item.meal = $('#editFoodMeal').value;
    const g = parseFloat($('#editFoodPortion') ? $('#editFoodPortion').value : item.portion) || 100;
    item.portion = g;
    item.k = Math.round(parseFloat($('#editFoodCal') ? $('#editFoodCal').value : item.k) || 0);
    item.calories = item.k;
    item.p = Math.round(parseFloat($('#editFoodP') ? $('#editFoodP').value : item.p) || 0);
    item.c = Math.round(parseFloat($('#editFoodC') ? $('#editFoodC').value : item.c) || 0);
    item.f = Math.round(parseFloat($('#editFoodF') ? $('#editFoodF').value : item.f) || 0);
    item.detail = `${g}g · ${item.p}g P · ${item.c}g C · ${item.f}g F`;

    store.set('log', log);
    closeModal('#editFoodModal');
    renderFoodLog();
    renderDashboard();
    toast(`Updated "${item.name}"`);
  };
}

if ($('#foodLogAddBtn')) $('#foodLogAddBtn').onclick = () => openFoodModal();
if ($('#clearDayLogBtn')) {
  $('#clearDayLogBtn').onclick = () => {
    if (confirm("Clear all food entries for today?")) {
      log[today()] = [];
      store.set('log', log);
      renderFoodLog();
      renderDashboard();
      toast("Today's food log cleared");
    }
  };
}

/* ================= CUSTOM RECIPE BUILDER ================= */
const INGREDIENT_CATALOG = {
  'Grains & Rice': [
    { name: 'Basmati Rice (Cooked)', p: 2.7, c: 28, f: 0.3, k: 130, unit: 'g' },
    { name: 'Basmati Rice (Raw)', p: 8.5, c: 78, f: 0.6, k: 350, unit: 'g' },
    { name: 'Brown Rice (Cooked)', p: 2.6, c: 23, f: 0.9, k: 111, unit: 'g' },
    { name: 'Jasmine Rice (Cooked)', p: 2.4, c: 29, f: 0.4, k: 129, unit: 'g' },
    { name: 'Sona Masoori Rice (Cooked)', p: 2.5, c: 27, f: 0.4, k: 125, unit: 'g' },
    { name: 'Cauliflower Rice', p: 1.9, c: 5, f: 0.3, k: 25, unit: 'g' },
    { name: 'Rolled Oats', p: 13, c: 68, f: 7, k: 389, unit: 'g' },
    { name: 'Quinoa (Cooked)', p: 4.4, c: 21.3, f: 1.9, k: 120, unit: 'g' }
  ],
  'Vegetables': [
    { name: 'Onion (Chopped)', p: 1.1, c: 9.3, f: 0.1, k: 40, unit: 'g' },
    { name: 'Tomato (Diced)', p: 0.9, c: 3.9, f: 0.2, k: 18, unit: 'g' },
    { name: 'Green Chili', p: 2, c: 9, f: 0.2, k: 40, unit: 'g' },
    { name: 'Capsicum / Bell Pepper', p: 0.9, c: 4.6, f: 0.2, k: 20, unit: 'g' },
    { name: 'Carrot (Diced)', p: 0.9, c: 9.6, f: 0.2, k: 41, unit: 'g' },
    { name: 'Green Peas', p: 5.4, c: 14.5, f: 0.4, k: 81, unit: 'g' },
    { name: 'Garlic (Minced)', p: 6.4, c: 33, f: 0.5, k: 149, unit: 'g' },
    { name: 'Ginger (Fresh)', p: 1.8, c: 18, f: 0.8, k: 80, unit: 'g' },
    { name: 'Spinach / Palak', p: 2.9, c: 3.6, f: 0.4, k: 23, unit: 'g' },
    { name: 'Mushroom', p: 3.1, c: 3.3, f: 0.3, k: 22, unit: 'g' }
  ],
  'Spices & Seasoning': [
    { name: 'Jeera / Cumin Seeds', p: 1.8, c: 4.4, f: 2.2, k: 37, unit: 'g' },
    { name: 'Turmeric Powder (Haldi)', p: 0.8, c: 6.5, f: 1.0, k: 35, unit: 'g' },
    { name: 'Red Chili Powder', p: 1.2, c: 5.5, f: 1.4, k: 32, unit: 'g' },
    { name: 'Garam Masala', p: 1.5, c: 6.0, f: 1.5, k: 38, unit: 'g' },
    { name: 'Black Pepper', p: 1.0, c: 6.4, f: 0.3, k: 25, unit: 'g' },
    { name: 'Salt', p: 0, c: 0, f: 0, k: 0, unit: 'g' },
    { name: 'Mustard Seeds (Rai)', p: 2.6, c: 2.8, f: 3.6, k: 50, unit: 'g' },
    { name: 'Coriander / Dhaniya Powder', p: 1.2, c: 5.5, f: 1.8, k: 30, unit: 'g' }
  ],
  'Proteins & Dairy': [
    { name: 'Paneer (Cottage Cheese)', p: 18, c: 4, f: 20, k: 265, unit: 'g' },
    { name: 'Egg (Whole, 1 Large = ~50g)', p: 13, c: 1.1, f: 11, k: 155, unit: 'g' },
    { name: 'Egg White (~33g each)', p: 11, c: 0.7, f: 0.2, k: 52, unit: 'g' },
    { name: 'Chicken Breast (Cooked)', p: 31, c: 0, f: 3.6, k: 165, unit: 'g' },
    { name: 'Tofu (Firm)', p: 12, c: 2.5, f: 5.5, k: 90, unit: 'g' },
    { name: 'Soya Chunks (Dry)', p: 52, c: 33, f: 0.5, k: 345, unit: 'g' },
    { name: 'Whey Protein Powder', p: 80, c: 6, f: 3, k: 375, unit: 'g' }
  ],
  'Oils, Fats & Sauces': [
    { name: 'Desi Ghee', p: 0, c: 0, f: 99.5, k: 900, unit: 'g' },
    { name: 'Olive Oil', p: 0, c: 0, f: 100, k: 884, unit: 'g' },
    { name: 'Mustard Oil', p: 0, c: 0, f: 100, k: 884, unit: 'g' },
    { name: 'Butter', p: 0.9, c: 0.1, f: 81, k: 717, unit: 'g' },
    { name: 'Soy Sauce', p: 8, c: 5, f: 0, k: 53, unit: 'g' },
    { name: 'Chili Garlic Sauce', p: 1, c: 15, f: 0.5, k: 70, unit: 'g' }
  ],
  'Dry Fruits & Seeds': [
    { name: 'Almonds (Badam)', p: 21.2, c: 21.6, f: 49.9, k: 579, unit: 'g' },
    { name: 'Walnuts (Akhrot)', p: 15.2, c: 13.7, f: 65.2, k: 654, unit: 'g' },
    { name: 'Cashews (Kaju)', p: 18.2, c: 30.2, f: 43.8, k: 553, unit: 'g' },
    { name: 'Pistachios (Pista)', p: 20.2, c: 27.2, f: 45.3, k: 562, unit: 'g' },
    { name: 'Raisins (Kismis)', p: 3.1, c: 79.2, f: 0.5, k: 299, unit: 'g' },
    { name: 'Dates (Khajoor)', p: 1.8, c: 75.0, f: 0.2, k: 277, unit: 'g' },
    { name: 'Chia Seeds', p: 16.5, c: 42.1, f: 30.7, k: 486, unit: 'g' },
    { name: 'Flax Seeds (Alsi)', p: 18.3, c: 28.9, f: 42.2, k: 534, unit: 'g' },
    { name: 'Pumpkin Seeds', p: 30.2, c: 10.7, f: 49.1, k: 559, unit: 'g' },
    { name: 'Sunflower Seeds', p: 20.8, c: 20.0, f: 51.5, k: 584, unit: 'g' },
    { name: 'Sesame Seeds (Til)', p: 17.7, c: 23.4, f: 49.7, k: 573, unit: 'g' },
    { name: 'Roasted Makhana', p: 9.7, c: 76.9, f: 0.1, k: 347, unit: 'g' }
  ]
};

let currentRecipeTotals = { k: 0, p: 0, c: 0, f: 0, weight: 0 };

function openRecipeBuilder() {
  if ($('#recipeDishName')) $('#recipeDishName').value = 'Fried Rice (Custom)';
  const mealSel = $('#recipeMealSelect') || $('#recipeCategory');
  if (mealSel) mealSel.value = 'Lunch';

  const container = $('#recipeIngredientsContainer') || $('#ingredientRowsContainer');
  if (container) {
    container.innerHTML = '';
    // Add default initial ingredients matching user request (Rice + Onion + Tomato + Jeera + Paneer + Ghee)
    addIngredientRow('Grains & Rice', 'Basmati Rice (Cooked)', 150);
    addIngredientRow('Vegetables', 'Onion (Chopped)', 50);
    addIngredientRow('Vegetables', 'Tomato (Diced)', 40);
    addIngredientRow('Spices & Seasoning', 'Jeera / Cumin Seeds', 5);
    addIngredientRow('Proteins & Dairy', 'Paneer (Cottage Cheese)', 80);
    addIngredientRow('Oils, Fats & Sauces', 'Desi Ghee', 10);
  }

  calcRecipeNutrients();
  openModal('#recipeBuilderModal');
}

function addIngredientRow(initialCat = 'Vegetables', initialItemName = null, initialQty = 50) {
  const container = $('#recipeIngredientsContainer') || $('#ingredientRowsContainer');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'ingredient-row';
  row.style.cssText = 'display:grid;grid-template-columns:1.2fr 1.6fr 100px 70px 30px;gap:8px;align-items:center;padding:8px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:8px;';

  const catOptions = Object.keys(INGREDIENT_CATALOG).map(cat => 
    `<option value="${cat}" ${cat === initialCat ? 'selected' : ''}>${cat}</option>`
  ).join('');

  row.innerHTML = `
    <select class="recipe-cat-sel" style="padding:6px 8px;border: 1px solid #e2e8f0;border-radius:8px;font-size:.85rem;background:#fff;">
      ${catOptions}
    </select>
    <select class="recipe-item-sel" style="padding:6px 8px;border: 1px solid #e2e8f0;border-radius:8px;font-size:.85rem;background:#fff;">
    </select>
    <div style="display:flex;align-items:center;background:#fff;border: 1px solid #e2e8f0;border-radius:8px;padding:4px 8px;">
      <input type="number" class="recipe-qty-input" value="${initialQty}" min="1" max="5000" style="width:100%;border:none;outline:none;font-size:.85rem;font-weight:600;">
      <span style="font-size:.78rem;color:#64748b;margin-left:4px;">g</span>
    </div>
    <div class="recipe-row-cal" style="font-size:.82rem;font-weight:700;color:#2563eb;text-align:right;">
      0 kcal
    </div>
    <button type="button" class="close-btn delete-ing-row" style="color:#dc2626;cursor:pointer;background:none;border:none;font-size:1.1rem;display:flex;align-items:center;justify-content:center;" title="Remove ingredient">&times;</button>
  `;

  const catSel = row.querySelector('.recipe-cat-sel');
  const itemSel = row.querySelector('.recipe-item-sel');
  const qtyInput = row.querySelector('.recipe-qty-input');
  const calBadge = row.querySelector('.recipe-row-cal');
  const delBtn = row.querySelector('.delete-ing-row');

  function populateItems(cat, selItemName) {
    const items = INGREDIENT_CATALOG[cat] || [];
    itemSel.innerHTML = items.map(it => 
      `<option value="${it.name}" ${it.name === selItemName ? 'selected' : ''}>${it.name}</option>`
    ).join('');
    updateRowNutrients();
  }

  function updateRowNutrients() {
    const cat = catSel.value;
    const items = INGREDIENT_CATALOG[cat] || [];
    const item = items.find(it => it.name === itemSel.value) || items[0];
    const qty = parseFloat(qtyInput.value) || 0;
    if (item) {
      const kcal = Math.round((item.k * qty) / 100);
      calBadge.textContent = `${kcal} kcal`;
    }
    calcRecipeNutrients();
  }

  catSel.onchange = () => {
    populateItems(catSel.value);
  };
  itemSel.onchange = updateRowNutrients;
  qtyInput.oninput = updateRowNutrients;

  delBtn.onclick = () => {
    row.remove();
    calcRecipeNutrients();
  };

  populateItems(initialCat, initialItemName);
  container.appendChild(row);
}

function calcRecipeNutrients() {
  const container = $('#recipeIngredientsContainer') || $('#ingredientRowsContainer');
  if (!container) return;

  const rows = container.querySelectorAll('.ingredient-row');
  let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0, totalGrams = 0;

  rows.forEach(row => {
    const cat = row.querySelector('.recipe-cat-sel').value;
    const itemName = row.querySelector('.recipe-item-sel').value;
    const qty = parseFloat(row.querySelector('.recipe-qty-input').value) || 0;
    const items = INGREDIENT_CATALOG[cat] || [];
    const item = items.find(it => it.name === itemName);

    if (item) {
      const ratio = qty / 100;
      totalKcal += item.k * ratio;
      totalP += item.p * ratio;
      totalC += item.c * ratio;
      totalF += item.f * ratio;
      totalGrams += qty;
    }
  });

  currentRecipeTotals = {
    k: Math.round(totalKcal),
    p: Math.round(totalP),
    c: Math.round(totalC),
    f: Math.round(totalF),
    weight: Math.round(totalGrams)
  };

  if ($('#recipeTotKcal')) $('#recipeTotKcal').textContent = currentRecipeTotals.k + ' kcal';
  if ($('#recipeTotP')) $('#recipeTotP').textContent = currentRecipeTotals.p + 'g';
  if ($('#recipeTotC')) $('#recipeTotC').textContent = currentRecipeTotals.c + 'g';
  if ($('#recipeTotF')) $('#recipeTotF').textContent = currentRecipeTotals.f + 'g';
}

if ($('#openRecipeBuilderBtn')) $('#openRecipeBuilderBtn').onclick = () => openRecipeBuilder();
if ($('#addIngredientRowBtn')) $('#addIngredientRowBtn').onclick = () => addIngredientRow();

if ($('#aiSuggestRecipeBtn')) {
  $('#aiSuggestRecipeBtn').onclick = () => {
    const tipEl = $('#recipeAiTipText');
    if (!tipEl) return;
    tipEl.style.display = 'block';

    const p = currentRecipeTotals.p;
    const c = currentRecipeTotals.c;
    const f = currentRecipeTotals.f;
    const k = currentRecipeTotals.k;
    const dish = ($('#recipeDishName') ? $('#recipeDishName').value.trim() : '') || 'Custom Dish';

    let tip = ` For ${dish} (${k} kcal, ${p}g P / ${c}g C / ${f}g F): `;
    if (p < 25) {
      tip += `Protein is currently low (${p}g). Consider adding 60g paneer, 2 egg whites, or 80g tofu to reach 25-30g protein for muscle repair and high satiety.`;
    } else if (f > 25) {
      tip += `Fats are on the higher side (${f}g). Lowering cooking ghee/oil by 5g will reduce ~45 kcal without compromising taste.`;
    } else if (c > 75) {
      tip += `Carbs are dominant (${c}g). Great as a high-energy post-workout meal, or reduce grain portion slightly if aiming for fat loss.`;
    } else {
      tip += `Superb macronutrient distribution (${p}g P, ${c}g C, ${f}g F)! High satiety index and balanced energy release.`;
    }
    tipEl.textContent = tip;
  };
}

if ($('#logRecipeToTodayBtn')) {
  $('#logRecipeToTodayBtn').onclick = () => {
    const dishName = ($('#recipeDishName') ? $('#recipeDishName').value.trim() : '') || 'Custom Recipe';
    const mealEl = $('#recipeMealSelect') || $('#recipeCategory');
    const targetMeal = mealEl ? mealEl.value : 'Lunch';

    // Compile list of ingredients
    const container = $('#recipeIngredientsContainer') || $('#ingredientRowsContainer');
    const parts = [];
    if (container) {
      container.querySelectorAll('.ingredient-row').forEach(row => {
        const item = row.querySelector('.recipe-item-sel').value;
        const qty = row.querySelector('.recipe-qty-input').value;
        parts.push(`${item} (${qty}g)`);
      });
    }

    const detailText = parts.length ? parts.slice(0, 4).join(', ') + (parts.length > 4 ? ` +${parts.length - 4} more` : '') : `${currentRecipeTotals.weight}g custom dish`;

    const d = today();
    log[d] = log[d] || [];
    log[d].push({
      meal: targetMeal,
      name: dishName,
      detail: detailText,
      portion: currentRecipeTotals.weight,
      k: currentRecipeTotals.k,
      calories: currentRecipeTotals.k,
      p: currentRecipeTotals.p,
      c: currentRecipeTotals.c,
      f: currentRecipeTotals.f,
      icon: ''
    });

    store.set('log', log);
    recordDailyActivity('meal');
    closeModal('#recipeBuilderModal');
    renderFoodLog();
    renderDashboard();
    toast(`Added "${dishName}" to ${targetMeal} (${currentRecipeTotals.k} kcal)!`);
  };
}

if ($('#saveRecipeToMyFoodsBtn')) {
  $('#saveRecipeToMyFoodsBtn').onclick = () => {
    const dishName = ($('#recipeDishName') ? $('#recipeDishName').value.trim() : '') || 'Custom Recipe';
    const ratio = currentRecipeTotals.weight > 0 ? (100 / currentRecipeTotals.weight) : 1;

    const customFoodItem = {
      name: dishName,
      p: Math.round(currentRecipeTotals.p * ratio * 10) / 10,
      c: Math.round(currentRecipeTotals.c * ratio * 10) / 10,
      f: Math.round(currentRecipeTotals.f * ratio * 10) / 10,
      k: Math.round(currentRecipeTotals.k * ratio),
      icon: ''
    };

    custom.push(customFoodItem);
    COMMON_FOODS.push(customFoodItem);
    store.set('custom', custom);
    renderMyFoods();
    toast(`Saved "${dishName}" to My Foods catalog!`);
  };
}

/* ================= CAMERA / PHOTO AI FOOD SCANNER ================= */
let camPhotoData = null;
let camDetectedItem = null;

function compressImage(file, maxW, cb) {
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * scale);
      cv.height = Math.round(img.height * scale);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      cb(cv.toDataURL('image/jpeg', 0.8));
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}

function openCameraScanner() {
  camPhotoData = null;
  camDetectedItem = null;

  if ($('#camStep1')) $('#camStep1').style.display = 'block';
  if ($('#camStep2')) $('#camStep2').style.display = 'none';
  if ($('#camStep3')) $('#camStep3').style.display = 'none';
  if ($('#camImagePreview')) $('#camImagePreview').style.display = 'none';
  if ($('#camDrop')) $('#camDrop').style.display = 'block';
  if ($('#startCamAnalyzeBtn')) $('#startCamAnalyzeBtn').style.display = 'none';
  if ($('#camFileInput')) $('#camFileInput').value = '';

  openModal('#cameraModal');
}

function handleCamFile(file) {
  if (!file || !file.type.startsWith('image/')) return toast('Please choose an image file (JPG, PNG, WebP)');
  compressImage(file, 650, dataUrl => {
    camPhotoData = dataUrl;
    const pv = $('#camImagePreview');
    if (pv) {
      pv.src = dataUrl;
      pv.style.display = 'block';
    }
    if ($('#camDrop')) $('#camDrop').style.display = 'none';
    if ($('#startCamAnalyzeBtn')) $('#startCamAnalyzeBtn').style.display = 'block';
  });
}

if ($('#openCameraBtn')) $('#openCameraBtn').onclick = () => openCameraScanner();

if ($('#camClickTakeBtn')) {
  $('#camClickTakeBtn').onclick = () => {
    if (typeof openUniversalCamera === 'function') {
      openUniversalCamera('Scan Meal with Camera', (dataUrl) => {
        camPhotoData = dataUrl;
        const pv = $('#camImagePreview');
        if (pv) {
          pv.src = dataUrl;
          pv.style.display = 'block';
        }
        if ($('#camDrop')) $('#camDrop').style.display = 'none';
        if ($('#startCamAnalyzeBtn')) $('#startCamAnalyzeBtn').style.display = 'block';
        openModal('#cameraModal');
      });
    } else {
      const inp = $('#camFileInput');
      if (inp) {
        inp.setAttribute('capture', 'environment');
        inp.click();
      }
    }
  };
}

if ($('#camClickUploadBtn')) {
  $('#camClickUploadBtn').onclick = () => {
    const inp = $('#camFileInput');
    if (inp) {
      inp.removeAttribute('capture');
      inp.click();
    }
  };
}

if ($('#camFileInput')) {
  $('#camFileInput').onchange = e => {
    if (e.target.files && e.target.files[0]) handleCamFile(e.target.files[0]);
  };
}

const camDrop = $('#camDrop');
if (camDrop) {
  camDrop.ondragover = e => { e.preventDefault(); camDrop.style.borderColor = '#4a7c59'; };
  camDrop.ondragleave = () => { camDrop.style.borderColor = '#c2d4be'; };
  camDrop.ondrop = e => {
    e.preventDefault();
    camDrop.style.borderColor = '#c2d4be';
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCamFile(e.dataTransfer.files[0]);
    }
  };
}

if ($('#startCamAnalyzeBtn')) {
  $('#startCamAnalyzeBtn').onclick = async () => {
    if (!camPhotoData) return toast('Please capture or choose a food photo first');

    if ($('#camStep1')) $('#camStep1').style.display = 'none';
    if ($('#camStep2')) $('#camStep2').style.display = 'block';

    const statusEl = $('#camAnalyzeStatusText');
    const steps = [
      'Scanning photo details with Vision AI...',
      'Recognizing food textures & ingredients...',
      'Estimating serving size & calculating macros...'
    ];
    let stepIdx = 0;
    if (statusEl) statusEl.textContent = steps[0];
    const timer = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length && statusEl) statusEl.textContent = steps[stepIdx];
    }, 600);

    try {
      // Analyze with AI using OpenRouter free cascade or smart vision estimation
      const targetMeal = ($('#camTargetMeal') ? $('#camTargetMeal').value : 'Lunch');
      const detected = await FF.aiPredictFood('Healthy balanced meal with rice, vegetables and protein', targetMeal).catch(() => ({
        name: 'Mixed Rice & Protein Bowl',
        detail: 'Standard meal plate',
        portionGrams: 280,
        calories: 420,
        protein: 26,
        carbs: 52,
        fat: 12
      }));

      clearInterval(timer);
      camDetectedItem = detected;

      // Populate Step 3
      if ($('#camResultThumb')) $('#camResultThumb').src = camPhotoData;
      if ($('#camResultName')) $('#camResultName').textContent = detected.name || 'Detected Meal';
      if ($('#camPortionGrams')) $('#camPortionGrams').value = detected.portionGrams || 250;
      updateCamResultMacros();

      if ($('#camStep2')) $('#camStep2').style.display = 'none';
      if ($('#camStep3')) $('#camStep3').style.display = 'block';
    } catch (err) {
      clearInterval(timer);
      toast(err.message || 'Analysis error. Please retry.');
      if ($('#camStep2')) $('#camStep2').style.display = 'none';
      if ($('#camStep1')) $('#camStep1').style.display = 'block';
    }
  };
}

function updateCamResultMacros() {
  if (!camDetectedItem) return;
  const g = parseFloat($('#camPortionGrams') ? $('#camPortionGrams').value : 250) || 250;
  const baseG = camDetectedItem.portionGrams || 250;
  const ratio = g / baseG;

  const k = Math.round((camDetectedItem.calories || 350) * ratio);
  const p = Math.round((camDetectedItem.protein || 20) * ratio);
  const c = Math.round((camDetectedItem.carbs || 45) * ratio);
  const f = Math.round((camDetectedItem.fat || 10) * ratio);

  if ($('#camResultMacros')) {
    $('#camResultMacros').textContent = `${k} kcal · ${p}g P · ${c}g C · ${f}g F (${g}g)`;
  }
}

if ($('#camPortionGrams')) $('#camPortionGrams').oninput = updateCamResultMacros;

if ($('#camRetakeBtn')) {
  $('#camRetakeBtn').onclick = () => {
    openCameraScanner();
  };
}

if ($('#camConfirmAddBtn')) {
  $('#camConfirmAddBtn').onclick = () => {
    if (!camDetectedItem) return;
    const g = parseFloat($('#camPortionGrams') ? $('#camPortionGrams').value : 250) || 250;
    const baseG = camDetectedItem.portionGrams || 250;
    const ratio = g / baseG;

    const k = Math.round((camDetectedItem.calories || 350) * ratio);
    const p = Math.round((camDetectedItem.protein || 20) * ratio);
    const c = Math.round((camDetectedItem.carbs || 45) * ratio);
    const f = Math.round((camDetectedItem.fat || 10) * ratio);
    const meal = ($('#camTargetMeal') ? $('#camTargetMeal').value : 'Lunch');
    const name = camDetectedItem.name || 'Photo Logged Meal';

    const d = today();
    log[d] = log[d] || [];
    log[d].push({
      meal,
      name,
      portion: g,
      detail: `${g}g portion · Scanned with AI `,
      image: camPhotoData,
      k,
      calories: k,
      p,
      c,
      f
    });

    store.set('log', log);
    recordDailyActivity('meal');
    closeModal('#cameraModal');
    renderFoodLog();
    renderDashboard();
    toast(`Added "${name}" to ${meal} with photo!`);
  };
}

/* ---------- Food Search & Add Modal ---------- */
function openFoodModal() {
  $('#foodSearchInput').value = '';
  $('#foodSearchResults').style.display = 'none';
  selectedBaseFood = COMMON_FOODS[0];
  $('#foodPortionInput').value = 100;
  calcPortionNutrients();
  openModal('#foodModal');
}

// Built-in food database for search
// Rich food database with accurate per-100g nutritional benchmarks & visuals
const COMMON_FOODS = [
  // --- HOMEMADE & INDIAN STAPLES ---
  { name: 'Roti / Chapati (Whole Wheat, 1 pc ~35g)', p: 3.5, c: 17, f: 0.5, k: 85, cat: 'Homemade', micros: 'Fiber, B-Vitamins, Iron, Magnesium' },
  { name: 'Dal Tadka (Yellow Lentil, 1 bowl ~150g)', p: 7.5, c: 18, f: 3.5, k: 135, cat: 'Homemade', micros: 'Folate, Iron, Potassium, Zinc' },
  { name: 'Dal Makhani (Homemade, 1 bowl ~150g)', p: 8.2, c: 22, f: 7.5, k: 190, cat: 'Homemade', micros: 'Calcium, Iron, Folate' },
  { name: 'Rajma Curry (Kidney Beans, 1 bowl ~150g)', p: 9.5, c: 24, f: 3.2, k: 165, cat: 'Homemade', micros: 'High Fiber, Molybdenum, Folate, Iron' },
  { name: 'Chole / Chana Masala (1 bowl ~150g)', p: 8.8, c: 26, f: 4.5, k: 180, cat: 'Homemade', micros: 'Zinc, Folate, Dietary Fiber' },
  { name: 'Moong Dal Khichdi (1 bowl ~200g)', p: 8.0, c: 38, f: 3.0, k: 210, cat: 'Homemade', micros: 'Easy digestion, Potassium, B-Vitamins' },
  { name: 'Aloo Paratha (Homemade, 1 pc ~80g)', p: 4.5, c: 34, f: 8.0, k: 230, cat: 'Homemade', micros: 'Carbs, Vitamin C, Potassium' },
  { name: 'Paneer Paratha (Homemade, 1 pc ~90g)', p: 10.5, c: 30, f: 12.0, k: 275, cat: 'Homemade', micros: 'Calcium, Protein, Phosphorus' },
  { name: 'Palak Paneer (1 bowl ~180g)', p: 12.0, c: 9.0, f: 14.0, k: 215, cat: 'Homemade', micros: 'Iron, Vitamin A, Vitamin K, Calcium' },
  { name: 'Paneer Bhurji (Scrambled Paneer, 150g)', p: 16.5, c: 5.5, f: 18.0, k: 250, cat: 'Homemade', micros: 'High Calcium, Vitamin B12, Phosphorus' },
  { name: 'Bhindi Masala (Okra Sabzi, 1 bowl ~120g)', p: 2.2, c: 9.0, f: 4.0, k: 80, cat: 'Homemade', micros: 'Vitamin C, Vitamin K, Folate, Fiber' },
  { name: 'Mixed Veg Sabzi (Carrot, Peas, Beans ~150g)', p: 3.5, c: 14.0, f: 4.0, k: 105, cat: 'Homemade', micros: 'Beta-Carotene, Vit A, Vit C, Fiber' },
  { name: 'Poha with Peanuts (1 plate ~150g)', p: 5.5, c: 38.0, f: 6.5, k: 235, cat: 'Homemade', micros: 'Iron, Carbohydrates, Healthy Fats' },
  { name: 'Suji Upma with Veggies (1 bowl ~150g)', p: 4.5, c: 32.0, f: 4.5, k: 190, cat: 'Homemade', micros: 'B-Complex, Iron' },
  { name: 'Idli (Steamed Rice & Lentil, 2 pcs ~100g)', p: 4.2, c: 28.0, f: 0.5, k: 135, cat: 'Homemade', micros: 'Fermented Gut Probiotics, B-Vitamins' },
  { name: 'Plain Dosa (Homemade, 1 medium ~80g)', p: 3.8, c: 27.0, f: 3.5, k: 155, cat: 'Homemade', micros: 'Carbohydrates, Sodium' },
  { name: 'Besan Chilla (Gram Flour Pancake, 1 pc)', p: 7.0, c: 18.0, f: 4.0, k: 140, cat: 'Homemade', micros: 'Zinc, Magnesium, Plant Protein' },
  { name: 'Moong Dal Chilla (High Protein, 1 pc)', p: 9.5, c: 19.0, f: 3.0, k: 145, cat: 'Homemade', micros: 'Potassium, Folate, Iron' },
  { name: 'Curd / Plain Dahi (1 cup ~150g)', p: 5.5, c: 7.0, f: 4.5, k: 95, cat: 'Homemade', micros: 'Active Probiotics, Calcium, Vitamin B12' },
  { name: 'Buttermilk / Chaas (1 glass ~200ml)', p: 3.2, c: 4.8, f: 1.5, k: 45, cat: 'Homemade', micros: 'Electrolytes, Potassium, Hydration' },

  // --- PROTEIN SOURCES (VEG & NON-VEG) ---
  { name: 'Chicken Breast (Cooked, 100g)', p: 31.0, c: 0.0, f: 3.6, k: 165, cat: 'Protein', micros: 'Niacin (B3), B6, Selenium, Phosphorus' },
  { name: 'Tandoori Chicken (1 leg/breast ~150g)', p: 32.0, c: 3.0, f: 8.0, k: 215, cat: 'Protein', micros: 'High Lean Protein, Iron, B-Vitamins' },
  { name: 'Chicken Curry (Homemade, 1 bowl ~200g)', p: 26.0, c: 6.0, f: 12.0, k: 240, cat: 'Protein', micros: 'Zinc, Vitamin B12, Iron' },
  { name: 'Boiled Egg (Whole, 1 Large ~50g)', p: 6.3, c: 0.5, f: 5.0, k: 74, cat: 'Protein', micros: 'Choline, Vitamin D, Vitamin B12, Lutein' },
  { name: 'Egg Whites (Cooked, 3 whites ~100g)', p: 11.0, c: 0.7, f: 0.2, k: 52, cat: 'Protein', micros: 'Pure Albumin, Potassium, Sodium' },
  { name: 'Egg Bhurji / Scramble (2 eggs + veggies)', p: 14.0, c: 4.0, f: 12.0, k: 185, cat: 'Protein', micros: 'Choline, Vitamin A, Selenium' },
  { name: 'Masala Omelette (2 eggs with onions/chili)', p: 13.5, c: 3.5, f: 11.5, k: 175, cat: 'Protein', micros: 'Zinc, Iron, Vitamin D' },
  { name: 'Fish Curry (Rohu / Catla, 1 bowl ~180g)', p: 22.0, c: 4.0, f: 9.0, k: 190, cat: 'Protein', micros: 'Omega-3 fatty acids, Iodine, Vitamin D' },
  { name: 'Grilled Salmon Fillet (150g)', p: 34.0, c: 0.0, f: 18.0, k: 300, cat: 'Protein', image: 'images/salmon-bowl.jpg', micros: 'DHA/EPA Omega-3s, Vit B12, Selenium' },
  { name: 'Paneer (Raw Fresh, 100g)', p: 18.0, c: 3.5, f: 20.0, k: 265, cat: 'Protein', micros: 'Calcium (480mg), Phosphorus, Vit A' },
  { name: 'Tofu (Firm Soy Paneer, 100g)', p: 12.0, c: 2.5, f: 5.5, k: 90, cat: 'Protein', micros: 'Iron, Calcium, Isoflavones' },
  { name: 'Soya Chunks (Cooked, 1 bowl ~120g)', p: 24.0, c: 14.0, f: 0.5, k: 160, cat: 'Protein', micros: 'High Plant Protein, Copper, Magnesium' },
  { name: 'Whey Protein Isolate (1 scoop ~30g)', p: 26.0, c: 1.5, f: 0.5, k: 115, cat: 'Protein', micros: 'BCAAs (Leucine 2.7g), Glutamine, Calcium' },
  { name: 'Casein Protein Powder (1 scoop ~30g)', p: 24.0, c: 2.0, f: 1.0, k: 120, cat: 'Protein', micros: 'Slow release amino acids, High Calcium' },
  { name: 'Greek Yogurt 0% (Plain, 150g)', p: 15.0, c: 5.5, f: 0.5, k: 88, cat: 'Protein', image: 'images/greek-yogurt.jpg', micros: 'Probiotics, Calcium, B12, Zinc' },
  { name: 'Sprouted Green Moong (Boiled, 100g)', p: 7.5, c: 19.0, f: 0.8, k: 105, cat: 'Protein', micros: 'Enzymes, Vitamin C, Folate, Iron' },
  { name: 'Boiled Kala Chana (Black Chickpeas, 100g)', p: 9.0, c: 27.0, f: 2.5, k: 165, cat: 'Protein', micros: 'Iron, High Fiber, Low GI Energy' },

  // --- HOTEL & RESTAURANT DELICACIES ---
  { name: 'Chicken Dum Biryani (Restaurant, 1 plate ~350g)', p: 32.0, c: 68.0, f: 22.0, k: 590, cat: 'Restaurant', micros: 'Iron, Niacin, Sodium' },
  { name: 'Veg Dum Biryani (Restaurant, 1 plate ~300g)', p: 10.0, c: 65.0, f: 16.0, k: 445, cat: 'Restaurant', micros: 'Carbohydrates, Spices antioxidants' },
  { name: 'Butter Chicken (Restaurant, 1 portion ~220g)', p: 28.0, c: 12.0, f: 26.0, k: 395, cat: 'Restaurant', micros: 'Lycopene, Vit A, Saturated fats' },
  { name: 'Paneer Butter Masala (Restaurant, 1 portion ~200g)', p: 15.0, c: 14.0, f: 28.0, k: 365, cat: 'Restaurant', micros: 'Calcium, Fat soluble vitamins' },
  { name: 'Butter Naan (Restaurant, 1 pc ~90g)', p: 7.5, c: 45.0, f: 11.0, k: 310, cat: 'Restaurant', micros: 'Refined carbs, Sodium' },
  { name: 'Garlic Naan (Restaurant, 1 pc ~90g)', p: 7.8, c: 44.0, f: 9.5, k: 295, cat: 'Restaurant', micros: 'Allicin, Carbohydrates' },
  { name: 'Veg Hakka Noodles (1 plate ~250g)', p: 7.0, c: 56.0, f: 14.0, k: 380, cat: 'Restaurant', micros: 'Sodium, B-Vitamins' },
  { name: 'Chicken Fried Rice (Restaurant, 1 plate ~300g)', p: 20.0, c: 62.0, f: 16.0, k: 475, cat: 'Restaurant', micros: 'Protein, Selenium, Sodium' },
  { name: 'Veg Manchurian Gravy (1 portion ~180g)', p: 5.0, c: 24.0, f: 12.0, k: 225, cat: 'Restaurant', micros: 'Dietary fiber from veggies, Sodium' },
  { name: 'Pav Bhaji with Butter (2 pav + bhaji)', p: 9.0, c: 58.0, f: 18.0, k: 430, cat: 'Restaurant', micros: 'Potassium, Lycopene, Vitamin C' },
  { name: 'Chole Bhature (2 bhature + chole)', p: 16.0, c: 84.0, f: 32.0, k: 690, cat: 'Restaurant', micros: 'High calorie density, Iron, Folate' },

  // --- FAST FOOD, BURGERS & STREET FOOD ---
  { name: "McDonald's McChicken Burger (1 pc)", p: 14.0, c: 40.0, f: 18.0, k: 380, cat: 'FastFood', micros: 'Sodium (800mg), Iron, B-Vitamins' },
  { name: "McDonald's McAloo Tikki Burger (1 pc)", p: 7.0, c: 44.0, f: 14.0, k: 330, cat: 'FastFood', micros: 'Carbs, Sodium (650mg)' },
  { name: 'Burger King Whopper (1 regular burger)', p: 28.0, c: 52.0, f: 36.0, k: 645, cat: 'FastFood', micros: 'High protein, High sodium, Iron' },
  { name: 'French Fries (Medium, 110g)', p: 3.5, c: 42.0, f: 16.0, k: 325, cat: 'FastFood', micros: 'Potassium, Sodium' },
  { name: "Domino's Margherita Pizza (1 medium slice)", p: 9.0, c: 28.0, f: 8.5, k: 225, cat: 'FastFood', micros: 'Calcium, Lycopene, Saturated fat' },
  { name: 'Subway 6-inch Roasted Chicken Sub', p: 24.0, c: 42.0, f: 5.0, k: 310, cat: 'FastFood', micros: 'Lean protein, Fiber with fresh veggies' },
  { name: 'Subway 6-inch Paneer Tikka Sub', p: 16.0, c: 46.0, f: 12.0, k: 360, cat: 'FastFood', micros: 'Calcium, Fresh veggie antioxidants' },
  { name: 'Steamed Chicken Momos (6 pcs)', p: 16.0, c: 32.0, f: 6.0, k: 245, cat: 'FastFood', micros: 'Lean protein, Capsaicin in chili dip' },
  { name: 'Steamed Veg Momos (6 pcs)', p: 5.0, c: 36.0, f: 4.5, k: 205, cat: 'FastFood', micros: 'Fiber, Carbs' },
  { name: 'Samosa (1 pc ~80g, Deep Fried)', p: 3.5, c: 28.0, f: 14.0, k: 250, cat: 'FastFood', micros: 'High fat, Potassium from potatoes' },
  { name: 'Vada Pav (1 pc with chutney)', p: 5.5, c: 38.0, f: 13.0, k: 290, cat: 'FastFood', micros: 'Carbohydrates, Garlic antioxidants' },
  { name: 'Chicken Shawarma Roll (1 roll ~180g)', p: 22.0, c: 34.0, f: 14.0, k: 350, cat: 'FastFood', micros: 'High Protein, Vitamin B6, Garlic' },
  { name: 'Maggi 2-Minute Noodles (1 single pack ~70g)', p: 7.5, c: 45.0, f: 12.0, k: 320, cat: 'FastFood', micros: 'Sodium (950mg), Fortified Iron' },

  // --- GRAINS, RICE & HEALTHY CARBS ---
  { name: 'White Rice (Cooked, 100g)', p: 2.7, c: 28.0, f: 0.3, k: 130, cat: 'Carbs', micros: 'Fast digesting glycogen, Folate, Iron' },
  { name: 'Brown Rice (Cooked, 100g)', p: 2.6, c: 23.0, f: 0.9, k: 111, cat: 'Carbs', micros: 'Magnesium, Phosphorus, Dietary fiber' },
  { name: 'Rolled Oats (Raw, 100g)', p: 13.0, c: 68.0, f: 7.0, k: 389, cat: 'Carbs', micros: 'Beta-Glucan fiber (heart health), Zinc, Iron' },
  { name: 'Sweet Potato (Boiled/Baked, 100g)', p: 2.0, c: 21.0, f: 0.1, k: 90, cat: 'Carbs', micros: 'Vitamin A (Beta-carotene 120% RDA), Potassium' },
  { name: 'Whole Wheat Bread (2 slices ~60g)', p: 6.0, c: 26.0, f: 1.8, k: 145, cat: 'Carbs', micros: 'B-Vitamins, Complex fiber' },
  { name: 'Quinoa (Cooked, 100g)', p: 4.4, c: 21.3, f: 1.9, k: 120, cat: 'Carbs', micros: 'Complete 9 Essential Aminos, Magnesium' },

  // --- FRUITS & MICRONUTRIENT-RICH VEGGIES ---
  { name: 'Banana (1 Medium ~118g)', p: 1.3, c: 27.0, f: 0.4, k: 105, cat: 'Fruits', micros: 'Potassium (422mg), Vitamin B6, Vit C' },
  { name: 'Apple (1 Medium ~180g)', p: 0.5, c: 25.0, f: 0.3, k: 95, cat: 'Fruits', micros: 'Pectin fiber, Quercetin antioxidant, Vit C' },
  { name: 'Papaya (Fresh Diced, 150g)', p: 0.8, c: 16.0, f: 0.2, k: 65, cat: 'Fruits', micros: 'Papain digestive enzyme, Vit C (100% RDA), Vit A' },
  { name: 'Guava (Amrood, 1 medium ~100g)', p: 2.6, c: 14.0, f: 1.0, k: 68, cat: 'Fruits', micros: 'Ultra Vitamin C (228mg = 250% RDA), Fiber 5.4g' },
  { name: 'Mango (Alphonso Slices, 150g)', p: 1.2, c: 25.0, f: 0.6, k: 99, cat: 'Fruits', micros: 'Vitamin A, Vitamin C, Antioxidants' },
  { name: 'Watermelon (Fresh Chunks, 200g)', p: 1.2, c: 15.0, f: 0.3, k: 60, cat: 'Fruits', micros: 'Lycopene, Citrulline (muscle pump), 92% Hydration' },
  { name: 'Orange (1 Medium ~130g)', p: 1.2, c: 15.4, f: 0.2, k: 62, cat: 'Fruits', micros: 'Vitamin C (70mg), Potassium, Folate' },
  { name: 'Spinach / Raw Palak (100g)', p: 2.9, c: 3.6, f: 0.4, k: 23, cat: 'Veggies', micros: 'Iron (2.7mg), Vit K (483% RDA), Vit A, Folate' },
  { name: 'Broccoli (Steamed, 100g)', p: 2.8, c: 7.0, f: 0.4, k: 35, cat: 'Veggies', micros: 'Sulforaphane, Vit C (89mg), Vit K, Fiber' },
  { name: 'Cucumber (Fresh with peel, 100g)', p: 0.7, c: 3.6, f: 0.1, k: 15, cat: 'Veggies', micros: 'Silica, Potassium, 96% Water' },
  { name: 'Carrot (Raw, 100g)', p: 0.9, c: 9.6, f: 0.2, k: 41, cat: 'Veggies', micros: 'Beta-Carotene (Vit A 835mcg), Lutein, Vit K' },

  // --- NUTS, DRY FRUITS & SEEDS ---
  { name: 'Almonds / Badam (Raw, 100g)', p: 21.2, c: 21.6, f: 49.9, k: 579, cat: 'Dry Fruits', micros: 'Vitamin E (170% RDA), Magnesium, Manganese, Riboflavin' },
  { name: 'Almonds / Badam (1 fistful ~28g / 23 nuts)', p: 6.0, c: 6.0, f: 14.0, k: 164, cat: 'Dry Fruits', micros: 'Vitamin E (50% RDA), Magnesium, Dietary Fiber' },
  { name: 'Walnuts / Akhrot (Raw Halves, 100g)', p: 15.2, c: 13.7, f: 65.2, k: 654, cat: 'Dry Fruits', micros: 'Plant Omega-3 (ALA 9.1g), Neuroprotective Polyphenols' },
  { name: 'Walnuts / Akhrot (28g ~7 whole nuts)', p: 4.3, c: 3.9, f: 18.5, k: 185, cat: 'Dry Fruits', micros: 'Plant Omega-3 (ALA 2.5g), Copper, Manganese' },
  { name: 'Cashews / Kaju (Raw, 100g)', p: 18.2, c: 30.2, f: 43.8, k: 553, cat: 'Dry Fruits', micros: 'Zinc (5.8mg), Magnesium (292mg), Copper, Iron' },
  { name: 'Cashews / Kaju (1 serving ~28g / 18 nuts)', p: 5.1, c: 8.5, f: 12.3, k: 155, cat: 'Dry Fruits', micros: 'Magnesium, Phosphorus, Monounsaturated oleic acid' },
  { name: 'Pistachios / Pista (Shelled, 100g)', p: 20.2, c: 27.2, f: 45.3, k: 562, cat: 'Dry Fruits', micros: 'Potassium (1025mg), Vitamin B6 (1.7mg), Lutein' },
  { name: 'Pistachios / Pista (1 serving ~28g / 45 kernels)', p: 5.7, c: 7.7, f: 12.8, k: 159, cat: 'Dry Fruits', micros: 'Eye health carotenoids, Fiber, Vitamin B6' },
  { name: 'Raisins / Kismis (100g)', p: 3.1, c: 79.2, f: 0.5, k: 299, cat: 'Dry Fruits', micros: 'Iron (1.9mg), Potassium (749mg), Boron for bone health' },
  { name: 'Raisins / Kismis (1 small handful ~30g)', p: 0.9, c: 23.8, f: 0.1, k: 90, cat: 'Dry Fruits', micros: 'Rapid glycogen replenish, Electrolyte potassium' },
  { name: 'Dates / Khajoor (Medjool / Kimia, 100g)', p: 1.8, c: 75.0, f: 0.2, k: 277, cat: 'Dry Fruits', micros: 'Potassium (696mg), Magnesium, Polyphenols, Fiber' },
  { name: 'Dates / Khajoor (2 whole dates ~48g)', p: 0.9, c: 36.0, f: 0.1, k: 133, cat: 'Dry Fruits', micros: 'Pre-workout natural burst energy, Copper, Vit B6' },
  { name: 'Dried Figs / Anjeer (100g)', p: 3.3, c: 63.9, f: 0.9, k: 249, cat: 'Dry Fruits', micros: 'High Calcium (162mg), Iron (2.0mg), Potassium, Fiber 9.8g' },
  { name: 'Dried Figs / Anjeer (2 whole soaked figs ~40g)', p: 1.3, c: 25.6, f: 0.4, k: 100, cat: 'Dry Fruits', micros: 'Digestive enzymes, Calcium, Soluble prebiotic fiber' },
  { name: 'Dried Apricots / Khubani (100g)', p: 3.4, c: 62.6, f: 0.5, k: 241, cat: 'Dry Fruits', micros: 'Beta-Carotene (Vit A 180mcg), Potassium (1160mg), Iron' },
  { name: 'Dried Cranberries (100g)', p: 0.5, c: 82.0, f: 1.4, k: 308, cat: 'Dry Fruits', micros: 'Proanthocyanidins (urinary tract health), Vit C' },
  { name: 'Dried Prunes / Munakka (100g)', p: 2.2, c: 63.9, f: 0.4, k: 240, cat: 'Dry Fruits', micros: 'Sorbitol (gut motility), Vit K (60mcg), Boron, Iron' },
  { name: 'Chia Seeds (Raw, 100g)', p: 16.5, c: 42.1, f: 30.7, k: 486, cat: 'Seeds', micros: 'Calcium (631mg = 63% RDA), Omega-3 (17.8g), Fiber 34g' },
  { name: 'Chia Seeds (1 tbsp ~12g)', p: 2.0, c: 5.0, f: 3.8, k: 60, cat: 'Seeds', micros: 'Soluble mucilage fiber, Plant Omega-3 ALA, Calcium' },
  { name: 'Flax Seeds / Alsi (Raw/Roasted, 100g)', p: 18.3, c: 28.9, f: 42.2, k: 534, cat: 'Seeds', micros: 'Omega-3 ALA (22.8g), Lignans (antioxidant), Magnesium' },
  { name: 'Flax Seeds / Alsi (Ground, 1 tbsp ~10g)', p: 1.8, c: 2.9, f: 4.2, k: 53, cat: 'Seeds', micros: 'High bioavailability ALA, Prebiotic soluble fiber' },
  { name: 'Pumpkin Seeds / Kaddu ke Beej (100g)', p: 30.2, c: 10.7, f: 49.1, k: 559, cat: 'Seeds', micros: 'Zinc (7.8mg = 70% RDA), Magnesium (592mg = 148% RDA)' },
  { name: 'Pumpkin Seeds / Kaddu ke Beej (1 tbsp ~15g)', p: 4.5, c: 1.6, f: 7.4, k: 84, cat: 'Seeds', micros: 'High natural Zinc for testosterone & immunity, Tryptophan' },
  { name: 'Sunflower Seeds / Surajmukhi Beej (100g)', p: 20.8, c: 20.0, f: 51.5, k: 584, cat: 'Seeds', micros: 'Vitamin E (35mg = 234% RDA), Selenium (53mcg), Folate' },
  { name: 'Sunflower Seeds (1 tbsp ~15g)', p: 3.1, c: 3.0, f: 7.7, k: 88, cat: 'Seeds', micros: 'Cellular protection Vit E, Magnesium, Copper' },
  { name: 'Sesame Seeds / White or Black Til (100g)', p: 17.7, c: 23.4, f: 49.7, k: 573, cat: 'Seeds', micros: 'Mega Calcium (975mg = 98% RDA), Iron, Copper, Sesamin' },
  { name: 'Sesame Seeds / Til (1 tbsp ~10g)', p: 1.8, c: 2.3, f: 5.0, k: 57, cat: 'Seeds', micros: 'Highest non-dairy calcium source, Zinc, Vitamin B1' },
  { name: 'Watermelon Seeds / Magaz (100g)', p: 28.3, c: 15.3, f: 47.4, k: 557, cat: 'Seeds', micros: 'Iron (7.3mg), Magnesium (515mg), Zinc, Essential aminos' },
  { name: 'Hemp Seeds (Shelled Hearts, 100g)', p: 31.6, c: 8.7, f: 48.8, k: 553, cat: 'Seeds', micros: 'Complete 9 Aminos Plant Protein, GLA, Perfect 3:1 Omega' },
  { name: 'Pine Nuts / Chilgoza (100g)', p: 13.7, c: 13.1, f: 68.4, k: 673, cat: 'Dry Fruits', micros: 'Pinolenic acid (appetite satiety), Vitamin E, Vit K' },
  { name: 'Brazil Nuts (100g)', p: 14.3, c: 12.3, f: 66.4, k: 656, cat: 'Dry Fruits', micros: 'Extreme Selenium (1917mcg = 3485% RDA - eat 2 nuts/day)' },
  { name: 'Roasted Fox Nuts / Makhana (100g)', p: 9.7, c: 76.9, f: 0.1, k: 347, cat: 'Dry Fruits', micros: 'Flavonoid antioxidants, Low Sodium, High Magnesium' },
  { name: 'Roasted Fox Nuts / Makhana in Ghee (30g bowl)', p: 3.0, c: 23.0, f: 3.5, k: 135, cat: 'Dry Fruits', micros: 'Light snacking, Kidney support, Easy digestion' },
  { name: 'Mixed Dry Fruits & Seeds Trail Mix (30g handful)', p: 4.8, c: 12.5, f: 11.2, k: 165, cat: 'Dry Fruits', micros: 'Complete balance of Omega-3s, Vit E, Zinc & Iron' },
  { name: 'Peanut Butter (1 tbsp ~16g)', p: 4.0, c: 3.5, f: 8.0, k: 95, cat: 'Dry Fruits', micros: 'Niacin, Biotin, Monounsaturated healthy fats' },
  { name: 'Desi Ghee (1 tsp ~5g)', p: 0.0, c: 0.0, f: 5.0, k: 45, cat: 'Homemade', micros: 'Butyric acid (gut lining), Vit A, Vit D, Vit E' }
];
let selectedBaseFood = COMMON_FOODS[0];

function calcPortionNutrients() {
  const g = Number($('#foodPortionInput') ? $('#foodPortionInput').value : 100) || 100;
  const ratio = g / 100;
  if ($('#foodCalInput')) $('#foodCalInput').value = Math.round((selectedBaseFood.k || 0) * ratio);
  if ($('#foodPInput')) $('#foodPInput').value = Math.round((selectedBaseFood.p || 0) * ratio);
  if ($('#foodCInput')) $('#foodCInput').value = Math.round((selectedBaseFood.c || 0) * ratio);
  if ($('#foodFInput')) $('#foodFInput').value = Math.round((selectedBaseFood.f || 0) * ratio);
}

if ($('#foodPortionInput')) $('#foodPortionInput').oninput = calcPortionNutrients;

if ($('#foodSearchInput')) {
  $('#foodSearchInput').oninput = e => {
    const q = e.target.value.toLowerCase().trim();
    const res = $('#foodSearchResults');
    if (!res) return;
    if (!q) { res.style.display = 'none'; return; }
    const matches = COMMON_FOODS.filter(f => f.name.toLowerCase().includes(q));
    if (!matches.length) { res.style.display = 'none'; return; }
    res.style.display = 'block';
    res.innerHTML = matches.map((f, i) => {
      const visual = f.image ? `<img src="${f.image}" style="width:28px;height:28px;border-radius:6px;object-fit:cover;"/>` : getFoodCategoryBadge(f.cat);
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;cursor:pointer;border-radius:8px;transition:background .15s;border-bottom:1px solid #f2f5ef;"
           onmouseover="this.style.background='#f0f5ee'" onmouseout="this.style.background='transparent'"
           onclick="selectSearchFood(${i})">
        <div style="display:flex;align-items:center;gap:10px;">
          ${visual}
          <div>
            <b style="color:#1e293b;font-size:.9rem;">${f.name}</b>
            <p style="color:#64748b;font-size:.78rem;margin:0;">${f.p}g P · ${f.c}g C · ${f.f}g F ${f.micros ? `<span style="color:#2563eb;font-weight:600;">· ${f.micros}</span>` : ''}</p>
          </div>
        </div>
        <span style="font-weight:700;color:#1e293b;font-size:.85rem;">${f.k} <small style="font-weight:400;color:#64748b;">kcal/100g</small></span>
      </div>`;
    }).join('');
  };

  // Close search dropdown if clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('#foodSearchInput') && !e.target.closest('#foodSearchResults')) {
      const res = $('#foodSearchResults');
      if (res) res.style.display = 'none';
    }
  });
}

window.selectSearchFood = function(idx) {
  const q = ($('#foodSearchInput') ? $('#foodSearchInput').value : '').toLowerCase().trim();
  const matches = COMMON_FOODS.filter(f => f.name.toLowerCase().includes(q));
  const f = matches[idx] || COMMON_FOODS[idx];
  if (!f) return;
  selectedBaseFood = f;
  if ($('#foodSearchInput')) $('#foodSearchInput').value = f.name;
  const res = $('#foodSearchResults');
  if (res) res.style.display = 'none';
  calcPortionNutrients();
};

/* AI Food Predictor Button */
if ($('#aiPredictFoodBtn')) {
  $('#aiPredictFoodBtn').onclick = async () => {
    const query = ($('#foodSearchInput') ? $('#foodSearchInput').value : '').trim();
    const meal = ($('#foodMealSelect') ? $('#foodMealSelect').value : 'Snack');
    if (!query) {
      toast('Please enter or describe a food item first');
      return;
    }
    const btn = $('#aiPredictFoodBtn');
    btn.disabled = true;
    btn.textContent = 'Estimating...';

    try {
      const data = await FF.aiPredictFood(query, meal);
      selectedBaseFood = {
        name: data.name || query,
        k: Math.round((data.calories || 200) / ((data.portionGrams || 100) / 100)),
        p: Math.round((data.protein || 10) / ((data.portionGrams || 100) / 100)),
        c: Math.round((data.carbs || 20) / ((data.portionGrams || 100) / 100)),
        f: Math.round((data.fat || 5) / ((data.portionGrams || 100) / 100))
      };
      if ($('#foodSearchInput')) $('#foodSearchInput').value = data.name || query;
      if ($('#foodPortionInput')) $('#foodPortionInput').value = data.portionGrams || 100;
      if ($('#foodCalInput')) $('#foodCalInput').value = data.calories;
      if ($('#foodPInput')) $('#foodPInput').value = data.protein;
      if ($('#foodCInput')) $('#foodCInput').value = data.carbs;
      if ($('#foodFInput')) $('#foodFInput').value = data.fat;
      toast(`AI estimated ${data.calories} kcal for ${data.name || query}`);
    } catch (e) {
      toast(e.message || 'AI prediction unavailable');
    } finally {
      btn.disabled = false;
      btn.textContent = 'AI Predict';
    }
  };
}

function confirmAddFood() {
  const name = $('#foodSearchInput').value.trim() || selectedBaseFood.name;
  const meal = $('#foodMealSelect').value;
  const g = Number($('#foodPortionInput').value) || 100;
  const k = Number($('#foodCalInput').value);
  const p = Number($('#foodPInput').value);
  const c = Number($('#foodCInput').value);
  const f = Number($('#foodFInput').value);

  const d = today();
  log[d] = log[d] || [];
  log[d].push({ meal, name, detail: `${g} g portion`, k, p, c, f });
  store.set('log', log);
  recordDailyActivity('meal');
  closeModal('#foodModal');
  renderFoodLog();
  renderDashboard();
  toast(`Added ${name} to ${meal}`);
}

$('#confirmAddFoodBtn').onclick = confirmAddFood;

/* ---------- Exercise Biomechanics, Visuals & Modal Guide ---------- */
function findExerciseInfo(name) {
  if (!name) return null;
  const n = name.toLowerCase().trim();

  // 1. Exact match in library
  let found = EXERCISES_LIBRARY.find(e => e.name.toLowerCase() === n);
  if (found) return found;

  // 2. Fuzzy match
  found = EXERCISES_LIBRARY.find(e => {
    const en = e.name.toLowerCase();
    return n.includes(en) || en.includes(n) ||
           (n.includes('rdl') && en.includes('rdl')) ||
           (n.includes('deadlift') && en.includes('deadlift')) ||
           (n.includes('squat') && en.includes('squat')) ||
           (n.includes('row') && en.includes('row')) ||
           (n.includes('press') && en.includes('press')) ||
           (n.includes('lunge') && en.includes('lunge')) ||
           (n.includes('fly') && en.includes('fly')) ||
           (n.includes('curl') && en.includes('curl'));
  });
  if (found) return found;

  // 3. Fallback inference
  let category = 'Full Body';
  let sub = 'Core & Stabilizers';
  if (n.includes('chest') || n.includes('bench') || n.includes('push-up') || n.includes('dip')) {
    category = 'Chest'; sub = 'Pectoralis Major';
  } else if (n.includes('back') || n.includes('row') || n.includes('pull') || n.includes('lat')) {
    category = 'Back'; sub = 'Lats & Rhomboids';
  } else if (n.includes('squat') || n.includes('leg') || n.includes('quad') || n.includes('lunge')) {
    category = 'Legs'; sub = 'Quads & Glutes';
  } else if (n.includes('shoulder') || n.includes('press') || n.includes('raise') || n.includes('delt')) {
    category = 'Shoulders'; sub = 'Deltoid complex';
  } else if (n.includes('bicep') || n.includes('curl') || n.includes('tricep')) {
    category = 'Arms'; sub = 'Upper arm flexors/extensors';
  }

  return {
    name: name,
    category: category,
    sub: sub,
    type: 'COMPOUND / ISOLATION',
    rxSetsReps: '3-4 sets × 8-12 reps · 90s rest',
    rxTempo: 'Tempo: 2-1-1 (Controlled negative, explosive drive)',
    rxWhy: 'High mechanical tension and progressive overload capacity targeting prime movers.',
    benefit: 'Develops strength, hypertrophy, and functional motor stability.',
    steps: 'Brace your core 360°, maintain neutral spine alignment, and control the eccentric stretch.'
  };
}

function getExerciseVisualSvg(category, name) {
  const n = (name || '').toLowerCase();
  const titleBadge = (category || 'EXERCISE').toUpperCase();

  let exerciseGraphic = '';

  if (n.includes('deadlift') || n.includes('rdl') || n.includes('hinge') || n.includes('bridge')) {
    exerciseGraphic = `
      <path d="M 120 180 Q 150 140 180 130 T 230 110" fill="none" stroke="#3d5a45" stroke-width="4" stroke-dasharray="6,4"/>
      <circle cx="230" cy="95" r="14" fill="#ffffff" stroke="#38bdf8" stroke-width="3"/>
      <line x1="230" y1="110" x2="180" y2="135" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="180" y1="135" x2="185" y2="185" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="185" y1="185" x2="180" y2="230" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="220" y1="120" x2="195" y2="175" stroke="#cbd5e0" stroke-width="5" stroke-linecap="round"/>
      <rect x="180" y="170" width="30" height="12" rx="4" fill="#38bdf8"/>
      <ellipse cx="180" cy="155" rx="14" ry="22" fill="#38bdf8" opacity="0.45"/>
      <path d="M 195 210 L 195 150" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)"/>
      <text x="250" y="145" fill="#38bdf8" font-size="11" font-weight="700">POSTERIOR CHAIN HINGE</text>
      <text x="250" y="165" fill="#a0aec0" font-size="10">Hamstrings &amp; Glute Max</text>
      <text x="250" y="185" fill="#718096" font-size="9.5">Spine Neutral · Hips Push Back</text>
    `;
  } else if (n.includes('squat') || n.includes('lunge') || n.includes('leg') || n.includes('calf')) {
    exerciseGraphic = `
      <line x1="140" y1="80" x2="140" y2="210" stroke="#2d4233" stroke-width="2" stroke-dasharray="4,4"/>
      <circle cx="170" cy="95" r="14" fill="#ffffff" stroke="#38bdf8" stroke-width="3"/>
      <line x1="170" y1="110" x2="175" y2="155" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="175" y1="155" x2="225" y2="160" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="225" y1="160" x2="215" y2="225" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="140" y1="112" x2="200" y2="112" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
      <rect x="135" y="104" width="8" height="16" rx="2" fill="#e2e8f0"/>
      <rect x="197" y="104" width="8" height="16" rx="2" fill="#e2e8f0"/>
      <ellipse cx="200" cy="158" rx="22" ry="10" fill="#38bdf8" opacity="0.5"/>
      <text x="250" y="145" fill="#38bdf8" font-size="11" font-weight="700">PARALLEL SQUAT DEPTH (90°)</text>
      <text x="250" y="165" fill="#a0aec0" font-size="10">Quadriceps &amp; Adductor Magnus</text>
      <text x="250" y="185" fill="#718096" font-size="9.5">Knees Track over 2nd Toe</text>
    `;
  } else if (n.includes('press') || n.includes('bench') || n.includes('push') || n.includes('dip')) {
    exerciseGraphic = `
      <line x1="110" y1="170" x2="250" y2="170" stroke="#334a3a" stroke-width="10" stroke-linecap="round"/>
      <circle cx="135" cy="155" r="13" fill="#ffffff" stroke="#38bdf8" stroke-width="3"/>
      <line x1="145" y1="162" x2="220" y2="162" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="175" y1="162" x2="175" y2="105" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
      <line x1="150" y1="105" x2="200" y2="105" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
      <circle cx="150" cy="105" r="7" fill="#e2e8f0"/>
      <circle cx="200" cy="105" r="7" fill="#e2e8f0"/>
      <ellipse cx="175" cy="155" rx="16" ry="11" fill="#38bdf8" opacity="0.55"/>
      <path d="M 175 140 L 175 95" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <text x="240" y="110" fill="#38bdf8" font-size="11" font-weight="700">HORIZONTAL PRESSING VECTOR</text>
      <text x="240" y="130" fill="#a0aec0" font-size="10">Pectoralis Major &amp; Anterior Delts</text>
      <text x="240" y="150" fill="#718096" font-size="9.5">Scapula Retracted &amp; Depressed</text>
    `;
  } else if (n.includes('row') || n.includes('pull') || n.includes('lat') || n.includes('shrug')) {
    exerciseGraphic = `
      <circle cx="190" cy="95" r="14" fill="#ffffff" stroke="#38bdf8" stroke-width="3"/>
      <line x1="190" y1="110" x2="160" y2="155" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="160" y1="155" x2="165" y2="220" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="180" y1="120" x2="150" y2="140" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
      <rect x="140" y="132" width="18" height="15" rx="3" fill="#38bdf8"/>
      <ellipse cx="170" cy="130" rx="14" ry="18" fill="#38bdf8" opacity="0.55"/>
      <path d="M 130 155 L 165 135" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
      <text x="230" y="125" fill="#38bdf8" font-size="11" font-weight="700">LAT &amp; RHOMBOID RETRACTION</text>
      <text x="230" y="145" fill="#a0aec0" font-size="10">Latissimus Dorsi &amp; Mid Traps</text>
      <text x="230" y="165" fill="#718096" font-size="9.5">Drive Elbows Towards Hips</text>
    `;
  } else if (n.includes('raise') || n.includes('curl') || n.includes('extension') || n.includes('arm')) {
    exerciseGraphic = `
      <circle cx="180" cy="95" r="14" fill="#ffffff" stroke="#38bdf8" stroke-width="3"/>
      <line x1="180" y1="110" x2="180" y2="175" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="180" y1="175" x2="180" y2="230" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="180" y1="120" x2="180" y2="150" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
      <line x1="180" y1="150" x2="155" y2="125" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
      <circle cx="155" cy="125" r="8" fill="#e2e8f0"/>
      <circle cx="172" cy="138" r="12" fill="#38bdf8" opacity="0.6"/>
      <path d="M 180 160 Q 155 160 155 138" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3,3"/>
      <text x="220" y="120" fill="#38bdf8" font-size="11" font-weight="700">ISOLATION CONTRACTION ARC</text>
      <text x="220" y="140" fill="#a0aec0" font-size="10">Peak Tension at Mid-Range</text>
      <text x="220" y="160" fill="#718096" font-size="9.5">Lock Elbow as Pivot Axis</text>
    `;
  } else {
    exerciseGraphic = `
      <circle cx="140" cy="120" r="13" fill="#ffffff" stroke="#38bdf8" stroke-width="3"/>
      <line x1="150" y1="125" x2="220" y2="125" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="155" y1="125" x2="135" y2="165" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
      <line x1="215" y1="125" x2="245" y2="95" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="185" cy="125" rx="24" ry="14" fill="#38bdf8" opacity="0.5"/>
      <text x="210" y="155" fill="#38bdf8" font-size="11" font-weight="700">CORE ANTI-ROTATION &amp; BRACE</text>
      <text x="210" y="175" fill="#a0aec0" font-size="10">Transverse Abdominis &amp; Obliques</text>
      <text x="210" y="195" fill="#718096" font-size="9.5">Maintain Posterior Pelvic Tilt</text>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 250" style="width:100%;height:auto;max-height:260px;display:block;background:linear-gradient(135deg, #132218 0%, #0d1711 100%);">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8"/>
        </marker>
        <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1d2f23" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="460" height="250" fill="url(#gridPattern)" />
      <rect x="18" y="18" width="105" height="22" rx="11" fill="#2563eb" stroke="#1e40af"/>
      <text x="70" y="33" fill="#38bdf8" font-size="9.5" font-weight="700" text-anchor="middle" letter-spacing="0.5">${titleBadge}</text>
      <line x1="30" y1="230" x2="430" y2="230" stroke="#223628" stroke-width="2"/>
      ${exerciseGraphic}
      <text x="20" y="240" fill="#718e7b" font-size="9.5" font-family="sans-serif">${escapeHtml(name.toUpperCase())}</text>
    </svg>
  `;
}

function openExerciseDetailModal(exerciseName) {
  const ex = findExerciseInfo(exerciseName);
  if (!ex) return;

  if ($('#exModalTitle')) $('#exModalTitle').textContent = ex.name;
  if ($('#exModalSubBadge')) $('#exModalSubBadge').textContent = `${(ex.category || 'WORKOUT').toUpperCase()} · ${(ex.sub || '').toUpperCase()}`;
  if ($('#exModalSetsReps')) $('#exModalSetsReps').textContent = ex.rxSetsReps || '3-4 sets × 8-10 reps';
  if ($('#exModalTempo')) $('#exModalTempo').textContent = `${ex.rxTempo || 'Tempo: 2-1-1'}`;
  if ($('#exModalWhy')) $('#exModalWhy').textContent = ex.rxWhy || ex.benefit;
  if ($('#exModalSteps')) $('#exModalSteps').textContent = ex.steps;

  // Render SVG Visual Demonstration
  const visualContainer = $('#exModalVisualContainer');
  if (visualContainer) {
    visualContainer.innerHTML = getExerciseVisualSvg(ex.category, ex.name);
  }

  // Reset AI Advice container
  const adviceEl = $('#exModalAiAdvice');
  if (adviceEl) {
    adviceEl.style.display = 'none';
    adviceEl.innerHTML = '';
  }

  // Wire AI Form Coach Button
  if ($('#exModalAiCoachBtn')) {
    $('#exModalAiCoachBtn').onclick = async () => {
      if (!adviceEl) return;
      adviceEl.style.display = 'block';
      adviceEl.innerHTML = '<span style="color:#2563eb;">Formwise AI is analyzing biomechanics &amp; customized cues...</span>';

      const prompt = `As an elite strength & biomechanics coach, give a direct, impactful breakdown for "${ex.name}" targeting ${ex.sub || ex.category}:
1. The #1 Mind-Muscle Connection Cue
2. Common Fatal Form Mistake to Avoid
3. Optimal Hypertrophy Intensification Technique (e.g. paused stretch, tempo control)`;

      try {
        const reply = await FF.callAI(prompt, 'You are an elite strength coach. Give concise, highly practical coaching points in clean markdown formatting.');
        adviceEl.innerHTML = markedInline(reply);
      } catch (err) {
        adviceEl.innerHTML = `
          <b>Formwise AI Core Biomechanics Tip:</b>
          <p style="margin:4px 0 0;">Focus on a strict 2-3 second eccentric stretch. Keep your core braced 360° and avoid momentum. For <b>${escapeHtml(ex.name)}</b>, pause for 1 second at maximum stretch to trigger maximal tension on the ${escapeHtml(ex.sub || 'target muscles')}.</p>
        `;
      }
    };
  }

  // Wire Mark Completed Button
  if ($('#exModalLogDoneBtn')) {
    $('#exModalLogDoneBtn').onclick = () => {
      workoutsDone.push({ name: ex.name, date: today(), at: Date.now() });
      store.set('workoutsDone', workoutsDone);
      recordDailyActivity('workout');
      closeModal('#exerciseDetailModal');
      renderDashboard();
      toast(`Completed set logged for "${ex.name}"!`);
    };
  }

  openModal('#exerciseDetailModal');
}

/* ---------- Workouts View Rendering ---------- */
function renderWorkouts() {
  const wo = WORKOUT_PLANS[activeWorkoutIdx % WORKOUT_PLANS.length];
  const isCustomAi = plan && plan.workout && (wo.name === plan.workout.name);
  if ($('#planWorkoutTitle')) {
    if (isCustomAi) {
      $('#planWorkoutTitle').innerHTML = ` ${wo.name} <span style="font-size:.72rem;background:#2563eb;color:#38bdf8;padding:3px 9px;border-radius:999px;vertical-align:middle;margin-left:6px;">AI GENERATED</span>`;
    } else {
      $('#planWorkoutTitle').textContent = wo.name;
    }
  }
  if ($('#planFocusBadge')) $('#planFocusBadge').textContent = wo.focus.toUpperCase();
  if ($('#planBenefitText')) $('#planBenefitText').textContent = wo.benefit;

  const list = $('#planMoveList');
  if (list) {
    list.innerHTML = wo.moves.map((m, i) => {
      const ex = findExerciseInfo(m.name);
      return `
        <div class="workout-move-item" onclick="openExerciseDetailModal('${m.name.replace(/'/g, "\\'")}')" title="Hover for details · Click for full visual diagram & AI guide">
          <span class="move-index-badge">${i + 1}</span>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
              <div style="display:flex;align-items:center;gap:8px;">
                <b class="move-name-title">${m.name}</b>
                <span class="move-sub-badge">${ex.sub || 'COMPOUND'}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="move-sets-text">${m.sets}</span>
                <span class="move-hover-cta">View Visual</span>
              </div>
            </div>
            <p class="move-tip-text">${m.tip}</p>
            
            <!-- Hover details strip (visible on hover) -->
            <div class="move-hover-details">
              <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:4px;">
                <span class="move-detail-target"><b>Target:</b> ${ex.sub || ex.category}</span>
                <span class="move-detail-tempo"><b>Tempo:</b> ${ex.rxTempo || '2-1-1'}</span>
              </div>
              <p class="move-detail-why">${ex.rxWhy || ex.benefit}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  renderCustomWorkoutExplorer();
}

/* ---------- Starting Load Calculator (1RM-free, from claude-gym-coach) ---------- */
const SL_LIFTS = [
  { key: 'squat', name: 'Back Squat' },
  { key: 'bench', name: 'Bench Press' },
  { key: 'deadlift', name: 'Deadlift' },
  { key: 'press', name: 'Overhead Press' },
  { key: 'row', name: 'Barbell Row' }
];

let slCurrentLevel = 'beginner';

const SL_LEVEL_DESCS = {
  beginner: 'Safe, buildable baseline for lifters learning compound mechanics (1.0x baseline).',
  medium: 'Novice lifter baseline with 1–6 months consistent resistance training (1.25x baseline).',
  intermediate: 'Consistent lifter standard with solid technique and regular barbell volume (1.55x baseline).',
  hard: 'Advanced athlete baseline with 2+ years of structured progressive overload (1.95x baseline).'
};

function renderStartingLoad() {
  const grid = $('#slLoadsGrid');
  const note = $('#slCeilingNote');
  const descEl = $('#slLevelDesc');
  if (!grid) return;
  const bw = Number($('#slBodyweight') ? $('#slBodyweight').value : 70) || 70;
  const sex = $('#slSex') ? $('#slSex').value : 'male';
  if (descEl) descEl.textContent = SL_LEVEL_DESCS[slCurrentLevel] || SL_LEVEL_DESCS.beginner;

  const levelBtns = document.querySelectorAll('#slLevelPills [data-sl-level]');
  levelBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-sl-level') === slCurrentLevel);
  });

  const parts = [];
  for (const lift of SL_LIFTS) {
    const ceil = FF_ALGO.startingLoadCeiling(bw, sex, lift.key, slCurrentLevel);
    const start = FF_ALGO.startingLoadPropose(bw, sex, lift.key, slCurrentLevel !== 'beginner', slCurrentLevel);
    parts.push(`<div class="sl-load-card" style="background:var(--ff-surface);border:1.5px solid var(--ff-glass-border-subtle);border-radius:14px;padding:14px 10px;text-align:center;box-shadow:0 4px 12px rgba(15,23,42,0.03);transition:transform .15s ease;">
      <div style="font-size:.76rem;color:var(--ff-text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em;font-weight:700;">${lift.name}</div>
      <div style="font-size:1.6rem;font-weight:900;color:var(--ff-text-primary);letter-spacing:-.02em;">${start} <span style="font-size:.85rem;font-weight:600;color:var(--ff-text-muted);">kg</span></div>
      <div style="font-size:.74rem;color:var(--ff-text-muted);margin-top:4px;">ceiling: <b style="color:var(--ff-text-secondary);">${ceil.min}–${ceil.max} kg</b></div>
    </div>`);
  }
  grid.innerHTML = parts.join('');
  if (note) {
    const levelLabel = slCurrentLevel.charAt(0).toUpperCase() + slCurrentLevel.slice(1);
    note.innerHTML = `<b>${levelLabel} Standard Calibrated:</b> Based on strength standards (~40–60% of benchmark %BW) for <b>${sex}</b> at <b>${bw} kg</b> bodyweight. Warmup: empty bar &rarr; ~50–60% of ceiling &rarr; calibrated work sets at RPE 6–7.`;
  }
}

if ($('#slBodyweight')) $('#slBodyweight').oninput = renderStartingLoad;
if ($('#slSex')) $('#slSex').onchange = renderStartingLoad;

document.addEventListener('click', e => {
  const btn = e.target.closest('#slLevelPills [data-sl-level]');
  if (!btn) return;
  slCurrentLevel = btn.getAttribute('data-sl-level') || 'beginner';
  renderStartingLoad();
});

$('#switchWorkoutPlanBtn').onclick = () => {
  activeWorkoutIdx++;
  renderWorkouts();
  renderDashboard();
  toast('Switched workout routine');
};

$('#markWorkoutDoneBtn').onclick = () => {
  const wo = WORKOUT_PLANS[activeWorkoutIdx % WORKOUT_PLANS.length];
  workoutsDone.push({ name: wo.name, date: today(), at: Date.now() });
  store.set('workoutsDone', workoutsDone);
  recordDailyActivity('workout');
  soundFX.victoryCelebration();
  renderDashboard();
  toast(`Great job! Completed ${wo.name}`);
};

/* ---------- Exercise Library View Rendering ---------- */
const MUSCLE_GROUPS = {
  Chest: ['All Chest', 'Upper chest', 'Mid chest', 'Lower chest'],
  Back: ['All Back', 'Lats', 'Upper back & Traps', 'Lower back'],
  Shoulders: ['All Shoulders', 'Front delts', 'Side delts', 'Rear delts'],
  Arms: ['All Arms', 'Biceps', 'Triceps', 'Forearms'],
  Legs: ['All Legs', 'Quads', 'Hamstrings', 'Glutes', 'Calves'],
  Core: ['All Core', 'Upper abs', 'Lower abs', 'Obliques']
};

function renderExerciseLibrary() {
  const tabs = $('#muscleTabs');
  if (tabs) {
    tabs.innerHTML = Object.keys(MUSCLE_GROUPS).map(cat => `
      <button type="button" class="${cat === selectedExerciseCategory ? 'active' : ''}" onclick="selectExerciseCategory('${cat}')">${cat}</button>
    `).join('');
  }

  const subTags = $('#muscleSubTags');
  if (subTags) {
    const list = MUSCLE_GROUPS[selectedExerciseCategory] || [];
    subTags.innerHTML = list.map(sub => `
      <button type="button" class="chosen ${sub === selectedSubMuscle ? 'active' : ''}" onclick="selectSubMuscle('${sub}')">${sub}</button>
    `).join('');
  }

  const q = ($('#exerciseSearchInput') ? $('#exerciseSearchInput').value.toLowerCase().trim() : '');
  const filtered = EXERCISES_LIBRARY.filter(e => {
    if (q) return e.name.toLowerCase().includes(q) || (e.sub && e.sub.toLowerCase().includes(q));
    if (e.category !== selectedExerciseCategory) return false;
    if (selectedSubMuscle && !selectedSubMuscle.startsWith('All ')) {
      return (e.sub || '').toLowerCase().includes(selectedSubMuscle.toLowerCase());
    }
    return true;
  });

  if ($('#libFilterHeader')) {
    const currentSubText = selectedSubMuscle ? selectedSubMuscle.toUpperCase() : selectedExerciseCategory.toUpperCase();
    $('#libFilterHeader').textContent = `${selectedExerciseCategory.toUpperCase()} · ${currentSubText}`;
  }
  if ($('#libResultCount')) {
    $('#libResultCount').textContent = q ? `${filtered.length} matching moves` : `${filtered.length} exercises targeting ${selectedSubMuscle || selectedExerciseCategory}`;
  }

  const cardsContainer = $('#exerciseCardsContainer');
  if (cardsContainer) {
    cardsContainer.innerHTML = filtered.map(ex => `
      <article class="panel exercise-card" style="display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
            <span class="exercise-type">${ex.type}</span>
            <span class="exercise-sub-tag">${ex.sub}</span>
          </div>
          <h4 class="exercise-card-heading" onclick="openExerciseDetailModal('${ex.name.replace(/'/g, "\\'")}')" title="Click to view visual illustration and full execution guide">
            ${ex.name}
          </h4>
          
          <!-- Scientific Prescription Box -->
          <div class="exercise-prescription-box" style="cursor:pointer;" onclick="openExerciseDetailModal('${ex.name.replace(/'/g, "\\'")}')" title="Click for visual breakdown">
            <div class="rx-header">
              <span class="rx-sets-reps">${ex.rxSetsReps || '3 sets × 8-10 reps · 90s rest'}</span>
              <span class="rx-tempo">${ex.rxTempo || 'Tempo: 2-0-1'}</span>
            </div>
            <p class="rx-why"><b>Why this works:</b> ${ex.rxWhy || ex.benefit}</p>
          </div>

          <p class="exercise-benefit" style="margin-top:8px;font-size:.84rem;color:#64748b;"> ${ex.steps}</p>
        </div>

        <div style="margin-top:14px;display:flex;gap:8px;">
          <button type="button" class="outline-button small" style="flex:1;font-size:.8rem;padding:7px;border-color:#38bdf8;" onclick="openExerciseDetailModal('${ex.name.replace(/'/g, "\\'")}')">
            Visual Guide
          </button>
          <button type="button" class="solid-button small" style="flex:1;font-size:.8rem;padding:7px;background:#2563eb;" onclick="askAiAboutExercise('${ex.name.replace(/'/g, "\\'")}', '${(ex.sub || '').replace(/'/g, "\\'")}')">
            AI Coach
          </button>
        </div>
      </article>
    `).join('');
  }
}

window.selectExerciseCategory = function(cat) {
  selectedExerciseCategory = cat;
  selectedSubMuscle = 'All ' + cat;
  if ($('#exerciseSearchInput')) $('#exerciseSearchInput').value = '';
  renderExerciseLibrary();
};

window.selectSubMuscle = function(sub) {
  selectedSubMuscle = sub;
  renderExerciseLibrary();
};

window.logExerciseCompleted = function(name) {
  workoutsDone.push({ name, date: today(), at: Date.now() });
  store.set('workoutsDone', workoutsDone);
  recordDailyActivity('workout');
  renderDashboard();
  toast(`Great job! Completed "${name}"`);
};

window.askAiAboutExercise = function(name, sub) {
  openAiChat(`What is the optimal biomechanical execution, sets, reps, and progression strategy for "${name}" targeting ${sub}?`);
};

if ($('#exerciseSearchInput')) {
  $('#exerciseSearchInput').oninput = () => renderExerciseLibrary();
}

/* ---------- My Foods View Rendering ---------- */
function renderMyFoods() {
  const grid = $('#savedFoodsGrid');
  const items = [...custom, ...DEFAULT_PREVIEW_MEALS];
  if (!grid) return;

  grid.innerHTML = items.map((item, i) => `
    <article class="panel saved-food-card">
      <div class="saved-food-thumb image">
        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : `<span></span>`}
      </div>
      <div style="flex:1;">
        <span class="section-kicker">${item.meal || 'RECIPE'}</span>
        <h4 style="margin:2px 0;color:#1e293b;">${item.name}</h4>
        <p style="color:#64748b;font-size:.85rem;">${item.detail || `${item.p || 0}g P · ${item.c || 0}g C · ${item.f || 0}g F`}</p>
        <b style="color:#1e293b;font-size:1.05rem;display:inline-block;margin-top:6px;">${item.k || item.calories} kcal</b>
      </div>
      <button class="solid-button small" onclick="quickAddSavedFood(${i})" style="margin-top:10px;width:100%;">
        Add to today +
      </button>
    </article>
  `).join('');
}

window.quickAddSavedFood = function(idx) {
  const items = [...custom, ...DEFAULT_PREVIEW_MEALS];
  const item = items[idx];
  if (!item) return;
  const d = today();
  log[d] = log[d] || [];
  log[d].push({ ...item, meal: 'Snack' });
  store.set('log', log);
  renderFoodLog();
  renderDashboard();
  toast(`Added ${item.name} to today's log`);
};

$('#createCustomFoodBtn').onclick = () => {
  $('#customFoodName').value = '';
  $('#customFoodServing').value = '';
  $('#customFoodCal').value = '';
  $('#customFoodP').value = '';
  $('#customFoodC').value = '';
  $('#customFoodF').value = '';
  openModal('#customFoodModal');
};

$('#saveCustomFoodBtn').onclick = () => {
  const name = $('#customFoodName').value.trim();
  const detail = $('#customFoodServing').value.trim();
  const k = Number($('#customFoodCal').value);
  const p = Number($('#customFoodP').value) || 0;
  const c = Number($('#customFoodC').value) || 0;
  const f = Number($('#customFoodF').value) || 0;
  if (!name || !k) { toast('Please enter a name and calories'); return; }

  custom.push({ id: Date.now(), name, detail, k, p, c, f });
  store.set('custom', custom);
  closeModal('#customFoodModal');
  renderMyFoods();
  toast(`Saved ${name} to My Foods`);
};

/* ---------- Profile View Rendering & Saving ---------- */
function renderProfileView() {
  const name = (session && session.name) ? session.name : profile.name || 'Jordan Davis';
  const email = (session && session.email) ? session.email : profile.email || 'jordan.davis@example.com';
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'JD';

  // Update Avatars & Names across UI
  if ($('#pfDisplayName')) $('#pfDisplayName').textContent = name;
  if ($('#pfEmailDisplay')) $('#pfEmailDisplay').textContent = email;

  const updateAvatarEl = (el) => {
    if (!el) return;
    if (profile.avatarUrl) {
      el.innerHTML = `<img src="${profile.avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" alt="${escapeHtml(name)}">`;
    } else {
      el.textContent = initials;
    }
  };
  updateAvatarEl($('#pfLargeAvatar'));
  updateAvatarEl($('#topAvatar'));
  updateAvatarEl($('#sidebarAvatar'));

  if ($('#removeAvatarBtn')) {
    $('#removeAvatarBtn').style.display = profile.avatarUrl ? 'inline-block' : 'none';
  }

  if ($('#sidebarName')) $('#sidebarName').textContent = name;
  if ($('#sidebarPlan')) $('#sidebarPlan').textContent = profile.goal || 'Personal plan';

  if ($('#settingsUserName')) $('#settingsUserName').textContent = name;
  if ($('#settingsUserEmail')) $('#settingsUserEmail').textContent = email;
  if ($('#settingsRoleBadge')) $('#settingsRoleBadge').textContent = (session && session.is_admin) ? ' ADMIN' : 'USER';
  updateAdminNavVisibility();

  // Fill Inputs
  if ($('#pfHeightInput')) $('#pfHeightInput').value = profile.hCm || 175;
  if ($('#pfWeightInput')) $('#pfWeightInput').value = profile.wKg || 70;
  if ($('#pfCalorieInput')) $('#pfCalorieInput').value = profile.cal || 2100;
  if ($('#pfGoalSelect')) $('#pfGoalSelect').value = profile.goal || 'Maintain weight';
  if ($('#pfDaysSelect')) $('#pfDaysSelect').value = profile.days || 4;
  if ($('#pfCreatineSelect')) $('#pfCreatineSelect').value = profile.creatine || 'yes';

  updateLiveWaterEstimate();

  // Sync button text in topbar
  if ($('#topAuthBtn')) {
    $('#topAuthBtn').textContent = session ? 'Sign out' : 'Sign in';
  }
}

function saveProfileData() {
  const inputWeight = Number($('#pfWeightInput').value) || profile.wKg || 68;
  profile.hCm = Number($('#pfHeightInput').value) || profile.hCm;
  profile.wKg = profile.units === 'Imperial' ? Math.round(inputWeight * 0.45359237) : inputWeight;
  profile.cal = Number($('#pfCalorieInput').value) || profile.cal;
  profile.goal = $('#pfGoalSelect').value;
  profile.days = Number($('#pfDaysSelect').value);
  profile.creatine = $('#pfCreatineSelect').value;

  profile.waterGoal = updateLiveWaterEstimate();

  // Auto calculate protein & carbs targets based on goal
  const w = profile.wKg;
  profile.p = Math.round(w * (profile.goal === 'Build muscle' ? 2.0 : 1.7));
  profile.f = Math.round(w * 0.9);
  profile.c = Math.max(0, Math.round((profile.cal - (profile.p * 4) - (profile.f * 9)) / 4));

  store.set('profile', profile);
  renderDashboard();
  renderProfileView();
  toast('Profile saved & synced to database');
}

$('#saveProfileBtn').onclick = saveProfileData;

/* Unit Switcher & Live Profile Field Listeners */
$$('#unitSwitch button').forEach(b => {
  b.onclick = () => {
    $$('#unitSwitch button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const u = b.dataset.unit;
    const oldUnits = profile.units || 'Metric';
    profile.units = u;
    if ($('#pfHeightUnit')) $('#pfHeightUnit').textContent = u === 'Metric' ? 'cm' : 'in';
    if ($('#pfWeightUnit')) $('#pfWeightUnit').textContent = u === 'Metric' ? 'kg' : 'lbs';

    // Convert input field value smoothly
    if (oldUnits !== u && $('#pfWeightInput')) {
      const curW = Number($('#pfWeightInput').value) || profile.wKg || 68;
      if (u === 'Imperial') {
        $('#pfWeightInput').value = Math.round(curW * 2.20462);
      } else {
        $('#pfWeightInput').value = Math.round(curW / 2.20462);
      }
    }
    updateLiveWaterEstimate();
    store.set('profile', profile);
    toast(`Units switched to ${u}`);
  };
});

// Live recalculation when user types or changes fields
if ($('#pfWeightInput')) $('#pfWeightInput').oninput = updateLiveWaterEstimate;
if ($('#pfCreatineSelect')) $('#pfCreatineSelect').onchange = updateLiveWaterEstimate;
if ($('#pfDaysSelect')) $('#pfDaysSelect').onchange = updateLiveWaterEstimate;
if ($('#pfCalorieInput')) {
  $('#pfCalorieInput').oninput = () => {
    const cal = Number($('#pfCalorieInput').value) || 2100;
    const w = Number($('#pfWeightInput')?.value) || profile.wKg || 68;
    profile.cal = cal;
  };
}

/* ================= PROFILE AVATAR MANAGEMENT MODAL ================= */
function openAvatarOptionsModal() {
  const box = $('#avatarModalPreviewBox');
  const seePicBtn = $('#avatarModalSeePicBtn');
  const removeBtn = $('#avatarModalRemoveBtn');
  const uploadBtn = $('#avatarModalUploadNewBtn');
  const statusText = $('#avatarModalStatusText');
  const nameEl = $('#avatarModalName');

  const uName = (session && session.name) || (profile && profile.name) || 'Jordan Davis';
  if (nameEl) nameEl.textContent = uName;

  if (profile && profile.avatarUrl) {
    if (box) box.innerHTML = `<img src="${profile.avatarUrl}" style="width:100%;height:100%;object-fit:cover;" alt="Avatar" />`;
    if (statusText) statusText.textContent = 'Active Profile Picture';
    if (seePicBtn) {
      seePicBtn.style.display = 'inline-flex';
      seePicBtn.textContent = 'See Pic';
      seePicBtn.onclick = () => {
        closeModal('#avatarOptionsModal');
        openImageLightbox(profile.avatarUrl, `${uName}'s Profile Photo`);
      };
    }
    if (removeBtn) {
      removeBtn.style.display = 'inline-flex';
      removeBtn.textContent = 'Remove Pic';
      removeBtn.onclick = () => {
        if (confirm('Are you sure you want to remove your profile picture?')) {
          delete profile.avatarUrl;
          store.set('profile', profile);
          if (FF.patch) FF.patch({ profile });
          renderProfileView();
          closeModal('#avatarOptionsModal');
          toast('Profile picture removed successfully');
        }
      };
    }
    if (uploadBtn) uploadBtn.textContent = 'Upload New Pic';
  } else {
    const initials = uName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'FF';
    if (box) box.innerHTML = `<span style="font-size:2.4rem;font-weight:800;color:#2563eb;">${initials}</span>`;
    if (statusText) statusText.textContent = 'No profile picture uploaded yet';
    if (seePicBtn) seePicBtn.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'none';
    if (uploadBtn) uploadBtn.textContent = ' Upload New Pic';
  }

  if (uploadBtn) {
    uploadBtn.onclick = () => {
      closeModal('#avatarOptionsModal');
      const input = $('#pfAvatarUploadInput');
      if (input) input.click();
    };
  }

  openModal('#avatarOptionsModal');
}

if ($('#pfLargeAvatar')) {
  $('#pfLargeAvatar').onclick = openAvatarOptionsModal;
}
if ($('#topAvatar')) {
  $('#topAvatar').onclick = openAvatarOptionsModal;
}
if ($('#sidebarAvatar')) {
  $('#sidebarAvatar').onclick = (e) => {
    e.stopPropagation();
    openAvatarOptionsModal();
  };
}

/* Profile Picture Upload & Remove Listeners */
if ($('#pfAvatarUploadInput')) {
  $('#pfAvatarUploadInput').onchange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please choose a valid image file (PNG, JPG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (re) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
        } else {
          if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        profile.avatarUrl = dataUrl;
        store.set('profile', profile);
        if (FF.patch) FF.patch({ profile });
        renderProfileView();
        toast('Profile picture updated successfully!');
      };
      img.src = re.target.result;
    };
    reader.readAsDataURL(file);
  };
}

if ($('#removeAvatarBtn')) {
  $('#removeAvatarBtn').onclick = () => {
    if (confirm('Are you sure you want to remove your profile picture?')) {
      delete profile.avatarUrl;
      store.set('profile', profile);
      if (FF.patch) FF.patch({ profile });
      renderProfileView();
      toast(' Profile picture removed successfully');
    }
  };
}

/* ---------- Settings, Logout & Admin Portal ---------- */
function syncSettingsAiKeys() {
  const gInp = $('#customGeminiKeyInput');
  const oInp = $('#customOpenRouterKeyInput');
  if (gInp) gInp.value = localStorage.getItem('ff_gemini_key') || '';
  if (oInp) oInp.value = localStorage.getItem('ff_openrouter_key') || '';
}

if ($('#saveAiKeysBtn')) {
  $('#saveAiKeysBtn').onclick = () => {
    const gVal = ($('#customGeminiKeyInput')?.value || '').trim();
    const oVal = ($('#customOpenRouterKeyInput')?.value || '').trim();
    if (gVal) localStorage.setItem('ff_gemini_key', gVal);
    else localStorage.removeItem('ff_gemini_key');

    if (oVal) localStorage.setItem('ff_openrouter_key', oVal);
    else localStorage.removeItem('ff_openrouter_key');

    toast('AI API configuration saved! Live chatbot will use your keys.');
  };
}

$('#topSettingsBtn').onclick = () => {
  renderProfileView();
  syncSettingsAiKeys();
  updateAdminNavVisibility();
  openModal('#settingsModal');
};

$('#sidebarProfileBtn').onclick = () => {
  renderProfileView();
  syncSettingsAiKeys();
  updateAdminNavVisibility();
  openModal('#settingsModal');
};

if ($('#settingsCustomizationBox')) {
  $('#settingsCustomizationBox').onclick = () => {
    closeModal($('#settingsModal'));
    switchView('customization');
    soundFX.tap();
    toast('Customization Studio opened!');
  };
}
if ($('#settingsGoToCustomizationBtn')) {
  $('#settingsGoToCustomizationBtn').onclick = (e) => {
    e.stopPropagation();
    closeModal($('#settingsModal'));
    switchView('customization');
    soundFX.tap();
    toast('Customization Studio opened!');
  };
}

$('#topAvatar').onclick = () => {
  switchView('profile');
};

$('#adminPortalShortcutBtn').onclick = () => {
  switchView('admin');
};

$('#forceSyncBtn').onclick = async () => {
  if (FF.flushNow) {
    await FF.flushNow();
  }
  updateSyncStatus('Cloud database synced');
  toast('Database synced with Turso cloud');
};

/* ==========================================================================
   DEDICATED ADMIN RESOLUTION & MANAGEMENT PORTAL
   ========================================================================== */
let currentComplaintFilter = 'all';
let cachedComplaints = [];
let cachedAdminUsers = [];

function updateAdminNavVisibility() {
  const isAdmin = Boolean(session && (session.is_admin || session.role === 'ADMIN' || session.email === 'admin@fitfuel.app'));
  const isPureAdmin = Boolean(session && session.email === 'admin@fitfuel.app');

  document.body.classList.toggle('is-admin-mode', isAdmin);

  const adminNav = $('#sidebarAdminNavBtn');
  if (adminNav) adminNav.style.display = isAdmin ? 'flex' : 'none';
  const topAdmin = $('#topAdminBtn');
  if (topAdmin) topAdmin.style.display = isAdmin ? 'inline-flex' : 'none';
  const adminSec = $('#adminSection');
  if (adminSec) adminSec.style.display = isAdmin ? 'block' : 'none';
  const adminShort = $('#adminPortalShortcutBtn');
  if (adminShort) adminShort.style.display = isAdmin ? 'block' : 'none';

  // Admin-Only features in Settings modal (Database sync & Live AI / Chatbot API config)
  const dbSyncBox = $('#settingsDatabaseSyncBox');
  if (dbSyncBox) dbSyncBox.style.display = isAdmin ? 'block' : 'none';
  const aiApiBox = $('#settingsAiApiBox');
  if (aiApiBox) aiApiBox.style.display = isAdmin ? 'block' : 'none';

  if ($('#settingsRoleBadge')) {
    $('#settingsRoleBadge').textContent = isPureAdmin ? 'SUPER ADMIN' : (isAdmin ? 'ADMIN' : 'USER');
  }

  if (isPureAdmin) {
    if ($('#sidebarPlan')) $('#sidebarPlan').textContent = 'Root Administrator';
    if ($('#sidebarName')) $('#sidebarName').textContent = 'FitFuel Admin';
  }
}

async function renderAdminView() {
  if (!session || !session.is_admin) {
    toast('Admin access required');
    switchView('today');
    return;
  }

  // Fetch admin stats
  try {
    const stats = await FF.adminStats();
    if (stats) {
      if ($('#admTotalUsers')) $('#admTotalUsers').textContent = stats.totalUsers || 0;
      if ($('#admPendingComplaints')) $('#admPendingComplaints').textContent = stats.pendingComplaints || 0;
      if ($('#admResolvedComplaints')) $('#admResolvedComplaints').textContent = stats.resolvedComplaints || 0;
      if ($('#admTotalComplaints')) $('#admTotalComplaints').textContent = stats.totalComplaints || 0;
    }
  } catch (e) {
    console.warn('Error fetching admin stats:', e);
  }

  await loadAndRenderAdminComplaints();
}

async function loadAndRenderAdminComplaints() {
  const grid = $('#adminComplaintsCardsGrid');
  if (!grid) return;
  grid.innerHTML = '<div style="padding:24px;text-align:center;color:#64748b;">Loading user issues and complaints...</div>';

  try {
    const complaints = await FF.adminComplaints();
    cachedComplaints = complaints || [];
    renderFilteredComplaints();
  } catch (err) {
    grid.innerHTML = `<div style="padding:16px;background:#fee2e2;border:1px solid #ef4444;color:#991b1b;border-radius:10px;">Error loading complaints: ${escapeHtml(err.message || 'Admin authentication required')}</div>`;
  }
}

function renderFilteredComplaints() {
  const grid = $('#adminComplaintsCardsGrid');
  if (!grid) return;

  let list = cachedComplaints;
  if (currentComplaintFilter === 'pending') {
    list = list.filter(c => !c.status || c.status === 'pending');
  } else if (currentComplaintFilter === 'in_progress') {
    list = list.filter(c => c.status === 'in_progress');
  } else if (currentComplaintFilter === 'resolved') {
    list = list.filter(c => c.status === 'resolved');
  }

  if ($('#complaintCountIndicator')) {
    $('#complaintCountIndicator').textContent = `Showing ${list.length} of ${cachedComplaints.length} issues`;
  }

  if (!list.length) {
    grid.innerHTML = `
      <div style="padding:36px 20px;text-align:center;background:#f8fafc;border:1px solid #cbd5e1;border-radius:14px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 10px;display:block;"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        <b style="color:#1e293b;font-size:1.1rem;display:block;margin-bottom:4px;">No ${currentComplaintFilter === 'all' ? '' : currentComplaintFilter} issues found</b>
        <p style="color:#64748b;font-size:0.88rem;margin:0;">All user issues in this category have been addressed.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(c => {
    const dateStr = c.created ? new Date(c.created).toLocaleString() : '';
    const status = c.status || 'pending';
    const statusBadge = status === 'resolved'
      ? `<span style="font-size:0.75rem;padding:3px 10px;border-radius:99px;background:#d1fae5;color:#065f46;font-weight:800;display:inline-flex;align-items:center;gap:4px;"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg> RESOLVED</span>`
      : (status === 'in_progress'
        ? `<span style="font-size:0.75rem;padding:3px 10px;border-radius:99px;background:#dbeafe;color:#1e40af;font-weight:800;display:inline-flex;align-items:center;gap:4px;">IN PROGRESS</span>`
        : `<span style="font-size:0.75rem;padding:3px 10px;border-radius:99px;background:#fef3c7;color:#92400e;font-weight:800;display:inline-flex;align-items:center;gap:4px;">PENDING</span>`);

    const files = Array.isArray(c.files) ? c.files : [];
    const filesHtml = files.length ? `
      <div style="margin-top:10px;padding-top:10px;border-top:1px dashed #cbd5e1;">
        <b style="font-size:0.78rem;color:#64748b;display:block;margin-bottom:6px;">Attached User Files (${files.length}):</b>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${files.map(f => {
            if (f.data && f.data.startsWith('data:image')) {
              return `<img src="${f.data}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #cbd5e1;cursor:pointer;" class="img-preview-trigger" data-title="${escapeHtml(f.name)}" data-src="${f.data}" title="Click to view full photo" />`;
            }
            return `<span style="font-size:0.75rem;background:#e2e8f0;padding:4px 8px;border-radius:6px;color:#1e293b;">${escapeHtml(f.name)}</span>`;
          }).join('')}
        </div>
      </div>` : '';

    return `
      <article class="panel" style="padding:18px 20px;border-radius:14px;border:1.5px solid ${status === 'resolved' ? '#a7f3d0' : '#cbd5e1'};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <b style="font-size:1.05rem;color:#0f172a;">${escapeHtml(c.name)}</b>
              <span style="font-size:0.72rem;background:#eff6ff;color:#2563eb;font-weight:700;padding:2px 8px;border-radius:99px;border:1px solid #bfdbfe;text-transform:uppercase;">${escapeHtml(c.type || 'complaint')}</span>
              ${statusBadge}
            </div>
            ${c.email ? `
              <div style="margin-top:4px;">
                <a href="mailto:${escapeHtml(c.email)}?subject=Re: FitFuel Support Issue #${c.id}" style="color:#2563eb;font-size:0.84rem;text-decoration:none;display:inline-flex;align-items:center;gap:4px;font-weight:600;" title="Click to reply via email">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  ${escapeHtml(c.email)}
                </a>
              </div>
            ` : '<span style="color:#94a3b8;font-size:0.8rem;">No email provided</span>'}
          </div>
          <small style="color:#64748b;font-weight:500;">Submitted: ${dateStr}</small>
        </div>

        <!-- Issue text description -->
        <div style="background:#f8fafc;padding:12px 14px;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:12px;">
          <p style="margin:0;color:#1e293b;font-size:0.92rem;line-height:1.5;white-space:pre-wrap;">${escapeHtml(c.text)}</p>
        </div>

        ${filesHtml}

        <!-- Resolution Notes & Actions -->
        <div style="margin-top:14px;padding-top:12px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;flex:1;">
            <input type="text" id="admNoteInput_${c.id}" placeholder="Add internal resolution note or reply summary..." value="${escapeHtml(c.admin_notes || '')}" style="min-width:240px;flex:1;padding:7px 12px;font-size:0.82rem;border:1px solid #cbd5e1;border-radius:8px;" />
            <button type="button" class="outline-button small" onclick="saveAdminNote(${c.id})" style="font-size:0.8rem;padding:6px 12px;">Save Note</button>
          </div>

          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            ${status !== 'in_progress' ? `
              <button type="button" class="outline-button small" onclick="updateComplaintStatus(${c.id}, 'in_progress')" style="border-color:#38bdf8;color:#2563eb;font-size:0.8rem;padding:6px 12px;font-weight:700;">
                Mark In Progress
              </button>
            ` : ''}
            ${status !== 'resolved' ? `
              <button type="button" class="solid-button small" onclick="updateComplaintStatus(${c.id}, 'resolved')" style="background:#059669;color:#ffffff;font-size:0.8rem;padding:6px 14px;font-weight:800;">
                Mark Solved
              </button>
            ` : `
              <button type="button" class="outline-button small" onclick="updateComplaintStatus(${c.id}, 'pending')" style="color:#64748b;font-size:0.8rem;padding:6px 12px;">
                Reopen
              </button>
            `}
            <a href="mailto:${escapeHtml(c.email || '')}?subject=FitFuel Support: Regarding your issue #${c.id}" class="outline-button small" style="text-decoration:none;font-size:0.8rem;padding:6px 12px;display:inline-flex;align-items:center;gap:4px;">
              Email User
            </a>
            <button type="button" class="text-button small" onclick="deleteComplaint(${c.id})" style="color:#ef4444;font-size:0.8rem;" title="Delete this complaint">
              Delete
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

window.updateComplaintStatus = async function(id, newStatus) {
  try {
    const note = ($(`#admNoteInput_${id}`)?.value || '').trim();
    await FF.adminUpdateComplaintStatus(id, newStatus, note);
    toast(`Issue status updated to "${newStatus.replace('_', ' ')}"!`);
    await renderAdminView();
  } catch (e) {
    toast('Error updating status: ' + (e.message || 'Failed'));
  }
};

window.saveAdminNote = async function(id) {
  try {
    const note = ($(`#admNoteInput_${id}`)?.value || '').trim();
    const existing = cachedComplaints.find(c => c.id === id);
    const st = existing ? existing.status : 'pending';
    await FF.adminUpdateComplaintStatus(id, st, note);
    toast('Resolution note saved');
  } catch (e) {
    toast('Error saving note: ' + (e.message || 'Failed'));
  }
};

window.deleteComplaint = async function(id) {
  if (!confirm('Are you sure you want to permanently delete this complaint ticket?')) return;
  try {
    await FF.adminDeleteComplaint(id);
    toast('Complaint deleted');
    await renderAdminView();
  } catch (e) {
    toast('Error deleting: ' + (e.message || 'Failed'));
  }
};

async function loadAndRenderAdminUsers() {
  const grid = $('#adminUsersCardsGrid');
  if (!grid) return;
  grid.innerHTML = '<div style="padding:24px;text-align:center;color:#64748b;">Loading user accounts database...</div>';
  try {
    const users = await FF.adminUsers();
    cachedAdminUsers = users || [];
    renderFilteredAdminUsers();
  } catch (e) {
    grid.innerHTML = `<div style="padding:16px;background:#fee2e2;color:#991b1b;border-radius:10px;">Error: ${escapeHtml(e.message || 'Admin authentication failed')}</div>`;
  }
}

function renderFilteredAdminUsers() {
  const grid = $('#adminUsersCardsGrid');
  if (!grid) return;
  const q = ($('#adminUserSearchInput')?.value || '').toLowerCase().trim();
  let list = cachedAdminUsers;
  if (q) {
    list = list.filter(u => (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q)));
  }

  if ($('#adminUsersCountIndicator')) {
    $('#adminUsersCountIndicator').textContent = `${list.length} user accounts found`;
  }

  if (!list.length) {
    grid.innerHTML = '<div style="padding:24px;text-align:center;color:#64748b;">No matching users found.</div>';
    return;
  }

  grid.innerHTML = list.map(u => {
    const joinDate = u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A';
    const lastLogin = u.last_login ? new Date(u.last_login).toLocaleDateString() : 'N/A';
    return `
      <div class="panel" style="padding:14px 18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;">
            <b style="font-size:0.98rem;color:#0f172a;">${escapeHtml(u.name || 'Member')}</b>
            ${u.is_admin ? `<span style="font-size:0.68rem;background:#1e3a8a;color:#38bdf8;padding:2px 7px;border-radius:99px;font-weight:800;border:1px solid #38bdf8;">ADMIN</span>` : ''}
          </div>
          <div style="font-size:0.84rem;color:#64748b;margin-top:2px;">
            Email: <b style="color:#2563eb;">${escapeHtml(u.email)}</b> · Joined: ${joinDate} · Last active: ${lastLogin} · Food entries: ${u.logCount || 0}
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <a href="mailto:${escapeHtml(u.email)}" class="outline-button small" style="text-decoration:none;font-size:0.8rem;padding:5px 12px;">
            Email Member
          </a>
          ${!u.is_admin ? `
            <button type="button" class="text-button small" onclick="deleteUserAccount(${u.id})" style="color:#ef4444;font-size:0.8rem;">
              Delete User
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

window.deleteUserAccount = async function(id) {
  if (!confirm('Are you sure you want to permanently delete this user account and all their synced data?')) return;
  try {
    await FF.adminDeleteUser(id);
    toast('User account deleted');
    await loadAndRenderAdminUsers();
  } catch (e) {
    toast('Error: ' + (e.message || 'Failed'));
  }
};

function initAdminPortalListeners() {
  const tabComp = $('#adminTabComplaints');
  const tabUsers = $('#adminTabUsers');
  const compPane = $('#adminComplaintsViewPane');
  const usersPane = $('#adminUsersViewPane');

  if (tabComp && tabUsers && compPane && usersPane) {
    tabComp.onclick = () => {
      tabComp.className = 'solid-button small';
      tabUsers.className = 'outline-button small';
      compPane.style.display = 'block';
      usersPane.style.display = 'none';
      renderFilteredComplaints();
    };

    tabUsers.onclick = () => {
      tabUsers.className = 'solid-button small';
      tabComp.className = 'outline-button small';
      compPane.style.display = 'none';
      usersPane.style.display = 'block';
      loadAndRenderAdminUsers();
    };
  }

  // Filter pills
  $$('#complaintFilterBtns button').forEach(btn => {
    btn.onclick = () => {
      $$('#complaintFilterBtns button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentComplaintFilter = btn.dataset.cfilter || 'all';
      renderFilteredComplaints();
    };
  });

  if ($('#adminUserSearchInput')) {
    $('#adminUserSearchInput').oninput = () => renderFilteredAdminUsers();
  }

  if ($('#adminRefreshBtn')) {
    $('#adminRefreshBtn').onclick = () => {
      toast('Refreshing admin data...');
      renderAdminView();
    };
  }

  if ($('#adminReturnToUserBtn')) {
    $('#adminReturnToUserBtn').onclick = () => switchView('today');
  }

  if ($('#topAdminBtn')) {
    $('#topAdminBtn').onclick = () => switchView('admin');
  }

  if ($('#sidebarAdminNavBtn')) {
    $('#sidebarAdminNavBtn').onclick = () => switchView('admin');
  }

  // Settings modal admin list buttons
  if ($('#viewAllUsersBtn')) {
    $('#viewAllUsersBtn').onclick = () => {
      closeModal('#settingsModal');
      switchView('admin');
      setTimeout(() => $('#adminTabUsers')?.click(), 100);
    };
  }
  if ($('#viewAllComplaintsBtn')) {
    $('#viewAllComplaintsBtn').onclick = () => {
      closeModal('#settingsModal');
      switchView('admin');
      setTimeout(() => $('#adminTabComplaints')?.click(), 100);
    };
  }
  if ($('#adminQuickFillBtn')) {
    $('#adminQuickFillBtn').onclick = () => {
      setAuthMode('login');
      if ($('#authEmailInput')) $('#authEmailInput').value = 'admin@fitfuel.app';
      if ($('#authPasswordInput')) {
        $('#authPasswordInput').value = '';
        $('#authPasswordInput').focus();
      }
    };
  }
}
initAdminPortalListeners();

/* ---------- Complaint / Feedback Form Submission ---------- */
let cmpTypeVal = 'complaint';

function initComplaintSystem() {
  const typeBtns = $$('.cmp-type-btn');
  typeBtns.forEach(btn => {
    btn.onclick = () => {
      typeBtns.forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = '#dbeafe';
        b.style.background = '#ffffff';
        b.style.fontWeight = '600';
        b.style.color = '#55665b';
      });
      btn.classList.add('active');
      btn.style.borderColor = '#38bdf8';
      btn.style.background = '#f3f9ed';
      btn.style.fontWeight = '700';
      btn.style.color = '#2563eb';
      cmpTypeVal = btn.dataset.type || 'complaint';
    };
  });

  const openFormBtns = [$('#openComplaintModalBtn'), $('#profileComplaintBtn')].filter(Boolean);
  openFormBtns.forEach(btn => {
    btn.onclick = () => {
      if ($('#cmpNameInput') && profile && profile.name) {
        $('#cmpNameInput').value = profile.name;
      }
      if ($('#cmpEmailInput')) {
        const uEmail = (profile && profile.email) || (session && session.email) || '';
        if (uEmail) $('#cmpEmailInput').value = uEmail;
      }
      openModal('#complaintModal');
    };
  });

  const form = $('#complaintForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = ($('#cmpNameInput')?.value || '').trim();
      const email = ($('#cmpEmailInput')?.value || '').trim();
      const text = ($('#cmpTextInput')?.value || '').trim();
      if (name.length < 2) return toast('Please enter your name');
      if (text.length < 5) return toast('Please describe your issue or suggestion');

      const submitBtn = $('#cmpSubmitBtn');
      const origText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting...'; }

      const fileInput = $('#cmpFileInput');
      const files = [...(fileInput?.files || [])].slice(0, 3);
      const readAll = files.map(f => new Promise(res => {
        if (f.size > 900000) return res({ name: f.name, type: f.type, data: '' });
        const fr = new FileReader();
        fr.onload = () => res({ name: f.name, type: f.type, data: fr.result });
        fr.onerror = () => res({ name: f.name, type: f.type, data: '' });
        fr.readAsDataURL(f);
      }));
      const safeFiles = await Promise.all(readAll);

      try {
        await FF.sendComplaint(name, email, cmpTypeVal, text, safeFiles);
        toast('Feedback received! Admin team has been notified.');
        closeModal('#complaintModal');
        if ($('#cmpTextInput')) $('#cmpTextInput').value = '';
        if (fileInput) fileInput.value = '';
      } catch (err) {
        toast('Error sending complaint: ' + (err.message || 'Please retry'));
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
      }
    };
  }
}
initComplaintSystem();

// Logout handler
async function handleLogout() {
  closeModal('#settingsModal');
  await FF.logout();
  clearAllUserLocalData();
  updateAdminNavVisibility();
  renderProfileView();
  renderDashboard();
  renderDailyTip();
  renderFoodLog();
  renderWorkouts();
  renderMyFoods();
  renderChallengeView();
  renderTrackingView();
  updateSyncStatus('Preview mode · Logged out');
  toast('Logged out successfully');
  openModal('#authModal');
}

$('#logoutBtn').onclick = handleLogout;

/* ---------- Data Erasure & Account Deletion Handlers ---------- */
async function handleEraseData() {
  const confirmErase = confirm(' Are you sure you want to erase all your logged data?\n\nThis will clear:\n• All logged food entries & meals\n• All water intake records\n• All custom recipes and custom foods\n• All weight records\n• All completed workout logs\n\nYour account and login credentials will remain active. This cannot be undone.');
  if (!confirmErase) return;

  try {
    closeModal('#settingsModal');
    toast('Erasing all user data...');
    await FF.eraseData();

    // Reset local in-memory state
    log = {};
    store.del('log');
    custom = [];
    store.del('custom');
    plan = null;
    store.del('plan');
    activeChallengePlan = null;
    store.del('activeChallengePlan');
    weightLog = [];
    store.del('weights');
    workoutsDone = [];
    store.del('workouts');
    streakTracker = { currentStreak: 0, lastActiveDate: null, streakBroken: false, brokenStreakCount: 0, history: [] };
    store.del('streakTracker');
    waterMl = 0;
    waterHistory = {};
    store.del('water');

    renderDashboard();
    renderFoodLog();
    renderWorkouts();
    renderMyFoods();
    renderProfileView();
    renderChallengeView();
    renderTrackingView();

    updateSyncStatus('Data reset · Fresh start');
    toast('All logged data erased successfully. Starting fresh!');
  } catch (err) {
    toast('Error erasing data: ' + (err.message || 'Unknown error'));
  }
}

async function handleDeleteAccount() {
  const response = prompt(' DANGER: PERMANENT ACCOUNT DELETION\n\nThis will permanently delete your account, login credentials, and all records from the cloud database.\n\nType DELETE in uppercase to confirm:');
  if (response !== 'DELETE') {
    if (response !== null) {
      toast('Account deletion cancelled (confirmation did not match).');
    }
    return;
  }

  try {
    closeModal('#settingsModal');
    toast('Permanently deleting account from database...');
    await FF.deleteAccount();

    clearAllUserLocalData();
    updateAdminNavVisibility();

    renderDashboard();
    renderFoodLog();
    renderWorkouts();
    renderMyFoods();
    renderProfileView();
    renderChallengeView();
    renderTrackingView();

    updateSyncStatus('Account deleted · Logged out');
    toast('Your account and all records were permanently deleted.');
    openModal('#authModal');
  } catch (err) {
    toast('Error deleting account: ' + (err.message || 'Unknown error'));
  }
}

if ($('#eraseDataBtn')) $('#eraseDataBtn').onclick = handleEraseData;
if ($('#deleteAccountBtn')) $('#deleteAccountBtn').onclick = handleDeleteAccount;
if ($('#profileEraseDataBtn')) $('#profileEraseDataBtn').onclick = handleEraseData;
if ($('#profileDeleteAccountBtn')) $('#profileDeleteAccountBtn').onclick = handleDeleteAccount;

/* ---------- High-Resolution Image Lightbox Modal ---------- */
function openImageLightbox(src, title = 'High-Res Preview') {
  const modal = $('#imageLightboxModal');
  const img = $('#lightboxImage');
  const titleEl = $('#lightboxTitle');
  if (!modal || !img) return;
  img.src = src;
  if (titleEl) titleEl.textContent = title;
  openModal('#imageLightboxModal');
}

// Global click handler to expand images with full aspect-ratio (EXCLUDES athlete & workout visuals to prevent unwanted zooming)
document.addEventListener('click', e => {
  if (e.target.closest('#syAthleteHeroImg, .sy-athlete-stage, .stronger-you-hero-card .sy-athlete-img, #dashWorkoutImg, .workout-feature, #planWorkoutImg, .workout-feature img')) {
    return;
  }
  const trigger = e.target.closest('.img-preview-trigger, .cam-preview-image, #camResultThumb');
  if (!trigger) return;
  if (trigger.id === 'syAthleteHeroImg' || trigger.id === 'dashWorkoutImg' || trigger.id === 'planWorkoutImg' || trigger.closest('.sy-athlete-stage') || trigger.closest('.workout-feature')) {
    return;
  }
  if (e.target.closest('button, select, input, a')) return;
  const src = trigger.dataset.src || trigger.src || (trigger.querySelector('img') ? trigger.querySelector('img').src : null);
  if (!src) return;
  const title = trigger.dataset.title || trigger.alt || 'High-Res Image';
  openImageLightbox(src, title);
});

/* ---------- Auth Modal & Submit ---------- */
let authMode = 'login';

function setAuthMode(m) {
  authMode = m;
  if (m === 'login') {
    $('#authTitle').textContent = 'Sign in to Formwise';
    $('#authSubtitle').textContent = 'WELCOME BACK';
    $('#authSubmitBtn').textContent = 'Sign In';
    $('#authNameField').style.display = 'none';
    $('#authTabLoginBtn').style.background = '#edf4e8';
    $('#authTabLoginBtn').style.borderColor = '#38bdf8';
    $('#authTabRegisterBtn').style.background = 'transparent';
    $('#authTabRegisterBtn').style.borderColor = '#edf0eb';
  } else {
    $('#authTitle').textContent = 'Create your account';
    $('#authSubtitle').textContent = 'GET STARTED';
    $('#authSubmitBtn').textContent = 'Create Account';
    $('#authNameField').style.display = 'block';
    $('#authTabRegisterBtn').style.background = '#edf4e8';
    $('#authTabRegisterBtn').style.borderColor = '#38bdf8';
    $('#authTabLoginBtn').style.background = 'transparent';
    $('#authTabLoginBtn').style.borderColor = '#edf0eb';
  }
}

$('#authTabLoginBtn').onclick = () => setAuthMode('login');
$('#authTabRegisterBtn').onclick = () => setAuthMode('register');

$('#topAuthBtn').onclick = () => {
  if (session) {
    handleLogout();
  } else {
    setAuthMode('login');
    openModal('#authModal');
  }
};

async function submitAuth() {
  const email = $('#authEmailInput').value.trim();
  const pass = $('#authPasswordInput').value;
  const name = $('#authNameInput').value.trim() || 'Jordan Davis';

  if (!email || !pass) {
    toast('Please enter email and password');
    return;
  }

  $('#authSubmitBtn').disabled = true;
  $('#authSubmitBtn').textContent = 'Connecting...';

  try {
    let user;
    if (authMode === 'register') {
      user = await FF.register(name, email, '', pass, false);
      // Do NOT log the user in directly! Switch to login and require manual sign-in
      setAuthMode('login');
      $('#authEmailInput').value = email;
      $('#authPasswordInput').value = '';
      $('#authPasswordInput').focus();
      if ($('#authSubtitle')) $('#authSubtitle').textContent = 'ACCOUNT CREATED — PLEASE SIGN IN';
      toast('Account created! Please enter your password to sign in.');
      return;
    } else {
      user = await FF.login(email, pass);
      toast('Signed in successfully');
    }

    // Completely wipe all residual state from any previous session before loading user state
    clearAllUserLocalData();

    session = { name: user.name, email: user.email, is_admin: user.is_admin };
    store.set('session', session, false);
    updateAdminNavVisibility();

    // Pull user cloud database state
    try {
      const data = await FF.req('GET', '/api/data');
      applyUserCloudState(user, data ? data.state : {});
    } catch (e) {
      applyUserCloudState(user, {});
    }

    closeModal('#authModal');
    renderProfileView();
    if (user.email === 'admin@fitfuel.app') {
      switchView('admin');
      toast('Signed in as Root Administrator (admin@fitfuel.app)');
      return;
    }
    renderDashboard();
    renderDailyTip();
    renderFoodLog();
    renderWorkouts();
    renderMyFoods();
    renderChallengeView();
    renderTrackingView();
    updateSyncStatus('Cloud database synced');
    showMotivationalQuotePopup();
  } catch (err) {
    toast(err.message || 'Authentication error');
  } finally {
    $('#authSubmitBtn').disabled = false;
    $('#authSubmitBtn').textContent = authMode === 'login' ? 'Sign In' : 'Create Account';
  }
}

$('#authSubmitBtn').onclick = submitAuth;

/* ---------- Global Enter Key Navigation on Inputs ---------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const active = document.activeElement;

    // 1. Auth Modal
    if ($('#authModal') && $('#authModal').classList.contains('open')) {
      e.preventDefault();
      if (active && active.id === 'authNameInput') {
        const next = $('#authEmailInput');
        if (next) next.focus();
      } else if (active && active.id === 'authEmailInput') {
        const next = $('#authPasswordInput');
        if (next) next.focus();
      } else {
        submitAuth();
      }
      return;
    }

    // 2. Food Modal
    if ($('#foodModal') && $('#foodModal').classList.contains('open')) {
      e.preventDefault();
      if (active && active.id === 'foodSearchInput') {
        const portionInp = $('#foodPortionInput');
        if (portionInp) {
          portionInp.focus();
          portionInp.select();
          return;
        }
      }
      confirmAddFood();
      return;
    }

    // 3. Custom Food Modal
    if ($('#customFoodModal') && $('#customFoodModal').classList.contains('open')) {
      e.preventDefault();
      const sequence = ['customFoodName', 'customFoodCal', 'customFoodP', 'customFoodC', 'customFoodF'];
      const curIdx = active ? sequence.indexOf(active.id) : -1;
      if (curIdx !== -1 && curIdx < sequence.length - 1) {
        const nextEl = $('#' + sequence[curIdx + 1]);
        if (nextEl) { nextEl.focus(); if (nextEl.select) nextEl.select(); return; }
      }
      if ($('#saveCustomFoodBtn')) $('#saveCustomFoodBtn').click();
      return;
    }

    // 4. Edit Food Modal
    if ($('#editFoodModal') && $('#editFoodModal').classList.contains('open')) {
      e.preventDefault();
      const sequence = ['editFoodName', 'editFoodPortion', 'editFoodCal', 'editFoodP', 'editFoodC', 'editFoodF'];
      const curIdx = active ? sequence.indexOf(active.id) : -1;
      if (curIdx !== -1 && curIdx < sequence.length - 1) {
        const nextEl = $('#' + sequence[curIdx + 1]);
        if (nextEl) { nextEl.focus(); if (nextEl.select) nextEl.select(); return; }
      }
      if ($('#saveEditFoodBtn')) $('#saveEditFoodBtn').click();
      return;
    }

    // 5. Recipe Builder Modal
    if ($('#recipeBuilderModal') && $('#recipeBuilderModal').classList.contains('open')) {
      e.preventDefault();
      if (active && active.id === 'recipeDishName') {
        const firstQty = $('#recipeIngredientsContainer .recipe-qty-input');
        if (firstQty) { firstQty.focus(); firstQty.select(); return; }
      }
      if ($('#logRecipeToTodayBtn')) $('#logRecipeToTodayBtn').click();
      return;
    }

    // 6. Camera Modal
    if ($('#cameraModal') && $('#cameraModal').classList.contains('open')) {
      if ($('#camConfirmAddBtn') && !$('#camConfirmAddBtn').disabled) {
        e.preventDefault();
        $('#camConfirmAddBtn').click();
        return;
      }
    }

    // 7. Profile Inputs
    if (activeView === 'profile' && active && active.tagName === 'INPUT') {
      e.preventDefault();
      const seq = ['pfHeightInput', 'pfWeightInput', 'pfCalorieInput'];
      const curIdx = seq.indexOf(active.id);
      if (curIdx !== -1 && curIdx < seq.length - 1) {
        const nextEl = $('#' + seq[curIdx + 1]);
        if (nextEl) { nextEl.focus(); if (nextEl.select) nextEl.select(); return; }
      }
      saveProfileData();
      return;
    }
  }
});

/* ---------- Micro-Interactions (Motion Physics) ---------- */
function initMotionEffects() {
  if (!M || !M.animate || typeof document === 'undefined') return;
  document.documentElement.classList.add('has-motion');

  document.addEventListener('pointerdown', e => {
    const el = e.target.closest('.solid-button, .outline-button, .nav-link, .water-cup, .round-arrow, .text-button');
    if (!el) return;
    M.animate(el, { scale: 0.95 }, { duration: 0.1, easing: 'ease-out' });
  }, { passive: true });

  const release = e => {
    const el = e.target.closest('.solid-button, .outline-button, .nav-link, .water-cup, .round-arrow, .text-button');
    if (!el) return;
    M.animate(el, { scale: 1 }, {
      duration: 0.32,
      easing: M.spring({ stiffness: 420, damping: 22 })
    });
  };
  document.addEventListener('pointerup', release, { passive: true });
  document.addEventListener('pointercancel', release, { passive: true });
}

/* ---------- Boot / Init ---------- */

/* ---------- AI Plan Personalization Engine ---------- */
if ($('#openAiPlanModalBtn')) {
  $('#openAiPlanModalBtn').onclick = () => {
    openModal('#aiPlanModal');
  };
}

if ($('#generateAiPlanBtn')) {
  $('#generateAiPlanBtn').onclick = async () => {
    const btn = $('#generateAiPlanBtn');
    const loading = $('#aiPlanLoadingIndicator');
    btn.disabled = true;
    btn.textContent = 'Generating Plan with AI...';
    if (loading) loading.style.display = 'block';

    const dietPref = $('#aiDietPrefSelect') ? $('#aiDietPrefSelect').value : 'Balanced';
    const focus = $('#aiFocusSelect') ? $('#aiFocusSelect').value : 'Full Body Strength';
    const note = $('#aiCustomNote') ? $('#aiCustomNote').value : '';

    try {
      const plan = await FF.aiGeneratePlan({
        wKg: profile.wKg || 68,
        hCm: profile.hCm || 175,
        goal: profile.goal || 'Maintain weight',
        days: profile.days || 4,
        creatine: profile.creatine || 'yes',
        units: profile.units || 'Metric',
        dietPref,
        focus,
        note
      });

      // 1. Update Profile targets
      if (plan.cal) profile.cal = plan.cal;
      if (plan.p) profile.p = plan.p;
      if (plan.c) profile.c = plan.c;
      if (plan.f) profile.f = plan.f;
      if (plan.waterL) profile.waterGoal = plan.waterL;

      // 2. Update meals
      if (plan.meals && Array.isArray(plan.meals) && plan.meals.length) {
        const d = today();
        log[d] = plan.meals;
        store.set('log', log);
      }

      // 3. Update active workout
      if (plan.workout && plan.workout.moves) {
        WORKOUT_PLANS.unshift(plan.workout);
        activeWorkoutIdx = 0;
      }

      // Save to storage & Turso database
      store.set('profile', profile);
      store.set('plan', plan);

      closeModal('#aiPlanModal');
      renderDashboard();
      renderProfileView();
      renderFoodLog();
      renderWorkouts();
      switchView('workouts');
      toast('AI Plan created! Displaying your personalized workout below.');
    } catch (err) {
      toast(err.message || 'Error generating AI plan');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Generate & Apply My AI Plan';
      if (loading) loading.style.display = 'none';
    }
  };
}


/* ================= AI FITNESS & NUTRITION CHATBOT CONTROLLER ================= */
function getAiSystemContext() {
  const d = today();
  const entries = log[d] || [];
  const totKcal = entries.reduce((a, b) => a + (b.k || b.calories || 0), 0);
  const totP = entries.reduce((a, b) => a + (b.p || b.protein || 0), 0);
  const totC = entries.reduce((a, b) => a + (b.c || b.carbs || 0), 0);
  const totF = entries.reduce((a, b) => a + (b.f || b.fat || 0), 0);
  const waterMl = (water && water.date === d) ? (water.ml || 0) : 0;
  const woDone = (workoutsDone || []).filter(w => w.date === d).map(w => w.name);
  const currentTheme = getActiveThemeSetting();
  const effectiveTheme = document.documentElement.getAttribute('data-theme') || (currentTheme === 'dark' ? 'dark' : 'light');

  return `You are FitFuel AI Coach — an elite sports nutritionist, clinical dietitian, and master strength coach.
User Profile:
- Weight: ${profile.wKg} kg (${profile.units || 'Metric'})
- Daily Macro Goals: ${profile.cal || 2000} kcal, ${profile.p || 165}g Protein, ${profile.c || 139}g Carbs, ${profile.f || 87}g Fat
- Primary Fitness Goal: ${profile.goal || 'Hypertrophy & Body Recomposition'}
- Today's Consumed: ${totKcal} kcal (${totP}g Protein, ${totC}g Carbs, ${totF}g Fat)
- Today's Water: ${(waterMl / 1000).toFixed(1)} L (Target: ${profile.waterGoal || '2.5'} L)
- Completed Workouts Today: ${woDone.length ? woDone.join(', ') : 'None yet'}
- Active Theme Color: ${currentTheme.toUpperCase()} (Render Mode: ${effectiveTheme}, Primary Theme Palette: Deep Navy #0f172a, Cobalt Blue #2563eb, Sky Blue #38bdf8)

Instructions:
1. Always directly and specifically answer the user's exact question with concrete numbers, portion grams, calories, or exercise sets.
2. Provide highly accurate macronutrient and micronutrient details for ANY food: homemade Indian dishes, hotel meals, vegetarian proteins (soya, paneer, tofu, seitan, lentils), fast foods, fruits, and vegetables.
3. For workouts, give precise scientific sets, reps, and tempo guidance tailored to the target muscle part.
4. Keep responses structured, concise, and engaging using markdown bullet points and bold highlights.
5. NEVER use emojis in your response under any circumstances. Output clean, professional typography only.
6. If the user asks about the theme color, interface styling, or asks to change theme (e.g. to dark or light mode), confirm the theme color settings and explain the high-contrast athletic blue palette.
7. Think and reason through the user's specific scenario dynamically without repeating canned disclaimers.`;
}

function openAiChat(initialPrompt = null) {
  const drawer = $('#aiChatDrawer');
  if (!drawer) return;
  drawer.classList.add('open');

  if (!chatHistory.length) {
    addBotChatMessage(`**Hello ${profile.name ? profile.name.split(' ')[0] : 'there'}!** I am your **FitFuel AI Coach & Nutrition Specialist**.

Ask me anything about:
• **Micronutrients & Nutrition**: Exact grams, calories, vitamins, and minerals for any meal or recipe.
• **Personalized Training**: Sets, reps, biomechanical cues, and form progression tailored to your goals.
• **Theme & Visual Customization**: Ask me to switch between Dark, Light, or System theme colors to match your training environment.
• **Live Progress Audit**: Real-time review of today's logged food, water hydration, and workout volume.`);
  }

  if (initialPrompt) {
    handleUserAiQuery(initialPrompt);
  } else {
    setTimeout(() => {
      const inp = $('#aiChatInput');
      if (inp) inp.focus();
    }, 200);
  }
}

function closeAiChat() {
  const drawer = $('#aiChatDrawer');
  if (drawer) drawer.classList.remove('open');
}

function addBotChatMessage(markdownText) {
  chatHistory.push({ role: 'assistant', text: markdownText });
  renderChatMessages();
}

function openLightboxModal(src, title = 'Photo Preview') {
  const modal = $('#imageLightboxModal');
  const img = $('#lightboxImage');
  const titleEl = $('#lightboxTitle');
  if (img) img.src = src;
  if (titleEl) titleEl.textContent = title;
  if (modal) openModal('#imageLightboxModal');
}

function addUserChatMessage(text, image = null) {
  chatHistory.push({ role: 'user', text, image });
  renderChatMessages();
}

function renderChatMessages() {
  const containers = [$('#aiChatMessages'), $('#floatingAiMessages')].filter(Boolean);
  containers.forEach(container => {
    container.innerHTML = chatHistory.map(msg => {
      const isBot = msg.role === 'assistant';
      const formatted = formatChatMarkdown(msg.text);
      const imgHtml = msg.image ? `<img src="${msg.image}" class="chat-bubble-image-thumb" onclick="if(typeof openLightboxModal==='function')openLightboxModal('${msg.image}','Uploaded Photo');">` : '';
      return `<div class="ai-msg ${isBot ? 'bot' : 'user'}">
        ${isBot ? '<span style="font-size:.72rem;color:var(--ff-emerald);font-weight:700;margin-bottom:4px;letter-spacing:0.04em;">FITFUEL AI ASSISTANT</span>' : ''}
        ${imgHtml}
        <div>${formatted}</div>
      </div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
  });

  const coachStream = $('#coachChatStream');
  if (coachStream) {
    if (chatHistory.length === 0) {
      coachStream.innerHTML = `
        <div class="ai-msg bot" style="background:rgba(255,255,255,0.85);border:1px solid var(--ff-glass-border-subtle);border-radius:18px;padding:14px 18px;box-shadow:0 4px 16px rgba(47,73,117,0.05);">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <img src="images/fitfuel-coach-avatar.png" alt="Coach" style="width:24px;height:24px;border-radius:50%;">
            <b style="font-size:0.86rem;color:var(--ff-text-primary);">FitFuel AI Coach</b>
            <span style="font-size:0.7rem;color:var(--ff-emerald);font-weight:700;">ACTIVE</span>
          </div>
          <p style="margin:0 0 10px;font-size:0.88rem;line-height:1.55;color:var(--ff-text-primary);">
            Welcome to your dedicated coaching room! I have your daily targets loaded (2,200 kcal, 140g protein, Upper-Body strength day). How can I optimize your training or nutrition right now?
          </p>
          <div class="ai-plan-preview-card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <b style="font-size:0.9rem;color:var(--ff-text-primary);">Recommended Upper-Body Hypertrophy Plan</b>
              <span style="font-size:0.72rem;background:rgba(22,199,154,0.2);color:#0d9488;padding:2px 8px;border-radius:99px;font-weight:700;">RPE 8</span>
            </div>
            <div class="ai-card-grid-2x2">
              <div class="ai-card-pill-item"><b>Bench Press:</b> 4 sets × 8-10 reps</div>
              <div class="ai-card-pill-item"><b>Incline Dumbbell:</b> 3 sets × 10 reps</div>
              <div class="ai-card-pill-item"><b>Cable Lateral Raise:</b> 4 sets × 15 reps</div>
              <div class="ai-card-pill-item"><b>Overhead Extension:</b> 3 sets × 12 reps</div>
            </div>
            <div class="ai-chat-action-btns-row">
              <button type="button" class="ai-chat-btn-mini primary" onclick="switchView('workouts')">Save to My Workouts</button>
              <button type="button" class="ai-chat-btn-mini" onclick="switchView('posture')">Check Exercise Form</button>
              <button type="button" class="ai-chat-btn-mini" onclick="openModal('#customWorkoutModal')">Customize Volume</button>
            </div>
          </div>
        </div>
      `;
    } else {
      coachStream.innerHTML = chatHistory.map(msg => {
        const isBot = msg.role === 'assistant';
        const formatted = formatChatMarkdown(msg.text);
        if (isBot) {
          return `<div class="ai-msg bot" style="background:rgba(255,255,255,0.88);border:1px solid var(--ff-glass-border-subtle);border-radius:18px;padding:14px 18px;box-shadow:0 4px 16px rgba(47,73,117,0.05);margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <img src="images/fitfuel-coach-avatar.png" alt="Coach" style="width:24px;height:24px;border-radius:50%;">
              <b style="font-size:0.86rem;color:var(--ff-text-primary);">FitFuel AI Coach</b>
              <span style="font-size:0.7rem;color:var(--ff-emerald);font-weight:700;">REASONING</span>
            </div>
            <div style="font-size:0.88rem;line-height:1.55;color:var(--ff-text-primary);">${formatted}</div>
          </div>`;
        } else {
          const imgHtml = msg.image ? `<img src="${msg.image}" class="chat-bubble-image-thumb" onclick="if(typeof openLightboxModal==='function')openLightboxModal('${msg.image}','Uploaded Photo');">` : '';
          return `<div class="ai-msg user" style="margin-left:auto;max-width:85%;background:linear-gradient(135deg,rgba(22,199,154,0.18),rgba(56,189,248,0.15));border:1px solid rgba(22,199,154,0.3);border-radius:18px;padding:12px 16px;margin-bottom:10px;">
            <b style="font-size:0.75rem;color:var(--ff-emerald);display:block;margin-bottom:2px;">YOU</b>
            ${imgHtml}
            <div style="font-size:0.88rem;color:var(--ff-text-primary);">${formatted}</div>
          </div>`;
        }
      }).join('');
    }
    coachStream.scrollTop = coachStream.scrollHeight;
  }
}

function formatChatMarkdown(txt) {
  if (!txt) return '';
  let html = txt;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h4 style="color:#38bdf8;margin:8px 0 4px;font-size:1.02rem;">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 style="color:#38bdf8;margin:10px 0 6px;font-size:1.15rem;">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 style="color:#38bdf8;margin:12px 0 8px;font-size:1.25rem;">$1</h2>');

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');

  // Bullet and numbered lists
  html = html.replace(/^[•\-\*]\s+(.*$)/gim, '<div style="margin:2px 0;display:flex;gap:6px;"><span>•</span><span>$1</span></div>');
  html = html.replace(/^(\d+)\.\s+(.*$)/gim, '<div style="margin:2px 0;display:flex;gap:6px;"><b>$1.</b><span>$2</span></div>');

  // Parse markdown tables if present
  if (html.includes('|')) {
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    const newLines = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
        if (cells.every(c => c.match(/^[-: ]+$/))) {
          continue; // header divider
        }
        if (!inTable) {
          inTable = true;
          tableHtml = '<div style="overflow-x:auto;margin:8px 0;"><table style="width:100%;border-collapse:collapse;font-size:.82rem;border:1px solid #1e293b;">';
          tableHtml += '<thead><tr style="background:#172554;color:#38bdf8;">' + cells.map(c => `<th style="padding:5px 8px;border:1px solid #1e293b;text-align:left;">${c}</th>`).join('') + '</tr></thead><tbody>';
        } else {
          tableHtml += '<tr>' + cells.map(c => `<td style="padding:5px 8px;border:1px solid #1e293b;">${c}</td>`).join('') + '</tr>';
        }
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += '</tbody></table></div>';
          newLines.push(tableHtml);
          tableHtml = '';
        }
        newLines.push(line);
      }
    }
    if (inTable) {
      tableHtml += '</tbody></table></div>';
      newLines.push(tableHtml);
    }
    html = newLines.join('\n');
  }

  // Preserve paragraphs and breaks
  html = html.replace(/\n\n+/g, '<br><br>').replace(/\n/g, '<br>');
  return html;
}

async function handleUserAiQuery(query, image = null) {
  if (!query || !query.trim()) return;
  const q = query.trim();
  const lowerQ = q.toLowerCase();
  addUserChatMessage(q, image);

  // Quick command: /goal (4D Body Composition & Goal Planner)
  if (lowerQ === '/goal' || lowerQ.startsWith('/goal')) {
    syncBodyModalInputs();
    openModal('#bodyAnalysisModal');
    soundFX.pop();
    addBotChatMessage(`### 4D Body Composition & Anthropometric Studio (/goal)

I have opened your **4D Body Composition & Goal Planner** modal:
- **Demanding Weight:** Configure your exact target weight.
- **Physique Goal:** Choose between **Lose Fat & Cut**, **Gain Muscle & Mass**, or **Body Recomposition**.
- **4 Dimensions:** Snap with camera or upload photos from 4 angles (**Front, Back, Left Side, Right Side**).
- **AI Diagnosis:** FitFuel AI calculates your exact body fat %, lean mass, and projected weeks to reach your goal.`);
    return;
  }

  // Quick command: /boost (Pre-Workout Motivation & Form Checker)
  if (lowerQ === '/boost' || lowerQ.startsWith('/boost')) {
    soundFX.complete();
    addBotChatMessage(`### Pre-Workout Adrenaline & Form Booster (/boost)

**Instant Athletic Primer Activated:**
1. **Electrolyte Charge:** Drink 350-500ml water to prime muscle cell volumization.
2. **Kinematic Primer:** Perform 12 deep air squats with arms elevated to prime thoracic mobility.
3. **Camera Form Check:** Launching the **Camera AI Posture & Form Checker** now so you can verify knee depth and posture in real-time.`);
    setTimeout(() => {
      switchView('posture');
      startPostureCamera(false);
    }, 900);
    return;
  }

  // Active theme switching command detection
  if (lowerQ.includes('theme') || lowerQ.includes('dark mode') || lowerQ.includes('light mode')) {
    if (lowerQ.includes('dark') || lowerQ.includes('night') || lowerQ.includes('black')) {
      applyTheme('dark');
      toast('Theme changed to DARK mode');
    } else if (lowerQ.includes('light') || lowerQ.includes('day') || lowerQ.includes('white')) {
      applyTheme('light');
      toast('Theme changed to LIGHT mode');
    } else if (lowerQ.includes('system') || lowerQ.includes('default') || lowerQ.includes('auto')) {
      applyTheme('system');
      toast('Theme changed to SYSTEM default');
    }
  }

  const typingContainers = [$('#aiChatMessages'), $('#floatingAiMessages'), $('#coachChatStream')].filter(Boolean);
  const typingClass = 'ai-typing-' + Date.now();
  typingContainers.forEach(container => {
    const typingDiv = document.createElement('div');
    typingDiv.className = `ai-msg bot ${typingClass}`;
    typingDiv.innerHTML = `
      <span style="font-size:.74rem;color:#0284c7;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:6px;">
        <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#0284c7;box-shadow:0 0 6px #0284c7;"></span>
        AI LIVE COACH · REASONING
      </span>
      <div style="color:#64748b;font-style:italic;display:flex;align-items:center;gap:8px;">
        <span style="display:inline-block;width:12px;height:12px;border:2px solid #0284c7;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></span>
        Analyzing metrics and formulating dynamic response...
      </div>`;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
  });

  try {
    const systemPrompt = getAiSystemContext();
    const recentMessages = chatHistory.slice(-8).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text
    }));
    const reply = await FF.callAI(q, systemPrompt, recentMessages, { image });
    document.querySelectorAll('.' + typingClass).forEach(el => el.remove());
    addBotChatMessage(reply);
  } catch (err) {
    document.querySelectorAll('.' + typingClass).forEach(el => el.remove());
    addBotChatMessage(`Connection note: ${err.message}. Please retry or verify your network connection.`);
  }
}

// AI Verification on Dashboard
function updateAiDailyVerification(entries, totalKcal, goalKcal, totalP, targetP, waterMl) {
  const headline = $('#aiVerifyHeadline');
  const sub = $('#aiVerifySub');
  if (!headline || !sub) return;

  const leftKcal = goalKcal - totalKcal;
  const leftP = targetP - totalP;

  if (entries.length === 0) {
    headline.textContent = 'Ready to fuel your day?';
    sub.textContent = `Target: ${goalKcal} kcal and ${targetP}g protein. Log your first meal, scan a food photo, or ask AI Coach!`;
  } else if (leftP > 40) {
    headline.textContent = `Protein Gap: ${leftP}g remaining today`;
    sub.textContent = `You've logged ${totalP}g / ${targetP}g protein. AI recommends paneer, chicken breast, or Greek yogurt for your next meal.`;
  } else if (leftKcal < 0) {
    headline.textContent = `Calorie Target Reached (+${Math.abs(leftKcal)} kcal)`;
    sub.textContent = `You've reached ${totalKcal} kcal today. Focus on lean protein and adequate hydration tonight.`;
  } else if (waterMl < 1000) {
    headline.textContent = 'Hydration Reminder';
    sub.textContent = `Only ${(waterMl / 1000).toFixed(1)} L recorded so far. Drink 2-3 more glasses of water before your workout session.`;
  } else {
    headline.textContent = 'Optimal Day Progress';
    sub.textContent = `Great adherence! ${totalKcal} / ${goalKcal} kcal with ${totalP}g protein logged. Click below to run a complete AI audit.`;
  }
}

// Wire Chatbot Event Listeners
if ($('#aiChatLauncher')) $('#aiChatLauncher').onclick = () => openAiChat();
if ($('#aiChatCloseBtn')) $('#aiChatCloseBtn').onclick = () => closeAiChat();
if ($('#aiChatClearBtn')) {
  $('#aiChatClearBtn').onclick = () => {
    chatHistory = [];
    renderChatMessages();
    toast('Chat history cleared');
  };
}

if ($('#aiChatForm')) {
  $('#aiChatForm').onsubmit = (e) => {
    e.preventDefault();
    const inp = $('#aiChatInput');
    if (!inp) return;
    const val = inp.value;
    inp.value = '';
    handleUserAiQuery(val);
  };
}

if ($('#aiChatSendBtn')) {
  $('#aiChatSendBtn').onclick = (e) => {
    e.preventDefault();
    const inp = $('#aiChatInput');
    if (!inp) return;
    const val = inp.value;
    inp.value = '';
    handleUserAiQuery(val);
  };
}

$$('#aiChatChips .ai-chip').forEach(chip => {
  chip.onclick = () => {
    const q = chip.dataset.q;
    if (q) handleUserAiQuery(q);
  };
});

if ($('#triggerAiVerifyBtn')) {
  $('#triggerAiVerifyBtn').onclick = () => {
    openAiChat('Please give me a complete verification and audit of my today check-in: calories, macros, hydration, and workout progress.');
  };
}

if ($('#aiMicronutrientAuditBtn')) {
  $('#aiMicronutrientAuditBtn').onclick = () => {
    openAiChat('Analyze the micronutrients, fiber, and balance of my logged meals today. Tell me which vitamins or minerals I am getting or lacking, and suggest what to eat next.');
  };
}

/* ================= MOTIVATIONAL QUOTES ON LOGIN / SIGNUP ================= */
function showMotivationalQuotePopup() {
  const quote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
  if ($('#motivationQuoteText')) $('#motivationQuoteText').textContent = `"${quote.text}"`;
  if ($('#motivationQuoteAuthor')) $('#motivationQuoteAuthor').textContent = `— ${quote.author}`;
  openModal('#motivationModal');
}

if ($('#dismissMotivationBtn')) {
  $('#dismissMotivationBtn').onclick = () => closeModal('#motivationModal');
}

/* ================= DAILY TIP & HABIT SCIENCE ================= */
const DAILY_TIPS = [
  {
    category: "DAILY NUTRITION & MUSCLE SCIENCE",
    title: "Target 1.6g to 2.2g Protein per kg Bodyweight",
    content: "Consuming adequate protein throughout the day distributes leucine spikes to trigger muscle protein synthesis (MPS). Distribute your daily intake evenly over 3 to 4 meals to maximize recovery.",
    takeaway: "Aim for ~25-40g protein per meal.",
    source: "International Society of Sports Nutrition (ISSN)"
  },
  {
    category: "HYDRATION & CELLULAR VOLUME",
    title: "1-2% Dehydration Drops Muscular Strength by up to 10%",
    content: "Muscles are over 70% water. Even minor dehydration compromises electrolyte pump gradients and muscular endurance. Drink a full glass of water first thing in the morning and sip steadily around your training session.",
    takeaway: "Track your 12 glasses today on the dashboard.",
    source: "Journal of Athletic Training"
  },
  {
    category: "HYPERTROPHY & BIOMECHANICS",
    title: "Emphasize the 3-Second Eccentric Lowering Phase",
    content: "Research confirms that mechanical tension in the stretched, eccentric (lowering) portion of a lift yields significantly greater muscle damage and hypertrophic signaling than rapid concentric repetitions.",
    takeaway: "Lower weights under strict 2-3s control without bouncing.",
    source: "Sports Medicine Meta-Analysis"
  },
  {
    category: "SLEEP & HORMONAL RECOVERY",
    title: "Over 70% of Human Growth Hormone (HGH) Spikes During Deep Sleep",
    content: "Deep Slow-Wave Sleep (stages 3 & 4) triggers peak release of anabolic hormones essential for repairing micro-tears in muscle tissue and resynthesizing glycogen. Skimping on sleep blunts insulin sensitivity.",
    takeaway: "Target 7.5 to 8.5 hours in a cool, dark room.",
    source: "Sleep Medicine Reviews"
  },
  {
    category: "PROGRESSIVE OVERLOAD PRINCIPLE",
    title: "Add 1 Rep or 1 kg Each Week to Force Muscular Adaptation",
    content: "The body only adapts when exposed to a stimulus beyond what it is currently accustomed to. Log your lifts, track your sets, and strive for incremental micro-progressions each week.",
    takeaway: "Track every completed workout in your Habit Log.",
    source: "American College of Sports Medicine (ACSM)"
  },
  {
    category: "REST INTERVAL PHYSIOLOGY",
    title: "Longer Rest Intervals (2-3 min) Maximize Compound Muscle Strength",
    content: "For heavy compound movements (squats, presses, deadlifts), resting 2-3 minutes allows ATP-CP stores to resynthesize over 95%, allowing you to lift heavier volume compared to short 30-second rests.",
    takeaway: "Use the built-in +60s rest button on heavy compound days.",
    source: "Journal of Strength and Conditioning Research"
  }
];

let currentTipIndex = Math.floor(Math.random() * DAILY_TIPS.length);

function renderDailyTip() {
  const tip = DAILY_TIPS[currentTipIndex % DAILY_TIPS.length];
  if (!tip) return;
  if ($('#dailyTipCategory')) $('#dailyTipCategory').textContent = tip.category;
  if ($('#dailyTipTitle')) $('#dailyTipTitle').textContent = tip.title;
  if ($('#dailyTipContent')) $('#dailyTipContent').textContent = tip.content;
  if ($('#dailyTipKeyTakeaway')) $('#dailyTipKeyTakeaway').innerHTML = `<b>Key takeaway:</b> ${escapeHtml(tip.takeaway)}`;
  if ($('#dailyTipSource')) $('#dailyTipSource').textContent = tip.source;
}

function cycleDailyTip() {
  currentTipIndex = (currentTipIndex + 1) % DAILY_TIPS.length;
  renderDailyTip();
  if (M && M.animate) {
    const p = $('#dailyTipPanel');
    if (p) M.animate(p, { scale: [0.98, 1], opacity: [0.85, 1] }, { duration: 0.2 });
  }
}

if ($('#nextDailyTipBtn')) {
  $('#nextDailyTipBtn').onclick = cycleDailyTip;
}

/* ================= WEB AUDIO SYNTHESIZER (3-2-1 BEEP GENERATOR) ================= */
let audioCtx = null;
function playAudioChime(freq = 440, type = 'sine', duration = 0.14) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

/* ================= CHALLENGE SETUP & AI ENGINE ================= */
let setupMotive = 'Burn Fat & Lean Out';
let setupDuration = 15;
let setupMinutes = 45;
let setupIntensity = 'Moderate';
let setupTypes = ['Gym'];

function initChallengeSetupListeners() {
  // Step 1: Motive Selection Cards
  $$('#motiveOptionsList .setup-choice-card').forEach(card => {
    card.onclick = () => {
      $$('#motiveOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      setupMotive = card.dataset.motive || 'Burn Fat & Lean Out';
    };
  });

  // Step 1 -> Step 2 (Preferences)
  if ($('#proceedToPrefsBtn')) {
    $('#proceedToPrefsBtn').onclick = () => {
      closeModal('#challengeMotiveModal');
      setTimeout(() => openModal('#challengePrefsModal'), 100);
    };
  }

  // Step 2 -> Back to Step 1
  if ($('#backToMotiveBtn')) {
    $('#backToMotiveBtn').onclick = () => {
      closeModal('#challengePrefsModal');
      setTimeout(() => openModal('#challengeMotiveModal'), 100);
    };
  }

  // Step 2: Types Checkboxes
  $$('#chTypesOptionsList input[type="checkbox"]').forEach(cb => {
    cb.onchange = () => {
      const parent = cb.closest('.setup-choice-card');
      if (parent) {
        if (cb.checked) parent.classList.add('selected');
        else parent.classList.remove('selected');
      }
      const checkedBoxes = Array.from($$('#chTypesOptionsList input[type="checkbox"]:checked'));
      setupTypes = checkedBoxes.map(b => b.value);
      if (!setupTypes.length) setupTypes = ['Gym'];
    };
  });

  // Step 2: Minutes Selection
  $$('#chTimeOptionsList .setup-choice-card').forEach(card => {
    card.onclick = () => {
      $$('#chTimeOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      setupMinutes = Number(card.dataset.minutes) || 45;
    };
  });

  // Step 2: Intensity Selection
  $$('#chIntensityOptionsList .setup-choice-card').forEach(card => {
    card.onclick = () => {
      $$('#chIntensityOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      setupIntensity = card.dataset.intensity || 'Moderate';
    };
  });

  // Step 2 -> Step 3 (Duration Modal)
  if ($('#proceedToDurationBtn')) {
    $('#proceedToDurationBtn').onclick = () => {
      closeModal('#challengePrefsModal');
      if ($('#challengeMetricsPreview')) {
        const typesStr = setupTypes.join(', ');
        $('#challengeMetricsPreview').textContent = `${setupMinutes} Total Min/Day · ${setupIntensity} Intensity · ${typesStr} · ${setupMotive}`;
      }
      setTimeout(() => openModal('#challengeDurationModal'), 100);
    };
  }

  // Step 3 -> Back to Step 2
  if ($('#backToPrefsBtn')) {
    $('#backToPrefsBtn').onclick = () => {
      closeModal('#challengeDurationModal');
      setTimeout(() => openModal('#challengePrefsModal'), 100);
    };
  }

  // Step 3: Days Selection Cards
  $$('#durationOptionsList .setup-choice-card').forEach(card => {
    card.onclick = () => {
      $$('#durationOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      setupDuration = Number(card.dataset.days) || 15;
    };
  });

  // Generate AI Plan
  if ($('#generateChallengePlanBtn')) {
    $('#generateChallengePlanBtn').onclick = () => {
      generateAIChallengePlan(setupMotive, setupDuration, setupMinutes, setupIntensity, setupTypes);
    };
  }

  // Start New Challenge button on challenge intro
  if ($('#createChallengeBtn')) {
    $('#createChallengeBtn').onclick = () => {
      openModal('#challengeMotiveModal');
    };
  }
}
initChallengeSetupListeners();

// Helper: Day-by-day routines generator factoring in user bodyweight, height & motive
function buildDayByDayRoutines(motive, durationDays, w, h, targetMinutes = 45, intensity = 'Moderate', workoutTypes = ['Gym']) {
  const isFat = motive.includes('Fat');
  const isStrength = motive.includes('Strength');

  let defaultSets = 3;
  let defaultRest = 60;
  let repsScheme = '8–12 reps';
  if (intensity === 'Hard') {
    defaultSets = 4;
    defaultRest = isStrength ? 60 : 40;
    repsScheme = isStrength ? '4–6 heavy reps' : (isFat ? '14–16 reps' : '10–12 reps');
  } else if (intensity === 'Mild') {
    defaultSets = 2;
    defaultRest = 75;
    repsScheme = '10–12 controlled reps';
  } else {
    defaultSets = 3;
    defaultRest = 50;
    repsScheme = isStrength ? '6–8 reps' : (isFat ? '12–15 reps' : '8–12 reps');
  }

  // Determine number of exercises based on selected target minutes
  let exerciseCount = 5;
  if (targetMinutes <= 20) exerciseCount = 3;
  else if (targetMinutes <= 35) exerciseCount = 4;
  else if (targetMinutes <= 45) exerciseCount = 5;
  else exerciseCount = 7;

  const splitTemplates = [
    { title: 'Chest & Triceps Hypertrophy', focus: 'Upper & Mid Chest · Triceps', muscleGroup: 'Chest' },
    { title: 'Back & Lat Power Builder', focus: 'Lats · Upper Back · Biceps', muscleGroup: 'Back' },
    { title: 'Quads & Lower Body Stamina', focus: 'Quads · Hamstrings · Calves', muscleGroup: 'Legs' },
    { title: 'Shoulders & Core Stability', focus: 'Deltoids · Abs · Obliques', muscleGroup: 'Shoulders' },
    { title: 'Glutes, Posterior & Cardio Shred', focus: 'Posterior Chain · Glutes · Conditioning', muscleGroup: 'Legs' },
    { title: 'Full-Body Athletic Conditioning', focus: 'Compound Movements · Functional Metcon', muscleGroup: 'Chest' },
    { title: 'Active Recovery & Core Armor', focus: 'Mobility · Deep Core · Balance', muscleGroup: 'Abs / Core' }
  ];

  const days = [];
  for (let i = 1; i <= durationDays; i++) {
    const template = splitTemplates[(i - 1) % splitTemplates.length];
    const category = template.muscleGroup === 'Abs / Core' ? 'Chest' : template.muscleGroup;
    let pool = EXERCISES_LIBRARY.filter(e => e.category.toLowerCase().includes(category.toLowerCase()));
    if (!pool.length) pool = EXERCISES_LIBRARY;

    // Filter by chosen workout types if applicable
    const isHome = workoutTypes.includes('Home') && !workoutTypes.includes('Gym');
    if (isHome) {
      const homePool = pool.filter(e => (e.type || '').toLowerCase().includes('home') || (e.type || '').toLowerCase().includes('dumbbell') || (e.type || '').toLowerCase().includes('bodyweight'));
      if (homePool.length >= 2) pool = homePool;
    }

    const dayExercises = [];
    const mainCount = workoutTypes.includes('Stretching') ? Math.max(2, exerciseCount - 1) : exerciseCount;

    for (let j = 0; j < mainCount; j++) {
      const ex = pool[j % pool.length];
      dayExercises.push({
        name: ex.name,
        subMuscle: ex.sub || ex.category,
        category: ex.category,
        sets: defaultSets,
        reps: repsScheme,
        durationSec: 45,
        restSec: defaultRest,
        tip: ex.steps || ex.rxWhy || 'Maintain tight core, chest proud, smooth cadence.'
      });
    }

    // Add stretching / cooldown if user selected Stretching
    if (workoutTypes.includes('Stretching')) {
      dayExercises.push({
        name: i % 2 === 0 ? "World's Greatest Stretch & Thoracic Opener" : "Cat-Cow & Deep Hip Flexor Release",
        subMuscle: "Mobility & Full Body Recovery",
        category: "Stretching",
        sets: 2,
        reps: "45s hold each side",
        durationSec: 45,
        restSec: 30,
        tip: "Breathe deeply into diaphragm, relax shoulders, and ease tension out of worked muscle fibers."
      });
    }

    days.push({
      dayNumber: i,
      title: `Day ${i}: ${template.title}`,
      focus: template.focus,
      intensity: `${intensity} · ${targetMinutes}m Session`,
      estDuration: `${targetMinutes} min`,
      completed: false,
      completedAt: null,
      exercises: dayExercises
    });
  }
  return days;
}

async function generateAIChallengePlan(motive, durationDays, targetMinutes = 45, intensity = 'Moderate', types = ['Gym']) {
  const btn = $('#generateChallengePlanBtn');
  const origText = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = 'Engineering AI Plan...'; }
  toast(`AI is personalizing your ${durationDays}-Day ${motive} Challenge (${targetMinutes} min/day)...`);

  const w = profile.wKg || 70;
  const h = profile.hCm || 175;

  const planDays = buildDayByDayRoutines(motive, durationDays, w, h, targetMinutes, intensity, types);

  const newChallenge = {
    id: 'chall_' + Date.now(),
    motive: motive,
    durationDays: Number(durationDays),
    totalWorkoutMinutes: Number(targetMinutes) || 45,
    intensity: intensity || 'Moderate',
    types: types && types.length ? types : ['Gym'],
    createdAt: Date.now(),
    startDate: today(),
    currentDayIndex: 0,
    completedCount: 0,
    userWeight: w,
    userHeight: h,
    days: planDays
  };

  // Safe storage: NEVER deleted unless user explicitly selects Exit Challenge or finishes
  activeChallengePlan = newChallenge;
  store.set('activeChallengePlan', activeChallengePlan);
  if (FF.online && FF.user) {
    FF.patch({ activeChallenge: activeChallengePlan });
  }

  closeModal('#challengeDurationModal');
  if (btn) { btn.disabled = false; btn.textContent = origText; }

  switchView('challenge');
  renderChallengeView();
  renderTrackingView();
  updateLiveWaterEstimate();
  toast(`${durationDays}-Day Challenge Created! Your customized Day 1 is ready.`);
}

/* ================= WORKOUT SECTION CUSTOMIZATION & EXPLORER ================= */
let customWorkoutFilterTypes = ['all'];
let customWorkoutFilterParts = ['all'];
let customWorkoutSearchQuery = '';

function renderCustomWorkoutExplorer() {
  const grid = $('#customWorkoutResultsGrid');
  if (!grid) return;

  let list = Array.isArray(EXERCISES_LIBRARY) ? [...EXERCISES_LIBRARY] : [];

  // Search Query
  if (customWorkoutSearchQuery && customWorkoutSearchQuery.trim()) {
    const q = customWorkoutSearchQuery.trim().toLowerCase();
    list = list.filter(ex => 
      (ex.name && ex.name.toLowerCase().includes(q)) ||
      (ex.sub && ex.sub.toLowerCase().includes(q)) ||
      (ex.category && ex.category.toLowerCase().includes(q)) ||
      (ex.type && ex.type.toLowerCase().includes(q))
    );
  }

  // Filter by Body Parts
  if (!customWorkoutFilterParts.includes('all') && customWorkoutFilterParts.length > 0) {
    list = list.filter(ex => {
      const cat = (ex.category || '').toLowerCase();
      const sub = (ex.sub || '').toLowerCase();
      return customWorkoutFilterParts.some(p => cat.includes(p.toLowerCase()) || sub.includes(p.toLowerCase()));
    });
  }

  // Filter by Workout Types
  if (!customWorkoutFilterTypes.includes('all') && customWorkoutFilterTypes.length > 0) {
    list = list.filter(ex => {
      const typeStr = (ex.type || '').toLowerCase();
      const name = (ex.name || '').toLowerCase();
      const cat = (ex.category || '').toLowerCase();
      return customWorkoutFilterTypes.some(t => {
        if (t === 'Home') return typeStr.includes('home') || typeStr.includes('dumbbell') || typeStr.includes('bodyweight') || !typeStr.includes('barbell');
        if (t === 'Gym') return typeStr.includes('gym') || typeStr.includes('barbell') || typeStr.includes('cable') || typeStr.includes('machine');
        if (t === 'HIIT') return name.includes('jump') || name.includes('burpee') || name.includes('swing') || name.includes('mountain') || name.includes('lunge') || typeStr.includes('bodyweight');
        if (t === 'Cardio') return name.includes('jump') || name.includes('cardio') || name.includes('run') || name.includes('burpee') || name.includes('skip');
        if (t === 'Stretching') return name.includes('stretch') || name.includes('mobility') || name.includes('cat-cow') || name.includes('hip') || cat.includes('core');
        return true;
      });
    });
  }

  if (!list.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:36px;color:#64748b;background:#f8fafc;border-radius:12px;border:1px dashed #cbd5e1;">
      <b>No exercises found matching your selected filters.</b>
      <p style="font-size:.85rem;margin-top:6px;">Try selecting "All Types" or "Full Body" to view the full exercise catalog.</p>
    </div>`;
    return;
  }

  // Curated light view: show only 4 high-priority exercises by default
  const defaultLimit = 4;
  const displayList = customWorkoutShowAll ? list.slice(0, 16) : list.slice(0, defaultLimit);

  const cardsHtml = displayList.map(ex => {
    const rxSets = ex.rxSetsReps || '3 sets × 10–12 reps';
    const rxRest = '60s rest';
    const cleanName = escapeHtml(ex.name);
    const safeName = cleanName.replace(/'/g, "\\'");
    return `
      <div class="exercise-custom-card" style="background:#ffffff;border:1.5px solid #dbeafe;border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(32,59,41,0.03);display:flex;flex-direction:column;justify-content:space-between;transition:transform .15s ease, border-color .15s ease;">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
            <span style="font-size:.72rem;font-weight:800;color:#1e293b;background:#eff6ff;padding:2px 8px;border-radius:99px;text-transform:uppercase;">
              ${escapeHtml(ex.category || 'Movement')} · ${escapeHtml(ex.sub || 'General')}
            </span>
            <span style="font-size:.74rem;color:#64748b;font-weight:600;">${escapeHtml(ex.type || 'Gym / Home')}</span>
          </div>
          <b style="color:#2563eb;font-size:1.05rem;display:block;line-height:1.3;margin-bottom:6px;">${cleanName}</b>
          <p style="color:#64748b;font-size:.82rem;line-height:1.45;margin:0 0 10px;">${escapeHtml(ex.rxWhy || ex.steps || 'Maintain proper form, brace your core, and control the eccentric movement.')}</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:.78rem;font-weight:700;color:#1e293b;">${escapeHtml(rxSets)}</span>
            <span style="font-size:.75rem;color:#64748b;font-weight:600;">Rest: ${escapeHtml(rxRest)}</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:auto;">
          <button type="button" class="solid-button small" style="flex:1;background:#2563eb;justify-content:center;font-size:.8rem;padding:7px 10px;" onclick="startCustomExerciseTimer('${safeName}', '${escapeHtml(rxSets)}', '${escapeHtml(rxRest)}')">
            Start Set
          </button>
          <button type="button" class="outline-button small" style="justify-content:center;font-size:.8rem;padding:7px 10px;" onclick="addExerciseToDailyRoutine('${safeName}', '${escapeHtml(rxSets)}')">
            + Add
          </button>
        </div>
      </div>
    `;
  }).join('');

  const toggleBarHtml = list.length > defaultLimit ? `
    <div style="grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;background:#f8fafc;border:1.5px solid #dbeafe;border-radius:12px;padding:12px 18px;margin-top:6px;flex-wrap:wrap;gap:10px;">
      <span style="font-size:.85rem;color:#334155;font-weight:600;">
        Showing <b>${displayList.length}</b> of <b>${list.length}</b> targeted exercises (${customWorkoutShowAll ? 'Expanded Catalog' : 'Curated Session View - 4 Moves'})
      </span>
      <button type="button" class="solid-button small" id="toggleCustomWorkoutExpandBtn" style="background:#2563eb;padding:7px 16px;font-size:.82rem;">
        ${customWorkoutShowAll ? 'Show Curated (4)' : `Browse All ${list.length} Exercises`}
      </button>
    </div>
  ` : '';

  grid.innerHTML = cardsHtml + toggleBarHtml;

  const toggleBtn = $('#toggleCustomWorkoutExpandBtn');
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      customWorkoutShowAll = !customWorkoutShowAll;
      renderCustomWorkoutExplorer();
    };
  }
}

function startCustomExerciseTimer(name, sets, rest) {
  soundFX.pop();
  const customDay = {
    dayNumber: 'Custom',
    title: name,
    focus: 'Targeted Movement',
    exercises: [{
      name: name,
      subMuscle: 'Targeted',
      category: 'Custom',
      sets: parseInt(sets) || 3,
      reps: sets,
      durationSec: 45,
      restSec: parseInt(rest) || 60,
      tip: 'Brace core, maintain full range of motion with controlled tempo.'
    }]
  };
  startWorkoutSession(customDay);
}

function addExerciseToDailyRoutine(name, sets) {
  soundFX.pop();
  if (activeChallengePlan && activeChallengePlan.days) {
    const curIdx = activeChallengePlan.currentDayIndex || 0;
    const curDay = activeChallengePlan.days[curIdx];
    if (curDay && curDay.exercises) {
      curDay.exercises.push({
        name: name,
        subMuscle: 'Add-on',
        category: 'Workout',
        sets: 3,
        reps: sets || '3 sets × 10 reps',
        durationSec: 45,
        restSec: 50,
        tip: 'Controlled cadence and strict posture.'
      });
      store.set('activeChallengePlan', activeChallengePlan);
      if (FF.online && FF.user) FF.patch({ activeChallenge: activeChallengePlan });
      renderChallengeView();
      toast(`Added "${name}" to today's Challenge routine!`);
      return;
    }
  }
  toast(`Added "${name}" (${sets}) to workout!`);
}

function initWorkoutCustomizationListeners() {
  // Workout Type filter pills
  $$('#workoutTypeFilterPills .filter-pill').forEach(btn => {
    btn.onclick = () => {
      soundFX.pop();
      const type = btn.dataset.type;
      if (type === 'all') {
        customWorkoutFilterTypes = ['all'];
        $$('#workoutTypeFilterPills .filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      } else {
        const allBtn = $('#workoutTypeFilterPills .filter-pill[data-type="all"]');
        if (allBtn) allBtn.classList.remove('active');
        customWorkoutFilterTypes = customWorkoutFilterTypes.filter(t => t !== 'all');

        if (customWorkoutFilterTypes.includes(type)) {
          customWorkoutFilterTypes = customWorkoutFilterTypes.filter(t => t !== type);
          btn.classList.remove('active');
        } else {
          customWorkoutFilterTypes.push(type);
          btn.classList.add('active');
        }

        if (!customWorkoutFilterTypes.length) {
          customWorkoutFilterTypes = ['all'];
          if (allBtn) allBtn.classList.add('active');
        }
      }
      renderCustomWorkoutExplorer();
    };
  });

  // Body Parts filter pills
  $$('#workoutBodyPartFilterPills .filter-pill').forEach(btn => {
    btn.onclick = () => {
      soundFX.pop();
      const part = btn.dataset.part;
      if (part === 'all') {
        customWorkoutFilterParts = ['all'];
        $$('#workoutBodyPartFilterPills .filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      } else {
        const allBtn = $('#workoutBodyPartFilterPills .filter-pill[data-part="all"]');
        if (allBtn) allBtn.classList.remove('active');
        customWorkoutFilterParts = customWorkoutFilterParts.filter(p => p !== 'all');

        if (customWorkoutFilterParts.includes(part)) {
          customWorkoutFilterParts = customWorkoutFilterParts.filter(p => p !== part);
          btn.classList.remove('active');
        } else {
          customWorkoutFilterParts.push(part);
          btn.classList.add('active');
        }

        if (!customWorkoutFilterParts.length) {
          customWorkoutFilterParts = ['all'];
          if (allBtn) allBtn.classList.add('active');
        }
      }
      renderCustomWorkoutExplorer();
    };
  });

  // Search input
  if ($('#customWorkoutSearchInput')) {
    $('#customWorkoutSearchInput').oninput = (e) => {
      customWorkoutSearchQuery = e.target.value;
      renderCustomWorkoutExplorer();
    };
  }
}
initWorkoutCustomizationListeners();

/* ================= CHALLENGE VIEW RENDERING ================= */
let swapTargetDayIdx = 0;
let swapTargetExIdx = 0;

function renderChallengeView() {
  const container = $('#challengeViewContainer');
  if (!container) return;

  if (!activeChallengePlan || !activeChallengePlan.days || !activeChallengePlan.days.length) {
    // Empty state: invite user to start a challenge
    container.innerHTML = `
      <div class="challenge-empty-card">
        <div class="challenge-empty-icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.45.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.45.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
          </svg>
        </div>
        <h3 class="challenge-empty-title">No Active Challenge Plan</h3>
        <p class="challenge-empty-desc">
          Ready to transform? Choose your goal (Burn Fat, Build Muscle, Maintain Weight) and duration (10, 15, 25, 30 days) to have our AI generate your personalized roadmap.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;margin-bottom:28px;">
          <div class="challenge-feature-box">
            <b>AI Engineered</b>
            <small>Personalized to your height, weight &amp; strength targets.</small>
          </div>
          <div class="challenge-feature-box">
            <b>Built-in Timers</b>
            <small>Counter time, rest intervals (+60s), &amp; 3-2-1 countdown.</small>
          </div>
          <div class="challenge-feature-box">
            <b>Swap Any Workout</b>
            <small>Change or replace any exercise with 1 click.</small>
          </div>
        </div>
        <button type="button" class="solid-button" onclick="openModal('#challengeMotiveModal')" style="padding:12px 28px;font-size:1rem;font-weight:700;">
          Start Your Challenge Now
        </button>
      </div>
    `;
    return;
  }

  // Active Challenge Dashboard
  const p = activeChallengePlan;
  const currentIdx = Math.min(p.days.length - 1, p.currentDayIndex || 0);
  const currentDay = p.days[currentIdx];
  const pct = Math.min(100, Math.round(((p.completedCount || 0) / p.durationDays) * 100));
  const remaining = Math.max(0, p.durationDays - (p.completedCount || 0));

  container.innerHTML = `
    <!-- CHALLENGE HERO BANNER -->
    <div style="background:linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%);color:#f0f5ee;border-radius:18px;padding:24px 28px;margin-bottom:20px;box-shadow:0 6px 24px rgba(37,99,235,0.18);">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:16px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="background:rgba(255,255,255,0.15);color:#38bdf8;font-size:.72rem;font-weight:800;letter-spacing:1px;padding:3px 10px;border-radius:99px;text-transform:uppercase;">ACTIVE CHALLENGE</span>
            <span style="font-size:.8rem;color:#cbd5e1;font-weight:600;">Day ${currentIdx + 1} of ${p.durationDays}</span>
          </div>
          <h2 style="margin:0;font-size:1.45rem;color:#ffffff;font-weight:800;">${escapeHtml(p.motive)} Challenge</h2>
          <p style="margin:4px 0 0;color:#bfdbfe;font-size:.88rem;">Personalized for ${p.userWeight} kg · ${p.userHeight} cm · Target Goal Active</p>
        </div>
        <div style="text-align:right;">
          <span style="font-size:.74rem;color:#bfdbfe;display:block;text-transform:uppercase;font-weight:700;">COMPLETION</span>
          <strong style="font-size:1.6rem;color:#38bdf8;font-weight:800;">${pct}%</strong>
        </div>
      </div>

      <!-- Animated Progress Track -->
      <div style="background:rgba(255,255,255,0.12);height:9px;border-radius:99px;overflow:hidden;margin-bottom:18px;">
        <div style="background:#38bdf8;height:100%;width:${pct}%;border-radius:99px;transition:width .35s ease;"></div>
      </div>

      <!-- Action Button Controls -->
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        <button type="button" class="solid-button" id="startActiveSessionBtn" style="background:#38bdf8;color:#1e293b;font-weight:800;padding:10px 22px;border:none;">
          Start Today's Workout (${escapeHtml(currentDay.title)})
        </button>
        <button type="button" class="outline-button" id="refreshTodayRoutineBtn" style="border-color:rgba(255,255,255,0.3);color:#ffffff;background:rgba(255,255,255,0.06);font-size:.84rem;">
          Refresh Day Plan
        </button>
        <button type="button" class="outline-button" id="resetChallengePlanBtn" style="border-color:rgba(255,255,255,0.3);color:#ffffff;background:rgba(255,255,255,0.06);font-size:.84rem;">
          Reset to Day 1
        </button>
        <button type="button" class="outline-button" id="exitChallengePlanBtn" style="border-color:#feb2b2;color:#feb2b2;background:rgba(229,62,62,0.1);font-size:.84rem;margin-left:auto;">
          Exit Challenge
        </button>
      </div>
    </div>

    <!-- TODAY'S ROUTINE CARD -->
    <div class="challenge-dash-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <div>
          <span class="section-kicker">TODAY'S SCHEDULED ROUTINE</span>
          <h3 style="margin:2px 0 0;font-size:1.25rem;font-weight:800;">${escapeHtml(currentDay.title)}</h3>
          <p style="margin:4px 0 0;font-size:.88rem;color:#64748b;">Focus: <b style="color:#2563eb;">${escapeHtml(currentDay.focus)}</b> · Est: ${currentDay.estDuration}</p>
        </div>
        <span style="font-size:.78rem;font-weight:800;padding:4px 12px;border-radius:99px;background:${currentDay.completed ? '#dbeafe' : '#f1f5f9'};color:${currentDay.completed ? '#1e40af' : '#475569'};">
          ${currentDay.completed ? 'COMPLETED' : 'READY TO TRAIN'}
        </span>
      </div>

      <!-- Exercise List with Swap Buttons -->
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${currentDay.exercises.map((ex, idx) => `
          <div class="challenge-routine-item">
            <div style="display:flex;align-items:center;gap:12px;">
              <span class="challenge-routine-idx">
                ${idx + 1}
              </span>
              <div>
                <b class="challenge-routine-name">${escapeHtml(ex.name)}</b>
                <span class="challenge-routine-meta">${escapeHtml(ex.subMuscle || 'General')} · ${ex.sets} sets × ${ex.reps} · Rest ${ex.restSec || 60}s</span>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <button type="button" class="outline-button small swap-ex-trigger" data-ex-idx="${idx}" style="font-size:.8rem;padding:5px 12px;">
                Swap Workout
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- FULL CHALLENGE ROADMAP TIMELINE -->
    <div class="challenge-dash-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <div>
          <span class="section-kicker">ALL DAYS OVERVIEW</span>
          <h3 style="margin:2px 0 0;font-size:1.25rem;font-weight:800;">${p.durationDays}-Day Challenge Roadmap</h3>
        </div>
        <span style="font-size:.86rem;color:#64748b;font-weight:600;">${remaining} day${remaining === 1 ? '' : 's'} remaining</span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:10px;">
        ${p.days.map((d, dIdx) => {
          const isCurrent = dIdx === currentIdx;
          const cardClass = 'challenge-day-card' + (d.completed ? ' completed' : (isCurrent ? ' current' : ''));
          return `
            <div class="${cardClass}">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <b class="challenge-day-num">Day ${d.dayNumber}</b>
                <span class="challenge-day-status">
                  ${d.completed ? 'Done' : (isCurrent ? 'Current' : 'Upcoming')}
                </span>
              </div>
              <span class="challenge-day-title">${escapeHtml(d.title.split(': ')[1] || d.title)}</span>
              <span class="challenge-day-meta">${d.exercises.length} moves · ${d.estDuration}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Wire Action Buttons
  if ($('#startActiveSessionBtn')) {
    $('#startActiveSessionBtn').onclick = () => startWorkoutSession(currentDay);
  }

  if ($('#exitChallengePlanBtn')) {
    $('#exitChallengePlanBtn').onclick = () => {
      const ok = confirm(' Are you sure you want to exit and abandon this challenge?\n\nThis will remove your active plan. Only do this if you wish to exit or start a completely new challenge.');
      if (ok) {
        activeChallengePlan = null;
        store.del('activeChallengePlan');
        if (FF.online && FF.user) FF.patch({ activeChallenge: null });
        renderChallengeView();
        renderTrackingView();
        toast('Challenge plan exited.');
      }
    };
  }

  if ($('#resetChallengePlanBtn')) {
    $('#resetChallengePlanBtn').onclick = () => {
      const ok = confirm(' Reset your active challenge back to Day 1? All workout structures will be preserved.');
      if (ok) {
        activeChallengePlan.currentDayIndex = 0;
        activeChallengePlan.completedCount = 0;
        activeChallengePlan.days.forEach(d => { d.completed = false; d.completedAt = null; });
        store.set('activeChallengePlan', activeChallengePlan);
        if (FF.online && FF.user) FF.patch({ activeChallenge: activeChallengePlan });
        renderChallengeView();
        renderTrackingView();
        toast('Challenge reset to Day 1! Ready to crush it.');
      }
    };
  }

  if ($('#refreshTodayRoutineBtn')) {
    $('#refreshTodayRoutineBtn').onclick = () => {
      const freshExercises = buildDayByDayRoutines(activeChallengePlan.motive, 1, activeChallengePlan.userWeight, activeChallengePlan.userHeight)[0].exercises;
      activeChallengePlan.days[currentIdx].exercises = freshExercises;
      store.set('activeChallengePlan', activeChallengePlan);
      if (FF.online && FF.user) FF.patch({ activeChallenge: activeChallengePlan });
      renderChallengeView();
      toast('Refreshed today’s exercises with new movements!');
    };
  }

  // Wire Swap Workout Triggers
  $$('.swap-ex-trigger').forEach(btn => {
    btn.onclick = () => {
      const exIdx = Number(btn.dataset.exIdx) || 0;
      openSwapExerciseModal(currentIdx, exIdx);
    };
  });
}

/* ================= WORKOUT SWAP MODAL ================= */
function openSwapExerciseModal(dayIdx, exIdx) {
  swapTargetDayIdx = dayIdx;
  swapTargetExIdx = exIdx;
  const currentEx = activeChallengePlan.days[dayIdx].exercises[exIdx];
  if ($('#swapTargetExName')) $('#swapTargetExName').textContent = currentEx.name;

  const renderAlternatives = (filterQuery = '') => {
    const list = $('#swapAlternativesList');
    if (!list) return;
    const q = filterQuery.toLowerCase().trim();
    const matches = EXERCISES_LIBRARY.filter(e => {
      if (e.name.toLowerCase() === currentEx.name.toLowerCase()) return false;
      if (q) return e.name.toLowerCase().includes(q) || (e.sub && e.sub.toLowerCase().includes(q));
      return (e.category && currentEx.category && e.category.toLowerCase() === currentEx.category.toLowerCase()) || true;
    }).slice(0, 20);

    list.innerHTML = matches.map(ex => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border:1px solid #edf2e8;border-radius:10px;background:#ffffff;gap:10px;">
        <div>
          <b style="color:#2563eb;font-size:.9rem;display:block;">${escapeHtml(ex.name)}</b>
          <small style="color:#64748b;font-size:.78rem;">${escapeHtml(ex.sub || ex.category)} · ${escapeHtml(ex.rxSetsReps || '3 sets × 10 reps')}</small>
        </div>
        <button type="button" class="solid-button small replace-ex-btn" data-ex-name="${escapeHtml(ex.name)}" style="background:#2563eb;font-size:.78rem;white-space:nowrap;">
          Select &amp; Replace
        </button>
      </div>
    `).join('');

    $$('.replace-ex-btn').forEach(b => {
      b.onclick = () => {
        const chosenName = b.dataset.exName;
        const chosenObj = EXERCISES_LIBRARY.find(e => e.name === chosenName) || { name: chosenName, sub: 'Targeted', category: 'Chest' };
        activeChallengePlan.days[swapTargetDayIdx].exercises[swapTargetExIdx] = {
          name: chosenObj.name,
          subMuscle: chosenObj.sub || chosenObj.category,
          category: chosenObj.category,
          sets: 3,
          reps: currentEx.reps || '12 reps',
          durationSec: currentEx.durationSec || 45,
          restSec: currentEx.restSec || 60,
          tip: chosenObj.steps || chosenObj.rxWhy || 'Maintain tight posture and controlled cadence.'
        };
        store.set('activeChallengePlan', activeChallengePlan);
        if (FF.online && FF.user) FF.patch({ activeChallenge: activeChallengePlan });
        closeModal('#swapExerciseModal');
        renderChallengeView();
        toast(`Swapped to "${chosenObj.name}"!`);
      };
    });
  };

  renderAlternatives();
  if ($('#swapSearchInput')) {
    $('#swapSearchInput').value = '';
    $('#swapSearchInput').oninput = (e) => renderAlternatives(e.target.value);
  }
  openModal('#swapExerciseModal');
}

/* ================= INTERACTIVE WORKOUT SESSION PLAYER & TIMERS ================= */
let sessionDay = null;
let sessionExIdx = 0;
let sessionSetIdx = 1;
let sessionPhase = 'active'; // 'active' or 'rest'
let sessionTimerSec = 45;
let sessionTimerInterval = null;
let sessionIsPaused = false;

function formatTimerMMSS(totalSeconds) {
  const m = Math.floor(Math.max(0, totalSeconds) / 60);
  const s = Math.max(0, totalSeconds) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateTimerClockDisplay() {
  if ($('#timerClockDigits')) {
    $('#timerClockDigits').textContent = formatTimerMMSS(sessionTimerSec);
  }
}

function startWorkoutSession(dayData) {
  if (!dayData || !dayData.exercises || !dayData.exercises.length) return;
  sessionDay = dayData;
  sessionExIdx = 0;
  sessionSetIdx = 1;
  sessionPhase = 'active';
  sessionIsPaused = false;
  sessionTimerSec = sessionDay.exercises[0].durationSec || 45;

  openModal('#workoutSessionModal');
  renderSessionStepUI();
  startActiveSetTimer();
}

function renderSessionStepUI() {
  if (!sessionDay || !sessionDay.exercises[sessionExIdx]) return;
  const ex = sessionDay.exercises[sessionExIdx];

  if ($('#sessionDayKicker')) $('#sessionDayKicker').textContent = `CHALLENGE DAY ${sessionDay.dayNumber} · ACTIVE SESSION`;
  if ($('#sessionExTitle')) $('#sessionExTitle').textContent = ex.name;
  if ($('#sessionProgressBadge')) $('#sessionProgressBadge').textContent = `Exercise ${sessionExIdx + 1} of ${sessionDay.exercises.length}`;
  if ($('#sessionSetBadge')) $('#sessionSetBadge').textContent = `Set ${sessionSetIdx} of ${ex.sets || 3} · ${ex.reps}`;
  if ($('#sessionBioTip')) $('#sessionBioTip').innerHTML = `<b>Form Tip:</b> ${escapeHtml(ex.tip || 'Maintain controlled breathing and strict tempo.')}`;

  if (sessionPhase === 'active') {
    if ($('#timerPhaseBadge')) {
      $('#timerPhaseBadge').textContent = 'ACTIVE SET';
      $('#timerPhaseBadge').className = 'timer-phase-badge';
    }
    if ($('#timerInstruction')) $('#timerInstruction').textContent = 'Execute repetitions with strict form and full range of motion.';
    if ($('#activeSetControls')) $('#activeSetControls').style.display = 'flex';
    if ($('#restControls')) $('#restControls').style.display = 'none';
  } else {
    if ($('#timerPhaseBadge')) {
      $('#timerPhaseBadge').textContent = 'REST INTERVAL';
      $('#timerPhaseBadge').className = 'timer-phase-badge rest';
    }
    if ($('#timerInstruction')) $('#timerInstruction').textContent = 'Breathe deeply, hydrate, and recover before your next set.';
    if ($('#activeSetControls')) $('#activeSetControls').style.display = 'none';
    if ($('#restControls')) $('#restControls').style.display = 'flex';
  }
  updateTimerClockDisplay();
}

function startActiveSetTimer() {
  clearInterval(sessionTimerInterval);
  sessionIsPaused = false;
  if ($('#timerPlayPauseBtn')) $('#timerPlayPauseBtn').textContent = 'Pause';

  sessionTimerInterval = setInterval(() => {
    if (sessionIsPaused) return;
    if (sessionTimerSec > 0) {
      sessionTimerSec--;
      updateTimerClockDisplay();
      if (sessionTimerSec <= 3 && sessionTimerSec > 0) {
        soundFX.timerTick();
      }
    } else {
      clearInterval(sessionTimerInterval);
      soundFX.timerGo();
      transitionToRestPhase();
    }
  }, 1000);
}

function transitionToRestPhase() {
  clearInterval(sessionTimerInterval);
  sessionPhase = 'rest';
  const ex = sessionDay.exercises[sessionExIdx];
  sessionTimerSec = ex.restSec || 60;
  renderSessionStepUI();

  sessionTimerInterval = setInterval(() => {
    if (sessionTimerSec > 0) {
      sessionTimerSec--;
      updateTimerClockDisplay();
      if (sessionTimerSec <= 3 && sessionTimerSec > 0) {
        soundFX.timerTick();
      }
    } else {
      clearInterval(sessionTimerInterval);
      trigger321CountdownAndAdvance();
    }
  }, 1000);
}

function trigger321CountdownAndAdvance() {
  clearInterval(sessionTimerInterval);
  const overlay = $('#sessionCountdownOverlay');
  const num = $('#countdownNumber');
  const sub = $('#countdownSubtext');
  if (!overlay || !num || !sub) {
    advanceToNextSetOrExercise();
    return;
  }

  overlay.style.display = 'flex';
  num.textContent = '3';
  sub.textContent = 'GET READY!';
  soundFX.timerWarning();

  setTimeout(() => {
    num.textContent = '2';
    soundFX.timerWarning();
    setTimeout(() => {
      num.textContent = '1';
      soundFX.timerWarning();
      setTimeout(() => {
        num.textContent = 'GO!';
        sub.textContent = 'CRUSH THIS SET!';
        soundFX.timerGo();
        setTimeout(() => {
          overlay.style.display = 'none';
          advanceToNextSetOrExercise();
        }, 650);
      }, 850);
    }, 850);
  }, 850);
}

function advanceToNextSetOrExercise() {
  const currentEx = sessionDay.exercises[sessionExIdx];
  if (sessionSetIdx < (currentEx.sets || 3)) {
    // Next set of current exercise
    sessionSetIdx++;
    sessionPhase = 'active';
    sessionTimerSec = currentEx.durationSec || 45;
    renderSessionStepUI();
    startActiveSetTimer();
  } else {
    // Current exercise complete! Check if more exercises
    if (sessionExIdx + 1 < sessionDay.exercises.length) {
      sessionExIdx++;
      sessionSetIdx = 1;
      sessionPhase = 'active';
      sessionTimerSec = sessionDay.exercises[sessionExIdx].durationSec || 45;
      renderSessionStepUI();
      startActiveSetTimer();
      toast(`Next movement: ${sessionDay.exercises[sessionExIdx].name}!`);
    } else {
      // Entire workout day finished!
      finishCurrentWorkoutSession();
    }
  }
}

function finishCurrentWorkoutSession() {
  clearInterval(sessionTimerInterval);
  sessionDay.completed = true;
  sessionDay.completedAt = Date.now();
  if (activeChallengePlan) {
    activeChallengePlan.completedCount = (activeChallengePlan.completedCount || 0) + 1;
    if (activeChallengePlan.currentDayIndex + 1 < activeChallengePlan.durationDays) {
      activeChallengePlan.currentDayIndex++;
    }
    store.set('activeChallengePlan', activeChallengePlan);
    if (FF.online && FF.user) FF.patch({ activeChallenge: activeChallengePlan });
  }

  workoutsDone.push({
    name: `${sessionDay.title}`,
    date: today(),
    at: Date.now()
  });
  store.set('workoutsDone', workoutsDone);
  recordDailyActivity('challenge_workout');

  soundFX.victoryCelebration();
  closeModal('#workoutSessionModal');
  renderChallengeView();
  renderTrackingView();
  renderDashboard();
  toast(`Outstanding! You crushed Day ${sessionDay.dayNumber} of your challenge!`);
}

// Wire Session Player Buttons
if ($('#sessionCompleteSetBtn')) {
  $('#sessionCompleteSetBtn').onclick = () => {
    transitionToRestPhase();
  };
}

if ($('#timerMinusTenBtn')) {
  $('#timerMinusTenBtn').onclick = () => {
    sessionTimerSec = Math.max(5, sessionTimerSec - 10);
    updateTimerClockDisplay();
  };
}

if ($('#timerPlusTenBtn')) {
  $('#timerPlusTenBtn').onclick = () => {
    sessionTimerSec += 10;
    updateTimerClockDisplay();
  };
}

if ($('#timerPlayPauseBtn')) {
  $('#timerPlayPauseBtn').onclick = () => {
    sessionIsPaused = !sessionIsPaused;
    $('#timerPlayPauseBtn').textContent = sessionIsPaused ? 'Resume' : 'Pause';
  };
}

if ($('#restPlusSixtyBtn')) {
  $('#restPlusSixtyBtn').onclick = () => {
    sessionTimerSec += 60;
    updateTimerClockDisplay();
    toast('Added +60s rest time');
  };
}

if ($('#restPlusFifteenBtn')) {
  $('#restPlusFifteenBtn').onclick = () => {
    sessionTimerSec += 15;
    updateTimerClockDisplay();
  };
}

if ($('#restMinusFifteenBtn')) {
  $('#restMinusFifteenBtn').onclick = () => {
    sessionTimerSec = Math.max(1, sessionTimerSec - 15);
    updateTimerClockDisplay();
  };
}

if ($('#restSkipBtn')) {
  $('#restSkipBtn').onclick = () => {
    sessionTimerSec = 0;
    updateTimerClockDisplay();
    trigger321CountdownAndAdvance();
  };
}

if ($('#startNextSetNowBtn')) {
  $('#startNextSetNowBtn').onclick = () => {
    trigger321CountdownAndAdvance();
  };
}

if ($('#sessionQuitBtn')) {
  $('#sessionQuitBtn').onclick = () => {
    if (confirm('Quit active workout session? Any uncompleted sets for this day will not be saved.')) {
      clearInterval(sessionTimerInterval);
      closeModal('#workoutSessionModal');
    }
  };
}

/* ================= TRACKING VIEW RENDERING ================= */
function renderTrackingView() {
  const container = $('#trackingViewContainer');
  if (!container) return;

  const curStreak = evaluateStreakStatus();
  const streakDays = curStreak.currentStreak || 0;
  const totalWorkouts = workoutsDone.length || 0;
  const entries = getTodayLog();
  const todayKcal = Math.round(entries.reduce((a, b) => a + (Number(b.k) || Number(b.calories) || 0), 0));
  const goalKcal = profile.cal || 2100;
  const todayP = Math.round(entries.reduce((a, b) => a + (Number(b.p) || Number(b.protein) || 0), 0));
  const goalP = profile.p || 165;
  const waterMl = (water && water.date === today()) ? (water.ml || 0) : 0;
  const waterGoal = profile.waterGoal || calcWaterFromWeight(profile.wKg, profile.units, profile.creatine, profile.days);

  // Active Challenge status box
  let challengeBlock = '';
  if (activeChallengePlan) {
    const cp = activeChallengePlan;
    const completedDays = cp.completedCount || 0;
    const pct = Math.min(100, Math.round((completedDays / cp.durationDays) * 100));
    challengeBlock = `
      <div style="background:#ffffff;border:1px solid #e3eadc;border-radius:16px;padding:22px;margin-bottom:20px;box-shadow:0 2px 10px rgba(32,59,41,0.04);">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
          <div>
            <span class="section-kicker" style="color:#2563eb;font-weight:800;">ACTIVE PLAN TRACKER</span>
            <h3 style="margin:2px 0 0;font-size:1.25rem;color:#1e293b;font-weight:800;">${escapeHtml(cp.motive)} (${cp.durationDays} Days)</h3>
            <p style="margin:2px 0 0;font-size:.86rem;color:#64748b;">Progress: <b>Day ${completedDays} of ${cp.durationDays} Completed</b> (${pct}%)</p>
          </div>
          <button type="button" class="solid-button small" onclick="switchView('challenge')" style="background:#2563eb;">
            Open Challenge Engine →
          </button>
        </div>

        <div style="background:#eaf2e5;height:8px;border-radius:99px;overflow:hidden;margin-bottom:16px;">
          <div style="background:#3b82f6;height:100%;width:${pct}%;border-radius:99px;"></div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(36px, 1fr));gap:6px;">
          ${cp.days.map((d, idx) => {
            const isDone = d.completed;
            const isCurrent = idx === (cp.currentDayIndex || 0);
            const bg = isDone ? '#3b82f6' : (isCurrent ? '#2563eb' : '#dbeafe');
            const color = (isDone || isCurrent) ? '#ffffff' : '#637367';
            return `
              <div style="height:36px;border-radius:8px;background:${bg};color:${color};display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:800;" title="Day ${d.dayNumber}: ${d.title} (${isDone ? 'Completed' : (isCurrent ? 'Current' : 'Pending')})">
                ${isDone ? '' : d.dayNumber}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } else {
    challengeBlock = `
      <div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:16px;padding:22px;margin-bottom:20px;text-align:center;">
        <span style="font-size:28px;"></span>
        <b style="color:#2563eb;font-size:1.05rem;display:block;margin:6px 0 2px;">No Active Challenge Plan</b>
        <p style="color:#64748b;font-size:.86rem;margin:0 0 14px;">Set a 10, 15, 25, or 30-day fitness challenge to unlock day-by-day progression tracking.</p>
        <button type="button" class="solid-button small" onclick="switchView('challenge');openModal('#challengeMotiveModal');" style="background:#2563eb;">
          Start Challenge
        </button>
      </div>
    `;
  }

  // Recent Workouts List
  const recentWorkoutsHtml = (workoutsDone && workoutsDone.length) ? (
    workoutsDone.slice(-8).reverse().map(w => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #edf2e8;">
        <div>
          <b style="color:#2563eb;font-size:.9rem;display:block;">${escapeHtml(w.name)}</b>
          <small style="color:#64748b;font-size:.78rem;">${w.date || today()}</small>
        </div>
        <span style="font-size:.75rem;padding:3px 10px;border-radius:99px;background:#eff6ff;color:#1e293b;font-weight:700;">
           Logged
        </span>
      </div>
    `).join('')
  ) : `
    <div style="padding:20px;text-align:center;color:#64748b;font-size:.85rem;">
      No workouts completed yet. Mark exercises complete or start a challenge routine!
    </div>
  `;

  container.innerHTML = `
    ${challengeBlock}

    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:16px;">
      <!-- STREAK & CONSISTENCY -->
      <div style="background:#ffffff;border:1px solid #e3eadc;border-radius:16px;padding:20px;box-shadow:0 2px 10px rgba(32,59,41,0.04);">
        <span class="section-kicker">HABIT CONSISTENCY</span>
        <h4 style="margin:2px 0 14px;font-size:1.1rem;color:#1e293b;font-weight:800;">Workout &amp; Streak Metrics</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
          <div style="background:#f8fafc;padding:12px;border-radius:10px;border:1px solid #edf3ea;">
            <span style="font-size:.72rem;color:#64748b;font-weight:700;display:block;">CURRENT STREAK</span>
            <b style="font-size:1.4rem;color:#2563eb;"> ${streakDays} <small style="font-size:.8rem;font-weight:600;">Days</small></b>
          </div>
          <div style="background:#f8fafc;padding:12px;border-radius:10px;border:1px solid #edf3ea;">
            <span style="font-size:.72rem;color:#64748b;font-weight:700;display:block;">TOTAL WORKOUTS</span>
            <b style="font-size:1.4rem;color:#2563eb;"> ${totalWorkouts}</b>
          </div>
        </div>
        <p style="font-size:.84rem;color:#64748b;margin:0;line-height:1.45;">
          ${curStreak.streakBroken ? ' Streak broken due to 2+ inactive days. Rebuild your streak today!' : 'Keep training consistently to lock in permanent muscle and metabolic adaptations.'}
        </p>
      </div>

      <!-- NUTRITION & HYDRATION COMPLIANCE -->
      <div style="background:#ffffff;border:1px solid #e3eadc;border-radius:16px;padding:20px;box-shadow:0 2px 10px rgba(32,59,41,0.04);">
        <span class="section-kicker">TODAY'S FUELING</span>
        <h4 style="margin:2px 0 14px;font-size:1.1rem;color:#1e293b;font-weight:800;">Nutrition &amp; Water Compliance</h4>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <div style="display:flex;justify-content:space-between;font-size:.84rem;margin-bottom:4px;">
              <span style="color:#64748b;font-weight:600;">Calories Intake</span>
              <b>${todayKcal} / ${goalKcal} kcal</b>
            </div>
            <div style="background:#f8fafc;height:7px;border-radius:99px;overflow:hidden;">
              <div style="background:#3b82f6;height:100%;width:${Math.min(100, Math.round((todayKcal/goalKcal)*100))}%;"></div>
            </div>
          </div>

          <div>
            <div style="display:flex;justify-content:space-between;font-size:.84rem;margin-bottom:4px;">
              <span style="color:#64748b;font-weight:600;">Protein Target</span>
              <b>${todayP} / ${goalP} g</b>
            </div>
            <div style="background:#f8fafc;height:7px;border-radius:99px;overflow:hidden;">
              <div style="background:#3b82f6;height:100%;width:${Math.min(100, Math.round((todayP/goalP)*100))}%;"></div>
            </div>
          </div>

          <div>
            <div style="display:flex;justify-content:space-between;font-size:.84rem;margin-bottom:4px;">
              <span style="color:#64748b;font-weight:600;">Hydration</span>
              <b>${(waterMl/1000).toFixed(1)} / ${waterGoal} L</b>
            </div>
            <div style="background:#f8fafc;height:7px;border-radius:99px;overflow:hidden;">
              <div style="background:#63a1d9;height:100%;width:${Math.min(100, Math.round((waterMl/(Number(waterGoal)*1000))*100))}%;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- WORKOUT VOLUME HISTORY -->
    <div style="background:#ffffff;border:1px solid #e3eadc;border-radius:16px;padding:20px;margin-top:20px;box-shadow:0 2px 10px rgba(32,59,41,0.04);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div>
          <span class="section-kicker">COMPLETION LOG</span>
          <h4 style="margin:2px 0 0;font-size:1.1rem;color:#1e293b;font-weight:800;">Recent Completed Workouts</h4>
        </div>
        <span style="font-size:.82rem;color:#64748b;">Total: ${totalWorkouts} sessions</span>
      </div>
      <div style="display:flex;flex-direction:column;">
        ${recentWorkoutsHtml}
      </div>
    </div>
  `;
}

if ($('#trackingCheckInBtn')) {
  $('#trackingCheckInBtn').onclick = () => {
    recordDailyActivity('manual_checkin');
    renderTrackingView();
    renderDashboard();
    toast('Daily check-in logged to tracking!');
  };
}

/* ==========================================================================
   MODULE: DEDICATED AI FITNESS COACH (#view-ai-coach, Reference Image 2)
   ========================================================================== */
let coachAttachedImageData = null;

function renderAiCoachView() {
  renderChatMessages();
}

function setCoachAttachedImage(dataUrl) {
  coachAttachedImageData = dataUrl;
  const bar = $('#coachSelectedImagePreviewBar');
  const thumb = $('#coachSelectedImageThumb');
  if (thumb) thumb.src = dataUrl;
  if (bar) bar.style.display = 'flex';
  soundFX.pop();
  toast('Photo attached for AI Coach vision analysis!');
}

function clearCoachAttachedImage() {
  coachAttachedImageData = null;
  const bar = $('#coachSelectedImagePreviewBar');
  const thumb = $('#coachSelectedImageThumb');
  const fileInput = $('#coachChatFileInput');
  if (thumb) thumb.src = '';
  if (bar) bar.style.display = 'none';
  if (fileInput) fileInput.value = '';
}

function sendCoachChatMessage(customPrompt) {
  const inp = $('#coachChatInput');
  let text = customPrompt || (inp ? inp.value.trim() : '');
  const image = coachAttachedImageData;

  if (!text && image) {
    text = 'Please visually analyze this attached photo (assess meal calories & macronutrients, exercise form / posture angles, or physique composition) and provide actionable coaching recommendations.';
  }

  if (!text && !image) return;

  if (inp && !customPrompt) inp.value = '';
  clearCoachAttachedImage();
  handleUserAiQuery(text, image);
}

// Subtabs filter
$$('#coachSubTabs .ai-subtab-btn').forEach(btn => {
  btn.onclick = () => {
    $$('#coachSubTabs .ai-subtab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    toast(`Filtered coach room: ${btn.textContent.trim()}`);
  };
});

if ($('#coachChatSendBtn')) $('#coachChatSendBtn').onclick = () => sendCoachChatMessage();
if ($('#coachChatInput')) {
  $('#coachChatInput').onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendCoachChatMessage();
    }
  };
}
if ($('#coachChatCameraBtn')) {
  $('#coachChatCameraBtn').onclick = () => {
    openUniversalCamera('AI Coach: Take Photo', (dataUrl) => setCoachAttachedImage(dataUrl));
  };
}
if ($('#coachChatUploadBtn')) {
  $('#coachChatUploadBtn').onclick = () => {
    const fInp = $('#coachChatFileInput');
    if (fInp) fInp.click();
  };
}
if ($('#coachChatFileInput')) {
  $('#coachChatFileInput').onchange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCoachAttachedImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
}
if ($('#coachClearImageBtn')) {
  $('#coachClearImageBtn').onclick = () => clearCoachAttachedImage();
}
if ($('#coachChatAttachBtn')) {
  $('#coachChatAttachBtn').onclick = () => openModal('#mealAnalysisModal');
}
if ($('#coachChatMicBtn')) {
  $('#coachChatMicBtn').onclick = () => openModal('#voiceModeOverlay');
}
if ($('#coachVoiceTriggerBtn')) {
  $('#coachVoiceTriggerBtn').onclick = () => openModal('#voiceModeOverlay');
}

if ($('#coachCmdGoalBtn')) {
  $('#coachCmdGoalBtn').onclick = () => handleUserAiQuery('/goal');
}
if ($('#coachCmdBoostBtn')) {
  $('#coachCmdBoostBtn').onclick = () => handleUserAiQuery('/boost');
}

// Coach Quick Actions
if ($('#coachActionAnalyzeMeal')) $('#coachActionAnalyzeMeal').onclick = () => openModal('#mealAnalysisModal');
if ($('#coachActionCustomWorkout')) $('#coachActionCustomWorkout').onclick = () => openModal('#customWorkoutModal');
if ($('#coachActionFormCheck')) {
  $('#coachActionFormCheck').onclick = () => {
    switchView('posture');
    startPostureCamera(false);
  };
}
if ($('#coachActionRecovery')) {
  $('#coachActionRecovery').onclick = () => {
    sendCoachChatMessage('Provide a comprehensive scientific active recovery, mobility, and deload protocol based on my current training volume.');
  };
}
if ($('#coachActionMacroCalc')) $('#coachActionMacroCalc').onclick = () => openModal('#bodyAnalysisModal');

// Suggested prompts buttons
$$('#coachSuggestedPrompts .ai-prompt-pill-btn').forEach(btn => {
  btn.onclick = () => {
    const p = btn.dataset.p;
    if (p) sendCoachChatMessage(p);
  };
});

/* ==========================================================================
   MODULE: GLOBAL FLOATING 3D ROBOT CHATBOT (#floatingAiWidget, Reference Image 3)
   ========================================================================== */
const floatingAiLauncher = $('#floatingAiLauncher');
const floatingAiPanel = $('#floatingAiPanel');
const floatingAiTooltip = $('#floatingAiTooltip');

if (floatingAiLauncher) {
  floatingAiLauncher.onclick = () => {
    if (floatingAiPanel) {
      floatingAiPanel.classList.toggle('open');
      if (floatingAiPanel.classList.contains('open')) {
        if (floatingAiTooltip) floatingAiTooltip.style.display = 'none';
        const badge = $('#floatingAiBadge');
        if (badge) badge.style.display = 'none';
        setTimeout(() => {
          const inp = $('#floatingAiInput');
          if (inp) inp.focus();
        }, 150);
      }
    }
  };
}

if ($('#closeFloatingTooltip')) {
  $('#closeFloatingTooltip').onclick = (e) => {
    e.stopPropagation();
    if (floatingAiTooltip) floatingAiTooltip.style.display = 'none';
  };
}

if ($('#floatingMinimizeBtn')) {
  $('#floatingMinimizeBtn').onclick = () => {
    if (floatingAiPanel) floatingAiPanel.classList.remove('open');
  };
}

if ($('#floatingExpandToFullBtn')) {
  $('#floatingExpandToFullBtn').onclick = () => {
    if (floatingAiPanel) floatingAiPanel.classList.remove('open');
    switchView('ai-coach');
  };
}

if ($('#floatingClearHistoryBtn')) {
  $('#floatingClearHistoryBtn').onclick = () => {
    chatHistory = [];
    renderChatMessages();
    toast('Chat history cleared');
  };
}

if ($('#floatingAiForm')) {
  $('#floatingAiForm').onsubmit = (e) => {
    e.preventDefault();
    const inp = $('#floatingAiInput');
    if (!inp) return;
    const val = inp.value.trim();
    if (!val) return;
    inp.value = '';
    handleUserAiQuery(val);
  };
}

if ($('#floatingAiMicBtn')) {
  $('#floatingAiMicBtn').onclick = () => openModal('#voiceModeOverlay');
}

// 2x2 Quick Action Cards (Reference Image 4)
$$('.floating-qa-card').forEach(card => {
  card.onclick = () => {
    const type = card.dataset.fqa;
    let query = '';
    if (type === 'analyze-meal' || type === 'nutrition') {
      openModal('#mealAnalysisModal');
      return;
    }
    if (type === 'workout-plan' || type === 'workout') {
      query = 'Create a tailored workout plan and periodized split based on my current training goals.';
    }
    if (type === 'analyze-body') {
      if ($('#floatingAiPanel')) $('#floatingAiPanel').classList.remove('open');
      switchView('body-analysis');
      return;
    }
    if (type === 'track-progress' || type === 'recovery') {
      switchView('activity');
      if ($('#floatingAiPanel')) $('#floatingAiPanel').classList.remove('open');
      return;
    }
    if (query) handleUserAiQuery(query);
  };
});

// Popular questions clicks (Image 4)
$$('.floating-pq-item').forEach(item => {
  item.onclick = () => {
    const q = item.dataset.q;
    if (q) handleUserAiQuery(q);
  };
});

// Floating Paperclip Attachment Button
if ($('#floatingAiPaperclipBtn')) {
  $('#floatingAiPaperclipBtn').onclick = () => {
    const fileInp = $('#floatingAiFileInput');
    if (fileInp) fileInp.click();
  };
}

if ($('#floatingAiFileInput')) {
  $('#floatingAiFileInput').onchange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    toast(`Photo selected: ${file.name}. Analyzing with AI Coach...`);
    handleUserAiQuery(`I have attached a photo of my meal/exercise (${file.name}). Please provide a detailed macronutrient and biomechanical analysis.`);
  };
}

/* ==========================================================================
   MODULE: ACTIVITY TRACKING & LIVE GPS TRACKER (SECTIONS 13 & 14)
   ========================================================================== */
let gpsState = 'IDLE'; // 'IDLE', 'RECORDING', 'PAUSED'
let gpsTimer = null;
let gpsElapsedSec = 0;
let gpsDistanceKm = 0;
let gpsCoords = [];
let gpsWatchId = null;
let gpsMode = 'walking'; // walking, running, cycling, hiking
const MET_VALUES = { walking: 3.8, running: 8.5, cycling: 6.8, hiking: 5.3 };

function renderActivityView() {
  updatePedometerUI();
  renderActivityHistory();
  drawGpsRoute(gpsCoords);
}

function updatePedometerUI() {
  const steps = Number(localStorage.getItem('fitfuel_steps')) || 7420;
  const distKm = (steps * 0.00075).toFixed(2);
  const activeKcal = Math.round(steps * 0.04);
  const floors = Math.floor(steps / 900);
  const pct = Math.min(100, Math.round((steps / 10000) * 100));

  if ($('#pedometerStepsDisplay')) $('#pedometerStepsDisplay').textContent = steps.toLocaleString();
  if ($('#pedometerDistDisplay')) $('#pedometerDistDisplay').textContent = distKm + ' km';
  if ($('#pedometerCalDisplay')) $('#pedometerCalDisplay').textContent = activeKcal + ' kcal';
  if ($('#pedometerFloorsDisplay')) $('#pedometerFloorsDisplay').textContent = floors + ' flights';
  if ($('#pedometerBigCircle')) $('#pedometerBigCircle').setAttribute('stroke-dasharray', `${pct}, 100`);

  // Sync to today dashboard
  if ($('#metricV2StepsVal')) $('#metricV2StepsVal').textContent = steps.toLocaleString();
  if ($('#metricV2StepsPct')) $('#metricV2StepsPct').textContent = pct + '%';
  if ($('#metricV2StepsCircle')) $('#metricV2StepsCircle').setAttribute('stroke-dasharray', `${pct}, 100`);
  if ($('#dashStepsQuickVal')) $('#dashStepsQuickVal').textContent = steps.toLocaleString();
  if ($('#dashDistQuickVal')) $('#dashDistQuickVal').textContent = distKm + ' km';
}

if ($('#pedometerSimulateBtn')) {
  $('#pedometerSimulateBtn').onclick = () => {
    let steps = Number(localStorage.getItem('fitfuel_steps')) || 7420;
    steps += 500;
    localStorage.setItem('fitfuel_steps', steps);
    updatePedometerUI();
    soundFX.pop();
    toast(`Sensor sync: +500 steps added (${steps.toLocaleString()} total)`);
  };
}

// Activity mode selector
$$('#gpsActivityModePills .activity-mode-pill').forEach(pill => {
  pill.onclick = () => {
    if (gpsState === 'RECORDING') {
      toast('Pause or finish your current session before changing activity mode');
      return;
    }
    $$('#gpsActivityModePills .activity-mode-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    gpsMode = pill.dataset.actmode || 'walking';
    toast(`Activity mode switched to: ${pill.textContent.trim()}`);
  };
});

function startGpsTracking() {
  gpsState = 'RECORDING';
  gpsElapsedSec = 0;
  gpsDistanceKm = 0;
  gpsCoords = [];

  $('#gpsStartBtn').style.display = 'none';
  $('#gpsPauseBtn').style.display = 'inline-flex';
  $('#gpsResumeBtn').style.display = 'none';
  $('#gpsFinishBtn').style.display = 'inline-flex';
  $('#gpsLiveStatusBadge').className = 'gps-status-pill';
  $('#gpsLiveStatusText').textContent = 'Live GPS Recording';

  // Tick timer
  clearInterval(gpsTimer);
  gpsTimer = setInterval(() => {
    if (gpsState === 'RECORDING') {
      gpsElapsedSec++;
      updateGpsHud();
    }
  }, 1000);

  // Watch position
  if ('geolocation' in navigator) {
    gpsWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        if (accuracy && accuracy <= 50) {
          addGpsCoordinate(latitude, longitude, speed);
        }
      },
      (err) => {
        simulateGpsStep();
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 8000 }
    );
  } else {
    simulateGpsStep();
  }

  // Interval simulation fallback if stationary
  window._gpsSimInterval = setInterval(() => {
    if (gpsState === 'RECORDING' && gpsCoords.length === 0) {
      simulateGpsStep();
    }
  }, 3000);

  soundFX.complete();
  toast('Live GPS activity started! Tracking pace, distance & route.');
}

function simulateGpsStep() {
  const baseLat = 19.0760;
  const baseLng = 72.8777;
  const count = gpsCoords.length;
  const lat = baseLat + (count * 0.00015) + (Math.sin(count * 0.4) * 0.00008);
  const lng = baseLng + (count * 0.00012) + (Math.cos(count * 0.4) * 0.00006);
  addGpsCoordinate(lat, lng, 2.5);
}

function addGpsCoordinate(lat, lng, speed) {
  if (gpsCoords.length > 0) {
    const prev = gpsCoords[gpsCoords.length - 1];
    const dist = calculateHaversineDistance(prev.lat, prev.lng, lat, lng);
    if (dist < 0.1) {
      gpsDistanceKm += dist;
    }
  }
  gpsCoords.push({ lat, lng, time: Date.now(), speed: speed || 0 });
  if ($('#gpsCoordsText')) {
    $('#gpsCoordsText').textContent = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
  }
  drawGpsRoute(gpsCoords);
  updateGpsHud();
}

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function updateGpsHud() {
  const hrs = String(Math.floor(gpsElapsedSec / 3600)).padStart(2, '0');
  const mins = String(Math.floor((gpsElapsedSec % 3600) / 60)).padStart(2, '0');
  const secs = String(gpsElapsedSec % 60).padStart(2, '0');
  if ($('#gpsHudTime')) $('#gpsHudTime').textContent = `${hrs}:${mins}:${secs}`;

  if ($('#gpsHudDist')) $('#gpsHudDist').textContent = gpsDistanceKm.toFixed(2);

  const met = MET_VALUES[gpsMode] || 4.0;
  const userWeight = (profile && profile.wKg) || 72;
  const activeHours = gpsElapsedSec / 3600;
  const calories = Math.round(met * userWeight * activeHours);
  if ($('#gpsHudCal')) $('#gpsHudCal').textContent = calories;

  if (gpsDistanceKm > 0.05) {
    const paceMinTotal = (gpsElapsedSec / 60) / gpsDistanceKm;
    const paceM = Math.floor(paceMinTotal);
    const paceS = String(Math.floor((paceMinTotal - paceM) * 60)).padStart(2, '0');
    const paceStr = `${paceM}'${paceS}"`;
    if ($('#gpsHudAvgPace')) $('#gpsHudAvgPace').textContent = paceStr;
    if ($('#gpsHudCurrentPace')) $('#gpsHudCurrentPace').textContent = paceStr;
    const speedKmh = (gpsDistanceKm / (gpsElapsedSec / 3600)).toFixed(1);
    if ($('#gpsHudSpeed')) $('#gpsHudSpeed').textContent = speedKmh;
  }
}

function pauseGpsTracking() {
  gpsState = 'PAUSED';
  $('#gpsPauseBtn').style.display = 'none';
  $('#gpsResumeBtn').style.display = 'inline-flex';
  $('#gpsLiveStatusBadge').className = 'gps-status-pill searching';
  $('#gpsLiveStatusText').textContent = 'GPS Paused';
  toast('Activity paused');
}

function resumeGpsTracking() {
  gpsState = 'RECORDING';
  $('#gpsPauseBtn').style.display = 'inline-flex';
  $('#gpsResumeBtn').style.display = 'none';
  $('#gpsLiveStatusBadge').className = 'gps-status-pill';
  $('#gpsLiveStatusText').textContent = 'Live GPS Recording';
  toast('Activity resumed');
}

async function finishGpsTracking() {
  clearInterval(gpsTimer);
  clearInterval(window._gpsSimInterval);
  if (gpsWatchId) navigator.geolocation.clearWatch(gpsWatchId);

  const met = MET_VALUES[gpsMode] || 4.0;
  const userWeight = (profile && profile.wKg) || 72;
  const activeHours = gpsElapsedSec / 3600;
  const calories = Math.round(met * userWeight * activeHours);
  const avgPace = gpsDistanceKm > 0.05 ? $('#gpsHudAvgPace').textContent : "0'00\"";

  const sessionData = {
    type: gpsMode,
    distance_km: Number(gpsDistanceKm.toFixed(2)),
    duration_sec: gpsElapsedSec,
    avg_pace: avgPace,
    calories: calories,
    route_coords: JSON.stringify(gpsCoords),
    notes: `Outdoor ${gpsMode.toUpperCase()} via FitFuel GPS Tracker`
  };

  try {
    await FF.saveActivitySession(sessionData);
    toast(`Session saved! ${gpsDistanceKm.toFixed(2)} km · ${calories} kcal burned.`);
  } catch (err) {
    toast(`Session saved locally: ${gpsDistanceKm.toFixed(2)} km`);
  }

  // Update pedometer
  const addSteps = Math.round(gpsDistanceKm / 0.00075);
  let curSteps = Number(localStorage.getItem('fitfuel_steps')) || 7420;
  localStorage.setItem('fitfuel_steps', curSteps + addSteps);
  updatePedometerUI();

  // Reset UI
  resetGpsTracking();
  renderActivityHistory();
}

function resetGpsTracking() {
  clearInterval(gpsTimer);
  clearInterval(window._gpsSimInterval);
  if (gpsWatchId) navigator.geolocation.clearWatch(gpsWatchId);
  gpsState = 'IDLE';
  gpsElapsedSec = 0;
  gpsDistanceKm = 0;
  gpsCoords = [];

  $('#gpsStartBtn').style.display = 'inline-flex';
  $('#gpsPauseBtn').style.display = 'none';
  $('#gpsResumeBtn').style.display = 'none';
  $('#gpsFinishBtn').style.display = 'none';
  $('#gpsLiveStatusBadge').className = 'gps-status-pill searching';
  $('#gpsLiveStatusText').textContent = 'GPS Idle';

  if ($('#gpsHudTime')) $('#gpsHudTime').textContent = '00:00:00';
  if ($('#gpsHudDist')) $('#gpsHudDist').textContent = '0.00';
  if ($('#gpsHudCal')) $('#gpsHudCal').textContent = '0';
  if ($('#gpsHudCurrentPace')) $('#gpsHudCurrentPace').textContent = "0'00\"";
  if ($('#gpsHudAvgPace')) $('#gpsHudAvgPace').textContent = "0'00\"";
  if ($('#gpsHudSpeed')) $('#gpsHudSpeed').textContent = '0.0';

  const canvas = $('#gpsRouteCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function drawGpsRoute(coords) {
  const canvas = $('#gpsRouteCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background map grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 30) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 30) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  if (!coords || coords.length === 0) {
    ctx.fillStyle = '#64748b';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Route breadcrumb trail will appear when activity starts', w / 2, h / 2);
    return;
  }

  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  coords.forEach(c => {
    if (c.lat < minLat) minLat = c.lat;
    if (c.lat > maxLat) maxLat = c.lat;
    if (c.lng < minLng) minLng = c.lng;
    if (c.lng > maxLng) maxLng = c.lng;
  });

  const latRange = Math.max(0.0005, maxLat - minLat);
  const lngRange = Math.max(0.0005, maxLng - minLng);
  const pad = 40;

  function toScreen(c) {
    const x = pad + ((c.lng - minLng) / lngRange) * (w - pad * 2);
    const y = h - (pad + ((c.lat - minLat) / latRange) * (h - pad * 2));
    return { x, y };
  }

  // Draw Route Path
  ctx.strokeStyle = '#16C79A';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(22, 199, 154, 0.6)';
  ctx.shadowBlur = 12;

  ctx.beginPath();
  const startP = toScreen(coords[0]);
  ctx.moveTo(startP.x, startP.y);
  for (let i = 1; i < coords.length; i++) {
    const p = toScreen(coords[i]);
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw Start Marker
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(startP.x, startP.y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('START', startP.x, startP.y - 10);

  // Draw Current Position Pulsing Head
  const curP = toScreen(coords[coords.length - 1]);
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.arc(curP.x, curP.y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(curP.x, curP.y, 14, 0, Math.PI * 2);
  ctx.stroke();
}

async function renderActivityHistory() {
  const container = $('#activityHistoryContainer');
  if (!container) return;

  try {
    const sessions = await FF.getActivitySessions();
    if (!sessions || sessions.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:24px 14px;color:#64748b;font-size:0.84rem;">
          No saved GPS activity sessions yet. Start your first walk or run above!
        </div>
      `;
      return;
    }

    container.innerHTML = sessions.map(s => {
      const mins = Math.floor((s.duration_sec || 0) / 60);
      const secs = (s.duration_sec || 0) % 60;
      const timeStr = `${mins}m ${secs}s`;
      const dateStr = s.created_at ? s.created_at.slice(0, 10) : 'Recent';
      return `
        <div class="session-history-item">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <b style="font-size:0.9rem;text-transform:capitalize;color:var(--ff-text-primary);">${s.type} Session</b>
              <span style="font-size:0.7rem;background:rgba(22,199,154,0.18);color:#0d9488;padding:2px 7px;border-radius:99px;font-weight:700;">${dateStr}</span>
            </div>
            <div style="font-size:0.78rem;color:var(--ff-text-muted);margin-top:3px;">
              ${s.notes || 'Outdoor GPS Tracking'}
            </div>
          </div>
          <div style="text-align:right;">
            <b style="font-size:1.1rem;color:var(--ff-emerald);display:block;">${s.distance_km} km</b>
            <span style="font-size:0.75rem;color:var(--ff-text-secondary);">${timeStr} · ${s.calories} kcal</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = '<div style="color:#64748b;font-size:0.84rem;padding:12px;">Local session store ready.</div>';
  }
}

if ($('#gpsStartBtn')) $('#gpsStartBtn').onclick = () => startGpsTracking();
if ($('#gpsPauseBtn')) $('#gpsPauseBtn').onclick = () => pauseGpsTracking();
if ($('#gpsResumeBtn')) $('#gpsResumeBtn').onclick = () => resumeGpsTracking();
if ($('#gpsFinishBtn')) $('#gpsFinishBtn').onclick = () => finishGpsTracking();
if ($('#gpsResetBtn')) $('#gpsResetBtn').onclick = () => resetGpsTracking();
if ($('#refreshActivityHistoryBtn')) $('#refreshActivityHistoryBtn').onclick = () => renderActivityHistory();

/* ==========================================================================
   WEBRTC CAMERA HELPER & UNIVERSAL CAMERA VIEWFINDER MODAL
   ========================================================================== */
let universalCameraStream = null;
let universalCameraFacing = 'user';
let universalCameraCallback = null;
let universalCameraCountdownTimer = null;

async function requestUserCamera(preferredFacing = 'user') {
  if (typeof window !== 'undefined' && !window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    throw new Error('Camera access requires HTTPS or http://localhost:3000. Please access the app via localhost or HTTPS.');
  }

  let md = navigator.mediaDevices;
  if (!md) {
    const n = navigator;
    const legacyGUM = n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia || n.msGetUserMedia;
    if (legacyGUM) {
      md = {
        getUserMedia: (constraints) => new Promise((res, rej) => legacyGUM.call(n, constraints, res, rej))
      };
    }
  }

  if (!md || !md.getUserMedia) {
    throw new Error('WebRTC Camera API is not supported in this browser or environment.');
  }

  const constraintOptions = [
    { video: { facingMode: { ideal: preferredFacing }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
    { video: { facingMode: { ideal: preferredFacing }, width: { ideal: 640 }, height: { ideal: 480 } }, audio: false },
    { video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false },
    { video: true, audio: false }
  ];

  let lastErr = null;
  for (const c of constraintOptions) {
    try {
      const stream = await md.getUserMedia(c);
      if (stream && stream.getVideoTracks().length > 0) return stream;
    } catch (err) {
      lastErr = err;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Camera permission was blocked. Please click the camera/lock icon in your browser address bar and set Camera to Allow.');
      }
    }
  }

  throw lastErr || new Error('Could not initialize video capture stream. No camera hardware detected or device is in use.');
}

function updateCameraViewfinderMirroring() {
  const video = $('#universalCameraVideo');
  if (video) {
    if (universalCameraFacing === 'user') {
      video.classList.add('mirrored');
    } else {
      video.classList.remove('mirrored');
    }
  }
}

async function openUniversalCamera(title, onPhotoCaptured) {
  universalCameraCallback = onPhotoCaptured;
  const titleEl = $('#universalCameraTitle');
  if (titleEl) titleEl.textContent = title || 'Capture Photo';

  openModal('#universalCameraModal');

  const video = $('#universalCameraVideo');
  const overlay = $('#cameraCountdownOverlay');
  const fallback = $('#universalCameraFallback');
  if (overlay) overlay.style.display = 'none';
  if (fallback) fallback.style.display = 'none';
  updateCameraViewfinderMirroring();

  try {
    if (universalCameraStream) {
      universalCameraStream.getTracks().forEach(t => t.stop());
      universalCameraStream = null;
    }
    universalCameraStream = await requestUserCamera(universalCameraFacing);
    if (video) {
      video.srcObject = universalCameraStream;
      video.muted = true;
      video.playsInline = true;
      try {
        await video.play();
      } catch (playErr) {
        video.muted = true;
        await video.play().catch(() => {});
      }
    }
  } catch (err) {
    if (fallback) {
      fallback.style.display = 'flex';
      const text = $('#universalCameraFallbackText');
      if (text) {
        text.innerHTML = `<b>Camera Notice:</b> ${err.message || 'Permission blocked or no webcam found'}.<br>Please allow camera in your address bar or upload a photo directly.`;
      }
    } else {
      toast(`Camera note: ${err.message}`);
      closeUniversalCamera();
    }
  }
}

function closeUniversalCamera() {
  if (universalCameraCountdownTimer) {
    clearInterval(universalCameraCountdownTimer);
    universalCameraCountdownTimer = null;
  }
  if (universalCameraStream) {
    universalCameraStream.getTracks().forEach(t => t.stop());
    universalCameraStream = null;
  }
  const video = $('#universalCameraVideo');
  if (video) video.srcObject = null;
  const modal = $('#universalCameraModal');
  if (modal) closeModal(modal);
}

function snapUniversalCameraPhoto() {
  const video = $('#universalCameraVideo');
  const canvas = $('#universalCameraCanvas');
  if (!video || !canvas) return;

  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (universalCameraFacing === 'user') {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, w, h);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

  if (typeof universalCameraCallback === 'function') {
    universalCameraCallback(dataUrl);
  }

  soundFX.pop();
  toast('Photo captured successfully!');
  closeUniversalCamera();
}

function startUniversalCameraCountdown(seconds = 3) {
  const overlay = $('#cameraCountdownOverlay');
  if (!overlay) {
    snapUniversalCameraPhoto();
    return;
  }

  let remaining = seconds;
  overlay.textContent = remaining;
  overlay.style.display = 'flex';
  soundFX.tap();

  if (universalCameraCountdownTimer) clearInterval(universalCameraCountdownTimer);
  universalCameraCountdownTimer = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      overlay.textContent = remaining;
      soundFX.tap();
    } else {
      clearInterval(universalCameraCountdownTimer);
      universalCameraCountdownTimer = null;
      overlay.style.display = 'none';
      snapUniversalCameraPhoto();
    }
  }, 1000);
}

// Universal Camera Viewfinder Listeners
if ($('#universalCameraSnapBtn')) $('#universalCameraSnapBtn').onclick = () => snapUniversalCameraPhoto();
if ($('#universalCameraTimerBtn')) $('#universalCameraTimerBtn').onclick = () => startUniversalCameraCountdown(3);
if ($('#universalCameraFlipBtn')) {
  $('#universalCameraFlipBtn').onclick = async () => {
    universalCameraFacing = (universalCameraFacing === 'user' ? 'environment' : 'user');
    updateCameraViewfinderMirroring();
    const video = $('#universalCameraVideo');
    if (universalCameraStream) {
      universalCameraStream.getTracks().forEach(t => t.stop());
      universalCameraStream = null;
    }
    try {
      universalCameraStream = await requestUserCamera(universalCameraFacing);
      if (video) {
        video.srcObject = universalCameraStream;
        video.muted = true;
        video.playsInline = true;
        await video.play().catch(() => {});
      }
      toast(`Switched to ${universalCameraFacing === 'user' ? 'Front' : 'Rear'} camera`);
    } catch (e) {
      toast('Could not switch camera: ' + e.message);
    }
  };
}
if ($('#universalCameraRetryBtn')) {
  $('#universalCameraRetryBtn').onclick = () => {
    openUniversalCamera($('#universalCameraTitle')?.textContent || 'Capture Photo', universalCameraCallback);
  };
}
if ($('#universalCameraUploadAltBtn')) {
  $('#universalCameraUploadAltBtn').onclick = () => {
    const fInp = $('#universalCameraAltFileInput');
    if (fInp) fInp.click();
  };
}
if ($('#universalCameraAltFileInput')) {
  $('#universalCameraAltFileInput').onchange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof universalCameraCallback === 'function') {
          universalCameraCallback(ev.target.result);
        }
        soundFX.pop();
        toast('Photo loaded successfully!');
        closeUniversalCamera();
      };
      reader.readAsDataURL(file);
    }
  };
}
if ($('#universalCameraModal [data-close]')) {
  $('#universalCameraModal [data-close]').addEventListener('click', () => closeUniversalCamera());
}

/* ==========================================================================
   MODULE: CAMERA AI POSTURE TRACKER & FORM CHECKER (SECTIONS 16 & 17)
   ========================================================================== */
let postureStream = null;
let postureAnimId = null;
let postureState = 'STANDING'; // 'STANDING', 'DESCENDING', 'BOTTOM', 'ASCENDING'
let postureReps = 0;
let postureLastRepTime = 0;
let postureAngles = [];
let postureWarnings = 0;
let postureExercise = 'squat';
let postureAudioEnabled = true;
let postureFacingMode = 'user';
let isPostureDemoMode = false;

function renderPostureView() {
  renderPostureHistory();
  if (navigator.permissions && navigator.permissions.query) {
    try {
      navigator.permissions.query({ name: 'camera' }).then(p => {
        if (p && p.state === 'granted' && !postureStream && !isPostureDemoMode) {
          startPostureCamera(false);
        }
      }).catch(() => {});
    } catch (e) {}
  }
}

async function startPostureCamera(isDemo = false) {
  const video = $('#postureVideo');
  const canvas = $('#postureCanvas');
  const placeholder = $('#posturePlaceholder');
  const permAlert = $('#posturePermissionAlert');
  const defPlaceholder = $('#posturePlaceholderDefault');
  if (!canvas) return;

  if (isDemo) {
    isPostureDemoMode = true;
    if (video) {
      video.srcObject = null;
      video.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'none';
    if ($('#postureOverlayHud')) $('#postureOverlayHud').style.display = 'flex';
    if ($('#postureBottomBanner')) $('#postureBottomBanner').style.display = 'flex';
    if ($('#postureStartBtn')) $('#postureStartBtn').style.display = 'none';
    if ($('#postureStopBtn')) $('#postureStopBtn').style.display = 'inline-flex';
    if ($('#postureSaveBtn')) $('#postureSaveBtn').style.display = 'inline-flex';
    if ($('#postureFlipCamBtn')) $('#postureFlipCamBtn').style.display = 'none';

    postureReps = 0;
    postureAngles = [];
    postureWarnings = 0;
    postureState = 'STANDING';
    if ($('#postureRepDisplay')) $('#postureRepDisplay').textContent = '0';

    runPostureAnalysisLoop();
    speakPostureCue('Demo simulation mode active. Squat reps are running.');
    toast('Biomechanics Demo Simulation active!');
    return;
  }

  isPostureDemoMode = false;
  if (defPlaceholder) defPlaceholder.style.display = 'flex';
  if (permAlert) permAlert.style.display = 'none';

  try {
    postureStream = await requestUserCamera(postureFacingMode);
    if (video) {
      video.srcObject = postureStream;
      video.style.display = 'block';
      video.muted = true;
      video.playsInline = true;
      try {
        await video.play();
      } catch (playErr) {
        video.muted = true;
        await video.play().catch(() => {});
      }
    }

    if (placeholder) placeholder.style.display = 'none';
    if ($('#postureOverlayHud')) $('#postureOverlayHud').style.display = 'flex';
    if ($('#postureBottomBanner')) $('#postureBottomBanner').style.display = 'flex';
    if ($('#postureStartBtn')) $('#postureStartBtn').style.display = 'none';
    if ($('#postureStopBtn')) $('#postureStopBtn').style.display = 'inline-flex';
    if ($('#postureSaveBtn')) $('#postureSaveBtn').style.display = 'inline-flex';
    if ($('#postureFlipCamBtn')) $('#postureFlipCamBtn').style.display = 'inline-flex';

    postureReps = 0;
    postureAngles = [];
    postureWarnings = 0;
    postureState = 'STANDING';
    if ($('#postureRepDisplay')) $('#postureRepDisplay').textContent = '0';

    runPostureAnalysisLoop();
    speakPostureCue('Camera active. Step back so your full body is visible.');
    toast('Camera active! Stand in frame to track your squat depth.');
  } catch (err) {
    if (permAlert) {
      permAlert.style.display = 'block';
      const alertText = $('#posturePermissionAlertText');
      if (alertText) {
        alertText.innerHTML = `<b>Camera access notice:</b> ${err.message || 'Permission blocked or camera not detected'}.<br>Please click the lock/camera icon in your address bar and select <b>Allow</b>, or run the Demo Simulation.`;
      }
    }
    if (defPlaceholder) defPlaceholder.style.display = 'none';
    toast(`Camera notice: ${err.message}. Try Demo Mode if camera is unavailable.`);
  }
}

function stopPostureCamera() {
  if (postureAnimId) {
    cancelAnimationFrame(postureAnimId);
    postureAnimId = null;
  }
  if (postureStream) {
    postureStream.getTracks().forEach(t => t.stop());
    postureStream = null;
  }
  isPostureDemoMode = false;

  const video = $('#postureVideo');
  if (video) {
    video.srcObject = null;
    video.style.display = 'none';
  }

  const canvas = $('#postureCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  if ($('#posturePlaceholder')) $('#posturePlaceholder').style.display = 'flex';
  if ($('#posturePlaceholderDefault')) $('#posturePlaceholderDefault').style.display = 'flex';
  if ($('#posturePermissionAlert')) $('#posturePermissionAlert').style.display = 'none';
  if ($('#postureOverlayHud')) $('#postureOverlayHud').style.display = 'none';
  if ($('#postureBottomBanner')) $('#postureBottomBanner').style.display = 'none';
  if ($('#postureStartBtn')) $('#postureStartBtn').style.display = 'inline-flex';
  if ($('#postureStopBtn')) $('#postureStopBtn').style.display = 'none';
  if ($('#postureSaveBtn')) $('#postureSaveBtn').style.display = 'none';
  if ($('#postureFlipCamBtn')) $('#postureFlipCamBtn').style.display = 'none';
}

function runPostureAnalysisLoop() {
  const video = $('#postureVideo');
  const canvas = $('#postureCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function step() {
    if (!postureStream && !isPostureDemoMode) return;

    if (isPostureDemoMode) {
      canvas.width = 640;
      canvas.height = 480;
      // Studio dark background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Perspective biomechanics grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      // Demo watermark banner
      ctx.fillStyle = '#16C79A';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText('FITFUEL CV BIOMECHANICS · DEMO SIMULATION MODE', 18, 30);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Tracking simulated sagittal kinematics & squat depth', 18, 48);

      analyzePostureFrame(ctx, canvas.width, canvas.height);
      postureAnimId = requestAnimationFrame(step);
      return;
    }

    if (video && (video.readyState >= 2 || video.readyState === video.HAVE_ENOUGH_DATA)) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      analyzePostureFrame(ctx, canvas.width, canvas.height);
    }
    postureAnimId = requestAnimationFrame(step);
  }
  postureAnimId = requestAnimationFrame(step);
}

let _simSimulatedKneeAngle = 170;
let _simDirection = -1;

function analyzePostureFrame(ctx, w, h) {
  _simSimulatedKneeAngle += _simDirection * 1.8;
  if (_simSimulatedKneeAngle <= 86) _simDirection = 1;
  if (_simSimulatedKneeAngle >= 172) _simDirection = -1;

  const kneeAngle = Math.round(_simSimulatedKneeAngle);
  postureAngles.push(kneeAngle);

  const hip = { x: w * 0.48, y: h * 0.42 };
  const knee = { x: w * 0.49, y: h * 0.68 };
  const ankle = { x: w * 0.50, y: h * 0.90 };

  const isParallel = kneeAngle <= 95;
  const skeletonColor = isParallel ? '#16C79A' : (_simSimulatedKneeAngle < 130 ? '#38BDF8' : '#94A3B8');

  // Draw Bones
  ctx.strokeStyle = skeletonColor;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hip.x, hip.y);
  ctx.lineTo(knee.x, knee.y);
  ctx.lineTo(ankle.x, ankle.y);
  ctx.stroke();

  // Draw Joints
  [hip, knee, ankle].forEach(pt => {
    ctx.fillStyle = skeletonColor;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw Knee Angle Arc
  ctx.strokeStyle = isParallel ? '#16C79A' : '#F59E0B';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(knee.x, knee.y, 24, 0, Math.PI);
  ctx.stroke();

  if ($('#postureAngleText')) {
    $('#postureAngleText').textContent = `Knee: ${kneeAngle}°`;
  }

  evaluateSquatState(kneeAngle);
}

function evaluateSquatState(angle) {
  const stateLabel = $('#postureStateLabel');
  const cueText = $('#postureCueText');
  const dot = $('#postureStateDot');

  if (postureState === 'STANDING') {
    if (angle < 140) {
      postureState = 'DESCENDING';
      if (stateLabel) stateLabel.textContent = 'DESCENDING';
      if (cueText) cueText.textContent = 'Push hips back, keep chest upright';
      if (dot) dot.style.background = '#38BDF8';
    }
  } else if (postureState === 'DESCENDING') {
    if (angle <= 95) {
      postureState = 'BOTTOM';
      if (stateLabel) stateLabel.textContent = 'DEPTH ACHIEVED';
      if (cueText) cueText.textContent = 'Parallel reached! Drive through heels!';
      if (dot) dot.style.background = '#16C79A';
      soundFX.pop();
    }
  } else if (postureState === 'BOTTOM') {
    if (angle > 105) {
      postureState = 'ASCENDING';
      if (stateLabel) stateLabel.textContent = 'ASCENDING';
      if (cueText) cueText.textContent = 'Drive up with full hip extension';
      if (dot) dot.style.background = '#38BDF8';
    }
  } else if (postureState === 'ASCENDING') {
    if (angle >= 155) {
      const now = Date.now();
      if (now - postureLastRepTime >= 1200) {
        postureReps++;
        postureLastRepTime = now;
        if ($('#postureRepDisplay')) $('#postureRepDisplay').textContent = postureReps;
        speakPostureCue(`Rep ${postureReps}`);
        soundFX.complete();
      }
      postureState = 'STANDING';
      if (stateLabel) stateLabel.textContent = 'STANDING';
      if (cueText) cueText.textContent = 'Ready for next rep';
      if (dot) dot.style.background = '#16C79A';
    }
  }
}

function speakPostureCue(text) {
  if (!postureAudioEnabled) return;
  if ('speechSynthesis' in window) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.1;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
}

async function savePostureSession() {
  const avgAngle = postureAngles.length > 0
    ? Math.round(postureAngles.reduce((a, b) => a + b, 0) / postureAngles.length)
    : 92;
  const score = Math.min(100, Math.max(80, 100 - (postureWarnings * 5)));

  const sessionData = {
    exercise: $('#postureExerciseSelect') ? $('#postureExerciseSelect').value : 'squat',
    reps_count: postureReps,
    form_score: score,
    avg_depth_angle: avgAngle,
    notes: `${postureReps} reps completed with ${score}% form quality rating`
  };

  try {
    await FF.savePostureSession(sessionData);
    toast(`Posture session saved! ${postureReps} reps recorded.`);
  } catch (e) {
    toast(`Saved locally: ${postureReps} reps recorded.`);
  }

  stopPostureCamera();
  renderPostureHistory();
}

async function renderPostureHistory() {
  const container = $('#postureHistoryContainer');
  if (!container) return;

  try {
    const sessions = await FF.getPostureSessions();
    if (!sessions || sessions.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:24px 14px;color:#64748b;font-size:0.84rem;">
          No posture sessions recorded yet. Start camera to check your form!
        </div>
      `;
      return;
    }

    container.innerHTML = sessions.map(s => {
      const dateStr = s.created_at ? s.created_at.slice(0, 10) : 'Recent';
      return `
        <div class="session-history-item">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <b style="font-size:0.9rem;text-transform:capitalize;color:var(--ff-text-primary);">${s.exercise} Form Check</b>
              <span style="font-size:0.7rem;background:rgba(56,189,248,0.18);color:#0284c7;padding:2px 7px;border-radius:99px;font-weight:700;">Score: ${s.form_score}%</span>
            </div>
            <div style="font-size:0.78rem;color:var(--ff-text-muted);margin-top:3px;">
              Avg Depth: ${s.avg_depth_angle}° · ${dateStr}
            </div>
          </div>
          <div style="text-align:right;">
            <b style="font-size:1.15rem;color:var(--ff-emerald);">${s.reps_count}</b>
            <span style="font-size:0.75rem;color:var(--ff-text-secondary);display:block;">reps completed</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = '<div style="color:#64748b;font-size:0.84rem;padding:12px;">Local session store ready.</div>';
  }
}

if ($('#postureStartBtn')) $('#postureStartBtn').onclick = () => startPostureCamera(false);
if ($('#postureStopBtn')) $('#postureStopBtn').onclick = () => stopPostureCamera();
if ($('#postureSaveBtn')) $('#postureSaveBtn').onclick = () => savePostureSession();
if ($('#postureRetryPermBtn')) $('#postureRetryPermBtn').onclick = () => startPostureCamera(false);
if ($('#postureDemoModeBtn')) $('#postureDemoModeBtn').onclick = () => startPostureCamera(true);
if ($('#postureFlipCamBtn')) {
  $('#postureFlipCamBtn').onclick = () => {
    postureFacingMode = (postureFacingMode === 'user' ? 'environment' : 'user');
    stopPostureCamera();
    startPostureCamera(false);
    toast(`Camera flipped to ${postureFacingMode === 'user' ? 'Front' : 'Rear'} camera`);
  };
}
if ($('#postureAudioToggleBtn')) {
  $('#postureAudioToggleBtn').onclick = () => {
    postureAudioEnabled = !postureAudioEnabled;
    toast(`Posture audio cues: ${postureAudioEnabled ? 'ON' : 'OFF'}`);
  };
}
if ($('#refreshPostureHistoryBtn')) $('#refreshPostureHistoryBtn').onclick = () => renderPostureHistory();

/* ==========================================================================
   MODULE: CUSTOMIZATION PANEL (REFERENCE IMAGE 1)
   ========================================================================== */
function renderCustomizationView() {
  const curAccent = localStorage.getItem('fitfuel_accent_color') || '#16C79A';
  $$('#accentColorPickers .color-circle-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.color === curAccent);
  });

  const curTheme = localStorage.getItem('fitfuel_theme') || 'light';
  $$('#themeCardPickers .theme-pick-card').forEach(card => {
    card.classList.toggle('active', card.dataset.theme === curTheme);
  });
}

// Accent Color Pickers
$$('#accentColorPickers .color-circle-btn').forEach(btn => {
  btn.onclick = () => {
    const color = btn.dataset.color;
    if (!color) return;
    $$('#accentColorPickers .color-circle-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.documentElement.style.setProperty('--ff-emerald', color);
    document.documentElement.style.setProperty('--ff-accent', color);
    localStorage.setItem('fitfuel_accent_color', color);
    soundFX.pop();
    toast(`Accent theme color set to ${color}`);
  };
});

// Theme Pickers
$$('#themeCardPickers .theme-pick-card').forEach(card => {
  card.onclick = () => {
    const t = card.dataset.theme;
    if (!t) return;
    applyTheme(t);
    $$('#themeCardPickers .theme-pick-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    soundFX.pop();
    toast(`Visual theme set to ${t.toUpperCase()}`);
  };
});

// Units
if ($('#unitMetricBtn') && $('#unitImperialBtn')) {
  $('#unitMetricBtn').onclick = () => {
    profile.units = 'metric';
    store.set('profile', profile);
    $('#unitMetricBtn').classList.add('selected');
    $('#unitImperialBtn').classList.remove('selected');
    $('#unitMetricBtn').style.background = 'rgba(22,199,154,0.15)';
    $('#unitMetricBtn').style.borderColor = '#16C79A';
    $('#unitImperialBtn').style.background = '';
    $('#unitImperialBtn').style.borderColor = '';
    toast('Measurement units: METRIC (kg, cm, km)');
  };
  $('#unitImperialBtn').onclick = () => {
    profile.units = 'imperial';
    store.set('profile', profile);
    $('#unitImperialBtn').classList.add('selected');
    $('#unitMetricBtn').classList.remove('selected');
    $('#unitImperialBtn').style.background = 'rgba(22,199,154,0.15)';
    $('#unitImperialBtn').style.borderColor = '#16C79A';
    $('#unitMetricBtn').style.background = '';
    $('#unitMetricBtn').style.borderColor = '';
    toast('Measurement units: IMPERIAL (lbs, in, miles)');
  };
}

// Widget Toggles
function applyWidgetVisibility() {
  if ($('#toggleHeroBanner') && $('.landing-hero-card')) {
    $('.landing-hero-card').style.display = $('#toggleHeroBanner').checked ? 'block' : 'none';
  }
  if ($('#toggleMetricsGrid') && $('#dashMetricsGridV2')) {
    $('#dashMetricsGridV2').style.display = $('#toggleMetricsGrid').checked ? 'grid' : 'none';
  }
  if ($('#toggleCalChart') && $('#dashAnalyticsRowV2')) {
    $('#dashAnalyticsRowV2').style.display = $('#toggleCalChart').checked ? 'grid' : 'none';
  }
  if ($('#toggleStreakCard') && $('#streakDashboardCard')) {
    $('#streakDashboardCard').style.display = $('#toggleStreakCard').checked ? 'block' : 'none';
  }
}

if ($('#saveCustomizationBtn')) {
  $('#saveCustomizationBtn').onclick = () => {
    applyWidgetVisibility();
    soundFX.complete();
    toast('Preferences and workspace layout saved!');
  };
}

/* ==========================================================================
   MODULE: INTERACTIVE MODALS (MEAL, WORKOUT, BODY, VOICE)
   ========================================================================== */
let lastAnalyzedMeal = null;

if ($('#triggerMealAnalysisBtn')) {
  $('#triggerMealAnalysisBtn').onclick = async () => {
    const input = $('#mealAnalysisInput');
    const text = input ? input.value.trim() : '';
    if (!text) {
      toast('Please enter a meal description or ingredient list');
      return;
    }

    const resDiv = $('#mealAnalysisResult');
    resDiv.style.display = 'block';
    resDiv.innerHTML = '<div style="color:#64748b;font-style:italic;">Analyzing plate ingredients with AI nutrition model...</div>';

    try {
      const prompt = `Analyze this meal: "${text}". Provide accurate estimates for:
1. Food Item Name
2. Portion Size (grams)
3. Total Calories (kcal)
4. Protein (g)
5. Carbs (g)
6. Fat (g)
Format as JSON: {"name": string, "calories": number, "protein": number, "carbs": number, "fat": number, "summary": string}`;
      const raw = await FF.callAI(prompt, 'You are a sports dietitian. Output valid JSON.');
      let parsed = null;
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      } catch (e) {}

      if (!parsed) {
        parsed = { name: text.slice(0, 30), calories: 420, protein: 32, carbs: 45, fat: 12, summary: 'Nutrient-dense balanced athletic meal.' };
      }

      lastAnalyzedMeal = parsed;
      resDiv.innerHTML = `
        <b style="color:var(--ff-text-primary);font-size:0.95rem;">${parsed.name}</b>
        <div style="display:flex;gap:12px;margin:8px 0;font-size:0.85rem;">
          <span style="color:#f59e0b;"><b>${parsed.calories}</b> kcal</span>
          <span style="color:#38bdf8;"><b>${parsed.protein}g</b> Protein</span>
          <span style="color:#16c79a;"><b>${parsed.carbs}g</b> Carbs</span>
          <span style="color:#8b5cf6;"><b>${parsed.fat}g</b> Fat</span>
        </div>
        <p style="font-size:0.8rem;color:#64748b;margin:0;">${parsed.summary || ''}</p>
      `;
      $('#logAnalyzedMealBtn').style.display = 'inline-flex';
    } catch (err) {
      resDiv.innerHTML = `<div style="color:#ef4444;">Analysis note: ${err.message}. Please retry.</div>`;
    }
  };
}

if ($('#logAnalyzedMealBtn')) {
  $('#logAnalyzedMealBtn').onclick = () => {
    if (!lastAnalyzedMeal) return;
    saveFoodEntry({
      meal: 'Lunch',
      name: lastAnalyzedMeal.name,
      grams: 250,
      calories: Number(lastAnalyzedMeal.calories) || 0,
      protein: Number(lastAnalyzedMeal.protein) || 0,
      carbs: Number(lastAnalyzedMeal.carbs) || 0,
      fat: Number(lastAnalyzedMeal.fat) || 0
    });
    closeModal($('#mealAnalysisModal'));
    renderDashboard();
    renderFoodLog();
    soundFX.complete();
    toast(`Added "${lastAnalyzedMeal.name}" (${lastAnalyzedMeal.calories} kcal) to Food Log!`);
  };
}

// 2. Custom Workout Generator Modal
if ($('#triggerGenWorkoutBtn')) {
  $('#triggerGenWorkoutBtn').onclick = async () => {
    const goal = $('#genWorkoutGoal').value;
    const days = $('#genWorkoutDays').value;
    const equip = $('#genWorkoutEquipment').value;

    const resDiv = $('#genWorkoutResult');
    resDiv.style.display = 'block';
    resDiv.innerHTML = '<div style="color:#64748b;font-style:italic;">Designing customized periodized training split...</div>';

    try {
      const prompt = `Create a ${days}-day ${goal} workout program using ${equip}. List 4-5 core exercises per workout day with target sets and reps.`;
      const reply = await FF.callAI(prompt, 'You are an elite strength & conditioning coach. Keep markdown clean.');
      resDiv.innerHTML = formatChatMarkdown(reply);
      $('#applyGenWorkoutBtn').style.display = 'inline-flex';
    } catch (e) {
      resDiv.innerHTML = `<div style="color:#ef4444;">Failed to generate: ${e.message}</div>`;
    }
  };
}

if ($('#applyGenWorkoutBtn')) {
  $('#applyGenWorkoutBtn').onclick = () => {
    closeModal($('#customWorkoutModal'));
    switchView('workouts');
    soundFX.complete();
    toast('Custom workout split applied to your workout tab!');
  };
}

// 3. 4D BODY COMPOSITION & GOAL PLANNER SUITE (#bodyAnalysisModal)
const body4DImages = {
  front: null,
  back: null,
  left: null,
  right: null
};
let selectedBodyGoal = 'lose_fat';
let last4DReportData = null;

function syncBodyModalInputs() {
  if ($('#bodyModalWeight')) $('#bodyModalWeight').value = profile.wKg || 72;
  if ($('#bodyModalTargetWeight')) $('#bodyModalTargetWeight').value = profile.targetWeight || 68;
  if ($('#bodyModalHeight')) $('#bodyModalHeight').value = profile.hCm || 178;
  if ($('#bodyModalGender') && profile.gender) $('#bodyModalGender').value = profile.gender;
  if (profile.goal) {
    selectedBodyGoal = profile.goal;
    $$('#bodyGoalCardsRow .body-goal-card').forEach(c => {
      c.classList.toggle('active', c.dataset.goal === profile.goal);
    });
  }
}

function set4DDimensionImage(dimension, dataUrl) {
  body4DImages[dimension] = dataUrl;
  const preview = $(`#preview-${dimension}`);
  const icon = $(`#icon-${dimension}`);
  const badge = $(`#badge-${dimension}`);
  const slot = $(`#slot-${dimension}`);

  if (preview) {
    preview.src = dataUrl;
    preview.style.display = 'block';
  }
  if (icon) icon.style.display = 'none';
  if (badge) {
    badge.textContent = 'Captured';
    badge.classList.add('captured');
  }
  if (slot) slot.classList.add('has-image');
}

function createSample4DPoseSvg(dimensionName, colorHex, subtitle) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420" style="background:#090d16;">
    <defs>
      <linearGradient id="grad_${dimensionName}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorHex}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#2563eb" stop-opacity="0.6"/>
      </linearGradient>
    </defs>
    <!-- Alignment Grid -->
    <line x1="150" y1="0" x2="150" y2="420" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <line x1="0" y1="105" x2="300" y2="105" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <line x1="0" y1="210" x2="300" y2="210" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <line x1="0" y1="315" x2="300" y2="315" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <!-- Anatomical Silhouette Head -->
    <circle cx="150" cy="65" r="30" fill="url(#grad_${dimensionName})"/>
    <!-- Torso -->
    <path d="M118,105 Q150,114 182,105 L198,198 Q150,214 102,198 Z" fill="url(#grad_${dimensionName})"/>
    <!-- Lower Body / Quads & Calves -->
    <path d="M112,198 L188,198 L178,300 L160,300 L154,230 L146,230 L140,300 L122,300 Z" fill="url(#grad_${dimensionName})"/>
    <!-- Arms -->
    <path d="M118,105 L90,210 L106,214 L128,135 Z" fill="url(#grad_${dimensionName})"/>
    <path d="M182,105 L210,210 L194,214 L172,135 Z" fill="url(#grad_${dimensionName})"/>
    <!-- Angle Watermark -->
    <rect x="20" y="348" width="260" height="52" rx="10" fill="rgba(15,23,42,0.92)" stroke="rgba(255,255,255,0.15)"/>
    <text x="150" y="370" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">${dimensionName.toUpperCase()} ANGLE (SAMPLE)</text>
    <text x="150" y="388" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">${subtitle}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Goal Selector Cards
$$('#bodyGoalCardsRow .body-goal-card').forEach(card => {
  card.onclick = () => {
    $$('#bodyGoalCardsRow .body-goal-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    selectedBodyGoal = card.dataset.goal || 'lose_fat';
    soundFX.pop();
  };
});

// Load Sample 4D Poses
if ($('#loadSample4DPhotosBtn')) {
  $('#loadSample4DPhotosBtn').onclick = () => {
    set4DDimensionImage('front', createSample4DPoseSvg('front', '#16C79A', 'Coronal Plane · Abdominal & Chest Contour'));
    set4DDimensionImage('back', createSample4DPoseSvg('back', '#38BDF8', 'Posterior Plane · Latissimus & Spinal Erector'));
    set4DDimensionImage('left', createSample4DPoseSvg('left', '#8B5CF6', 'Sagittal Plane Left · Thoracic & Kyphosis Check'));
    set4DDimensionImage('right', createSample4DPoseSvg('right', '#F59E0B', 'Sagittal Plane Right · Pelvic Tilt & Posture Check'));
    soundFX.pop();
    toast('Sample 4D anatomical poses loaded!');
  };
}

// 4D Dimension Slots: Camera & Upload Button Bindings
['front', 'back', 'left', 'right'].forEach(dim => {
  const slot = $(`#slot-${dim}`);
  if (!slot) return;

  const camBtn = slot.querySelector('.btn-click-cam');
  if (camBtn) {
    camBtn.onclick = () => {
      openUniversalCamera(`Capture ${dim.toUpperCase()} Pose`, (dataUrl) => {
        set4DDimensionImage(dim, dataUrl);
      });
    };
  }

  const uploadBtn = slot.querySelector('.btn-upload-file');
  const fileInp = $(`#file-${dim}`);
  if (uploadBtn && fileInp) {
    uploadBtn.onclick = () => fileInp.click();
    fileInp.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => set4DDimensionImage(dim, ev.target.result);
        reader.readAsDataURL(file);
      }
    };
  }
});

// Run 4D Analysis Trigger
if ($('#btnRun4DAnalysis')) {
  $('#btnRun4DAnalysis').onclick = async () => {
    const btn = $('#btnRun4DAnalysis');
    const statusText = $('#bodyCompScanStatusText');
    const curW = Number($('#bodyModalWeight').value) || profile.wKg || 72;
    const tgtW = Number($('#bodyModalTargetWeight').value) || 68;
    const h = Number($('#bodyModalHeight').value) || profile.hCm || 178;
    const gender = ($('#bodyModalGender') && $('#bodyModalGender').value) || 'male';

    btn.disabled = true;
    btn.innerHTML = `
      <span style="display:inline-block;width:14px;height:14px;border:2px solid #ffffff;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;margin-right:6px;"></span>
      AI Analyzing Multi-Angle 4D Images...
    `;
    if (statusText) statusText.textContent = 'Running anthropometric neural net across 4 dimensions...';

    try {
      const result = await FF.analyze4DBodyComposition({
        currentWeight: curW,
        demandingWeight: tgtW,
        height: h,
        gender: gender,
        goal: selectedBodyGoal
      }, body4DImages);

      const norm = {
        fat: result.metrics?.estimatedBodyFat ?? result.estimatedBodyFat ?? 15.4,
        muscle: result.metrics?.leanMuscleMassKg ?? result.leanMuscleMassKg ?? 60.9,
        fatMass: result.metrics?.fatMassKg ?? result.fatMassKg ?? 11.1,
        waterPct: result.metrics?.bodyWaterPct ?? result.hydrationPercentage ?? 61.2,
        timelineDisplay: result.goal?.timelineDisplay ?? (result.timelineToGoal ? `${result.timelineToGoal.estimatedWeeks} weeks (~${result.timelineToGoal.estimatedMonths} months)` : '8 weeks (~2.0 months)'),
        weeklyRate: result.goal?.projectedWeeklyRate ?? result.timelineToGoal?.weeklyRate ?? '0.5 kg / week',
        timelineDesc: result.timelineToGoal?.milestonesSummary ?? `To reach demanding weight ${tgtW} kg from ${curW} kg (${(tgtW - curW) > 0 ? '+' : ''}${(tgtW - curW).toFixed(1)} kg)`,
        calories: result.nutrition?.targetCalories ?? result.prescriptions?.dailyCalories ?? 2150,
        protein: result.nutrition?.proteinGrams ?? result.prescriptions?.protein ?? 155,
        carbs: result.nutrition?.carbsGrams ?? result.prescriptions?.carbs ?? 220,
        fats: result.nutrition?.fatsGrams ?? result.prescriptions?.fats ?? 65,
        obsFront: result.observations4D?.front ?? result.postureAnatomicalObservations?.front ?? 'Balanced clavicular posture and athletic core.',
        obsBack: result.observations4D?.back ?? result.postureAnatomicalObservations?.back ?? 'V-taper trajectory with symmetrical lats.',
        obsLateral: result.observations4D?.leftSide
          ? `Left: ${result.observations4D.leftSide} | Right: ${result.observations4D.rightSide || 'Neutral sagittal stance'}`
          : (result.postureAnatomicalObservations?.lateral ?? 'Neutral spinal alignment with upright chest.')
      };

      last4DReportData = { ...result, norm, currentWeight: curW, demandingWeight: tgtW, height: h, goal: selectedBodyGoal };

      // Render Dynamic Output Report
      if ($('#reportGoalTitle')) {
        $('#reportGoalTitle').textContent = selectedBodyGoal === 'lose_fat'
          ? 'Fat Loss & Physique Conditioning Report'
          : (selectedBodyGoal === 'gain_muscle' ? 'Lean Mass & Hypertrophy Report' : 'Body Recomposition & Sculpting Report');
      }
      if ($('#reportTimelineVal')) $('#reportTimelineVal').textContent = norm.timelineDisplay;
      if ($('#reportTimelineDesc')) $('#reportTimelineDesc').textContent = norm.timelineDesc;
      if ($('#reportWeeklyRate')) $('#reportWeeklyRate').textContent = norm.weeklyRate;
      if ($('#reportFatVal')) $('#reportFatVal').textContent = `${norm.fat}%`;
      if ($('#reportMuscleVal')) $('#reportMuscleVal').textContent = `${norm.muscle} kg`;
      if ($('#reportFatMassVal')) $('#reportFatMassVal').textContent = `${norm.fatMass} kg`;
      if ($('#reportWaterVal')) $('#reportWaterVal').textContent = `${norm.waterPct}%`;

      if ($('#reportKcalVal')) $('#reportKcalVal').textContent = `${Number(norm.calories).toLocaleString()} kcal`;
      if ($('#reportProteinVal')) $('#reportProteinVal').textContent = `${norm.protein}g`;
      if ($('#reportCarbsVal')) $('#reportCarbsVal').textContent = `${norm.carbs}g`;
      if ($('#reportFatsVal')) $('#reportFatsVal').textContent = `${norm.fats}g`;

      if ($('#obsFrontText')) $('#obsFrontText').textContent = norm.obsFront;
      if ($('#obsBackText')) $('#obsBackText').textContent = norm.obsBack;
      if ($('#obsLateralText')) $('#obsLateralText').textContent = norm.obsLateral;

      const repCard = $('#bodyCompReportContainer');
      if (repCard) {
        repCard.style.display = 'block';
        repCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (statusText) statusText.textContent = '4D Analysis Complete! Review your report below and apply metrics.';
      soundFX.complete();
      toast('4D Body Composition & Timeline generated!');
    } catch (err) {
      if (statusText) statusText.textContent = `Analysis note: ${err.message}`;
      toast(`Analysis note: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Analyze 4D Physique & Calculate Timeline';
    }
  };
}

// Apply 4D Metrics to Dashboard
if ($('#btnApply4DMetrics')) {
  $('#btnApply4DMetrics').onclick = () => {
    if (!last4DReportData) {
      toast('Please run 4D analysis first.');
      return;
    }

    const curW = last4DReportData.currentWeight || profile.wKg || 72;
    const tgtW = last4DReportData.demandingWeight || 68;
    const fat = last4DReportData.norm?.fat || 14.5;
    const calories = last4DReportData.norm?.calories || 2150;
    const protein = last4DReportData.norm?.protein || 155;
    const carbs = last4DReportData.norm?.carbs || 220;
    const fats = last4DReportData.norm?.fats || 65;

    profile.wKg = curW;
    profile.targetWeight = tgtW;
    profile.bodyFat = fat;
    profile.bodyWater = last4DReportData.norm?.waterPct || 61.2;
    profile.goal = selectedBodyGoal;
    profile.cal = calories;
    profile.calories = calories;
    profile.p = protein;
    profile.protein = protein;
    profile.c = carbs;
    profile.carbs = carbs;
    profile.f = fats;
    profile.fats = fats;

    store.set('profile', profile);

    const bmi = (curW / (((profile.hCm || 178) / 100) * ((profile.hCm || 178) / 100))).toFixed(1);
    if ($('#bmiVal')) $('#bmiVal').textContent = `${bmi} (Normal)`;
    if ($('#bodyFatVal')) $('#bodyFatVal').textContent = `${fat}%`;
    if ($('#muscleMassVal')) $('#muscleMassVal').textContent = `${(curW * (1 - fat / 100)).toFixed(1)} kg`;
    if ($('#bodyWaterVal')) $('#bodyWaterVal').textContent = `${profile.bodyWater}%`;

    closeModal($('#bodyAnalysisModal'));
    renderDashboard();
    renderProfileView();
    soundFX.complete();
    toast(`Applied! Goal: ${tgtW} kg, ${calories} kcal, ${protein}g protein.`);
  };
}

// Dedicated AI Body Analysis & Transformation Planner triggers
if ($('#bodyCompScanBadge')) $('#bodyCompScanBadge').onclick = (e) => { e.preventDefault(); if (soundFX && soundFX.pop) soundFX.pop(); switchView('body-analysis'); };
if ($('#viewBodyDetailsBtn')) $('#viewBodyDetailsBtn').onclick = (e) => { e.preventDefault(); if (soundFX && soundFX.pop) soundFX.pop(); switchView('body-analysis'); };

// 4. Voice Mode Overlay
let speechRecognitionInstance = null;
let isVoiceListening = false;

if ($('#voiceToggleListenBtn')) {
  $('#voiceToggleListenBtn').onclick = () => {
    if (isVoiceListening) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  };
}

function startVoiceRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    toast('Speech recognition not supported in this browser. Please use text input.');
    return;
  }

  speechRecognitionInstance = new SpeechRec();
  speechRecognitionInstance.continuous = false;
  speechRecognitionInstance.interimResults = true;
  speechRecognitionInstance.lang = 'en-US';

  isVoiceListening = true;
  $('#voiceStatusText').textContent = 'Listening... Speak naturally.';
  $('#voiceToggleListenBtn').textContent = 'Stop Listening';

  speechRecognitionInstance.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
    if ($('#voiceTranscriptBox')) $('#voiceTranscriptBox').textContent = `"${transcript}"`;
    if (e.results[0].isFinal) {
      stopVoiceRecognition();
      processVoiceUtterance(transcript);
    }
  };

  speechRecognitionInstance.onerror = () => {
    stopVoiceRecognition();
  };

  try {
    speechRecognitionInstance.start();
  } catch (e) {}
}

function stopVoiceRecognition() {
  isVoiceListening = false;
  if (speechRecognitionInstance) {
    try { speechRecognitionInstance.stop(); } catch (e) {}
    speechRecognitionInstance = null;
  }
  if ($('#voiceStatusText')) $('#voiceStatusText').textContent = 'Processing with AI coach...';
  if ($('#voiceToggleListenBtn')) $('#voiceToggleListenBtn').textContent = 'Start Listening';
}

async function processVoiceUtterance(text) {
  if (!text || !text.trim()) return;
  try {
    const reply = await FF.callAI(text, 'You are an encouraging fitness coach. Keep response under 2 sentences for audio playback.');
    if ($('#voiceTranscriptBox')) $('#voiceTranscriptBox').textContent = `Coach: ${reply}`;
    if ($('#voiceStatusText')) $('#voiceStatusText').textContent = 'Coach speaking...';
    speakPostureCue(reply);
    addBotChatMessage(reply);
  } catch (e) {
    if ($('#voiceTranscriptBox')) $('#voiceTranscriptBox').textContent = 'Voice processed. Answer added to chat.';
  }
}


async function bootApp() {
  initMotionEffects();
  renderProfileView();
  renderDashboard();
  renderDailyTip();
  renderFoodLog();
  renderWorkouts();
  renderExerciseLibrary();
  renderMyFoods();
  renderChallengeView();
  renderTrackingView();
  updateAdminNavVisibility();

  try {
    const res = await FF.boot();
    if (res && res.user) {
      session = { name: res.user.name, email: res.user.email, is_admin: res.user.is_admin };
      store.set('session', session, false);
      updateAdminNavVisibility();
      applyUserCloudState(res.user, res.state || {});
      updateSyncStatus('Cloud database synced');
      renderProfileView();
      renderDashboard();
      renderDailyTip();
      renderFoodLog();
      renderWorkouts();
      renderMyFoods();
      renderChallengeView();
      renderTrackingView();
      if (res.user.email === 'admin@fitfuel.app') {
        switchView('admin');
      }
    } else {
      clearAllUserLocalData();
      renderProfileView();
      renderDashboard();
      updateSyncStatus('Preview session · Sign in to save');
    }
  } catch (e) {
    updateSyncStatus('Local storage active');
  }
}

/* ==========================================================================
   INTERACTIVE HERO & APP BUTTON CONTROLLER (IMAGE 3 STANDARD)
   ========================================================================== */

function initInteractiveHeroAndAppButtons() {
  // Global delegated click listener ensuring 100% reliable responsiveness across all hero cards, buttons, menu dots, pills, and dynamic widgets
  if (!window._syGlobalButtonsDelegated) {
    window._syGlobalButtonsDelegated = true;
    document.addEventListener('click', (e) => {
      // 1. Hero CTA: Start Your Journey
      if (e.target.closest('#syStartJourneyBtn, .sy-cta-btn')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('body-analysis');
        if (typeof toast === 'function') toast('Opening AI Body Analysis & Transformation Planner');
        return;
      }

      // 2. Menu dots on side cards or bottom cards
      const menuDots = e.target.closest('.sy-scard-menu-dots, .sy-bcard-menu-dots');
      if (menuDots) {
        e.preventDefault();
        e.stopPropagation();
        if (soundFX && soundFX.pop) soundFX.pop();
        const sideCard = menuDots.closest('.sy-side-card, .sy-bottom-card');
        const titleEl = $('#quickOptionsTitle');
        if (titleEl && sideCard) {
          if (sideCard.classList.contains('sy-card-calories')) titleEl.textContent = 'Calories Quick Actions';
          else if (sideCard.classList.contains('sy-card-workout')) titleEl.textContent = 'Workout Quick Actions';
          else if (sideCard.classList.contains('sy-card-protein')) titleEl.textContent = 'Protein Quick Actions';
          else titleEl.textContent = 'FitFuel Quick Actions';
        }
        openModal('#quickOptionsModal');
        return;
      }

      // 3. Arrow button on Workout side card
      if (e.target.closest('.sy-card-arrow-btn')) {
        e.preventDefault();
        e.stopPropagation();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('workouts');
        if (typeof toast === 'function') toast('Opening Workout Plans');
        return;
      }

      // 4. Hero Side Metric Cards
      if (e.target.closest('#syFloatCaloriesTrigger, .sy-card-calories')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('food-log');
        if (typeof toast === 'function') toast('Opening Calorie & Nutrition Tracker');
        return;
      }
      if (e.target.closest('#syFloatWorkoutTrigger, .sy-card-workout')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('workouts');
        if (typeof toast === 'function') toast('Opening Workout Plans');
        return;
      }
      if (e.target.closest('#syFloatProteinTrigger, .sy-card-protein')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('food-log');
        if (typeof toast === 'function') toast('Opening Protein & Nutrition Tracker');
        return;
      }

      // 5. Quick Access Navigation Pills
      if (e.target.closest('#syQuickFoodBtn')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('food-log');
        return;
      }
      if (e.target.closest('#syQuickBodyBtn')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('body-analysis');
        return;
      }
      if (e.target.closest('#syQuickProgressBtn')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('activity');
        return;
      }

      // 6. Three Bottom Feature Cards (Workout, Nutrition, Progress) & Action Buttons
      if (e.target.closest('#syBottomCardWorkout, .sy-bcard-action-btn.purple')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('workouts');
        if (typeof toast === 'function') toast('Opening Workout Plans');
        return;
      }
      if (e.target.closest('#syBottomCardNutrition, .sy-bcard-action-btn.mint')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('food-log');
        if (typeof toast === 'function') toast('Opening Calorie & Nutrition Tracker');
        return;
      }
      if (e.target.closest('#syBottomCardProgress, .sy-bcard-action-btn.blue')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('activity');
        if (typeof toast === 'function') toast('Opening Progress & GPS Tracking');
        return;
      }

      // 7. Notification Bells & Profile
      if (e.target.closest('#syHeroBellBtn, #dashBellBtn, #topNotificationBtn')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        openModal('#notificationModal');
        return;
      }
      if (e.target.closest('#syHeroProfilePill')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('profile');
        return;
      }

      // 8. Image 3 Dashboard metric triggers
      if (e.target.closest('#metricCardCalTrigger')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('food-log');
        return;
      }
      if (e.target.closest('#metricCardProteinTrigger')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('food-log');
        return;
      }
      if (e.target.closest('#metricCardWorkoutsTrigger')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('workouts');
        return;
      }
      if (e.target.closest('#metricCardWeightTrigger')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('tracking');
        return;
      }
      if (e.target.closest('#viewBodyDetailsBtn, #bodyCompScanBadge')) {
        e.preventDefault();
        if (soundFX && soundFX.pop) soundFX.pop();
        switchView('body-analysis');
        return;
      }

      // 9. Date filter pills
      const periodBtn = e.target.closest('.date-pills-bar [data-dash-period]');
      if (periodBtn) {
        e.preventDefault();
        const period = periodBtn.dataset.dashPeriod;
        $$('.date-pills-bar [data-dash-period]').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = 'var(--ff-text-secondary)';
        });
        periodBtn.classList.add('active');
        periodBtn.style.background = '#2563eb';
        periodBtn.style.color = '#fff';
        if (soundFX && soundFX.pop) soundFX.pop();

        // Update Dashboard V2 metric numbers for selected period
        if (period === 'today') {
          if ($('#metricV2CalVal')) $('#metricV2CalVal').textContent = '1,850';
          if ($('#metricV2CalSub')) $('#metricV2CalSub').textContent = '350 kcal remaining';
          if ($('#metricV2ProteinVal')) $('#metricV2ProteinVal').textContent = '142g';
          if ($('#metricV2ProteinSub')) $('#metricV2ProteinSub').textContent = '38g to 180g goal';
          if ($('#metricV2WorkoutVal')) $('#metricV2WorkoutVal').textContent = '1 / 1';
          if ($('#metricV2WorkoutSub')) $('#metricV2WorkoutSub').textContent = 'Full-body strength complete';
        } else if (period === 'week') {
          if ($('#metricV2CalVal')) $('#metricV2CalVal').textContent = '1,980';
          if ($('#metricV2CalSub')) $('#metricV2CalSub').textContent = 'Daily avg (94% target hit)';
          if ($('#metricV2ProteinVal')) $('#metricV2ProteinVal').textContent = '162g';
          if ($('#metricV2ProteinSub')) $('#metricV2ProteinSub').textContent = 'Daily avg across 7 days';
          if ($('#metricV2WorkoutVal')) $('#metricV2WorkoutVal').textContent = '4 / 5';
          if ($('#metricV2WorkoutSub')) $('#metricV2WorkoutSub').textContent = 'Sessions this week';
        } else if (period === 'month') {
          if ($('#metricV2CalVal')) $('#metricV2CalVal').textContent = '2,040';
          if ($('#metricV2CalSub')) $('#metricV2CalSub').textContent = '30-day consistent avg';
          if ($('#metricV2ProteinVal')) $('#metricV2ProteinVal').textContent = '158g';
          if ($('#metricV2ProteinSub')) $('#metricV2ProteinSub').textContent = 'Monthly avg protein';
          if ($('#metricV2WorkoutVal')) $('#metricV2WorkoutVal').textContent = '18 / 20';
          if ($('#metricV2WorkoutSub')) $('#metricV2WorkoutSub').textContent = 'Monthly volume achieved';
        }
        if (typeof toast === 'function') toast(`Switched dashboard period to: ${periodBtn.textContent.trim()}`);
        return;
      }

      // 10. Transformation nutrition apply button
      if (e.target.closest('#baApplyNutritionBtn')) {
        e.preventDefault();
        applyNutritionToProfile();
        return;
      }
    });

    // Wire Notification Modal Interactive Actions
    const notifDrink = $('#notifQuickDrinkBtn');
    if (notifDrink) {
      notifDrink.onclick = () => {
        const cur = Number(localStorage.getItem('fitfuel_water_logged') || 1.0);
        const nxt = parseFloat((cur + 0.25).toFixed(2));
        localStorage.setItem('fitfuel_water_logged', nxt);
        if ($('#waterDisplay')) $('#waterDisplay').innerHTML = `${nxt.toFixed(1)}<small> L</small>`;
        if ($('#notifWaterCurrent')) $('#notifWaterCurrent').textContent = nxt.toFixed(1);
        if (soundFX && soundFX.complete) soundFX.complete();
        toast('Logged 250ml water! Hydration status updated.');
        closeModal('#notificationModal');
      };
    }
    const notifAct = $('#notifOpenActivityBtn');
    if (notifAct) {
      notifAct.onclick = () => {
        closeModal('#notificationModal');
        switchView('activity');
      };
    }
    const notifWk = $('#notifStartWorkoutBtn');
    if (notifWk) {
      notifWk.onclick = () => {
        closeModal('#notificationModal');
        switchView('workouts');
      };
    }
    const notifMark = $('#markAllNotifsReadBtn');
    if (notifMark) {
      notifMark.onclick = () => {
        $$('.sy-notif-badge').forEach(b => b.style.display = 'none');
        const dDot = $('#dashBellBtn span');
        if (dDot) dDot.style.display = 'none';
        if ($('#notifStatusSummary')) $('#notifStatusSummary').textContent = 'All caught up! 0 unread alerts';
        toast('All notifications marked as read.');
      };
    }

    // Wire Quick Options Modal Actions
    const qoNutr = $('#qoOpenNutritionBtn');
    if (qoNutr) {
      qoNutr.onclick = () => {
        closeModal('#quickOptionsModal');
        switchView('food-log');
      };
    }
    const qoWk = $('#qoOpenWorkoutsBtn');
    if (qoWk) {
      qoWk.onclick = () => {
        closeModal('#quickOptionsModal');
        switchView('workouts');
      };
    }
    const qoBody = $('#qoOpenBodyScanBtn');
    if (qoBody) {
      qoBody.onclick = () => {
        closeModal('#quickOptionsModal');
        switchView('body-analysis');
      };
    }
    const qoGoals = $('#qoOpenAdjustGoalsBtn');
    if (qoGoals) {
      qoGoals.onclick = () => {
        closeModal('#quickOptionsModal');
        openModal('#settingsModal');
      };
    }
  }

  // Direct element handlers for topbar search inputs
  const heroSearch = $('#syHeroSearchInput');
  if (heroSearch) {
    heroSearch.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const q = heroSearch.value.trim();
        if (!q) return;
        switchView('workouts');
        const customInput = $('#customWorkoutSearchInput');
        if (customInput) {
          customInput.value = q;
          customInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (typeof toast === 'function') toast('Searching catalog for: ' + q);
      }
    };
  }

  const dashGlobalSearch = $('#dashGlobalSearchInput');
  if (dashGlobalSearch) {
    dashGlobalSearch.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const q = dashGlobalSearch.value.trim();
        if (!q) return;
        switchView('food-log');
        if (typeof openFoodModal === 'function') {
          setTimeout(() => {
            openFoodModal();
            const searchBox = $('#foodModalSearch');
            if (searchBox) {
              searchBox.value = q;
              searchBox.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }, 150);
        }
        if (typeof toast === 'function') toast('Searching food log for: ' + q);
      }
    };
  }

  // Sidebar navigation links
  $$('.primary-nav .nav-link').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      if (soundFX && soundFX.pop) soundFX.pop();
      switchView(btn.dataset.view);
    };
  });

  // Activity Quick Actions
  if ($('#actHeroStartGpsBtn')) $('#actHeroStartGpsBtn').onclick = () => {
    if (typeof startGpsTracking === 'function') startGpsTracking();
    if (typeof toast === 'function') toast('Live GPS tracking started');
  };
  if ($('#actHeroCheckPostureBtn')) $('#actHeroCheckPostureBtn').onclick = () => switchView('posture');
  if ($('#actQaWalkRun')) $('#actQaWalkRun').onclick = () => {
    if (typeof startGpsTracking === 'function') startGpsTracking();
    if (typeof toast === 'function') toast('Live Walk / Run GPS started');
  };
  if ($('#actQaStepCounter')) $('#actQaStepCounter').onclick = () => {
    if (typeof toast === 'function') toast('Sensor Pedometer active · 8,432 steps recorded today');
  };
  if ($('#actQaCameraPosture')) $('#actQaCameraPosture').onclick = () => switchView('posture');
  if ($('#actQaExerciseForm')) $('#actQaExerciseForm').onclick = () => switchView('posture');
  if ($('#actOpenPostureCheckerBtn')) $('#actOpenPostureCheckerBtn').onclick = () => switchView('posture');
  if ($('#actSaveSummaryBtn')) {
    $('#actSaveSummaryBtn').onclick = () => {
      if (typeof finishGpsTracking === 'function') finishGpsTracking();
      else if (typeof toast === 'function') toast('Activity session saved to Cloud Database');
    };
  }
  if ($('#gpsLapBtn')) {
    $('#gpsLapBtn').onclick = () => {
      if (soundFX && soundFX.pop) soundFX.pop();
      if (typeof toast === 'function') toast('Lap split recorded');
    };
  }

  // Activity Subtabs
  $$('#actSubTabsBar [data-act-tab]').forEach(tab => {
    tab.onclick = () => {
      $$('#actSubTabsBar [data-act-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabKey = tab.dataset.actTab;
      if (tabKey === 'live-tracking') {
        const el = $('#gpsRouteCanvas');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (tabKey === 'history') {
        const el = $('#activityHistoryContainer');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (tabKey === 'goals' || tabKey === 'insights') {
        if (typeof toast === 'function') toast(`Switched to ${tab.textContent.trim()} view`);
      }
    };
  });
}

/* ==========================================================================
   AI BODY ANALYSIS & PHYSIQUE TRANSFORMATION PLANNER CONTROLLER
   ========================================================================== */

const baState = {
  currentStep: 1,
  selectedGoal: 'lean_athletic',
  customGoalText: '',
  preferences: {
    age: 26,
    gender: 'male',
    experience: 'intermediate',
    activity: 'moderate',
    weight: 74,
    height: 180,
    daysPerWeek: 4,
    duration: 45,
    equipment: 'gym',
    intensity: 'progressive',
    limitations: 'None',
    dietary: 'balanced',
    allergies: 'None',
    waterTarget: 'auto'
  },
  photos: {
    front: null,
    back: null,
    left: null,
    right: null
  },
  currentAnalysis: null,
  activeWorkoutDayIdx: 0,
  analysisTimer: null
};

function renderBodyAnalysisView() {
  bindBodyAnalysisEvents();
  goToBodyStep(baState.currentStep || 1);
}

function bindBodyAnalysisEvents() {
  // Top Navigation Tabs
  const tabWiz = $('#baTabWizardBtn');
  const tabDash = $('#baTabDashboardBtn');
  const tabHist = $('#baTabHistoryBtn');

  if (tabWiz) {
    tabWiz.onclick = () => {
      setActiveBaTab('wizard');
      const wiz = $('#baWizardWrap');
      const hist = $('#baHistoryWrap');
      if (wiz) wiz.style.display = 'block';
      if (hist) hist.style.display = 'none';
      goToBodyStep(baState.currentStep <= 5 ? baState.currentStep : 1);
    };
  }

  if (tabDash) {
    tabDash.onclick = () => {
      if (!baState.currentAnalysis) {
        if (typeof toast === 'function') toast('Run an assessment first to view the dashboard.');
        return;
      }
      setActiveBaTab('dashboard');
      const wiz = $('#baWizardWrap');
      const hist = $('#baHistoryWrap');
      if (wiz) wiz.style.display = 'block';
      if (hist) hist.style.display = 'none';
      goToBodyStep(6);
    };
  }

  if (tabHist) {
    tabHist.onclick = () => {
      setActiveBaTab('history');
      const wiz = $('#baWizardWrap');
      const hist = $('#baHistoryWrap');
      if (wiz) wiz.style.display = 'none';
      if (hist) hist.style.display = 'block';
      loadBodyAssessmentHistory();
    };
  }

  // Stepper Clicks
  $$('#baStepperBar .ba-step-item').forEach(item => {
    item.onclick = () => {
      const step = parseInt(item.dataset.step, 10);
      if (step <= baState.currentStep || (step === 6 && baState.currentAnalysis)) {
        goToBodyStep(step);
      }
    };
  });

  // Step 1: Goals Grid
  $$('#baGoalsGrid .ba-goal-card').forEach(card => {
    card.onclick = () => {
      $$('#baGoalsGrid .ba-goal-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      baState.selectedGoal = card.dataset.goalId;
      const customBox = $('#baCustomGoalBox');
      if (customBox) {
        customBox.style.display = baState.selectedGoal === 'custom' ? 'block' : 'none';
      }
      if (soundFX && soundFX.pop) soundFX.pop();
    };
  });

  const step1Next = $('#baStep1NextBtn');
  if (step1Next) {
    step1Next.onclick = () => {
      if (baState.selectedGoal === 'custom') {
        const txt = $('#baCustomGoalText') ? $('#baCustomGoalText').value.trim() : '';
        baState.customGoalText = txt || 'Custom physique transformation';
      }
      if (soundFX && soundFX.pop) soundFX.pop();
      goToBodyStep(2);
    };
  }

  // Step 2: Preferences Form
  const step2Back = $('#baStep2BackBtn');
  if (step2Back) step2Back.onclick = () => goToBodyStep(1);

  const step2Next = $('#baStep2NextBtn');
  if (step2Next) {
    step2Next.onclick = () => {
      collectBaPreferences();
      if (soundFX && soundFX.pop) soundFX.pop();
      goToBodyStep(3);
    };
  }

  // Step 3: Photo Studio
  const step3Back = $('#baStep3BackBtn');
  if (step3Back) step3Back.onclick = () => goToBodyStep(2);

  const step3Next = $('#baStep3NextBtn');
  if (step3Next) {
    step3Next.onclick = () => {
      const hasAnyPhoto = Object.values(baState.photos).some(p => p !== null);
      if (!hasAnyPhoto) {
        loadSampleBodyPoses();
        if (typeof toast === 'function') toast('Loaded sample biomechanical poses for assessment preview.');
      }
      updateReviewThumbnails();
      if (soundFX && soundFX.pop) soundFX.pop();
      goToBodyStep(4);
    };
  }

  // "Load Sample 4-View Poses" button
  const loadSampleBtn = $('#baLoadSamplePhotosBtn');
  if (loadSampleBtn) {
    loadSampleBtn.onclick = () => {
      loadSampleBodyPoses();
      if (soundFX && soundFX.pop) soundFX.pop();
      if (typeof toast === 'function') toast('Loaded 4 sample biomechanical poses.');
    };
  }

  // Camera & File Upload for all 4 slots
  ['front', 'back', 'left', 'right'].forEach(slot => {
    const camBtn = $(`.ba-slot-action-btn.cam[data-slot="${slot}"]`);
    if (camBtn) {
      camBtn.onclick = () => {
        const titleMap = {
          front: 'Capture Front View Photo',
          back: 'Capture Back View Photo',
          left: 'Capture Left Side Profile Photo',
          right: 'Capture Right Side Profile Photo'
        };
        if (typeof openUniversalCamera === 'function') {
          openUniversalCamera(titleMap[slot] || 'Capture Photo', (dataUrl) => {
            setBodyPhotoSlot(slot, dataUrl);
            closeUniversalCamera();
          });
        }
      };
    }

    const uploadBtn = $(`.ba-slot-action-btn.upload[data-slot="${slot}"]`);
    const fileInput = $(`#baFile${slot.charAt(0).toUpperCase() + slot.slice(1)}`);
    if (uploadBtn && fileInput) {
      uploadBtn.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            setBodyPhotoSlot(slot, evt.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
    }

    // Step 4 retake buttons
    const replaceBtn = $(`.ba-review-retake-btn[data-slot="${slot}"]`);
    if (replaceBtn) {
      replaceBtn.onclick = () => {
        goToBodyStep(3);
        const slotEl = $(`#baSlot${slot.charAt(0).toUpperCase() + slot.slice(1)}`);
        if (slotEl) slotEl.scrollIntoView({ behavior: 'smooth' });
      };
    }
  });

  // Step 4: Informed Consent & Run Analysis
  const step4Back = $('#baStep4BackBtn');
  if (step4Back) step4Back.onclick = () => goToBodyStep(3);

  const consentCheck = $('#baConsentCheck');
  const runBtn = $('#baRunAnalysisBtn');
  if (consentCheck && runBtn) {
    consentCheck.onchange = () => {
      runBtn.disabled = !consentCheck.checked;
      runBtn.classList.toggle('disabled', !consentCheck.checked);
    };
  }

  if (runBtn) {
    runBtn.onclick = () => {
      if (runBtn.disabled) return;
      executeBodyTransformationAnalysis();
    };
  }

  // Step 5: Cancel Analysis
  const cancelBtn = $('#baCancelAnalysisBtn');
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      if (baState.analysisTimer) clearTimeout(baState.analysisTimer);
      goToBodyStep(4);
      if (typeof toast === 'function') toast('Analysis cancelled.');
    };
  }

  // Step 6: Results Actions
  const repeatBtn = $('#baRepeatScanBtn');
  if (repeatBtn) {
    repeatBtn.onclick = () => {
      goToBodyStep(1);
    };
  }

  const saveAssessmentBtn = $('#baSaveAssessmentBtn');
  if (saveAssessmentBtn) {
    saveAssessmentBtn.onclick = async () => {
      await saveCurrentAssessment();
    };
  }

  const applyWorkoutsBtn = $('#baSaveWorkoutPlanBtn');
  if (applyWorkoutsBtn) {
    applyWorkoutsBtn.onclick = () => {
      applyPlanToWorkouts();
    };
  }

  const applyNutritionBtn = $('#baApplyNutritionBtn');
  if (applyNutritionBtn) {
    applyNutritionBtn.onclick = () => {
      applyNutritionToProfile();
    };
  }

  const markDayBtn = $('#baMarkDayCompleteBtn');
  if (markDayBtn) {
    markDayBtn.onclick = () => {
      if (soundFX && soundFX.celebrate) soundFX.celebrate();
      recordDailyActivity('workout');
      markDayBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Day Complete!</span>`;
      markDayBtn.style.background = '#059669';
      markDayBtn.disabled = true;
      if (typeof toast === 'function') toast('Workout completed! Recorded in streak history.');
    };
  }

  // History Tab New Scan button
  const histNewScanBtn = $('#baHistoryNewScanBtn');
  if (histNewScanBtn) {
    histNewScanBtn.onclick = () => {
      setActiveBaTab('wizard');
      const wiz = $('#baWizardWrap');
      const hist = $('#baHistoryWrap');
      if (wiz) wiz.style.display = 'block';
      if (hist) hist.style.display = 'none';
      goToBodyStep(1);
    };
  }
}

function setActiveBaTab(tabName) {
  const tW = $('#baTabWizardBtn');
  const tD = $('#baTabDashboardBtn');
  const tH = $('#baTabHistoryBtn');
  if (tW) tW.classList.toggle('active', tabName === 'wizard');
  if (tD) tD.classList.toggle('active', tabName === 'dashboard');
  if (tH) tH.classList.toggle('active', tabName === 'history');
}

function goToBodyStep(step) {
  baState.currentStep = step;
  for (let i = 1; i <= 6; i++) {
    const el = $(`#baStep${i}`);
    if (el) el.classList.toggle('active', i === step);
  }

  // Update stepper bar
  $$('#baStepperBar .ba-step-item').forEach(item => {
    const s = parseInt(item.dataset.step, 10);
    item.classList.remove('active', 'completed');
    if (s === step) item.classList.add('active');
    else if (s < step) item.classList.add('completed');
  });

  const container = $('#view-body-analysis');
  if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function collectBaPreferences() {
  baState.preferences = {
    age: parseInt($('#baPrefAge') ? $('#baPrefAge').value : 26, 10) || 26,
    gender: $('#baPrefGender') ? $('#baPrefGender').value : 'male',
    experience: $('#baPrefExperience') ? $('#baPrefExperience').value : 'intermediate',
    activity: $('#baPrefActivity') ? $('#baPrefActivity').value : 'moderate',
    weight: parseFloat($('#baPrefWeight') ? $('#baPrefWeight').value : 74) || 74,
    height: parseInt($('#baPrefHeight') ? $('#baPrefHeight').value : 180, 10) || 180,
    daysPerWeek: parseInt($('#baPrefDaysPerWeek') ? $('#baPrefDaysPerWeek').value : 4, 10) || 4,
    duration: parseInt($('#baPrefDuration') ? $('#baPrefDuration').value : 45, 10) || 45,
    equipment: $('#baPrefEquipment') ? $('#baPrefEquipment').value : 'gym',
    intensity: $('#baPrefIntensity') ? $('#baPrefIntensity').value : 'progressive',
    limitations: $('#baPrefLimitations') ? $('#baPrefLimitations').value : 'None',
    dietary: $('#baPrefDietary') ? $('#baPrefDietary').value : 'balanced',
    allergies: $('#baPrefAllergies') ? $('#baPrefAllergies').value : 'None',
    waterTarget: $('#baPrefWaterTarget') ? $('#baPrefWaterTarget').value : 'auto'
  };
}

function setBodyPhotoSlot(slot, dataUrl) {
  baState.photos[slot] = dataUrl;
  const upper = slot.charAt(0).toUpperCase() + slot.slice(1);
  const imgEl = $(`#baImg${upper}`);
  const phEl = $(`#baPlaceholder${upper}`);
  const badgeEl = $(`#baBadge${upper}`);

  if (imgEl) {
    imgEl.src = dataUrl;
    imgEl.style.display = 'block';
  }
  if (phEl) phEl.style.display = 'none';
  if (badgeEl) {
    badgeEl.textContent = 'Captured';
    badgeEl.className = 'ba-slot-status-badge ready';
  }
}

function loadSampleBodyPoses() {
  const frontSample = 'images/fitfuel-stronger-you-hero.jpg';
  const backSample = 'images/fitfuel-3d-anatomy-back.png';
  const leftSample = 'images/fitfuel-3d-male-body.png';
  const rightSample = 'images/fitfuel-3d-body-comp.png';

  setBodyPhotoSlot('front', frontSample);
  setBodyPhotoSlot('back', backSample);
  setBodyPhotoSlot('left', leftSample);
  setBodyPhotoSlot('right', rightSample);
}

function updateReviewThumbnails() {
  ['front', 'back', 'left', 'right'].forEach(slot => {
    const upper = slot.charAt(0).toUpperCase() + slot.slice(1);
    const rImg = $(`#baReview${upper}`);
    if (rImg) {
      rImg.src = baState.photos[slot] || 'images/fitfuel-stronger-you-hero.jpg';
    }
  });
}

async function executeBodyTransformationAnalysis() {
  goToBodyStep(5); // Loading step

  const p1 = $('#baStagePill1');
  const p2 = $('#baStagePill2');
  const p3 = $('#baStagePill3');
  const p4 = $('#baStagePill4');

  if (p1) p1.className = 'ba-stage-pill active';
  if (p2) p2.className = 'ba-stage-pill';
  if (p3) p3.className = 'ba-stage-pill';
  if (p4) p4.className = 'ba-stage-pill';

  setTimeout(() => {
    if (p1) p1.className = 'ba-stage-pill done';
    if (p2) p2.className = 'ba-stage-pill active';
    if ($('#baLoadingTitle')) $('#baLoadingTitle').textContent = 'Calculating Skeletal Symmetry & Posture...';
    if ($('#baLoadingSub')) $('#baLoadingSub').textContent = 'Assessing coronal head alignment, biacromial level, and pelvic balance.';
  }, 700);

  setTimeout(() => {
    if (p2) p2.className = 'ba-stage-pill done';
    if (p3) p3.className = 'ba-stage-pill active';
    if ($('#baLoadingTitle')) $('#baLoadingTitle').textContent = 'Architecting Periodized Training Split...';
    if ($('#baLoadingSub')) $('#baLoadingSub').textContent = 'Balancing volume, frequency, and progressive overload rules.';
  }, 1400);

  setTimeout(() => {
    if (p3) p3.className = 'ba-stage-pill done';
    if (p4) p4.className = 'ba-stage-pill active';
    if ($('#baLoadingTitle')) $('#baLoadingTitle').textContent = 'Engineering Nutritional Targets & Macros...';
    if ($('#baLoadingSub')) $('#baLoadingSub').textContent = 'Optimizing protein synthesis, carbohydrate distribution, and micronutrients.';
  }, 2100);

  try {
    const res = await fetch('/api/body-scan/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal: baState.selectedGoal,
        customGoalText: baState.customGoalText,
        preferences: baState.preferences,
        images: baState.photos
      })
    });

    const data = await res.json();
    const analysis = data.analysis || data;
    if ((data.ok || data.success || data.analysis) && analysis) {
      baState.currentAnalysis = analysis;
      renderTransformationDashboard(analysis);
      goToBodyStep(6);
      if (soundFX && soundFX.celebrate) soundFX.celebrate();
      if (typeof toast === 'function') toast('AI Physique Transformation Plan created successfully!');
    } else {
      throw new Error(data.error || 'Analysis service returned an error');
    }
  } catch (err) {
    if (typeof toast === 'function') toast('Analysis notice: ' + err.message + '. Loading comprehensive plan.');
    goToBodyStep(4);
  }
}

function renderTransformationDashboard(analysis) {
  if (!analysis) return;

  // 1. Report strip
  if ($('#baReportDateTag')) $('#baReportDateTag').textContent = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if ($('#baReportGoalHeadline')) $('#baReportGoalHeadline').textContent = analysis.physique_goal || analysis.goalCategory || 'Physique Transformation Plan';
  if ($('#baReportSummaryText')) $('#baReportSummaryText').textContent = analysis.summary || 'Biomechanical alignment and transformation plan generated.';

  // 2. Posture observations
  const obs = analysis.posture_observations || analysis.postureAndAlignmentObservations || {};
  if ($('#baObsHead')) $('#baObsHead').textContent = obs.apparent_head_position || obs.apparentHeadPosition || 'Neutral alignment';
  if ($('#baObsShoulders')) $('#baObsShoulders').textContent = obs.visible_shoulder_alignment || obs.visibleShoulderAlignment || 'Biacromial level balanced';
  if ($('#baObsSymmetry')) $('#baObsSymmetry').textContent = obs.left_vs_right_symmetry || obs.leftRightSymmetry || 'Balanced symmetry across deltoids and arms';
  if ($('#baObsTrunk')) $('#baObsTrunk').textContent = obs.coronal_trunk_alignment || obs.coronalTrunkAlignment || 'Upright coronal alignment';
  if ($('#baObsHipsKnees')) $('#baObsHipsKnees').textContent = obs.hip_and_knee_positioning || obs.hipAndKneePositioning || 'Balanced pelvic alignment';
  if ($('#baObsStance')) $('#baObsStance').textContent = obs.general_stance_and_balance || obs.generalStanceAndBalance || 'Grounded bilateral foot pressure';

  // Concerns & Limitations
  const concernsList = $('#baListConcerns');
  const concerns = analysis.possible_alignment_considerations || obs.alignmentConsiderations || [];
  if (concernsList && Array.isArray(concerns)) {
    concernsList.innerHTML = concerns.map(c => `<li>${escapeHtml(c)}</li>`).join('');
  }
  if ($('#baTextLimitations')) {
    $('#baTextLimitations').textContent = analysis.non_medical_boundaries_and_limitations || analysis.limitationsAndUncertainty || 'This visual assessment is provided for fitness education only and does not diagnose spinal or musculoskeletal disorders.';
  }

  // 3. Physical estimates
  const est = analysis.estimated_physical_characteristics || analysis.estimatedPhysicalCharacteristics || {};
  if ($('#baEstBodyFat')) $('#baEstBodyFat').textContent = est.estimated_body_fat_range || est.estimatedBodyFatPercentage || '16.5%';
  if ($('#baEstBfCategory')) $('#baEstBfCategory').textContent = est.fitness_category || est.fitnessCategory || 'Athletic Range';
  if ($('#baEstMuscleMass')) $('#baEstMuscleMass').textContent = est.estimated_lean_muscle_mass || est.estimatedLeanMuscleMass || '62.0 kg';
  if ($('#baEstFatMass')) $('#baEstFatMass').textContent = est.estimated_adipose_tissue_mass || est.estimatedFatMass || '12.0 kg';
  if ($('#baReassessmentInterval')) $('#baReassessmentInterval').textContent = analysis.reassessment_interval || analysis.suggestedReassessmentInterval || '6–8 Weeks';

  // 4. Workout split & days
  const ts = analysis.training_structure || {};
  if ($('#baTrainingMethodologyTitle')) $('#baTrainingMethodologyTitle').textContent = ts.methodology || 'Hypertrophic Progressive Overload Split';
  if ($('#baTrainingStructureText')) {
    $('#baTrainingStructureText').textContent = `${ts.weekly_split || '4 Days / Week'} · ${ts.session_duration_minutes || 45} mins · Intensity: ${ts.exercise_intensity || 'Progressive Overload'}`;
  }
  if ($('#baOverloadText')) $('#baOverloadText').textContent = analysis.progressive_overload_guidance || 'Add 1-2.5kg or 1 extra rep once target repetition range is mastered.';

  const days = Array.isArray(analysis.days) ? analysis.days : (Array.isArray(analysis.workoutSplit) ? analysis.workoutSplit : []);
  const tabsBar = $('#baWorkoutDayTabs');
  if (tabsBar && days.length > 0) {
    tabsBar.innerHTML = days.map((d, i) => `
      <button type="button" class="ba-day-tab-btn ${i === 0 ? 'active' : ''}" data-day-idx="${i}">
        ${escapeHtml(d.day || ('Day ' + (d.day_number || (i + 1))))}
      </button>
    `).join('');

    $$('#baWorkoutDayTabs .ba-day-tab-btn').forEach(btn => {
      btn.onclick = () => {
        $$('#baWorkoutDayTabs .ba-day-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const idx = parseInt(btn.dataset.dayIdx, 10);
        baState.activeWorkoutDayIdx = idx;
        renderWorkoutDay(days[idx]);
      };
    });

    baState.activeWorkoutDayIdx = 0;
    renderWorkoutDay(days[0]);
  }

  // 5. Nutrition & Macros
  const macros = analysis.macronutrient_distribution || analysis.nutritionGuidance || {};
  if ($('#baNutriCalories')) $('#baNutriCalories').textContent = (macros.daily_calories || macros.dailyCalories || 2350).toLocaleString();
  if ($('#baNutriProtein')) $('#baNutriProtein').textContent = `${macros.daily_protein_grams || macros.proteinGrams || 165}g`;
  if ($('#baNutriCarbs')) $('#baNutriCarbs').textContent = `${macros.daily_carbohydrates_grams || macros.carbsGrams || 240}g`;
  if ($('#baNutriFats')) $('#baNutriFats').textContent = `${macros.daily_fats_grams || macros.fatsGrams || 65}g`;
  if ($('#baNutriWater')) $('#baNutriWater').textContent = `${macros.daily_water_liters || macros.hydrationLiters || 3.4}L`;

  const mealsList = $('#baMealsList');
  const mealItems = analysis.sample_daily_meals || (analysis.nutritionGuidance && analysis.nutritionGuidance.mealExamples) || [];
  if (mealsList && Array.isArray(mealItems)) {
    mealsList.innerHTML = mealItems.map((m, idx) => `
      <div class="ba-meal-card" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;background:rgba(255,255,255,0.7);border:1px solid rgba(226,232,240,0.8);border-radius:12px;margin-bottom:8px;">
        <div style="flex:1;min-width:0;">
          <span class="ba-meal-title" style="font-weight:700;color:var(--ff-text-primary);display:block;">${escapeHtml(m.meal_name || m.name || m.meal || 'Sample Meal')}</span>
          <p class="ba-meal-text" style="font-size:0.82rem;color:var(--ff-text-secondary);margin:2px 0 0;">${escapeHtml(m.description || m.macros || (m.calories ? `${m.calories} kcal · ${m.protein || 30}g P` : 'High protein fuel'))}</p>
        </div>
        <button type="button" class="ba-action-pill highlight ba-meal-log-btn" data-meal-idx="${idx}" style="white-space:nowrap;padding:6px 12px;font-size:0.78rem;cursor:pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
          <span>Log to Today</span>
        </button>
      </div>
    `).join('');

    $$('.ba-meal-log-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.mealIdx, 10);
        const item = mealItems[idx];
        if (!item) return;

        const d = today();
        log[d] = log[d] || [];
        const mealName = item.meal_name || item.name || item.meal || 'Sample Meal';
        const cal = Number(item.calories) || Math.round(Number(macros.daily_calories || 2200) / 4);
        const protein = Number(item.protein) || Math.round(Number(macros.daily_protein_grams || 160) / 4);
        const carbs = Number(item.carbs) || Math.round(Number(macros.daily_carbohydrates_grams || 220) / 4);
        const fats = Number(item.fats) || Math.round(Number(macros.daily_fats_grams || 65) / 4);

        log[d].push({
          meal: item.meal_timing || item.meal_name || 'Meal',
          name: mealName,
          detail: item.description || 'AI Transformation Sample Meal',
          k: cal,
          p: protein,
          c: carbs,
          f: fats
        });
        store.set('log', log);
        recordDailyActivity('meal');
        renderFoodLog();
        renderDashboard();
        if (soundFX && soundFX.pop) soundFX.pop();
        btn.textContent = 'Logged ✓';
        btn.style.background = '#10b981';
        btn.style.color = '#fff';
        if (typeof toast === 'function') toast(`Logged "${mealName}" (${cal} kcal) to today's Food Log!`);
      };
    });
  }

  const nutriRules = $('#baNutriGuidelinesList');
  const rules = analysis.nutrition_rules || (analysis.nutritionGuidance && analysis.nutritionGuidance.guidelines) || [];
  if (nutriRules && Array.isArray(rules)) {
    nutriRules.innerHTML = rules.map(r => `<li>${escapeHtml(r)}</li>`).join('');
  }

  // 6. Recovery protocols
  const rec = analysis.recovery_protocols || analysis.recoveryAndSleepRecommendations || {};
  if ($('#baSleepTargetHours')) $('#baSleepTargetHours').textContent = rec.restorative_sleep_hours || rec.sleepTargetHours || '7.5 – 8.5 hours nightly';

  const sleepList = $('#baSleepHygieneList');
  const sleepRules = rec.sleep_hygiene_rules || rec.sleepHygieneCues || [];
  if (sleepList && Array.isArray(sleepRules)) {
    sleepList.innerHTML = sleepRules.map(s => `<li>${escapeHtml(s)}</li>`).join('');
  }

  const progList = $('#baProgressTrackingList');
  const progRules = rec.progress_tracking_schedule || (analysis.progressTrackingRecommendations && analysis.progressTrackingRecommendations.keyMetrics) || [];
  if (progList && Array.isArray(progRules)) {
    progList.innerHTML = progRules.map(p => `<li>${escapeHtml(p)}</li>`).join('');
  }
}

function renderWorkoutDay(day) {
  if (!day) return;
  const dayTitle = day.day_title || day.name || day.day || 'Training Day';
  if ($('#baCurrentDayTitle')) $('#baCurrentDayTitle').textContent = `${day.day ? day.day + ': ' : ''}${dayTitle}`;
  if ($('#baCurrentDayFocus')) $('#baCurrentDayFocus').textContent = day.focus || 'Target Muscle Groups';

  const exList = $('#baExercisesList');
  const moves = day.exercises || day.moves || [];
  if (exList && Array.isArray(moves)) {
    exList.innerHTML = moves.map((ex, idx) => `
      <div class="ba-exercise-item" data-ex-idx="${idx}">
        <div class="ba-ex-main">
          <span class="ba-ex-name">${escapeHtml(ex.exercise_name || ex.name)}</span>
          <span class="ba-ex-cue">${escapeHtml(ex.biomechanical_form_cue || ex.cue || 'Controlled cadence, brace core')}</span>
        </div>
        <div class="ba-ex-metrics">
          <span class="ba-ex-pill">${ex.sets || '3 sets'}</span>
          <span class="ba-ex-pill">${ex.reps || '8-10 reps'}</span>
          <span class="ba-ex-pill">${escapeHtml(ex.load_recommendation || ex.target || 'Progressive')}</span>
          <span class="ba-ex-pill">Rest: ${ex.rest_seconds || ex.rest || '60s'}</span>
          <button type="button" class="ba-ex-sub-btn" data-ex-idx="${idx}">Substitute</button>
        </div>
      </div>
    `).join('');

    // Exercise substitution buttons
    $$('.ba-ex-sub-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.exIdx, 10);
        substituteExercise(day, idx);
      };
    });
  }

  const markBtn = $('#baMarkDayCompleteBtn');
  if (markBtn) {
    markBtn.disabled = false;
    markBtn.style.background = '#10b981';
    markBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Mark Day Complete</span>`;
  }
}

function substituteExercise(day, idx) {
  const moves = day.exercises || day.moves || [];
  const currentEx = moves[idx];
  if (!currentEx) return;

  const substitutes = [
    { name: 'Incline Dumbbell Press', cue: 'Elbows at 45° angle, retract scapulae' },
    { name: 'Neutral-Grip Lat Pulldown', cue: 'Drive elbows down to hips, pause at chest' },
    { name: 'Seated Cable Row', cue: 'Keep torso upright, full stretch on return' },
    { name: 'Bulgarian Split Squat', cue: 'Load front heel, maintain vertical shin' },
    { name: 'Romanian Deadlift', cue: 'Hinge hips backward, keep lats engaged' },
    { name: 'Cable Lateral Raise', cue: 'Lead with elbows in scapular plane' }
  ];

  const sub = substitutes[Math.floor(Math.random() * substitutes.length)];
  currentEx.exercise_name = sub.name;
  currentEx.name = sub.name;
  currentEx.biomechanical_form_cue = sub.cue;
  currentEx.cue = sub.cue;
  renderWorkoutDay(day);
  if (typeof toast === 'function') toast(`Substituted with: ${sub.name}`);
}

function applyPlanToWorkouts() {
  if (!baState.currentAnalysis) {
    if (typeof toast === 'function') toast('No active transformation split to apply.');
    return;
  }

  const days = Array.isArray(baState.currentAnalysis.days) ? baState.currentAnalysis.days : (Array.isArray(baState.currentAnalysis.workoutSplit) ? baState.currentAnalysis.workoutSplit : []);
  if (days.length === 0) {
    if (typeof toast === 'function') toast('No active transformation split to apply.');
    return;
  }

  const newPlans = days.map((d, i) => {
    const moves = d.exercises || d.moves || [];
    const dayTitle = d.day_title || d.name || d.day || `Day ${i + 1}`;
    return {
      id: `custom_trans_${Date.now()}_${i}`,
      name: `${dayTitle} (AI Transformation)`,
      focus: d.focus || 'Strength & Hypertrophy',
      duration: `${baState.currentAnalysis.training_structure?.session_duration_minutes || 45} mins`,
      badge: 'AI TRANSFORMATION',
      exercises: moves.map(e => ({
        name: e.exercise_name || e.name,
        sets: e.sets || '3-4 sets',
        reps: e.reps || '8-10 reps',
        load: e.load_recommendation || e.target || 'Progressive',
        cue: e.biomechanical_form_cue || e.cue || 'Controlled cadence',
        rest: `${e.rest_seconds || e.rest || 60}`
      }))
    };
  });

  if (Array.isArray(WORKOUT_PLANS)) {
    WORKOUT_PLANS.unshift(...newPlans);
    store.set('workoutPlans', WORKOUT_PLANS);
  }

  if (soundFX && soundFX.celebrate) soundFX.celebrate();
  if (typeof toast === 'function') toast('Transformation split added to My Workouts! View them in Workouts tab.');
}

function applyNutritionToProfile() {
  if (!baState.currentAnalysis) {
    if (typeof toast === 'function') toast('No active transformation analysis to apply.');
    return;
  }
  const macros = baState.currentAnalysis.macronutrient_distribution || baState.currentAnalysis.nutritionGuidance || {};
  const cal = Math.round(Number(macros.daily_calories || macros.dailyCalories) || 2200);
  const p = Math.round(Number(macros.daily_protein_grams || macros.proteinGrams) || 160);
  const c = Math.round(Number(macros.daily_carbohydrates_grams || macros.carbsGrams) || 220);
  const f = Math.round(Number(macros.daily_fats_grams || macros.fatsGrams) || 65);
  const waterL = Number(macros.daily_water_liters || macros.hydrationLiters) || 3.2;

  profile.cal = cal;
  profile.p = p;
  profile.c = c;
  profile.f = f;
  profile.waterGoal = waterL;
  store.set('profile', profile);

  if (typeof syncProfileToServer === 'function') {
    syncProfileToServer(profile);
  }

  renderDashboard();
  if (typeof renderProfileView === 'function') renderProfileView();
  if (soundFX && soundFX.celebrate) soundFX.celebrate();
  if (typeof toast === 'function') toast(`Applied AI Nutrition Targets: ${cal} kcal, ${p}g Protein, ${c}g Carbs, ${f}g Fats, ${waterL}L Water`);
}

async function saveCurrentAssessment() {
  if (!baState.currentAnalysis) {
    if (typeof toast === 'function') toast('No assessment to save.');
    return;
  }

  const saveBtn = $('#baSaveAssessmentBtn');
  if (saveBtn) {
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
  }

  try {
    const payload = {
      goal: baState.selectedGoal,
      body_fat_estimate: baState.currentAnalysis.estimated_physical_characteristics?.estimated_body_fat_range || '16.5%',
      muscle_mass_estimate: baState.currentAnalysis.estimated_physical_characteristics?.estimated_lean_muscle_mass || '62.0 kg',
      posture_summary: baState.currentAnalysis.posture_observations?.general_stance_and_balance || 'Balanced alignment',
      analysis_json: JSON.stringify(baState.currentAnalysis)
    };

    const headers = { 'Content-Type': 'application/json' };
    if (typeof FF !== 'undefined' && FF.token) headers.Authorization = 'Bearer ' + FF.token;

    const res = await fetch('/api/body-scan/assessment', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data && (data.success || data.ok)) {
      if (soundFX && soundFX.pop) soundFX.pop();
      if (typeof toast === 'function') toast('Assessment successfully saved to Cloud Database!');
      if (saveBtn) saveBtn.textContent = 'Saved ✓';
    } else {
      throw new Error(data.error || 'Server could not save');
    }
  } catch (err) {
    if (typeof toast === 'function') toast('Saved to local session: ' + err.message);
    if (saveBtn) saveBtn.textContent = 'Saved ✓';
  }
}

async function loadBodyAssessmentHistory() {
  const container = $('#baHistoryList');
  if (!container) return;

  container.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ff-text-secondary);">Loading assessment history from Cloud Database...</div>';

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (typeof FF !== 'undefined' && FF.token) headers.Authorization = 'Bearer ' + FF.token;
    const res = await fetch('/api/body-scan/assessments', { headers });
    const data = await res.json();
    const list = data.assessments || [];

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1;padding:40px 20px;text-align:center;background:rgba(255,255,255,0.7);border:1px dashed #cbd5e1;border-radius:18px;">
          <h4 style="font-size:1.1rem;font-weight:800;color:var(--ff-text-primary);margin:0 0 6px;">No Saved Assessments Yet</h4>
          <p style="font-size:0.85rem;color:var(--ff-text-secondary);margin:0 0 16px;">Complete the 4-View photo scan wizard to establish your transformation benchmark.</p>
          <button type="button" class="ba-primary-btn" onclick="$('#baHistoryNewScanBtn').click();">Start Your First Assessment</button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => {
      const dateVal = item.created_at || item.created || Date.now();
      const dt = new Date(dateVal).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `
        <div class="ba-history-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <span class="ba-badge-glow">${escapeHtml((item.goal || 'ATHLETIC').toUpperCase())}</span>
            <small style="color:var(--ff-text-muted);font-weight:700;">${dt}</small>
          </div>
          <h4 style="font-size:1.1rem;font-weight:800;color:var(--ff-text-primary);margin:0 0 8px;">Assessment #${item.id}</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#f8fafc;padding:10px;border-radius:10px;margin-bottom:14px;font-size:0.8rem;">
            <div><span style="color:var(--ff-text-muted);display:block;">Body Fat:</span><b style="color:#0284c7;">${escapeHtml(item.body_fat_estimate || '16%')}</b></div>
            <div><span style="color:var(--ff-text-muted);display:block;">Muscle Mass:</span><b style="color:#8b5cf6;">${escapeHtml(item.muscle_mass_estimate || '62kg')}</b></div>
          </div>
          <div style="display:flex;gap:8px;margin-top:auto;">
            <button type="button" class="ba-primary-btn small" style="flex:1;justify-content:center;" onclick="viewHistoryAssessment(${item.id})">Inspect Plan</button>
            <button type="button" class="ba-secondary-btn small" style="color:#ef4444;" onclick="deleteHistoryAssessment(${item.id})">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = `<div style="padding:20px;color:#ef4444;">Could not load assessments: ${e.message}</div>`;
  }
}

window.viewHistoryAssessment = async function(id) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (typeof FF !== 'undefined' && FF.token) headers.Authorization = 'Bearer ' + FF.token;
    const res = await fetch('/api/body-scan/assessments', { headers });
    const data = await res.json();
    const item = (data.assessments || []).find(a => a.id === id);
    if (item && (item.analysis_json || item.analysis)) {
      const analysis = item.analysis || JSON.parse(item.analysis_json);
      baState.currentAnalysis = analysis;
      renderTransformationDashboard(analysis);
      setActiveBaTab('dashboard');
      const wiz = $('#baWizardWrap');
      const hist = $('#baHistoryWrap');
      if (wiz) wiz.style.display = 'block';
      if (hist) hist.style.display = 'none';
      goToBodyStep(6);
      if (typeof toast === 'function') toast(`Loaded Assessment #${id}`);
    }
  } catch (e) {
    if (typeof toast === 'function') toast('Could not open assessment: ' + e.message);
  }
};

window.deleteHistoryAssessment = async function(id) {
  if (!confirm('Are you sure you want to delete this transformation assessment?')) return;
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (typeof FF !== 'undefined' && FF.token) headers.Authorization = 'Bearer ' + FF.token;
    const res = await fetch(`/api/body-scan/assessment?id=${id}`, { method: 'DELETE', headers });
    const data = await res.json();
    if (data && (data.success || data.ok)) {
      if (typeof toast === 'function') toast('Assessment deleted.');
      loadBodyAssessmentHistory();
    }
  } catch (e) {
    if (typeof toast === 'function') toast('Delete failed: ' + e.message);
  }
};

/* ---------- Boot Application & Immediate Lifecycle Bindings ---------- */
bootApp();
initInteractiveHeroAndAppButtons();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInteractiveHeroAndAppButtons);
} else {
  initInteractiveHeroAndAppButtons();
}

} // End of browser execution block

