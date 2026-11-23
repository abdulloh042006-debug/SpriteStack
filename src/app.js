/* =========================================================================
   SPRITESTACK POYGA 2.0 — MAIN CLIENT APPLICATION
   Integrates: 25 Verified Vehicles, 15-Slice SpriteStacker, 10 Maps,
   Tunnels, Jump Ramps, Isolated Trains & Ships, Weather, Infinite Levels,
   Economy/Shop/Compare, Social Profile/Emotes, and Real WebSocket Multiplayer.
   ========================================================================= */

import { VEHICLES, WORLD_VEHICLES, CAR_CATEGORIES, CAR_COLORS, getVehicleById, loadWorldCatalogData, getAllVehiclesCount, computeBasePR, getCarClassFromPR } from './data/vehicles.js';
import { TRACKS, WEATHER_MODES, RACE_MODES, getTrackById } from './data/tracks.js';
import {
  EMOTES, ACHIEVEMENTS, DAILY_CHALLENGES,
  generateNickname, sanitizeNickname, generateRoomName,
  xpNeededForLevel, applyXpGain, validateVehiclePurchase, purchaseVehicle,
  calculateRaceReward, createDefaultProfile, evaluateAchievements
} from './engine/progression.js';
import { generateCarSlices, drawSpriteStack, drawPixelAvatar, drawInviteQR } from './engine/spriteStacker.js';
import {
  AI_PERSONALITIES, buildTrackGeometry, updateDecorEnvironments,
  createPhysicsCar, updateCarPhysics, resolveCarCollisions
} from './engine/physics.js';

/* ---------- Safe Persistence (v2 with v1 migration) ---------- */
function loadProfile() {
  const def = createDefaultProfile();
  try {
    const rawV2 = localStorage.getItem('spritestack_poyga_v2');
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      const merged = {
        ...def,
        ...parsed,
        tuning: { ...def.tuning, ...(parsed.tuning || {}) },
        stats: { ...def.stats, ...(parsed.stats || {}) },
        settings: { ...def.settings, ...(parsed.settings || {}) }
      };
      const today = new Date().toISOString().slice(0, 10);
      if (merged.dailyDate !== today) {
        merged.dailyDate = today;
        merged.dailyProgress = { dailyWins: 0, dailyLaps: 0, dailyDrift: 0 };
        merged.dailyClaimed = [];
      }
      return merged;
    }
    const rawV1 = localStorage.getItem('spritestack_poyga_v1');
    if (rawV1) {
      const v1 = JSON.parse(rawV1);
      if (v1 && v1.bestRank) def.bestRank = v1.bestRank;
    }
  } catch (_) {}
  return def;
}

function saveProfile() {
  try { localStorage.setItem('spritestack_poyga_v2', JSON.stringify(profile)); } catch (_) {}
}

const profile = loadProfile();

/* ---------- Procedural Pixel Textures (Cached per theme) ---------- */
const texCache = new Map();
const patCache = new Map();
function getCachedPattern(key, imgCanvas) {
  let p = patCache.get(key);
  if (!p) { p = ctx.createPattern(imgCanvas, 'repeat'); patCache.set(key, p); }
  return p;
}
function getGroundTexture(theme, isNight) {
  const key = `g_${theme}_${isNight}`;
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas');
  c.width = 48; c.height = 48;
  const g = c.getContext('2d');
  const palettes = {
    grass:      isNight ? ['#162e18', '#0d1f0f', '#214223'] : ['#4a9e2a', '#2d7a18', '#73c938'],
    city:       isNight ? ['#1e222a', '#15181e', '#2c313c'] : ['#525864', '#3f444f', '#6b7280'],
    night_city: ['#151a26', '#0e121b', '#232b3e'],
    mountain:   isNight ? ['#252822', '#1a1d18', '#33382f'] : ['#6b705c', '#535747', '#848a73'],
    desert:     isNight ? ['#524028', '#3f301d', '#665033'] : ['#d4a359', '#b8873d', '#e5bc78'],
    forest:     isNight ? ['#112716', '#0a1a0d', '#1b3b22'] : ['#2f7d24', '#1e5c17', '#4aa339'],
    coastal:    isNight ? ['#3f3a2c', '#2e2a1f', '#524b3a'] : ['#d9c38c', '#c2aa70', '#ead8a8'],
    industrial: isNight ? ['#1c1f24', '#131519', '#2b3038'] : ['#474c54', '#353940', '#5e646e'],
    snow:       isNight ? ['#475569', '#334155', '#64748b'] : ['#dce8f2', '#bfd4e6', '#f1f7fc']
  };
  const pal = palettes[theme] || palettes.grass;
  g.fillStyle = pal[0];
  g.fillRect(0, 0, 48, 48);
  let s = 1337;
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  for (let y = 0; y < 48; y += 3) {
    for (let x = 0; x < 48; x += 3) {
      const r = rand();
      if (r < 0.22) { g.fillStyle = pal[1]; g.fillRect(x, y, 3, 3); }
      else if (r < 0.42) { g.fillStyle = pal[2]; g.fillRect(x, y, 3, 3); }
    }
  }
  texCache.set(key, c);
  return c;
}

function getAsphaltTexture(isNight) {
  const key = `a_${isNight}`;
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas');
  c.width = 48; c.height = 48;
  const g = c.getContext('2d');
  g.fillStyle = isNight ? '#21252e' : '#3a3d42';
  g.fillRect(0, 0, 48, 48);
  let s = 9001;
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  for (let i = 0; i < 44; i++) {
    const x = Math.floor(rand() * 16) * 3;
    const y = Math.floor(rand() * 16) * 3;
    g.fillStyle = rand() > 0.45 ? (isNight ? '#313745' : '#53575e') : (isNight ? '#171a21' : '#2c2f34');
    g.fillRect(x, y, 3, 3);
  }
  texCache.set(key, c);
  return c;
}

function getTreeSlices(theme, isNight) {
  const key = `t_${theme}_${isNight}`;
  if (texCache.has(key)) return texCache.get(key);
  const slices = [];
  const S = 18;
  const isSnow = theme === 'snow';
  const isDesert = theme === 'desert';
  for (let z = 0; z < 8; z++) {
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const g = c.getContext('2d');
    if (z < 2) {
      g.fillStyle = '#5c3c24';
      g.fillRect(7, 7, 4, 4);
    } else {
      const rad = isDesert ? [0, 0, 3, 3, 3, 2, 2, 1][z] : [0, 0, 7, 7, 6, 5, 4, 2][z];
      let col = z < 4 ? '#1f6e24' : (z < 6 ? '#329628' : '#59ba34');
      if (isSnow && z >= 5) col = '#e2eef8';
      else if (isDesert) col = '#2d8a42';
      else if (isNight) col = z < 5 ? '#12331a' : '#1f4f2b';
      g.fillStyle = col;
      for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
          if ((x - 8.5) ** 2 + (y - 8.5) ** 2 <= rad * rad) g.fillRect(x, y, 1, 1);
        }
      }
    }
    slices.push(c);
  }
  texCache.set(key, slices);
  return slices;
}

/* ---------- Web Audio Synthesizer (Zero External Files) ---------- */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = Boolean(profile.settings.muted);
    this.ready = false;
    this.engineOsc = null;
    this.engineFilter = null;
    this.engineGain = null;
    this.screechGain = null;
  }
  init() {
    if (this.ready) {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.value = 340;
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0;
      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();

      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf; noise.loop = true;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 4;
      this.screechGain = this.ctx.createGain();
      this.screechGain.gain.value = 0;
      noise.connect(bp); bp.connect(this.screechGain); this.screechGain.connect(this.ctx.destination);
      noise.start();
      this.ready = true;
    } catch (_) {}
  }
  updateEngine(speedRatio, drifting, nitro, inTunnel, active) {
    if (!this.ready || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.muted || !active) {
      this.engineGain.gain.setTargetAtTime(0, now, 0.08);
      this.screechGain.gain.setTargetAtTime(0, now, 0.06);
      return;
    }
    const freq = 55 + speedRatio * 155 + (nitro ? 45 : 0);
    this.engineOsc.frequency.setTargetAtTime(freq, now, 0.05);
    this.engineFilter.frequency.setTargetAtTime(inTunnel ? 620 : 340, now, 0.08);
    this.engineGain.gain.setTargetAtTime((inTunnel ? 0.048 : 0.032) + speedRatio * 0.035, now, 0.08);
    this.screechGain.gain.setTargetAtTime(drifting ? 0.034 : 0, now, 0.05);
  }
  beep(freq = 660, dur = 0.14, type = 'square', vol = 0.08) {
    if (!this.ready || !this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + dur);
  }
  jump() { this.beep(320, 0.16, 'triangle', 0.1); setTimeout(() => this.beep(540, 0.14, 'triangle', 0.08), 70); }
  land() { this.beep(95, 0.12, 'triangle', 0.14); }
  bump() { this.beep(115, 0.1, 'triangle', 0.11); }
  lap() { this.beep(587, 0.1, 'triangle', 0.09); setTimeout(() => this.beep(880, 0.18, 'triangle', 0.09), 110); }
  fanfare(won) { (won ? [523, 659, 784, 1046] : [392, 349, 311]).forEach((f, i) => setTimeout(() => this.beep(f, 0.2, 'triangle', 0.1), i * 130)); }
}
const sfx = new SoundEngine();

/* ---------- Global Game State ---------- */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimap-canvas');
const mctx = minimapCanvas.getContext('2d');
const previewCanvas = document.getElementById('preview-canvas');
const pctx = previewCanvas.getContext('2d');

const keys = { up: false, down: false, left: false, right: false, drift: false, nitro: false };

function isTouchDevice() {
  return ('ontouchstart' in window) ||
    Number(navigator.maxTouchPoints || 0) > 0 ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches);
}

document.documentElement.classList.toggle('touch-device', isTouchDevice());

const DEFAULT_MULTIPLAYER_SERVER = 'wss://spritestack-poyga-server-lb2i.onrender.com';

const state = {
  mode: 'menu', // menu | countdown | racing | paused | finished
  activeTab: 'race',
  selectedTrackId: 0,
  inspectCarId: profile.selectedVehicleId || 'daewoo_nexia_n100',
  garageCat: 'all',
  garageClass: 'all',
  garagePage: 1,
  garageSearch: '',
  garageSort: 'level',
  explodePreview: false,
  touchVisible: isTouchDevice(),
  raceConfig: { laps: 2, weather: 'clear', weatherPhysics: false, raceMode: 'classic', botCount: 3, isMultiplayer: false, raceTime: 0, active: false },
  track: null,
  cars: [],
  skids: [],
  particles: [],
  weatherDrops: [],
  floatingEmotes: [],
  countdownTimer: 0,
  lastCountdownNum: 4,
  cam: { x: 0, y: 0, shake: 0, zoom: 1.0 },
  lastEmoteAt: 0,
  // Real WebSocket Multiplayer State
  mp: {
    ws: null,
    connected: false,
    scope: 'online',
    rooms: [],
    lobby: null,
    remoteStates: new Map(),
    lastSyncSent: 0
  }
};

let toastTimer = null;
function showToast(msg, ms = 2600) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.display = 'block';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.style.display = 'none'; }, ms);
}

