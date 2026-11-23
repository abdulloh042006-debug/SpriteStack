/* =========================================================================
   SPRITESTACK POYGA — INFINITE PROGRESSION, ECONOMY, PROFILE & ACHIEVEMENTS
   Safe arithmetic for arbitrarily high levels (no artificial cap).
   ========================================================================= */

export const NICKNAME_PREFIXES = [
  'Turbo', 'Drift', 'Nitro', 'Chaqmoq', 'Qora', 'Tezlik', 'Tungi', 'Pixel',
  'Asphalt', 'Ghost', 'Shadow', 'Storm', 'Speed', 'Neon', 'Road', 'Ferrari',
  'Oltin', 'Shamol', 'Burgut', 'Yolbars', 'Temir', 'Sulton', 'Usta', 'Afsona'
];

export const NICKNAME_SUFFIXES = [
  'Burgut', 'Sulton', 'Tulpor', 'Racer', 'Yolbars', 'Qiroli', 'Bek', 'Raketa',
  'Pilot', 'King', 'Driver', 'Drift', 'Rider', 'Legend', 'Phantom', 'Hunter',
  'Boss', 'Master', 'Samurai', 'Wolf', 'Falcon', 'Shox', 'Pro', 'Max'
];

export const ROOM_ADJECTIVES = [
  'Tungi', 'Turbo', 'Toshkent', 'Qizilqum', 'Nitro', 'Oxirgi', 'Tog\'', 'Pixel', 'Tezlik', 'Drift'
];

export const ROOM_NOUNS = [
  'Arena', 'Poyga', 'Gran-Pri', 'Bellashuv', 'Qirollik', 'Shosse', 'Final', 'Chempionat', 'Klub', 'Hujum'
];

export const EMOTES = [
  { id: 'wave',  icon: '👋', label: 'Salom' },
  { id: 'fire',  icon: '🔥', label: 'Olov!' },
  { id: 'laugh', icon: '😂', label: 'Haha' },
  { id: 'flex',  icon: '⚡', label: 'Qani!' },
  { id: 'thumb', icon: '👍', label: 'Zo\'r' },
  { id: 'trophy',icon: '🏆', label: 'G\'alaba' },
  { id: 'shock', icon: '😱', label: 'Voy!' },
  { id: 'sad',   icon: '😢', label: 'Eh...' }
];

export const ACHIEVEMENTS = [
  { id: 'first_win',    title: 'Birinchi G\'alaba',  desc: 'Istalgan poygada 1-o\'rinni egallang',    rewardCoins: 1000, rewardXp: 200,  check: (p) => p.stats.wins >= 1 },
  { id: 'ten_wins',     title: '10 ta G\'alaba',     desc: 'Jami 10 marta 1-o\'rin oling',           rewardCoins: 5000, rewardXp: 800,  check: (p) => p.stats.wins >= 10 },
  { id: 'drift_king',   title: 'Drift Ustasi',       desc: 'Jami 5 000 drift balli to\'plang',       rewardCoins: 2500, rewardXp: 450,  check: (p) => p.stats.totalDrift >= 5000 },
  { id: 'air_jumper',   title: 'Parvoz Ustasi',      desc: 'Rampadan 5 marta muvaffaqiyatli sakrang', rewardCoins: 2000, rewardXp: 350,  check: (p) => p.stats.jumps >= 5 },
  { id: 'collector_5',  title: 'Kolleksioner',       desc: '5 ta avtomobilga ega bo\'ling',          rewardCoins: 3500, rewardXp: 600,  check: (p) => p.ownedVehicles.length >= 5 },
  { id: 'night_racer',  title: 'Tungi Poygachi',     desc: 'Tungi Gran-Pri bosqichini yakunlang',    rewardCoins: 2200, rewardXp: 400,  check: (p) => Boolean(p.bestRank[3]) },
  { id: 'level_10',     title: '10-Daraja Ustasi',   desc: '10-darajaga ko\'tariling',               rewardCoins: 4000, rewardXp: 500,  check: (p) => p.level >= 10 },
  { id: 'mp_winner',    title: 'Onlayn Chempion',    desc: 'Multiplayer poygada g\'olib bo\'ling',   rewardCoins: 6000, rewardXp: 1000, check: (p) => p.stats.mpWins >= 1 }
];

