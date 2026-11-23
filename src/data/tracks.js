/* =========================================================================
   SPRITESTACK POYGA — 10 MAPS & SPECIAL ENVIRONMENTS
   Original 5 stages preserved + 5 new worlds with Tunnels, Jump Ramps,
   Isolated Trains, Animated Water & Isolated Ships, and Weather options.
   ========================================================================= */

export const WEATHER_MODES = [
  { id: 'clear',  label: 'Ochiq havo',    gripMul: 1.00 },
  { id: 'rain',   label: 'Yomg\'ir',      gripMul: 0.94 },
  { id: 'snow',   label: 'Qor',           gripMul: 0.90 },
  { id: 'fog',    label: 'Tuman',         gripMul: 0.98 },
  { id: 'sunset', label: 'Quyosh botishi',gripMul: 1.00 },
  { id: 'night',  label: 'Tun',           gripMul: 1.00 }
];

export const RACE_MODES = [
  { id: 'classic',     label: 'Klassik poyga',     desc: 'Barcha aylanishlarni birinchi bo\'lib tugating' },
  { id: 'sprint',      label: 'Sprint (1 aylanish)',desc: 'Tezkor 1 aylanishlik qisqa bellashuv' },
  { id: 'drift',       label: 'Drift musobaqasi',  desc: 'Eng ko\'p drift balli to\'plagan g\'olib bo\'ladi' },
  { id: 'time_attack', label: 'Vaqtga qarshi',     desc: 'Botsiz yakka tartibda rekord o\'rnating' },
  { id: 'elimination', label: 'Oxirgi qolgan',     desc: 'Har aylanishda eng oxirgi poygachi chiqib ketadi' }
];