let bannerTimer = null;
function showBanner(main, sub = '', dur = 900) {
  const el = document.getElementById('center-banner');
  el.innerHTML = `<div class="countdown-text">${main}</div>` + (sub ? `<div class="banner-sub">${sub}</div>` : '');
  if (bannerTimer) clearTimeout(bannerTimer);
  if (dur > 0) bannerTimer = setTimeout(() => { el.innerHTML = ''; }, dur);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const d = Math.floor((sec * 10) % 10);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${d}`;
}

/* ---------- World Rendering (Tracks, Tunnels, Ramps, Isolated Trains & Ships, Weather) ---------- */
function renderWorld() {
  const track = state.track;
  if (!track) return;
  const S = track.samples;
  const M = S.length;
  const halfW = track.halfW;
  const isNight = state.raceConfig.weather === 'night';
  const viewW = canvas.width / state.cam.zoom;
  const viewH = canvas.height / state.cam.zoom;

  // 1. Ground texture
  const groundPat = getCachedPattern(`gp_${track.theme}_${isNight}`, getGroundTexture(track.theme, isNight));
  ctx.fillStyle = groundPat;
  ctx.fillRect(state.cam.x - viewW * 0.75, state.cam.y - viewH * 0.75, viewW * 1.5, viewH * 1.5);

  // 2. Animated Pixel Water & Independent Decorative Ships (ZERO physics interaction!)
  if (track.water) {
    const w = track.water;
    const wx = w.side === 'east' ? w.xEdge : state.cam.x - viewW;
    const ww = w.side === 'east' ? 1800 : (w.xEdge - (state.cam.x - viewW));
    ctx.fillStyle = isNight ? '#0c4a6e' : w.color;
    ctx.fillRect(wx, state.cam.y - viewH, Math.max(0, ww), viewH * 2);
    // Shoreline foam
    ctx.fillStyle = isNight ? '#38bdf8' : '#e0f2fe';
    ctx.fillRect(w.xEdge - 4, state.cam.y - viewH, 8, viewH * 2);
    // Animated wave pixels
    const waveShift = Math.floor(state.raceConfig.raceTime * 18) % 36;
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    for (let wy = -1200; wy < 1200; wy += 48) {
      for (let ox = 40; ox < 600; ox += 84) {
        const px = w.side === 'east' ? w.xEdge + ox : w.xEdge - ox;
        ctx.fillRect(px, wy + waveShift, 18, 3);
      }
    }
    // Render independent ships
    for (const sh of track.decorShips) {
      ctx.save();
      ctx.translate(sh.x, sh.y);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(-sh.width / 2, -sh.dir * (sh.length / 2 + 12), sh.width, 14); // wake
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-sh.width / 2 - 2, -sh.length / 2 - 2, sh.width + 4, sh.length + 4);
      ctx.fillStyle = sh.color;
      ctx.fillRect(-sh.width / 2, -sh.length / 2, sh.width, sh.length);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-sh.width * 0.32, -sh.length * 0.2, sh.width * 0.64, sh.length * 0.36);
      ctx.restore();
    }
  }

  // 3. Independent Railway Tracks & Decorative Trains (ZERO physics interaction!)
  for (const tr of track.decorTrains) {
    // Railway ballast & sleepers
    ctx.fillStyle = isNight ? '#1c1917' : '#57534e';
    ctx.fillRect(-1800, tr.y - 18, 3600, 36);
    ctx.fillStyle = '#292524';
    for (let rx = -1780; rx < 1780; rx += 16) ctx.fillRect(rx, tr.y - 14, 5, 28);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-1800, tr.y - 9, 3600, 3);
    ctx.fillRect(-1800, tr.y + 6, 3600, 3);
  }

  // 4. Road Curbs & Asphalt
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(S[0].x, S[0].y);
  for (let i = 1; i < M; i++) ctx.lineTo(S[i].x, S[i].y);
  ctx.closePath();
  ctx.strokeStyle = isNight ? '#cbd5e1' : '#f8fafc';
  ctx.lineWidth = halfW * 2 + 24;
  ctx.stroke();

  ctx.save();
  ctx.setLineDash([22, 22]);
  ctx.strokeStyle = isNight ? '#b91c1c' : '#e11d2a';
  ctx.lineWidth = halfW * 2 + 24;
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(S[0].x, S[0].y);
  for (let i = 1; i < M; i++) ctx.lineTo(S[i].x, S[i].y);
  ctx.closePath();
  ctx.strokeStyle = getCachedPattern(`ap_${isNight}`, getAsphaltTexture(isNight));
  ctx.lineWidth = halfW * 2;
  ctx.stroke();

  // Center dashed line
  ctx.save();
  ctx.setLineDash([16, 26]);
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 5. Checkered Start/Finish Line
  const p0 = S[0];
  ctx.save();
  ctx.translate(p0.x, p0.y);
  ctx.rotate(p0.angle);
  const cell = 11;
  const cols = Math.floor((halfW * 2) / cell);
  const startY = -(cols * cell) / 2;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#f8fafc' : '#111318';
      ctx.fillRect(-cell + r * cell, startY + c * cell, cell, cell);
    }
  }
  ctx.restore();

  // 6. Jump Ramps (Yellow/Black Chevron Launch Pads)
  for (const r of track.ramps) {
    ctx.save();
    ctx.translate(r.pt.x, r.pt.y);
    ctx.rotate(r.pt.angle);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-26, -halfW * 0.72, 52, halfW * 1.44);
    ctx.fillStyle = '#111827';
    for (let ry = -halfW * 0.62; ry < halfW * 0.62; ry += 22) {
      ctx.fillRect(-16, ry, 10, 10);
      ctx.fillRect(4, ry + 5, 12, 10);
    }
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(20, -halfW * 0.72, 6, halfW * 1.44);
    ctx.restore();
  }

  // 7. Skid Marks
  for (let i = 0; i < state.skids.length; i++) {
    const sk = state.skids[i];
    ctx.fillStyle = `rgba(12, 12, 16, ${sk.alpha})`;
    ctx.fillRect(sk.x - 2, sk.y - 2, 4, 4);
  }

  // 8. Independent Moving Trains (drawn above rails, strictly visual)
  for (const tr of track.decorTrains) {
    const carLen = 58;
    const gap = 6;
    for (let c = 0; c < tr.cars; c++) {
      const cx = tr.x - tr.dir * c * (carLen + gap);
      // 3-layer mini sprite stack for train car
      for (let l = 0; l < 4; l++) {
        ctx.fillStyle = l === 0 ? '#111827' : (c === 0 && l === 3 ? '#f8fafc' : tr.color);
        ctx.fillRect(cx - carLen / 2, tr.y - 13 - l * 3, carLen, 26);
      }
      // Windows
      ctx.fillStyle = tr.type === 'highspeed' ? '#38bdf8' : '#fde68a';
      ctx.fillRect(cx - carLen / 2 + 8, tr.y - 19, carLen - 16, 6);
    }
  }

  // 9. Depth-sorted Cars & 8-Slice Trees
  const treeSlices = getTreeSlices(track.theme, isNight);
  const drawList = [];
  for (const car of state.cars) {
    if (!car.eliminated) drawList.push({ type: 'car', y: car.y, obj: car });
  }
  for (const tree of track.trees) {
    if (Math.abs(tree.x - state.cam.x) < viewW * 0.65 && Math.abs(tree.y - state.cam.y) < viewH * 0.65) {
      drawList.push({ type: 'tree', y: tree.y, obj: tree });
    }
  }
  drawList.sort((a, b) => a.y - b.y);

  for (const item of drawList) {
    if (item.type === 'tree') {
      drawSpriteStack(ctx, treeSlices, item.obj.x, item.obj.y, 0, item.obj.scale, 3.1, 0.28);
    } else {
      const car = item.obj;
      if (isNight || car.inTunnel) {
        ctx.save();
        ctx.translate(car.x, car.y - 8 - car.z);
        ctx.rotate(car.angle);
        const grad = ctx.createLinearGradient(14, 0, 165, 0);
        grad.addColorStop(0, 'rgba(254, 240, 138, 0.42)');
        grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(14, -10); ctx.lineTo(165, -46); ctx.lineTo(165, 46); ctx.lineTo(14, 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      const neon = car.isPlayer ? profile.tuning.neon : 'none';
      drawSpriteStack(ctx, car.slices, car.x, car.y, car.angle, 1.85, 1.55, 0.42, car.z, neon);

      ctx.save();
      ctx.font = '700 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = car.isPlayer ? '#fde047' : (car.isRemote ? '#38bdf8' : 'rgba(255,255,255,0.78)');
      ctx.fillText(car.isPlayer ? profile.nickname : car.name, car.x, car.y - 34 - car.z);
      ctx.restore();
    }
  }

  // 10. Tunnel Roof Overpasses (semi-transparent cutaway when player is inside so car stays visible!)
  const playerCar = state.cars.find(c => c.isPlayer);
  for (const tun of track.tunnels) {
    const alpha = playerCar && playerCar.inTunnel ? 0.45 : 0.88;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(S[tun.startIdx].x, S[tun.startIdx].y);
    for (let i = tun.startIdx + 1; i <= tun.endIdx; i++) {
      const p = S[i % M];
      ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = `rgba(15, 23, 42, ${alpha})`;
    ctx.lineWidth = halfW * 2 + 28;
    ctx.lineCap = 'butt';
    ctx.stroke();

    // Tunnel interior guide lights
    ctx.setLineDash([10, 32]);
    ctx.strokeStyle = `rgba(251, 191, 36, ${alpha * 0.85})`;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  // 11. Particles & Floating Emotes
  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i];
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  for (let i = state.floatingEmotes.length - 1; i >= 0; i--) {
    const fe = state.floatingEmotes[i];
    const car = state.cars.find(c => c.id === fe.carId);
    if (car) {
      ctx.save();
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(fe.icon, car.x, car.y - 52 - car.z - (2.2 - fe.life) * 14);
      ctx.restore();
    }
  }
}

function renderWeatherOverlay(dt) {
  const w = state.raceConfig.weather;
  if (w === 'sunset') {
    ctx.fillStyle = 'rgba(249, 115, 22, 0.12)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (w === 'fog') {
    ctx.fillStyle = 'rgba(203, 213, 225, 0.22)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (w === 'rain' || w === 'snow') {
    const isSnow = w === 'snow';
    while (state.weatherDrops.length < (isSnow ? 85 : 110)) {
      state.weatherDrops.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, spd: isSnow ? 70 + Math.random() * 60 : 420 + Math.random() * 180 });
    }
    ctx.fillStyle = isSnow ? 'rgba(255,255,255,0.82)' : 'rgba(147,197,253,0.55)';
    for (const d of state.weatherDrops) {
      d.y += d.spd * dt;
      d.x += (isSnow ? Math.sin(d.y * 0.02) * 28 : -75) * dt;
      if (d.y > canvas.height) { d.y = -8; d.x = Math.random() * canvas.width; }
      if (d.x < 0) d.x = canvas.width;
      ctx.fillRect(d.x, d.y, isSnow ? 3 : 2, isSnow ? 3 : 10);
    }
  }
}

function renderMinimap() {
  const track = state.track;
  if (!track) return;
  const W = minimapCanvas.width, H = minimapCanvas.height;
  mctx.clearRect(0, 0, W, H);
  const b = track.bounds;
  const scale = Math.min((W - 14) / (b.maxX - b.minX), (H - 14) / (b.maxY - b.minY));
  const ox = (W - (b.maxX - b.minX) * scale) / 2 - b.minX * scale;
  const oy = (H - (b.maxY - b.minY) * scale) / 2 - b.minY * scale;

  const S = track.samples;
  mctx.beginPath();
  mctx.moveTo(S[0].x * scale + ox, S[0].y * scale + oy);
  for (let i = 2; i < S.length; i += 2) mctx.lineTo(S[i].x * scale + ox, S[i].y * scale + oy);
  mctx.closePath();
  mctx.strokeStyle = 'rgba(255,255,255,0.34)';
  mctx.lineWidth = 4.5;
  mctx.stroke();

  for (const car of state.cars) {
    if (car.eliminated) continue;
    mctx.fillStyle = car.isPlayer ? '#ef233c' : (car.isRemote ? '#fbbf24' : '#38bdf8');
    mctx.beginPath();
    mctx.arc(car.x * scale + ox, car.y * scale + oy, car.isPlayer ? 3.8 : 2.5, 0, Math.PI * 2);
    mctx.fill();
  }
}

/* ---------- Race Start & Finish ---------- */
function spawnParticle(x, y, vx, vy, size, color, life) {
  if (state.particles.length > 180) return;
  state.particles.push({ x, y, vx, vy, size, color, life, maxLife: life });
}

function startRace(mpStartData = null) {
  sfx.init();
  const isMp = Boolean(mpStartData);
  const trackId = isMp ? mpStartData.settings.trackId : state.selectedTrackId;
  const trackDef = getTrackById(trackId);
  const laps = isMp
    ? mpStartData.settings.laps
    : (document.getElementById('cfg-mode').value === 'sprint' ? 1 : Math.max(1, Math.min(20, Number(document.getElementById('cfg-laps').value) || trackDef.defaultLaps)));
  const raceMode = isMp ? mpStartData.settings.raceMode : document.getElementById('cfg-mode').value;
  const weather = isMp ? mpStartData.settings.weather : document.getElementById('cfg-weather').value;
  const weatherObj = WEATHER_MODES.find(w => w.id === weather) || WEATHER_MODES[0];
  const botCount = isMp
    ? (mpStartData.settings.aiEnabled ? Math.min(3, mpStartData.settings.aiCount || 2) : 0)
    : (raceMode === 'time_attack' ? 0 : Math.max(0, Math.min(5, Number(document.getElementById('cfg-bots').value))));

  state.raceConfig = {
    laps,
    weather,
    weatherGripMul: weatherObj.gripMul,
    weatherPhysics: document.getElementById('cfg-weather-phys').checked,
    raceMode,
    botCount,
    isMultiplayer: isMp,
    raceTime: 0,
    active: false
  };

  state.track = buildTrackGeometry(trackDef);
  state.skids = [];
  state.particles = [];
  state.weatherDrops = [];
  state.floatingEmotes = [];
  state.mp.remoteStates.clear();
  state.countdownTimer = 3.2;
  state.lastCountdownNum = 4;
  state.cars = [];

  const S = state.track.samples;
  const M = S.length;

  const gridEntries = [];
  if (isMp) {
    for (const p of mpStartData.players) {
      gridEntries.push({
        isPlayer: p.playerId === profile.playerId,
        isRemote: p.playerId !== profile.playerId,
        id: p.playerId,
        name: p.nickname,
        vehicle: getVehicleById(p.vehicleId),
        colorKey: p.colorKey || 'rosso'
      });
    }
  } else {
    gridEntries.push({
      isPlayer: true,
      isRemote: false,
      id: profile.playerId,
      name: profile.nickname,
      vehicle: getEffectiveVehicle(getVehicleById(profile.selectedVehicleId), getVehicleUpgrades(profile, profile.selectedVehicleId)),
      colorKey: profile.selectedColor
    });
  }

  // Add AI bots if enabled
  const botVehicles = ['ferrari_488', 'ferrari_f40', 'malibu', 'chevy_onix', 'byd_chazor', 'chevy_cobalt'];
  const botColors = ['yellow', 'blue', 'white', 'emerald', 'orange'];
  for (let b = 0; b < botCount; b++) {
    const pers = AI_PERSONALITIES[b % AI_PERSONALITIES.length];
    gridEntries.push({
      isPlayer: false,
      isRemote: false,
      id: `bot_${b}`,
      name: pers.name,
      vehicle: getVehicleById(botVehicles[b % botVehicles.length]),
      colorKey: botColors[b % botColors.length],
      personality: pers
    });
  }

  // Place player at back of grid for exciting overtakes in single-player
  if (!isMp && gridEntries.length > 1) {
    const playerEntry = gridEntries.shift();
    gridEntries.push(playerEntry);
  }

  gridEntries.forEach((entry, slot) => {
    const sIdx = (M - 4 - Math.floor(slot / 2) * 3) % M;
    const pt = S[sIdx];
    const lat = (slot % 2 === 0 ? -1 : 1) * 28;
    const car = createPhysicsCar({
      id: entry.id,
      isPlayer: entry.isPlayer,
      isRemote: entry.isRemote,
      name: entry.name,
      vehicleId: entry.vehicle.id,
      carName: entry.vehicle.name,
      colorKey: entry.colorKey,
      x: pt.x + pt.nx * lat,
      y: pt.y + pt.ny * lat,
      angle: pt.angle,
      wpIndex: sIdx,
      gameStats: entry.vehicle.gameStats,
      botSkill: trackDef.botSkill,
      personality: entry.personality || null,
      laneOffset: lat
    });
    car.slices = generateCarSlices(entry.vehicle, entry.colorKey, entry.isPlayer ? profile.tuning : {});
    state.cars.push(car);
  });

  const player = state.cars.find(c => c.isPlayer);
  state.cam.x = player.x;
  state.cam.y = player.y;
  state.cam.shake = 0;

  document.getElementById('menu-screen').classList.remove('active');
  document.getElementById('pause-screen').classList.remove('active');
  document.getElementById('results-screen').classList.remove('active');
  document.getElementById('hud').classList.add('active');
  document.getElementById('hud-stage').textContent = trackDef.name;

  // Set game mode before evaluating touch-control visibility.
  state.mode = 'countdown';
  updateTouchVisibility();
}

function getStandings() {
  if (state.raceConfig.raceMode === 'drift') {
    return [...state.cars].sort((a, b) => b.driftScore - a.driftScore);
  }
  return [...state.cars].sort((a, b) => {
    if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
    if (a.finished && b.finished) return a.finishTime - b.finishTime;
    if (a.finished) return -1;
    if (b.finished) return 1;
    return b.totalProgress - a.totalProgress;
  });
}

function finishRace() {
  state.mode = 'finished';
  state.raceConfig.active = false;
  const trackDef = getTrackById(state.track.id);
  const standings = getStandings();
  const player = state.cars.find(c => c.isPlayer);
  const rank = standings.findIndex(c => c.isPlayer) + 1;

  // Send authoritative finish to server if multiplayer
  if (state.raceConfig.isMultiplayer && state.mp.connected && state.mp.ws) {
    mpSend({ type: 'finish_race', lap: player.lap, driftScore: player.driftScore });
  }

  // Local economy & infinite level progression
  const reward = calculateRaceReward({
    rank,
    totalRacers: state.cars.length,
    stageId: trackDef.id,
    laps: state.raceConfig.laps,
    driftScore: player.driftScore,
    completed: true,
    isMultiplayer: state.raceConfig.isMultiplayer
  });

  profile.currency += reward.coins;
  const lvlRes = applyXpGain(profile, reward.xp);
  profile.stats.races += 1;
  if (rank === 1) {
    profile.stats.wins += 1;
    profile.dailyProgress.dailyWins += 1;
    if (state.raceConfig.isMultiplayer) profile.stats.mpWins += 1;
  }
  if (rank <= 3) profile.stats.podiums += 1;
  profile.stats.totalDrift += player.driftScore;
  profile.stats.jumps += player.jumpsCount;
  profile.dailyProgress.dailyLaps += state.raceConfig.laps;
  profile.dailyProgress.dailyDrift += player.driftScore;

  const prevBest = profile.bestRank[trackDef.id];
  if (!prevBest || rank < prevBest) profile.bestRank[trackDef.id] = rank;
  const prevTime = profile.bestTimes[trackDef.id];
  if (!prevTime || state.raceConfig.raceTime < prevTime) profile.bestTimes[trackDef.id] = Number(state.raceConfig.raceTime.toFixed(2));

  const newAchs = evaluateAchievements(profile);
  saveProfile();
  sfx.fanfare(rank <= 3);

  document.getElementById('res-trophy').textContent = rank === 1 ? '🏆' : (rank === 2 ? '🥈' : (rank === 3 ? '🥉' : '🏁'));
  document.getElementById('res-title').textContent = rank === 1 ? '1-o\'rin! Chempion!' : `${rank}-o’rin bilan marraga yetdingiz`;
  document.getElementById('res-sub').textContent = `${trackDef.name} · Vaqt: ${formatTime(state.raceConfig.raceTime)} · Drift: ${player.driftScore}`;

  let rewardText = `+🪙 ${reward.coins.toLocaleString('uz-UZ')} tanga · +⭐ ${reward.xp} XP`;
  if (lvlRes.leveledUp) rewardText += ` · 🎉 YANGI DARAJA: ${profile.level}! (+🪙 ${lvlRes.bonusCoins})`;
  if (newAchs.length > 0) rewardText += ` · 🏅 Yutuq: ${newAchs.map(a => a.title).join(', ')}`;
  document.getElementById('res-reward-box').textContent = rewardText;

  document.getElementById('res-tbody').innerHTML = standings.map((c, idx) => `
    <tr class="${c.isPlayer ? 'player-row' : ''}">
      <td>${idx + 1}</td>
      <td>${c.isPlayer ? '⭐ ' + profile.nickname : c.name}</td>
      <td>${c.carName}</td>
      <td>${state.raceConfig.raceMode === 'drift' ? c.driftScore + ' ball' : (c.finished ? formatTime(c.finishTime) : (c.eliminated ? 'Chiqib ketdi' : `${c.lap}/${state.raceConfig.laps}`))}</td>
    </tr>
  `).join('');

  const nextBtn = document.getElementById('btn-next-stage');
  if (state.raceConfig.isMultiplayer) {
    nextBtn.style.display = state.mp.lobby && state.mp.lobby.hostId === profile.playerId ? 'inline-block' : 'none';
    nextBtn.textContent = '🔄 Revansh (Rematch)';
  } else if (state.selectedTrackId < TRACKS.length - 1) {
    nextBtn.style.display = 'inline-block';
    nextBtn.textContent = `➡ ${state.selectedTrackId + 2}-trassaga o'tish`;
  } else {
    nextBtn.style.display = 'none';
  }

  document.getElementById('results-screen').classList.add('active');
  refreshAllMenus();
}