export const DAILY_CHALLENGES = [
  { id: 'daily_win',   title: 'Bugun 1 ta poyga yuting',          target: 1,   metric: 'dailyWins',  rewardCoins: 1500, rewardXp: 300 },
  { id: 'daily_laps',  title: 'Bugun 5 ta aylanish yakunlang',    target: 5,   metric: 'dailyLaps',  rewardCoins: 1200, rewardXp: 240 },
  { id: 'daily_drift', title: 'Bugun 1 500 drift balli to\'plang',target: 1500,metric: 'dailyDrift', rewardCoins: 1800, rewardXp: 320 }
];

const BANNED_WORDS = ['admin', 'fuck', 'shit', 'bitch', 'asshole'];

export function sanitizeNickname(raw) {
  const cleaned = String(raw || '').replace(/[^a-zA-Z0-9_\-'\s]/g, '').trim().slice(0, 18);
  if (!cleaned) return generateNickname();
  const low = cleaned.toLowerCase();
  if (BANNED_WORDS.some(w => low.includes(w))) return generateNickname();
  return cleaned;
}

export function generateNickname() {
  const p = NICKNAME_PREFIXES[Math.floor(Math.random() * NICKNAME_PREFIXES.length)];
  const s = NICKNAME_SUFFIXES[Math.floor(Math.random() * NICKNAME_SUFFIXES.length)];
  const num = Math.random() < 0.35 ? Math.floor(Math.random() * 99) : '';
  return `${p}${s}${num}`;
}

export function generateRoomName() {
  const a = ROOM_ADJECTIVES[Math.floor(Math.random() * ROOM_ADJECTIVES.length)];
  const n = ROOM_NOUNS[Math.floor(Math.random() * ROOM_NOUNS.length)];
  return `${a} ${n}`;
}

/* ---------- Infinite Safe Level Math (No Cap, Overflow Safe) ---------- */
export function xpNeededForLevel(level) {
  const L = Math.max(1, Math.floor(Number(level) || 1));
  // Smooth polynomial growth: L=1 -> 200, L=10 -> 4730, L=100 -> 133800, safe even at L=1,000,000
  const val = Math.floor(200 * Math.pow(L, 1.38));
  return Number.isFinite(val) ? Math.min(val, Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
}

export function applyXpGain(profile, rawXp) {
  const gain = Math.max(0, Math.floor(Number(rawXp) || 0));
  if (gain <= 0) return { leveledUp: false, levelsGained: 0, bonusCoins: 0 };

  let level = Math.max(1, Math.floor(Number(profile.level) || 1));
  let xp = Math.max(0, Math.floor(Number(profile.xp) || 0)) + gain;
  let levelsGained = 0;
  let bonusCoins = 0;

  // Guard loop with reasonable iteration cap per single call while remaining unbounded overall
  let guard = 0;
  while (guard < 500) {
    const req = xpNeededForLevel(level);
    if (xp >= req) {
      xp -= req;
      level += 1;
      levelsGained += 1;
      bonusCoins += Math.min(50000, 350 + level * 75);
      guard++;
    } else {
      break;
    }
  }

  profile.level = level;
  profile.xp = xp;
  profile.currency = Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(profile.currency + bonusCoins)));
  return { leveledUp: levelsGained > 0, levelsGained, bonusCoins };
}

export function validateVehiclePurchase(profile, vehicle) {
  if (!vehicle) return { ok: false, reason: 'Avtomobil topilmadi.' };
  if (profile.ownedVehicles.includes(vehicle.id)) {
    return { ok: false, reason: 'Bu avtomobil sizda allaqachon mavjud.' };
  }
  if (profile.level < vehicle.minLevel) {
    return {
      ok: false,
      reason: `Darajangiz yetarli emas: ${vehicle.minLevel}-daraja kerak (sizda: ${profile.level}-daraja).`
    };
  }
  if (profile.currency < vehicle.price) {
    const missing = vehicle.price - profile.currency;
    return {
      ok: false,
      reason: `Mablag' yetarli emas: yana ${missing.toLocaleString('uz-UZ')} tanga kerak.`
    };
  }
  return { ok: true, reason: 'OK' };
}

export function purchaseVehicle(profile, vehicle) {
  const check = validateVehiclePurchase(profile, vehicle);
  if (!check.ok) return check;
  profile.currency = Math.max(0, profile.currency - vehicle.price);
  profile.ownedVehicles.push(vehicle.id);
  return { ok: true, reason: `${vehicle.name} muvaffaqiyatli sotib olindi!` };
}

export function calculateRaceReward({ rank, totalRacers, stageId, laps, driftScore, completed, isMultiplayer }) {
  if (!completed) return { coins: 0, xp: 0 };
  const diffMul = 1 + stageId * 0.28;
  const rankBase = rank === 1 ? 1200 : (rank === 2 ? 800 : (rank === 3 ? 550 : 280));
  const lapBonus = laps * 90;
  const driftBonus = Math.min(600, Math.floor((driftScore || 0) * 0.15));
  const mpMul = isMultiplayer ? 1.35 : 1.0;

  const coins = Math.round((rankBase + lapBonus + driftBonus) * diffMul * mpMul);
  const xp = Math.round((140 + (totalRacers - rank) * 45 + laps * 25) * diffMul * mpMul);
  return { coins, xp };
}

export function createDefaultProfile() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    schemaVersion: 2,
    playerId: 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
    nickname: generateNickname(),
    avatarSeed: Math.floor(Math.random() * 10000),
    avatarColor: '#ef233c',
    currency: 1500,
    xp: 0,
    level: 1,
    ownedVehicles: ['daewoo_nexia_n100', 'vaz_2101'],
    selectedVehicleId: 'daewoo_nexia_n100',
    selectedColor: 'rosso',
    upgrades: {},
    tuning: {
      rimStyle: 'sport',
      spoiler: 'stock',
      stripe: false,
      neon: 'none',
      nitroFlame: 'blue'
    },
    bestRank: {},
    bestTimes: {},
    achievements: [],
    dailyDate: today,
    dailyProgress: { dailyWins: 0, dailyLaps: 0, dailyDrift: 0 },
    dailyClaimed: [],
    stats: {
      races: 0,
      wins: 0,
      podiums: 0,
      totalDrift: 0,
      jumps: 0,
      mpWins: 0
    },
    settings: {
      muted: false,
      lang: 'uz',
      serverUrl: ''
    }
  };
}