export const TRACKS = [
  {
    id: 0,
    code: 'beginner_circuit',
    name: '1. Boshlang\'ich Halqa',
    theme: 'grass',
    diffLabel: 'Oson',
    diffClass: 'diff-1',
    minLevel: 1,
    defaultLaps: 2,
    trackWidth: 158,
    defaultWeather: 'clear',
    botCount: 3,
    botDesc: '3 ta havaskor bot · Keng yo\'l',
    botSkill: { speedMul: 0.78, cornerBrake: 0.72, lookahead: 10, laneNoise: 28, nitroChance: 0.002 },
    tunnels: [],
    ramps: [],
    trains: [],
    water: null,
    ships: [],
    controlPoints: [
      [0, -420], [440, -420], [720, -210], [680, 220],
      [360, 420], [-220, 400], [-640, 260], [-700, -140], [-420, -400]
    ]
  },
  {
    id: 1,
    code: 'city_turns',
    name: '2. Shahar Burilishlari',
    theme: 'city',
    diffLabel: 'O\'rtacha',
    diffClass: 'diff-2',
    minLevel: 1,
    defaultLaps: 3,
    trackWidth: 146,
    defaultWeather: 'clear',
    botCount: 4,
    botDesc: '4 ta tajribali bot · Qisqa tunnel + S-burilish',
    botSkill: { speedMul: 0.89, cornerBrake: 0.80, lookahead: 12, laneNoise: 18, nitroChance: 0.006 },
    tunnels: [{ startFrac: 0.44, endFrac: 0.54, name: 'Shahar Tunneli' }],
    ramps: [],
    trains: [],
    water: null,
    ships: [],
    controlPoints: [
      [-100, -520], [450, -520], [820, -320], [740, 40],
      [360, 40], [260, 320], [660, 460], [320, 680],
      [-380, 600], [-760, 320], [-600, -120], [-780, -380], [-460, -540]
    ]
  },
  {
    id: 2,
    code: 'mountain_pass',
    name: '3. Tog\' Dovoni',
    theme: 'mountain',
    diffLabel: 'Qiyin',
    diffClass: 'diff-3',
    minLevel: 1,
    defaultLaps: 3,
    trackWidth: 138,
    defaultWeather: 'sunset',
    botCount: 4,
    botDesc: '4 ta pro bot · Tunnel + Sakrash rampasi',
    botSkill: { speedMul: 0.98, cornerBrake: 0.87, lookahead: 14, laneNoise: 10, nitroChance: 0.012 },
    tunnels: [{ startFrac: 0.22, endFrac: 0.34, name: 'Qamchiq Tunneli' }],
    ramps: [{ frac: 0.72, power: 215 }],
    trains: [],
    water: null,
    ships: [],
    controlPoints: [
      [0, -640], [560, -620], [920, -340], [620, -80],
      [940, 240], [640, 640], [120, 520], [-140, 220],
      [-480, 580], [-920, 380], [-820, -60], [-460, -180], [-820, -480], [-420, -640]
    ]
  },
  {
    id: 3,
    code: 'night_grand_prix',
    name: '4. Tungi Gran-Pri',
    theme: 'night_city',
    diffLabel: 'Juda Qiyin',
    diffClass: 'diff-4',
    minLevel: 1,
    defaultLaps: 3,
    trackWidth: 134,
    defaultWeather: 'night',
    botCount: 5,
    botDesc: '5 ta usta bot · Tungi chiroqlar + Rampa',
    botSkill: { speedMul: 1.05, cornerBrake: 0.92, lookahead: 15, laneNoise: 6, nitroChance: 0.020 },
    tunnels: [{ startFrac: 0.62, endFrac: 0.71, name: 'Neon Tunnel' }],
    ramps: [{ frac: 0.16, power: 225 }],
    trains: [],
    water: null,
    ships: [],
    controlPoints: [
      [-80, -680], [540, -680], [980, -420], [960, 60],
      [520, 120], [420, 420], [880, 640], [320, 820],
      [-240, 660], [-360, 320], [-780, 480], [-1020, 120],
      [-720, -160], [-960, -480], [-520, -680]
    ]
  },
  {
    id: 4,
    code: 'champions_final',
    name: '5. Chempionlar Finali',
    theme: 'grass',
    diffLabel: 'Ekstremal',
    diffClass: 'diff-5',
    minLevel: 1,
    defaultLaps: 4,
    trackWidth: 130,
    defaultWeather: 'clear',
    botCount: 5,
    botDesc: '5 ta afsonaviy bot · Tunnel + 2 ta Rampa',
    botSkill: { speedMul: 1.12, cornerBrake: 0.96, lookahead: 16, laneNoise: 3, nitroChance: 0.032 },
    tunnels: [{ startFrac: 0.35, endFrac: 0.45, name: 'Chempionlar Tunneli' }],
    ramps: [{ frac: 0.08, power: 220 }, { frac: 0.80, power: 235 }],
    trains: [],
    water: null,
    ships: [],
    controlPoints: [
      [-120, -760], [620, -760], [1120, -460], [860, -120],
      [1140, 260], [760, 740], [220, 620], [40, 240],
      [-320, 240], [-340, 720], [-880, 680], [-1140, 240],
      [-740, -40], [-1080, -420], [-680, -760]
    ]
  },
  {
    id: 5,
    code: 'desert_highway',
    name: '6. Qizilqum Cho\'l Shossesi',
    theme: 'desert',
    diffLabel: 'O\'rtacha',
    diffClass: 'diff-2',
    minLevel: 3,
    defaultLaps: 3,
    trackWidth: 150,
    defaultWeather: 'sunset',
    botCount: 4,
    botDesc: '4 ta bot · Yuk poyezdi + Sakrash rampasi',
    botSkill: { speedMul: 0.92, cornerBrake: 0.82, lookahead: 13, laneNoise: 14, nitroChance: 0.010 },
    tunnels: [],
    ramps: [{ frac: 0.48, power: 235 }],
    trains: [
      { id: 'desert_freight', type: 'freight', cars: 7, speed: 155, y: -120, xStart: -1500, xEnd: 1500, dir: 1, color: '#b45309' }
    ],
    water: null,
    ships: [],
    controlPoints: [
      [-200, -560], [560, -580], [1020, -280], [920, 260],
      [420, 560], [-180, 480], [-680, 560], [-1020, 220],
      [-940, -320], [-540, -540]
    ]
  },
  {
    id: 6,
    code: 'forest_road',
    name: '7. Zomin O\'rmon Yo\'li',
    theme: 'forest',
    diffLabel: 'Qiyin',
    diffClass: 'diff-3',
    minLevel: 5,
    defaultLaps: 3,
    trackWidth: 138,
    defaultWeather: 'rain',
    botCount: 4,
    botDesc: '4 ta bot · Yomg\'ir + O\'rmon tunneli',
    botSkill: { speedMul: 0.97, cornerBrake: 0.86, lookahead: 14, laneNoise: 9, nitroChance: 0.014 },
    tunnels: [{ startFrac: 0.56, endFrac: 0.68, name: 'O\'rmon Tunneli' }],
    ramps: [{ frac: 0.25, power: 205 }],
    trains: [],
    water: null,
    ships: [],
    controlPoints: [
      [0, -600], [520, -640], [880, -340], [560, -40],
      [880, 320], [440, 680], [-140, 560], [-560, 640],
      [-920, 260], [-620, -80], [-880, -420], [-440, -620]
    ]
  },
  {
    id: 7,
    code: 'coastal_highway',
    name: '8. Sohil Bo\'yi & Port',
    theme: 'coastal',
    diffLabel: 'Qiyin',
    diffClass: 'diff-3',
    minLevel: 7,
    defaultLaps: 3,
    trackWidth: 142,
    defaultWeather: 'clear',
    botCount: 5,
    botDesc: '5 ta bot · Dengiz suvi + Kemalar + Rampa',
    botSkill: { speedMul: 1.00, cornerBrake: 0.88, lookahead: 14, laneNoise: 8, nitroChance: 0.016 },
    tunnels: [],
    ramps: [{ frac: 0.30, power: 225 }],
    trains: [],
    water: { side: 'east', xEdge: 680, color: '#0284c7', deep: '#0369a1' },
    ships: [
      { id: 'cargo_1', type: 'cargo',     length: 130, width: 34, speed: 46, x: 960,  yStart: -1100, yEnd: 1100, dir: 1,  color: '#dc2626' },
      { id: 'speed_1', type: 'speedboat', length: 44,  width: 16, speed: 135, x: 800, yStart: 1000,  yEnd: -1000,dir: -1, color: '#f8fafc' },
      { id: 'pass_1',  type: 'passenger', length: 95,  width: 26, speed: 72, x: 1120, yStart: -900,  yEnd: 900,  dir: 1,  color: '#f59e0b' }
    ],
    controlPoints: [
      [-180, -640], [440, -640], [560, -240], [540, 220],
      [480, 640], [-80, 680], [-560, 520], [-880, 200],
      [-580, -60], [-880, -380], [-540, -640]
    ]
  },
  {
    id: 8,
    code: 'industrial_rail',
    name: '9. Temiryo\'l Sanoat Zonasi',
    theme: 'industrial',
    diffLabel: 'Juda Qiyin',
    diffClass: 'diff-4',
    minLevel: 10,
    defaultLaps: 3,
    trackWidth: 136,
    defaultWeather: 'fog',
    botCount: 5,
    botDesc: '5 ta bot · Tezyurar Afrosiyob + Yuk poyezdi + Tunnel',
    botSkill: { speedMul: 1.06, cornerBrake: 0.92, lookahead: 15, laneNoise: 6, nitroChance: 0.022 },
    tunnels: [{ startFrac: 0.14, endFrac: 0.28, name: 'Sanoat Tunneli' }],
    ramps: [{ frac: 0.65, power: 230 }],
    trains: [
      { id: 'hs_passenger', type: 'highspeed', cars: 5, speed: 340, y: -260, xStart: -1600, xEnd: 1600, dir: 1,  color: '#0ea5e9' },
      { id: 'ind_freight',  type: 'freight',   cars: 8, speed: 125, y: 280,  xStart: 1600,  xEnd: -1600,dir: -1, color: '#64748b' }
    ],
    water: null,
    ships: [],
    controlPoints: [
      [-140, -700], [580, -700], [980, -400], [940, 140],
      [580, 560], [60, 680], [-420, 540], [-920, 420],
      [-1020, -40], [-680, -360], [-920, -620], [-520, -700]
    ]
  },
  {
    id: 9,
    code: 'snow_mountain',
    name: '10. Chimyon Qorli Dovoni',
    theme: 'snow',
    diffLabel: 'Ekstremal',
    diffClass: 'diff-5',
    minLevel: 12,
    defaultLaps: 4,
    trackWidth: 132,
    defaultWeather: 'snow',
    botCount: 5,
    botDesc: '5 ta afsonaviy bot · Qor + 2 ta Tunnel + Rampa',
    botSkill: { speedMul: 1.10, cornerBrake: 0.94, lookahead: 16, laneNoise: 4, nitroChance: 0.028 },
    tunnels: [
      { startFrac: 0.20, endFrac: 0.30, name: 'Shimoliy Tunnel' },
      { startFrac: 0.72, endFrac: 0.82, name: 'Muzlik Tunneli' }
    ],
    ramps: [{ frac: 0.50, power: 245 }],
    trains: [],
    water: { side: 'west', xEdge: -820, color: '#0ea5e9', deep: '#0369a1' },
    ships: [
      { id: 'ice_boat', type: 'passenger', length: 78, width: 22, speed: 55, x: -1040, yStart: -900, yEnd: 900, dir: 1, color: '#ef4444' }
    ],
    controlPoints: [
      [0, -720], [560, -700], [1020, -360], [720, -20],
      [1040, 320], [640, 740], [100, 600], [-220, 320],
      [-580, 680], [-700, 240], [-560, -140], [-680, -520], [-380, -720]
    ]
  }
];

export function getTrackById(id) {
  return TRACKS.find(t => t.id === id) || TRACKS[0];
}