/* ---------- Main Loop ---------- */
let rafId = null;
let lastTime = 0;
let previewAngle = 0;

function renderPreviewGarage(dt) {
  previewAngle += dt * 1.1;
  const w = previewCanvas.width, h = previewCanvas.height;
  pctx.clearRect(0, 0, w, h);
  pctx.strokeStyle = 'rgba(255,255,255,0.06)';
  pctx.lineWidth = 1;
  for (let x = 0; x < w; x += 18) { pctx.beginPath(); pctx.moveTo(x, 0); pctx.lineTo(x, h); pctx.stroke(); }
  for (let y = 0; y < h; y += 18) { pctx.beginPath(); pctx.moveTo(0, y); pctx.lineTo(w, y); pctx.stroke(); }

  const v = getVehicleById(state.inspectCarId);
  const slices = generateCarSlices(v, profile.selectedColor, profile.tuning);
  const spacing = state.explodePreview ? 7.2 : 2.4;
  const baseY = state.explodePreview ? h * 0.87 : h * 0.65;
  const scale = state.explodePreview ? 2.5 : 3.15;
  drawSpriteStack(pctx, slices, w / 2, baseY, previewAngle, scale, spacing, 0.45, 0, profile.tuning.neon);
}

function tick(ts) {
  if (!lastTime) lastTime = ts;
  const dt = Math.min(0.05, (ts - lastTime) / 1000);
  lastTime = ts;

  if (state.mode === 'menu') {
    if (state.activeTab === 'garage') renderPreviewGarage(dt);
    sfx.updateEngine(0, false, false, false, false);
    rafId = requestAnimationFrame(tick);
    return;
  }

  if (state.track) {
    updateDecorEnvironments(state.track, dt);

    if (state.mode === 'countdown') {
      state.countdownTimer -= dt;
      const num = Math.ceil(state.countdownTimer);
      if (num < state.lastCountdownNum && num >= 1) {
        state.lastCountdownNum = num;
        sfx.beep(520, 0.14, 'square', 0.08);
        showBanner(String(num), getTrackById(state.track.id).name, 850);
      }
      if (state.countdownTimer <= 0) {
        state.mode = 'racing';
        state.raceConfig.active = true;
        sfx.beep(880, 0.25, 'square', 0.1);
        showBanner('KETDIK!', 'Gazni bosing!', 900);
      }
    } else if (state.mode === 'racing' || state.mode === 'finished') {
      if (state.mode === 'racing') state.raceConfig.raceTime += dt;

      for (const car of state.cars) {
        if (car.isRemote) {
          const rs = state.mp.remoteStates.get(car.id);
          if (rs) {
            car.x += (rs.x - car.x) * Math.min(1, dt * 14);
            car.y += (rs.y - car.y) * Math.min(1, dt * 14);
            car.z += (rs.z - car.z) * Math.min(1, dt * 14);
            car.angle = rs.angle;
            car.speed = rs.speed;
            car.lap = rs.lap;
            car.wpIndex = rs.wpIndex;
            car.driftScore = rs.driftScore;
            car.totalProgress = (car.lap - 1) * state.track.samples.length + car.wpIndex;
          }
          continue;
        }

        updateCarPhysics(car, keys, dt, state.track, state.raceConfig, {
          onJump: (c) => { if (c.isPlayer) { sfx.jump(); showBanner('PARVOZ!', '', 550); } },
          onLand: (c) => {
            if (c.isPlayer) { sfx.land(); state.cam.shake = Math.min(7, state.cam.shake + 3.5); }
            for (let k = 0; k < 6; k++) spawnParticle(c.x, c.y, (Math.random() - 0.5) * 70, (Math.random() - 0.5) * 70, 5, '#cbd5e1', 0.35);
          },
          onLap: (c) => {
            if (c.isPlayer && c.lap <= state.raceConfig.laps) {
              sfx.lap();
              showBanner(`${c.lap}-AYLANISH!`, c.lap === state.raceConfig.laps ? 'OXIRGI AYLANISH!' : '', 1000);
            }
            if (state.raceConfig.raceMode === 'elimination' && c.isPlayer) {
              const active = getStandings().filter(x => !x.eliminated);
              if (active.length > 1) {
                const last = active[active.length - 1];
                last.eliminated = true;
                if (last.isPlayer) finishRace();
              }
            }
          },
          onFinish: (c) => { if (c.isPlayer) finishRace(); },
          onMissedCheckpoint: () => { showToast("⚠️ Aylanish hisoblanmadi! Maydonni to'liq aylanib chiqing."); }
        });

        // Visual skid marks & particles
        const fx = Math.cos(car.angle), fy = Math.sin(car.angle), rx = -fy, ry = fx;
        if (car.drifting && !car.onGrass) {
          state.skids.push({ x: car.x - fx * 14 + rx * 7, y: car.y - fy * 14 + ry * 7, alpha: 0.42 });
          state.skids.push({ x: car.x - fx * 14 - rx * 7, y: car.y - fy * 14 - ry * 7, alpha: 0.42 });
          if (state.skids.length > 520) state.skids.splice(0, 2);
          if (Math.random() < 0.55) spawnParticle(car.x - fx * 14, car.y - fy * 14, -fx * 18 + (Math.random() - 0.5) * 26, -fy * 18 + (Math.random() - 0.5) * 26, 5, '#cbd5e1', 0.35);
        }
        if (car.nitroActive) {
          spawnParticle(car.x - fx * 22, car.y - fy * 22, -fx * 88 + (Math.random() - 0.5) * 22, -fy * 88 + (Math.random() - 0.5) * 22, 6, Math.random() > 0.4 ? '#38bdf8' : '#fde047', 0.22);
        }
        if (car.onGrass && car.speed > 75 && Math.random() < 0.4) {
          spawnParticle(car.x - fx * 14, car.y - fy * 14, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, 4, '#65a30d', 0.34);
        }
      }

      resolveCarCollisions(state.cars, (a, b) => {
        if (a.isPlayer || b.isPlayer) { state.cam.shake = Math.min(8, state.cam.shake + 4); sfx.bump(); }
      });

      // Multiplayer 20Hz position sync
      if (state.raceConfig.isMultiplayer && state.mp.connected && ts - state.mp.lastSyncSent > 50) {
        const p = state.cars.find(c => c.isPlayer);
        if (p) {
          state.mp.lastSyncSent = ts;
          mpSend({
            type: 'state_update',
            x: p.x, y: p.y, z: p.z, angle: p.angle, speed: p.speed,
            drifting: p.drifting, nitroActive: p.nitroActive,
            lap: p.lap, wpIndex: p.wpIndex, driftScore: p.driftScore
          });
        }
      }

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        if (p.life <= 0) state.particles.splice(i, 1);
      }
      for (let i = state.floatingEmotes.length - 1; i >= 0; i--) {
        state.floatingEmotes[i].life -= dt;
        if (state.floatingEmotes[i].life <= 0) state.floatingEmotes.splice(i, 1);
      }
    }

    const player = state.cars.find(c => c.isPlayer);
    if (player) {
      const tx = player.x + Math.cos(player.angle) * (player.speed * 0.24);
      const ty = player.y + Math.sin(player.angle) * (player.speed * 0.24);
      state.cam.x += (tx - state.cam.x) * Math.min(1, dt * 6.5);
      state.cam.y += (ty - state.cam.y) * Math.min(1, dt * 6.5);
      state.cam.shake *= Math.pow(0.05, dt);
      const baseZ = Math.min(canvas.width, canvas.height) < 560 ? 0.82 : 1.04;
      const targetZ = baseZ - (player.speed / 460) * 0.14 - (player.z / 150) * 0.12;
      state.cam.zoom += (targetZ - state.cam.zoom) * Math.min(1, dt * 4);

      if (state.mode === 'racing' || state.mode === 'countdown') {
        const st = getStandings();
        const rank = st.findIndex(c => c.isPlayer) + 1;
        const posEl = document.getElementById('hud-pos');
        posEl.textContent = `${rank}/${state.cars.length}`;
        posEl.className = `hud-val ${rank <= 3 ? 'pos-' + rank : ''}`;
        document.getElementById('hud-lap').textContent = `${Math.min(player.lap, state.raceConfig.laps)}/${state.raceConfig.laps}`;
        document.getElementById('hud-time').textContent = formatTime(state.raceConfig.raceTime);
        document.getElementById('hud-drift').textContent = player.driftScore;
        document.getElementById('hud-speed').textContent = Math.round(player.speed * 0.68);
        document.getElementById('hud-air-tag').textContent = player.airborne ? '✈️ HAVODA' : (player.inTunnel ? '🚇 TUNNEL' : 'KM/SOAT');
        document.getElementById('hud-nitro-pct').textContent = `${Math.round(player.nitro)}%`;
        document.getElementById('hud-nitro-bar').style.width = `${player.nitro}%`;
      }
      sfx.updateEngine(Math.min(1, player.speed / player.maxSpeed), player.drifting && !player.onGrass, player.nitroActive, player.inTunnel, state.mode === 'racing');
    }

    ctx.save();
    ctx.translate(canvas.width / 2 + (Math.random() - 0.5) * state.cam.shake, canvas.height / 2 + (Math.random() - 0.5) * state.cam.shake);
    ctx.scale(state.cam.zoom, state.cam.zoom);
    ctx.translate(-state.cam.x, -state.cam.y);
    renderWorld();
    ctx.restore();
    renderWeatherOverlay(dt);
    renderMinimap();
  }

  rafId = requestAnimationFrame(tick);
}