export function evaluateAchievements(profile) {
  const newlyUnlocked = [];
  for (const ach of ACHIEVEMENTS) {
    if (!profile.achievements.includes(ach.id) && ach.check(profile)) {
      profile.achievements.push(ach.id);
      profile.currency += ach.rewardCoins;
      applyXpGain(profile, ach.rewardXp);
      newlyUnlocked.push(ach);
    }
  }
  return newlyUnlocked;
}

/* ---------- Paid Performance Tuning System (Engine, Brakes, Tires, Suspension) ---------- */
export const TUNING_PARTS = [
  { id: 'engine',     label: 'Dvigatel',  icon: '⚡', baseCost: 850,  mult: 1.65, prPerLvl: 14, desc: '+Tezlik, +Tezlanish, +Nitro' },
  { id: 'brakes',     label: 'Tormoz',    icon: '🛑', baseCost: 550,  mult: 1.55, prPerLvl: 7,  desc: '+Tormoz kuchi' },
  { id: 'tires',      label: 'Shinalar',  icon: '🛞', baseCost: 650,  mult: 1.55, prPerLvl: 9,  desc: '+Ilashish, +Drift nazorati' },
  { id: 'suspension', label: 'Osma',      icon: '🔩', baseCost: 700,  mult: 1.60, prPerLvl: 8,  desc: '+Boshqaruv, +Yo’lsiz yurish' }
];
export const MAX_UPGRADE_LEVEL = 5;

export function getVehicleUpgrades(profile, vehicleId) {
  if (!profile.upgrades) profile.upgrades = {};
  const u = profile.upgrades[vehicleId];
  return {
    engine: Math.max(0, Math.min(MAX_UPGRADE_LEVEL, (u && u.engine) || 0)),
    brakes: Math.max(0, Math.min(MAX_UPGRADE_LEVEL, (u && u.brakes) || 0)),
    tires: Math.max(0, Math.min(MAX_UPGRADE_LEVEL, (u && u.tires) || 0)),
    suspension: Math.max(0, Math.min(MAX_UPGRADE_LEVEL, (u && u.suspension) || 0))
  };
}