/* ---------- Multiplayer WebSocket Client ---------- */
function mpSend(obj) {
  if (state.mp.ws && state.mp.ws.readyState === 1) {
    state.mp.ws.send(JSON.stringify(obj));
  }
}

function connectMultiplayer(url) {
  if (state.mp.ws) { try { state.mp.ws.close(); } catch (_) {} }
  const cleanUrl = (url || '').trim();
  if (!cleanUrl || (!cleanUrl.startsWith('ws://') && !cleanUrl.startsWith('wss://'))) {
    showToast('To\'g\'ri WebSocket manzilini kiriting (ws://... yoki wss://...)');
    return;
  }
  try {
    const ws = new WebSocket(cleanUrl);
    state.mp.ws = ws;
    document.getElementById('mp-conn-status').textContent = '● Ulanmoqda...';
    document.getElementById('mp-conn-status').style.color = '#fbbf24';

    ws.onopen = () => {
      state.mp.connected = true;
      profile.settings.serverUrl = cleanUrl;
      saveProfile();
      document.getElementById('mp-conn-status').textContent = '● Ulangan';
      document.getElementById('mp-conn-status').style.color = '#34d399';
      showToast('Multiplayer serverga muvaffaqiyatli ulandi!');
      mpSend({ type: 'list_rooms', scope: state.mp.scope });
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'room_list') {
          state.mp.rooms = msg.rooms || [];
          renderMpRoomList();
        } else if (msg.type === 'room_joined' || msg.type === 'lobby_state' || msg.type === 'rematch_lobby') {
          state.mp.lobby = msg.lobby;
          if (msg.type === 'rematch_lobby') {
            returnToMenu();
            switchTab('multiplayer');
          }
          renderMpLobby();
        } else if (msg.type === 'race_started') {
          startRace(msg);
        } else if (msg.type === 'peer_state') {
          state.mp.remoteStates.set(msg.state.playerId, msg.state);
        } else if (msg.type === 'emote_broadcast') {
          const em = EMOTES.find(e => e.id === msg.emoteId) || EMOTES[0];
          state.floatingEmotes.push({ carId: msg.playerId, icon: em.icon, life: 2.2 });
        } else if (msg.type === 'host_migrated') {
          showToast(`Yangi host: ${msg.hostName}`);
        } else if (msg.type === 'kicked') {
          state.mp.lobby = null;
          renderMpLobby();
          showToast(msg.message || 'Xonadan chiqarildingiz.');
        } else if (msg.type === 'error') {
          showToast(msg.message || 'Xatolik yuz berdi.');
        }
      } catch (_) {}
    };

    ws.onclose = () => {
      state.mp.connected = false;
      state.mp.lobby = null;
      document.getElementById('mp-conn-status').textContent = '● Uzilgan';
      document.getElementById('mp-conn-status').style.color = '#f87171';
      renderMpLobby();
    };

    ws.onerror = () => {
      showToast('Serverga ulanib bo\'lmadi. node server/index.js ishlayotganini tekshiring.');
    };
  } catch (e) {
    showToast('WebSocket ulanishida xatolik: ' + e.message);
  }
}

/* ---------- UI Rendering ---------- */
function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === 'pane-' + tabId));
  if (tabId === 'race') renderTracksTab();
  else if (tabId === 'garage') renderGarageTab();
  else if (tabId === 'compare') renderCompareTab();
  else if (tabId === 'multiplayer') {
    renderMpRoomList();
    renderMpLobby();
    const socketState = state.mp.ws ? state.mp.ws.readyState : WebSocket.CLOSED;
    if (socketState !== WebSocket.OPEN && socketState !== WebSocket.CONNECTING) {
      const serverInput = document.getElementById('mp-server-url');
      connectMultiplayer(serverInput.value || DEFAULT_MULTIPLAYER_SERVER);
    }
  }
  else if (tabId === 'profile') renderProfileTab();
}

function renderHeader() {
  document.getElementById('hdr-nick').textContent = profile.nickname;
  document.getElementById('hdr-level').textContent = `Daraja ${profile.level}`;
  document.getElementById('hdr-coins').textContent = `🪙 ${profile.currency.toLocaleString('uz-UZ')}`;
  drawPixelAvatar(document.getElementById('header-avatar').getContext('2d'), profile.avatarSeed, profile.avatarColor, 28);
  const curCar = getVehicleById(profile.selectedVehicleId);
  document.getElementById('race-car-badge').textContent = `Tanlangan: ${curCar.name}`;
}

function renderTracksTab() {
  const list = document.getElementById('stage-list');
  list.innerHTML = TRACKS.map(t => {
    const locked = profile.level < t.minLevel;
    const best = profile.bestRank[t.id];
    const medal = best === 1 ? '🏆' : (best === 2 ? '🥈' : (best === 3 ? '🥉' : ''));
    const badges = [
      t.tunnels.length ? '🚇 Tunnel' : '',
      t.ramps.length ? '🛫 Rampa' : '',
      t.trains.length ? '🚆 Poyezd' : '',
      t.ships.length ? '🚢 Kemalar' : ''
    ].filter(Boolean).join(' · ');
    return `
      <button class="stage-item ${t.id === state.selectedTrackId ? 'selected' : ''} ${locked ? 'locked' : ''}" data-track="${t.id}">
        <div>
          <div style="font-size:13px;font-weight:800;">${t.name} ${medal} ${locked ? `<span style="color:#f87171;font-size:10.5px;">🔒 ${t.minLevel}-daraja</span>` : ''}</div>
          <div style="font-size:10.5px;color:var(--muted);margin-top:2px;">${t.botDesc}${badges ? ' · ' + badges : ''}</div>
        </div>
        <span class="diff-badge ${t.diffClass}">${t.diffLabel}</span>
      </button>
    `;
  }).join('');

  list.querySelectorAll('.stage-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = getTrackById(Number(btn.dataset.track));
      if (profile.level < t.minLevel) {
        showToast(`Bu trassani ochish uchun ${t.minLevel}-daraja kerak (sizda: ${profile.level}-daraja).`);
        return;
      }
      state.selectedTrackId = t.id;
      document.getElementById('cfg-laps').value = t.defaultLaps;
      document.getElementById('cfg-bots').value = t.botCount;
      document.getElementById('cfg-weather').value = t.defaultWeather;
      renderTracksTab();
    });
  });

  const cur = getTrackById(state.selectedTrackId);
  const bt = profile.bestTimes[cur.id];
  document.getElementById('selected-track-env').textContent = `${cur.diffLabel} · ${cur.defaultLaps} aylanish`;
  document.getElementById('track-info-card').innerHTML = `
    <b>${cur.name}</b> — Yo’l kengligi: ${cur.trackWidth}px · Bot mahorati: ${Math.round(cur.botSkill.speedMul * 100)}% ·
    Shaxsiy rekord: <b>${bt ? formatTime(bt) : 'Hali yo\'q'}</b>
  `;
}

function renderGarageTab() {
  const PAGE_SIZE = 24;
  // Categories
  const catBox = document.getElementById('cat-filters');
  catBox.innerHTML = CAR_CATEGORIES.map(c => {
    const label = c.id === 'world' && WORLD_VEHICLES.length
      ? `🌍 Jahon (${WORLD_VEHICLES.length.toLocaleString('uz-UZ')})`
      : c.label;
    return `<button class="chip ${state.garageCat === c.id ? 'active' : ''}" data-cat="${c.id}">${label}</button>`;
  }).join('');
  catBox.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => {
    state.garageCat = b.dataset.cat;
    state.garagePage = 1;
    renderGarageTab();
  }));

  // World status banner
  const wStatus = document.getElementById('world-status-text');
  if (wStatus) {
    wStatus.textContent = WORLD_VEHICLES.length
      ? `🌍 Jahon bazasi faol: ${getAllVehiclesCount().toLocaleString('uz-UZ')} ta avtomobil`
      : `📦 ${VEHICLES.length} ta ichki model (31 608 ta jahon bazasi uchun server yoki JSON yuklang)`;
  }

  // Choose source pool
  const q = state.garageSearch.toLowerCase().trim();
  const clsFilter = state.garageClass || 'all';
  let pool;
  if (state.garageCat === 'world') {
    pool = WORLD_VEHICLES;
  } else if (state.garageCat === 'all' && q.length >= 2 && WORLD_VEHICLES.length) {
    // Searching in "Barchasi" searches both built-in and 31,608 world cars!
    pool = VEHICLES.concat(WORLD_VEHICLES);
  } else {
    pool = VEHICLES;
  }

  let list = [];
  for (let i = 0; i < pool.length; i++) {
    const v = pool[i];
    if (state.garageCat !== 'all' && state.garageCat !== 'world' && v.category !== state.garageCat) continue;
    if (clsFilter !== 'all') {
      const c = v.carClass || getCarClassFromPR(computeBasePR(v));
      if (c !== clsFilter) continue;
    }
    if (q) {
      if (!v.name.toLowerCase().includes(q) && !v.brand.toLowerCase().includes(q) && !(v.generation || '').toLowerCase().includes(q)) continue;
    }
    list.push(v);
  }

  // Sort (avoid sorting 31k unnecessarily if default level sort & huge pool unless requested)
  if (state.garageSort === 'price') list.sort((a, b) => a.price - b.price);
  else if (state.garageSort === 'speed') list.sort((a, b) => b.gameStats.maxSpeed - a.gameStats.maxSpeed);
  else if (state.garageSort === 'accel') list.sort((a, b) => b.gameStats.accel - a.gameStats.accel);
  else if (state.garageSort === 'pr') list.sort((a, b) => computeBasePR(b) - computeBasePR(a));
  else list.sort((a, b) => a.minLevel - b.minLevel || a.price - b.price);

  const totalMatches = list.length;
  const totalPages = Math.max(1, Math.ceil(totalMatches / PAGE_SIZE));
  if (state.garagePage > totalPages) state.garagePage = totalPages;
  if (state.garagePage < 1) state.garagePage = 1;
  const startIdx = (state.garagePage - 1) * PAGE_SIZE;
  const pageItems = list.slice(startIdx, startIdx + PAGE_SIZE);

  document.getElementById('garage-count').textContent = `${profile.ownedVehicles.length}/${getAllVehiclesCount().toLocaleString('uz-UZ')} mavjud`;
  const grid = document.getElementById('car-grid');
  grid.innerHTML = pageItems.length ? pageItems.map(v => {
    const owned = profile.ownedVehicles.includes(v.id);
    const active = profile.selectedVehicleId === v.id;
    const eff = owned ? getEffectiveVehicle(v, getVehicleUpgrades(profile, v.id)) : v;
    const pr = eff.currentPR || computeBasePR(v);
    const cls = v.carClass || getCarClassFromPR(pr);
    return `
      <button class="car-card ${v.id === state.inspectCarId ? 'selected' : ''} ${owned ? 'owned' : ''}" data-vid="${v.id}">
        <div class="car-card-title">${v.name}</div>
        <div class="car-card-sub">${v.generation} · <b>${cls}</b> · PR ${pr}</div>
        <div class="car-card-foot">
          <span style="color:${owned ? '#34d399' : '#fbbf24'}">${active ? '⭐ Tanlangan' : (owned ? '✓ Mavjud' : '🪙 ' + v.price.toLocaleString('uz-UZ'))}</span>
          <span style="color:var(--muted)">L${v.minLevel}</span>
        </div>
      </button>
    `;
  }).join('') : `<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:18px;font-size:12px;">Avtomobil topilmadi. Boshqa nom yoki sinfni tanlang.</div>`;

  grid.querySelectorAll('.car-card').forEach(b => b.addEventListener('click', () => {
    state.inspectCarId = b.dataset.vid;
    renderGarageTab();
  }));

  // Pagination controls
  const pager = document.getElementById('garage-pager');
  if (pager) {
    if (totalPages > 1) {
      pager.style.display = 'flex';
      document.getElementById('garage-page-info').textContent = `Sahifa ${state.garagePage} / ${totalPages.toLocaleString('uz-UZ')} (${totalMatches.toLocaleString('uz-UZ')} ta)`;
      document.getElementById('btn-page-prev').disabled = state.garagePage <= 1;
      document.getElementById('btn-page-next').disabled = state.garagePage >= totalPages;
    } else {
      pager.style.display = 'none';
    }
  }

  // Detail Panel for inspected vehicle (even if locked!)
  const rawV = getVehicleById(state.inspectCarId);
  const owned = profile.ownedVehicles.includes(rawV.id);
  const isSelected = profile.selectedVehicleId === rawV.id;
  const upg = getVehicleUpgrades(profile, rawV.id);
  const v = getEffectiveVehicle(rawV, owned ? upg : null);
  const carClass = rawV.carClass || getCarClassFromPR(v.currentPR);

  document.getElementById('preview-caption').textContent = `${v.name} — ${CAR_COLORS[profile.selectedColor].name} · [${carClass}] PR ${v.currentPR}/${v.maxPR}`;
  document.getElementById('detail-status-badge').innerHTML = owned
    ? `<span style="color:#34d399">✓ Garajda · PR ${v.currentPR}</span>`
    : `<span style="color:#fbbf24">🔒 Daraja ${v.minLevel} · 🪙 ${v.price.toLocaleString('uz-UZ')}</span>`;

  // Color swatches
  const crow = document.getElementById('color-row');
  crow.innerHTML = '<span>Rang:</span>' + Object.keys(CAR_COLORS).map(k => `
    <button class="swatch ${profile.selectedColor === k ? 'selected' : ''}" data-c="${k}" style="background:${CAR_COLORS[k].main}" title="${CAR_COLORS[k].name}"></button>
  `).join('');
  crow.querySelectorAll('.swatch').forEach(b => b.addEventListener('click', () => {
    profile.selectedColor = b.dataset.c;
    saveProfile();
    renderGarageTab();
  }));

  // Purchase / Select Action Bar
  const actBar = document.getElementById('purchase-action-bar');
  if (owned) {
    actBar.innerHTML = isSelected
      ? `<button class="btn-emerald" disabled style="width:100%;opacity:0.85;">⭐ Hozirgi tanlangan avtomobil</button>`
      : `<button class="btn-primary" id="btn-equip-car" style="width:100%;">🏎️ Shu avtomobilni tanlash</button>`;
    const eq = document.getElementById('btn-equip-car');
    if (eq) eq.addEventListener('click', () => {
      profile.selectedVehicleId = rawV.id;
      saveProfile();
      if (state.mp.connected) mpSend({ type: 'select_vehicle', vehicleId: rawV.id, colorKey: profile.selectedColor });
      showToast(`${rawV.name} tanlandi!`);
      refreshAllMenus();
    });
  } else {
    const check = validateVehiclePurchase(profile, rawV);
    actBar.innerHTML = `
      <button class="btn-primary" id="btn-buy-car" ${check.ok ? '' : 'disabled'} style="width:100%;margin-bottom:4px;">
        🛒 Sotib olish — 🪙 ${rawV.price.toLocaleString('uz-UZ')} tanga
      </button>
      ${!check.ok ? `<div style="font-size:11px;color:#fca5a5;text-align:center;">${check.reason}</div>` : ''}
    `;
    const buyBtn = document.getElementById('btn-buy-car');
    if (buyBtn && check.ok) {
      buyBtn.addEventListener('click', () => {
        const res = purchaseVehicle(profile, rawV);
        if (res.ok) {
          profile.selectedVehicleId = rawV.id;
          evaluateAchievements(profile);
          saveProfile();
          sfx.lap();
          showToast(res.reason);
          refreshAllMenus();
        } else {
          showToast(res.reason);
        }
      });
    }
  }

  // Paid Performance Tuning (Engine, Brakes, Tires, Suspension -> PR & Physics)
  const tuneBox = document.getElementById('car-perf-tuning');
  if (tuneBox) {
    const prPct = Math.min(100, Math.round(((v.currentPR - v.basePR) / Math.max(1, v.maxPR - v.basePR)) * 100));
    tuneBox.innerHTML = `
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:11.5px;font-weight:800;">
          <span>🔧 Pullik Tuning (Performance Rating)</span>
          <span style="color:#38bdf8;">PR ${v.currentPR} / ${v.maxPR}</span>
        </div>
        <div class="stat-bar" style="margin-bottom:8px;height:7px;">
          <div class="stat-fill" style="width:${Math.max(6, prPct)}%;background:linear-gradient(90deg,#38bdf8,#34d399);"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          ${TUNING_PARTS.map(part => {
            const lvl = upg[part.id] || 0;
            const maxed = lvl >= MAX_UPGRADE_LEVEL;
            const cost = getUpgradeCost(rawV, part.id, lvl);
            const canBuy = owned && !maxed && profile.currency >= cost;
            return `
              <button class="chip btn-upgrade-part" data-part="${part.id}" ${canBuy ? '' : 'disabled'}
                style="display:flex;flex-direction:column;align-items:flex-start;padding:6px 8px;text-align:left;opacity:${owned ? (canBuy || maxed ? 1 : 0.65) : 0.45};">
                <div style="display:flex;justify-content:space-between;width:100%;font-size:11px;color:#fff;">
                  <span>${part.icon} ${part.label}</span>
                  <span style="color:#34d399;">${lvl}/${MAX_UPGRADE_LEVEL}</span>
                </div>
                <div style="font-size:9.5px;color:#94a3b8;margin-top:2px;">${part.desc}</div>
                <div style="font-size:10px;color:${maxed ? '#34d399' : '#fbbf24'};margin-top:3px;font-weight:800;">
                  ${maxed ? '✓ Maksimal' : (owned ? '🪙 ' + cost.toLocaleString('uz-UZ') + ' (+' + part.prPerLvl + ' PR)' : 'Avval sotib oling')}
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
    tuneBox.querySelectorAll('.btn-upgrade-part').forEach(btn => {
      btn.addEventListener('click', () => {
        const res = purchaseVehicleUpgrade(profile, rawV, btn.dataset.part);
        if (res.ok) {
          saveProfile();
          sfx.lap();
          showToast(res.reason);
          refreshAllMenus();
        } else {
          showToast(res.reason);
        }
      });
    });
  }

  // 9 Connected Game Physics Stats (live upgraded values!)
  const gs = v.gameStats;
  const statDefs = [
    ['Maksimal tezlik', gs.maxSpeed, 490, `${gs.maxSpeed}`],
    ['Tezlanish', gs.accel, 430, `${gs.accel}`],
    ['Boshqaruv', gs.handling, 3.85, gs.handling.toFixed(2)],
    ['Tormozlash', gs.braking, 440, `${gs.braking}`],
    ['Drift boshqaruvi', gs.driftControl * 100, 100, `${Math.round(gs.driftControl * 100)}%`],
    ['Yo’l bilan ilashish', gs.grip * 100, 100, `${Math.round(gs.grip * 100)}%`],
    ['Avtomobil vazni', gs.weight, 2400, `${gs.weight} kg`],
    ['Nitro samaradorligi', (gs.nitroEff - 1) * 300, 100, `${gs.nitroEff.toFixed(2)}×`],
    ['Yo’lsiz joyda yurish', gs.offRoad * 100, 100, `${Math.round(gs.offRoad * 100)}%`]
  ];
  document.getElementById('car-game-stats').innerHTML = statDefs.map(([label, val, max, txt]) => `
    <div class="stat-row">
      <span class="stat-name">${label}</span>
      <div class="stat-bar"><div class="stat-fill" style="width:${Math.min(100, Math.round((val / max) * 100))}%"></div></div>
      <span class="stat-num">${txt}</span>
    </div>
  `).join('');

  // Real Historical & Technical Specifications (strictly separate!)
  const rs = v.realSpecs;
  document.getElementById('car-real-specs').innerHTML = `
    <p style="font-size:11.5px;color:#cbd5e1;line-height:1.45;margin-bottom:6px;">${rs.description}</p>
    <table class="spec-table">
      <tr><td>Ishlab chiqaruvchi</td><td>${rs.manufacturer} (${rs.origin})</td></tr>
      <tr><td>Status / Manba</td><td>${rs.localStatus}</td></tr>
      <tr><td>Dvigatel</td><td>${rs.engine} (${rs.displacement})</td></tr>
      <tr><td>Quvvat / Moment</td><td>${rs.power} / ${rs.torque}</td></tr>
      <tr><td>Uzatma / Tortish</td><td>${rs.transmission} · ${rs.drivetrain}</td></tr>
      <tr><td>0–100 km/soat / Vazn</td><td>${rs.zeroTo100} / ${rs.weightKg}</td></tr>
      <tr><td>O'lchamlar</td><td>${rs.dimensions}</td></tr>
      <tr><td>Tashqi ko’rinish</td><td>${rs.exterior}</td></tr>
      <tr><td>Salon</td><td>${rs.interior}</td></tr>
      <tr><td>Manba</td><td><a class="src-link" href="${rs.sourceUrl}" target="_blank" rel="noopener">${rs.sourceTitle}</a></td></tr>
    </table>
  `;
}