export function getUpgradeCost(vehicle, partId, currentLevel) {
  const part = TUNING_PARTS.find(p => p.id === partId);
  if (!part || currentLevel >= MAX_UPGRADE_LEVEL) return 0;
  const priceScale = 1 + Math.min(3.5, (vehicle.price || 0) / 35000);
  const raw = part.baseCost * priceScale * Math.pow(part.mult, currentLevel);
  return Math.max(250, Math.round(raw / 50) * 50);
}

export function getEffectiveVehicle(vehicle, upgrades) {
  const u = upgrades || { engine: 0, brakes: 0, tires: 0, suspension: 0 };
  const gs = vehicle.gameStats;
  const basePR = typeof vehicle.basePR === 'number'
    ? vehicle.basePR
    : Math.max(120, Math.min(920, Math.round((gs.maxSpeed - 280) * 2.1 + (gs.accel - 200) * 1.45 + (gs.handling - 2.6) * 110 + (gs.braking - 240) * 0.9)));
  const prGain = (u.engine || 0) * 14 + (u.brakes || 0) * 7 + (u.tires || 0) * 9 + (u.suspension || 0) * 8;
  const maxPR = typeof vehicle.maxPR === 'number' ? vehicle.maxPR : Math.min(999, basePR + 190);
  const currentPR = Math.min(maxPR, basePR + prGain);

  return {
    ...vehicle,
    basePR,
    maxPR,
    currentPR,
    gameStats: {
      ...gs,
      maxSpeed: Math.round(gs.maxSpeed * (1 + (u.engine || 0) * 0.032)),
      accel: Math.round(gs.accel * (1 + (u.engine || 0) * 0.042)),
      nitroEff: Number((gs.nitroEff + (u.engine || 0) * 0.018).toFixed(3)),
      braking: Math.round(gs.braking * (1 + (u.brakes || 0) * 0.05)),
      grip: Number(Math.min(0.985, gs.grip + (u.tires || 0) * 0.008).toFixed(3)),
      driftControl: Number(Math.min(0.975, gs.driftControl + (u.tires || 0) * 0.006).toFixed(3)),
      handling: Number(Math.min(3.85, gs.handling * (1 + (u.suspension || 0) * 0.03)).toFixed(2)),
      offRoad: Number(Math.min(0.96, gs.offRoad + (u.suspension || 0) * 0.025).toFixed(3))
    }
  };
}

export function purchaseVehicleUpgrade(profile, vehicle, partId) {
  if (!vehicle) return { ok: false, reason: 'Avtomobil topilmadi.' };
  if (!profile.ownedVehicles.includes(vehicle.id)) {
    return { ok: false, reason: 'Avval ushbu avtomobilni sotib oling.' };
  }
  const part = TUNING_PARTS.find(p => p.id === partId);
  if (!part) return { ok: false, reason: 'Tuning qismi topilmadi.' };

  const cur = getVehicleUpgrades(profile, vehicle.id);
  const lvl = cur[partId];
  if (lvl >= MAX_UPGRADE_LEVEL) {
    return { ok: false, reason: `${part.label} allaqachon maksimal darajada (${MAX_UPGRADE_LEVEL}/${MAX_UPGRADE_LEVEL}).` };
  }
  const cost = getUpgradeCost(vehicle, partId, lvl);
  if (profile.currency < cost) {
    const missing = cost - profile.currency;
    return { ok: false, reason: `Mablag' yetarli emas: yana ${missing.toLocaleString('uz-UZ')} tanga kerak.` };
  }
  profile.currency = Math.max(0, profile.currency - cost);
  if (!profile.upgrades) profile.upgrades = {};
  if (!profile.upgrades[vehicle.id]) profile.upgrades[vehicle.id] = { engine: 0, brakes: 0, tires: 0, suspension: 0 };
  profile.upgrades[vehicle.id][partId] = lvl + 1;
  return {
    ok: true,
    level: lvl + 1,
    cost,
    reason: `${part.label} ${lvl + 1}-darajaga kuchaytirildi! (-${cost.toLocaleString('uz-UZ')} tanga)`
  };
}