function renderCompareTab() {
  const selA = document.getElementById('cmp-car-a');
  const selB = document.getElementById('cmp-car-b');
  if (!selA.options.length) {
    VEHICLES.forEach((v, i) => {
      selA.add(new Option(v.name, v.id));
      selB.add(new Option(v.name, v.id));
      if (v.id === profile.selectedVehicleId) selA.selectedIndex = i;
    });
    selB.value = 'ferrari_f40';
  }
  const a = getVehicleById(selA.value);
  const b = getVehicleById(selB.value);

  const rows = [
    ['Maksimal tezlik', a.gameStats.maxSpeed, b.gameStats.maxSpeed, '', true],
    ['Tezlanish', a.gameStats.accel, b.gameStats.accel, '', true],
    ['Boshqaruv', a.gameStats.handling, b.gameStats.handling, '', true],
    ['Tormozlash', a.gameStats.braking, b.gameStats.braking, '', true],
    ['Drift boshqaruvi', Math.round(a.gameStats.driftControl * 100), Math.round(b.gameStats.driftControl * 100), '%', true],
    ['Yo\'l bilan ilashish', Math.round(a.gameStats.grip * 100), Math.round(b.gameStats.grip * 100), '%', true],
    ['Avtomobil vazni', a.gameStats.weight, b.gameStats.weight, ' kg', null], // Neutral: lighter = agile, heavier = stable
    ['Nitro samaradorligi', Number(a.gameStats.nitroEff.toFixed(2)), Number(b.gameStats.nitroEff.toFixed(2)), '×', true],
    ['Yo\'lsiz joyda yurish', Math.round(a.gameStats.offRoad * 100), Math.round(b.gameStats.offRoad * 100), '%', true]
  ];

  const html = `
    <div class="cmp-row" style="font-weight:800;border-bottom:2px solid rgba(255,255,255,0.14);">
      <div>${a.name} ${a.id === profile.selectedVehicleId ? '<span class="badge-red">Joriy</span>' : ''}</div>
      <div class="cmp-center">KO'RSATKICH</div>
      <div style="text-align:right;">${b.name} ${b.id === profile.selectedVehicleId ? '<span class="badge-red">Joriy</span>' : ''}</div>
    </div>
    ${rows.map(([label, va, vb, unit, higherBetter]) => {
      const diff = Number((va - vb).toFixed(2));
      const clsA = higherBetter === null ? '' : (va > vb ? 'better' : (va < vb ? 'worse' : ''));
      const clsB = higherBetter === null ? '' : (vb > va ? 'better' : (vb < va ? 'worse' : ''));
      const diffTxt = diff === 0 ? '=' : (diff > 0 ? `+${diff}${unit}` : `${diff}${unit}`);
      return `
        <div class="cmp-row">
          <div class="${clsA}">${va}${unit} <span style="font-size:10px;opacity:0.75">(${diffTxt})</span></div>
          <div class="cmp-center">${label}</div>
          <div class="${clsB}" style="text-align:right;">${vb}${unit}</div>
        </div>
      `;
    }).join('')}
    <div style="margin-top:10px;font-size:11.5px;color:var(--muted);">
      <b>Real dvigatel:</b> ${a.name} (${a.realSpecs.engine}, ${a.realSpecs.power}, ${a.realSpecs.drivetrain}) <b>vs</b> ${b.name} (${b.realSpecs.engine}, ${b.realSpecs.power}, ${b.realSpecs.drivetrain}).
      <br><i>Izoh: Vazn neytral ko'rsatkich — yengil mashina chaqqonroq, og’ir mashina esa to'qnashuvda barqarorroq bo'ladi.</i>
    </div>
  `;
  document.getElementById('cmp-body').innerHTML = html;
}

function renderMpRoomList() {
  const box = document.getElementById('mp-room-list');
  if (!state.mp.connected) {
    box.innerHTML = `<div style="font-size:12px;color:var(--muted);padding:10px;">Xonalarni ko'rish uchun avval multiplayer serverga ulaning.</div>`;
    return;
  }
  if (!state.mp.rooms.length) {
    box.innerHTML = `<div style="font-size:12px;color:var(--muted);padding:10px;">Hozircha ochiq ${state.mp.scope === 'lan' ? 'Wi-Fi (LAN)' : 'Onlayn'} xonalar yo'q. O'ng tomondan yangi xona yarating!</div>`;
    return;
  }
  box.innerHTML = state.mp.rooms.map(r => `
    <div class="lobby-slot">
      <div>
        <div style="font-weight:800;">${r.name} ${r.hasPassword ? '🔒' : ''}</div>
        <div style="font-size:10.5px;color:var(--muted);">Kod: ${r.code} · ${getTrackById(r.trackId).name} · ${r.laps} ayl. · ${r.playerCount}/${r.maxPlayers} kishi</div>
      </div>
      <button class="btn-emerald mp-quick-join" data-code="${r.code}" style="padding:5px 10px;font-size:11px;">Kirish</button>
    </div>
  `).join('');
  box.querySelectorAll('.mp-quick-join').forEach(b => b.addEventListener('click', () => {
    document.getElementById('mp-join-code').value = b.dataset.code;
    joinRoomByCode();
  }));
}

function renderMpLobby() {
  const createBox = document.getElementById('mp-create-box');
  const lobbyBox = document.getElementById('mp-lobby-box');
  const lobby = state.mp.lobby;
  if (!lobby) {
    createBox.style.display = 'block';
    lobbyBox.style.display = 'none';
    return;
  }
  createBox.style.display = 'none';
  lobbyBox.style.display = 'block';
  document.getElementById('lobby-title').textContent = `${lobby.name} (${lobby.scope === 'lan' ? 'Wi-Fi LAN' : 'Onlayn'})`;
  document.getElementById('lobby-code').textContent = lobby.code;

  const baseHttp = window.location.protocol.startsWith('http') ? window.location.origin + window.location.pathname : 'http://localhost:3000/';
  const inviteUrl = `${baseHttp}?room=${lobby.code}`;
  drawInviteQR(document.getElementById('lobby-qr'), inviteUrl);

  document.getElementById('lobby-meta').textContent =
    `${getTrackById(lobby.settings.trackId).name} · ${lobby.settings.laps} aylanish · ${lobby.players.length}/${lobby.maxPlayers} o'yinchi`;

  const isHost = lobby.hostId === profile.playerId;
  document.getElementById('btn-lobby-start').style.display = isHost ? 'inline-block' : 'none';

  document.getElementById('lobby-players').innerHTML = lobby.players.map(p => `
    <div class="lobby-slot">
      <div>
        <b>${p.nickname}</b> ${p.isHost ? '<span class="badge-red">HOST</span>' : ''}
        <div style="font-size:10.5px;color:var(--muted);">Daraja ${p.level} · ${getVehicleById(p.vehicleId).name}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:11px;font-weight:800;color:${p.ready ? '#34d399' : '#fbbf24'}">${p.ready ? '✓ Tayyor' : '⏳ Kutmoqda'}</span>
        ${isHost && !p.isHost ? `<button class="btn-secondary kick-btn" data-pid="${p.playerId}" style="padding:3px 7px;font-size:10px;">✕</button>` : ''}
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.kick-btn').forEach(b => b.addEventListener('click', () => {
    mpSend({ type: 'kick_player', targetId: b.dataset.pid });
  }));
}

function renderProfileTab() {
  const reqXp = xpNeededForLevel(profile.level);
  document.getElementById('prof-level-tag').textContent = `Cheksiz Daraja: ${profile.level}`;
  document.getElementById('prof-nick-input').value = profile.nickname;
  document.getElementById('prof-xp-text').textContent = `XP: ${profile.xp.toLocaleString('uz-UZ')} / ${reqXp.toLocaleString('uz-UZ')}`;
  document.getElementById('prof-xp-bar').style.width = `${Math.min(100, Math.round((profile.xp / reqXp) * 100))}%`;
  drawPixelAvatar(document.getElementById('profile-avatar').getContext('2d'), profile.avatarSeed, profile.avatarColor, 56);

  document.getElementById('prof-stats-grid').innerHTML = [
    ['Poygalar', profile.stats.races],
    ['G\'alabalar', profile.stats.wins],
    ['Podiumlar', profile.stats.podiums],
    ['Drift balli', profile.stats.totalDrift],
    ['Sakrashlar', profile.stats.jumps],
    ['Avtomobillar', `${profile.ownedVehicles.length}/${VEHICLES.length}`]
  ].map(([k, val]) => `<div class="hud-pill"><span class="hud-label">${k}</span><span class="hud-val" style="font-size:14px;">${val}</span></div>`).join('');

  // Daily Challenges
  document.getElementById('daily-list').innerHTML = DAILY_CHALLENGES.map(ch => {
    const cur = profile.dailyProgress[ch.metric] || 0;
    const done = cur >= ch.target;
    const claimed = profile.dailyClaimed.includes(ch.id);
    return `
      <div class="lobby-slot">
        <div>
          <div style="font-weight:800;font-size:12px;">${ch.title}</div>
          <div style="font-size:10.5px;color:var(--muted);">Jarayon: ${Math.min(cur, ch.target)}/${ch.target} · Mukofot: 🪙 ${ch.rewardCoins} + ${ch.rewardXp} XP</div>
        </div>
        ${claimed ? '<span style="color:#34d399;font-size:11px;font-weight:800;">✓ Olindi</span>' :
          (done ? `<button class="btn-emerald claim-daily" data-did="${ch.id}" style="padding:4px 9px;font-size:11px;">Olish</button>` : '<span style="color:var(--muted);font-size:11px;">Jarayonda</span>')}
      </div>
    `;
  }).join('');

  document.querySelectorAll('.claim-daily').forEach(b => b.addEventListener('click', () => {
    const ch = DAILY_CHALLENGES.find(x => x.id === b.dataset.did);
    if (ch && !profile.dailyClaimed.includes(ch.id)) {
      profile.dailyClaimed.push(ch.id);
      profile.currency += ch.rewardCoins;
      applyXpGain(profile, ch.rewardXp);
      saveProfile();
      sfx.lap();
      showToast(`Mukofot olindi: +🪙 ${ch.rewardCoins} va +${ch.rewardXp} XP!`);
      refreshAllMenus();
    }
  }));

  // Achievements
  document.getElementById('ach-count').textContent = `${profile.achievements.length}/${ACHIEVEMENTS.length}`;
  document.getElementById('ach-list').innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = profile.achievements.includes(a.id);
    return `
      <div class="lobby-slot" style="opacity:${unlocked ? 1 : 0.58}">
        <div>
          <div style="font-weight:800;font-size:12px;">${unlocked ? '🏅' : '🔒'} ${a.title}</div>
          <div style="font-size:10.5px;color:var(--muted);">${a.desc}</div>
        </div>
        <span style="font-size:11px;font-weight:800;color:#fbbf24;">🪙 ${a.rewardCoins}</span>
      </div>
    `;
  }).join('');

  // Personal Track Records
  document.getElementById('records-list').innerHTML = TRACKS.map(t => `
    <div style="display:flex;justify-content:space-between;font-size:11.5px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
      <span>${t.name}</span>
      <span style="color:#38bdf8;font-weight:700;">${profile.bestTimes[t.id] ? formatTime(profile.bestTimes[t.id]) : '—'} ${profile.bestRank[t.id] ? `(#${profile.bestRank[t.id]})` : ''}</span>
    </div>
  `).join('');
}

function refreshAllMenus() {
  renderHeader();
  if (state.activeTab === 'race') renderTracksTab();
  else if (state.activeTab === 'garage') renderGarageTab();
  else if (state.activeTab === 'compare') renderCompareTab();
  else if (state.activeTab === 'multiplayer') { renderMpRoomList(); renderMpLobby(); }
  else if (state.activeTab === 'profile') renderProfileTab();
}

function joinRoomByCode() {
  if (!state.mp.connected) { showToast('Avval serverga ulaning.'); return; }
  const code = document.getElementById('mp-join-code').value.trim().toUpperCase();
  if (code.length < 4) { showToast('6 xonali xona kodini kiriting.'); return; }
  mpSend({
    type: 'join_room',
    code,
    password: document.getElementById('mp-join-pass').value,
    playerId: profile.playerId,
    nickname: profile.nickname,
    avatarSeed: profile.avatarSeed,
    avatarColor: profile.avatarColor,
    level: profile.level,
    vehicleId: profile.selectedVehicleId,
    colorKey: profile.selectedColor
  });
}

function updateTouchVisibility() {
  const tc = document.getElementById('touch-controls');
  const visible = state.touchVisible && (state.mode === 'racing' || state.mode === 'countdown');
  tc.classList.toggle('visible', visible);
  tc.setAttribute('aria-hidden', String(!visible));
}

function togglePause() {
  if (state.mode === 'racing') {
    state.mode = 'paused';
    state.raceConfig.active = false;
    document.getElementById('pause-screen').classList.add('active');
    sfx.updateEngine(0, false, false, false, false);
  } else if (state.mode === 'paused') {
    state.mode = 'racing';
    state.raceConfig.active = true;
    document.getElementById('pause-screen').classList.remove('active');
  }
}

function returnToMenu() {
  state.mode = 'menu';
  state.raceConfig.active = false;
  document.getElementById('hud').classList.remove('active');
  document.getElementById('pause-screen').classList.remove('active');
  document.getElementById('results-screen').classList.remove('active');
  document.getElementById('touch-controls').classList.remove('visible');
  document.getElementById('touch-controls').setAttribute('aria-hidden', 'true');
  document.getElementById('menu-screen').classList.add('active');
  document.getElementById('center-banner').innerHTML = '';
  sfx.updateEngine(0, false, false, false, false);
  refreshAllMenus();
}

async function toggleFullscreenLandscape() {
  const doc = document;
  const el = document.documentElement;
  const isFs = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
  try {
    if (!isFs) {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      if (screen.orientation && screen.orientation.lock) {
        try { await screen.orientation.lock('landscape'); } catch (_) {}
      }
      if (('ontouchstart' in window) || navigator.maxTouchPoints > 0) {
        state.touchVisible = true;
        updateTouchVisibility();
      }
      showToast("To’liq ekran va gorizontal rejim yoqildi!");
    } else {
      if (screen.orientation && screen.orientation.unlock) {
        try { screen.orientation.unlock(); } catch (_) {}
      }
      if (doc.exitFullscreen) await doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
    }
  } catch (_) {
    showToast("Brauzer to'liq ekran rejimini chekladi.");
  }
  setTimeout(resizeCanvas, 120);
}

function toggleMute() {
  sfx.muted = !sfx.muted;
  profile.settings.muted = sfx.muted;
  saveProfile();
  document.getElementById('btn-mute').textContent = sfx.muted ? '🔇' : '🔊';
  document.getElementById('btn-menu-mute').textContent = sfx.muted ? '🔇' : '🔊';
}

function initUI() {
  // Populate dropdowns
  const modeSel = document.getElementById('cfg-mode');
  RACE_MODES.forEach(m => modeSel.add(new Option(m.label, m.id)));
  const weatherSel = document.getElementById('cfg-weather');
  WEATHER_MODES.forEach(w => weatherSel.add(new Option(w.label, w.id)));
  const mpTrackSel = document.getElementById('mp-track');
  TRACKS.forEach(t => mpTrackSel.add(new Option(t.name, t.id)));

  // HUD Emotes
  const emBar = document.getElementById('hud-emotes');
  emBar.innerHTML = EMOTES.slice(0, 6).map(e => `<button class="emote-btn" data-em="${e.id}" title="${e.label}">${e.icon}</button>`).join('');
  emBar.querySelectorAll('.emote-btn').forEach(b => b.addEventListener('click', () => {
    const now = Date.now();
    if (now - state.lastEmoteAt < 1200) return;
    state.lastEmoteAt = now;
    const em = EMOTES.find(x => x.id === b.dataset.em);
    if (em) state.floatingEmotes.push({ carId: profile.playerId, icon: em.icon, life: 2.2 });
    if (state.mp.connected) mpSend({ type: 'emote', emoteId: b.dataset.em });
  }));

  // Default public server. Keep a previously selected non-local custom server.
  const savedServerUrl = profile.settings.serverUrl || '';
  const defaultWs = savedServerUrl && !/(localhost|127\.0\.0\.1)/i.test(savedServerUrl)
    ? savedServerUrl
    : DEFAULT_MULTIPLAYER_SERVER;
  document.getElementById('mp-server-url').value = defaultWs;
  document.getElementById('mp-room-name').value = generateRoomName();

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));

  // Search & Sort
  document.getElementById('car-search').addEventListener('input', (e) => { state.garageSearch = e.target.value; renderGarageTab(); });
  document.getElementById('car-sort').addEventListener('change', (e) => { state.garageSort = e.target.value; renderGarageTab(); });
  document.getElementById('cmp-car-a').addEventListener('change', renderCompareTab);
  document.getElementById('cmp-car-b').addEventListener('change', renderCompareTab);

  // Tuning controls
  document.getElementById('tune-rim').value = profile.tuning.rimStyle;
  document.getElementById('tune-spoiler').value = profile.tuning.spoiler;
  document.getElementById('tune-neon').value = profile.tuning.neon;
  document.getElementById('tune-stripe').checked = Boolean(profile.tuning.stripe);
  ['tune-rim', 'tune-spoiler', 'tune-neon', 'tune-stripe'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      profile.tuning.rimStyle = document.getElementById('tune-rim').value;
      profile.tuning.spoiler = document.getElementById('tune-spoiler').value;
      profile.tuning.neon = document.getElementById('tune-neon').value;
      profile.tuning.stripe = document.getElementById('tune-stripe').checked;
      saveProfile();
    });
  });

  // Buttons
  document.getElementById('btn-explode').addEventListener('click', (e) => {
    state.explodePreview = !state.explodePreview;
    e.target.classList.toggle('active', state.explodePreview);
    e.target.textContent = state.explodePreview ? 'Yig\'ish (3D)' : 'Qatlamlarni yoyish';
  });
  document.getElementById('btn-start-race').addEventListener('click', () => startRace(null));
  document.getElementById('btn-mute').addEventListener('click', toggleMute);
  document.getElementById('btn-menu-mute').addEventListener('click', toggleMute);
  document.getElementById('btn-pause').addEventListener('click', togglePause);
  document.getElementById('btn-restart').addEventListener('click', () => startRace(null));
  document.getElementById('btn-resume').addEventListener('click', togglePause);
  document.getElementById('btn-pause-restart').addEventListener('click', () => startRace(null));
  document.getElementById('btn-pause-menu').addEventListener('click', returnToMenu);
  document.getElementById('btn-retry-stage').addEventListener('click', () => startRace(null));
  document.getElementById('btn-res-menu').addEventListener('click', returnToMenu);
  document.getElementById('btn-next-stage').addEventListener('click', () => {
    if (state.raceConfig.isMultiplayer) {
      mpSend({ type: 'rematch' });
      return;
    }
    if (state.selectedTrackId < TRACKS.length - 1) {
      const next = getTrackById(state.selectedTrackId + 1);
      if (profile.level >= next.minLevel) state.selectedTrackId++;
    }
    startRace(null);
  });
  document.getElementById('btn-touch-toggle').addEventListener('click', () => { state.touchVisible = !state.touchVisible; updateTouchVisibility(); });
  document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreenLandscape);
  document.getElementById('btn-menu-fullscreen').addEventListener('click', toggleFullscreenLandscape);
  document.addEventListener('fullscreenchange', () => setTimeout(() => {
    resizeCanvas();
    updateTouchVisibility();
  }, 120));
  window.addEventListener('orientationchange', () => setTimeout(() => {
    resizeCanvas();
    updateTouchVisibility();
  }, 180));

  // Profile actions
  document.getElementById('btn-rand-nick').addEventListener('click', () => {
    document.getElementById('prof-nick-input').value = generateNickname();
  });
  document.getElementById('btn-save-nick').addEventListener('click', () => {
    profile.nickname = sanitizeNickname(document.getElementById('prof-nick-input').value);
    saveProfile();
    showToast(`Nik saqlandi: ${profile.nickname}`);
    refreshAllMenus();
  });
  document.getElementById('btn-rand-avatar').addEventListener('click', () => {
    const cols = ['#ef233c', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    profile.avatarSeed = Math.floor(Math.random() * 10000);
    profile.avatarColor = cols[Math.floor(Math.random() * cols.length)];
    saveProfile();
    refreshAllMenus();
  });

  // Multiplayer UI Actions
  document.getElementById('btn-mp-connect').addEventListener('click', () => connectMultiplayer(document.getElementById('mp-server-url').value));
  document.getElementById('mp-scope-lan').addEventListener('click', () => {
    state.mp.scope = 'lan';
    document.getElementById('mp-scope-lan').classList.add('active');
    document.getElementById('mp-scope-online').classList.remove('active');
    if (state.mp.connected) mpSend({ type: 'list_rooms', scope: 'lan' });
  });
  document.getElementById('mp-scope-online').addEventListener('click', () => {
    state.mp.scope = 'online';
    document.getElementById('mp-scope-online').classList.add('active');
    document.getElementById('mp-scope-lan').classList.remove('active');
    if (state.mp.connected) mpSend({ type: 'list_rooms', scope: 'online' });
  });
  document.getElementById('btn-mp-refresh').addEventListener('click', () => {
    if (!state.mp.connected) { showToast('Avval serverga ulaning.'); return; }
    mpSend({ type: 'list_rooms', scope: state.mp.scope });
  });
  document.getElementById('btn-mp-random').addEventListener('click', () => {
    if (!state.mp.connected) { showToast('Avval serverga ulaning.'); return; }
    mpSend({
      type: 'random_join', scope: state.mp.scope,
      playerId: profile.playerId, nickname: profile.nickname,
      avatarSeed: profile.avatarSeed, avatarColor: profile.avatarColor,
      level: profile.level, vehicleId: profile.selectedVehicleId, colorKey: profile.selectedColor
    });
  });
  document.getElementById('btn-mp-join').addEventListener('click', joinRoomByCode);
  document.getElementById('btn-mp-rand-name').addEventListener('click', () => {
    document.getElementById('mp-room-name').value = generateRoomName();
  });
  document.getElementById('btn-mp-create').addEventListener('click', () => {
    if (!state.mp.connected) { showToast('Avval multiplayer serverga ulaning.'); return; }
    mpSend({
      type: 'create_room',
      name: document.getElementById('mp-room-name').value || generateRoomName(),
      scope: state.mp.scope,
      visibility: document.getElementById('mp-visibility').value,
      password: document.getElementById('mp-password').value,
      maxPlayers: Number(document.getElementById('mp-max-players').value),
      trackId: Number(document.getElementById('mp-track').value),
      laps: Number(document.getElementById('mp-laps').value),
      aiEnabled: document.getElementById('mp-ai-enabled').checked,
      playerId: profile.playerId,
      nickname: profile.nickname,
      avatarSeed: profile.avatarSeed,
      avatarColor: profile.avatarColor,
      level: profile.level,
      vehicleId: profile.selectedVehicleId,
      colorKey: profile.selectedColor
    });
  });
  document.getElementById('btn-lobby-ready').addEventListener('click', () => mpSend({ type: 'toggle_ready' }));
  document.getElementById('btn-lobby-start').addEventListener('click', () => mpSend({ type: 'start_race' }));
  document.getElementById('btn-lobby-leave').addEventListener('click', () => {
    mpSend({ type: 'leave_room' });
    state.mp.lobby = null;
    renderMpLobby();
  });
  document.getElementById('btn-copy-code').addEventListener('click', () => {
    if (!state.mp.lobby) return;
    copyText(state.mp.lobby.code);
    showToast(`Xona kodi nusxalandi: ${state.mp.lobby.code}`);
  });
  document.getElementById('btn-copy-link').addEventListener('click', () => {
    if (!state.mp.lobby) return;
    const baseHttp = window.location.protocol.startsWith('http') ? window.location.origin + window.location.pathname : 'http://localhost:3000/';
    copyText(`${baseHttp}?room=${state.mp.lobby.code}`);
    showToast('Taklif havolasi nusxalandi!');
  });

  // Keyboard & Touch bindings
  const setKey = (code, val) => {
    if (code === 'ArrowUp' || code === 'KeyW') keys.up = val;
    if (code === 'ArrowDown' || code === 'KeyS') keys.down = val;
    if (code === 'ArrowLeft' || code === 'KeyA') keys.left = val;
    if (code === 'ArrowRight' || code === 'KeyD') keys.right = val;
    if (code === 'Space') keys.drift = val;
    if (code === 'ShiftLeft' || code === 'ShiftRight') keys.nitro = val;
  };
  window.addEventListener('keydown', (e) => {
    if (document.activeElement && ['INPUT', 'SELECT'].includes(document.activeElement.tagName)) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    if ((e.code === 'KeyP' || e.code === 'Escape') && (state.mode === 'racing' || state.mode === 'paused')) { togglePause(); return; }
    if (e.code === 'KeyR' && (state.mode === 'racing' || state.mode === 'paused') && !state.raceConfig.isMultiplayer) { startRace(null); return; }
    setKey(e.code, true);
  });
  window.addEventListener('keyup', (e) => setKey(e.code, false));

  const bindTouch = (id, keyName) => {
    const el = document.getElementById(id);
    const down = (e) => {
      e.preventDefault();
      keys[keyName] = true;
      el.classList.add('pressed');
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
    };
    const up = (e) => {
      if (e) e.preventDefault();
      keys[keyName] = false;
      el.classList.remove('pressed');
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  };
  bindTouch('tc-left', 'left'); bindTouch('tc-right', 'right');
  bindTouch('tc-gas', 'up'); bindTouch('tc-brake', 'down');
  bindTouch('tc-drift', 'drift'); bindTouch('tc-nitro', 'nitro');
}

function copyText(txt) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).catch(() => fallbackCopy(txt));
  } else {
    fallbackCopy(txt);
  }
}

function fallbackCopy(txt) {
  const ta = document.createElement('textarea');
  ta.value = txt; document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); } catch (_) {}
  document.body.removeChild(ta);
}

function resizeCanvas() {
  const wrap = document.getElementById('game-wrap');
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
}

window.addEventListener('resize', () => {
  resizeCanvas();
  updateTouchVisibility();
});
window.addEventListener('load', () => {
  resizeCanvas();
  initUI();
  refreshAllMenus();
  state.track = buildTrackGeometry(TRACKS[0]);
  state.cam.x = state.track.samples[0].x;
  state.cam.y = state.track.samples[0].y;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
});

/* ---------- World 31,608-Vehicle Catalog Loader & Garage Pagination ---------- */
(function initWorldCatalogBindings() {
  const clsSel = document.getElementById('car-class-filter');
  if (clsSel) clsSel.addEventListener('change', () => {
    state.garageClass = clsSel.value;
    state.garagePage = 1;
    renderGarageTab();
  });
  const prevBtn = document.getElementById('btn-page-prev');
  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (state.garagePage > 1) { state.garagePage--; renderGarageTab(); }
  });
  const nextBtn = document.getElementById('btn-page-next');
  if (nextBtn) nextBtn.addEventListener('click', () => {
    state.garagePage++;
    renderGarageTab();
  });
  const fileInp = document.getElementById('world-json-input');
  if (fileInp) fileInp.addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const parsed = JSON.parse(await f.text());
      const n = loadWorldCatalogData(parsed);
      if (n > 0) {
        state.garageCat = 'world';
        state.garagePage = 1;
        showToast(`🌍 ${n.toLocaleString('uz-UZ')} ta jahon avtomobili yuklandi!`);
        renderGarageTab();
      } else {
        showToast('JSON fayl formati mos kelmadi.');
      }
    } catch (err) {
      showToast('JSON faylni o’qishda xatolik.');
    }
  });

  // Auto-fetch from Node.js server when served over HTTP(S)
  if (typeof fetch === 'function' && location.protocol.startsWith('http')) {
    fetch('/data/world_vehicles_compact.json')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const n = loadWorldCatalogData(data);
        if (n > 0) {
          renderGarageTab();
        }
      })
      .catch(() => {});
  }
})();
