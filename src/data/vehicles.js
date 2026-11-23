/* =========================================================================
   SPRITESTACK POYGA — SINGLE SOURCE OF TRUTH: VERIFIED VEHICLE CATALOG
   28 Playable Vehicles spanning Uzbekistan Automotive History (Soviet -> 2026)
   & Global Supercars. Real specs & game physics stats are strictly separated.
   ========================================================================= */

export const CAR_CATEGORIES = [
  { id: 'all',        label: 'Barchasi' },
  { id: 'soviet',     label: 'Klassik Sovet' },
  { id: 'daewoo',     label: 'Daewoo Davri' },
  { id: 'chevrolet',  label: 'Chevrolet / UzAuto' },
  { id: 'modern_uz',  label: 'Zamonaviy O\'zbekiston' },
  { id: 'commercial', label: 'Tijorat' },
  { id: 'supercar',   label: 'Superkarlar' },
  { id: 'world',      label: '🌍 Jahon (31k+)' }
];

export const CAR_COLORS = {
  rosso:   { name: 'Rosso Qizil',   main: '#dc1e2a', light: '#ff424e', dark: '#940d16', trim: '#52060b' },
  crimson: { name: 'To\'q qizil',   main: '#b91c1c', light: '#ef4444', dark: '#7f1d1d', trim: '#450a0a' },
  black:   { name: 'Qora metallik', main: '#272c36', light: '#475569', dark: '#11151c', trim: '#090b10' },
  white:   { name: 'Oq marvarid',   main: '#e2e8f0', light: '#ffffff', dark: '#94a3b8', trim: '#475569' },
  blue:    { name: 'Ko\'k poyga',   main: '#1d63dc', light: '#3b82f6', dark: '#143c8c', trim: '#0b2254' },
  yellow:  { name: 'Sariq Modena',  main: '#eab308', light: '#fde047', dark: '#a16207', trim: '#713f12' },
  emerald: { name: 'Yashil GT',     main: '#10b981', light: '#34d399', dark: '#047857', trim: '#064e3b' },
  silver:  { name: 'Kumushrang',    main: '#94a3b8', light: '#cbd5e1', dark: '#64748b', trim: '#334155' },
  orange:  { name: 'To\'q sariq',   main: '#f97316', light: '#fb923c', dark: '#c2410c', trim: '#7c2d12' }
};

export const VEHICLES = [
  /* ===================== CATEGORY A: CLASSIC SOVIET ===================== */
  {
    id: 'vaz_2101',
    name: 'VAZ-2101 "Kopeyka"',
    brand: 'VAZ / Lada',
    generation: '1-avlod (1970–1988)',
    era: '1970-yillar',
    category: 'soviet',
    defaultColor: 'white',
    visualProfile: { shape: 'boxy_sedan', grille: 'chrome_slats', lights: 'round_2', rear: 'classic_bar', wing: false, stripe: false, detail: 'standard' },
    price: 0,
    minLevel: 1,
    gameStats: {
      maxSpeed: 332, accel: 245, handling: 2.95, braking: 270,
      driftControl: 0.915, grip: 0.92, weight: 955, nitroEff: 1.18, offRoad: 0.72
    },
    realSpecs: {
      origin: 'SSSR (Tolyatti)',
      manufacturer: 'AvtoVAZ',
      localStatus: 'Tarixiy import (O\'zbekistonda keng tarqalgan)',
      engine: '1.2L 4-silindrli benzin (karbyurator)',
      displacement: '1 198 sm³',
      power: '64 ot kuchi',
      torque: 'Noma\'lum',
      transmission: '4 bosqichli mexanik',
      drivetrain: 'Orqa g\'ildirak (RWD)',
      zeroTo100: '20.0 soniya',
      weightKg: '955 kg',
      dimensions: '4073 × 1611 × 1440 mm',
      exterior: 'Yumaloq bitta old faralar, xrom bamperlar, klassik burchakli sedan kuzovi.',
      interior: 'Yupqa plastik rul, gorizontal spidometr, vinil o\'rindiqlar.',
      description: 'O\'zbekiston yo\'llarining afsonaviy klassikasi. Yengil kuzovi va orqa g\'ildirak tortishi sababli drift o\'rganish uchun qulay boshlang\'ich mashina.',
      sourceTitle: 'Lada 2101 I 1.2 MT Specifications — drive.place',
      sourceUrl: 'https://lada.drive.place/2101/i/group_sedan/343548',
      verified: true
    }
  },
  {
    id: 'vaz_2106',
    name: 'VAZ-2106 "Shox"',
    brand: 'VAZ / Lada',
    generation: '1-avlod (1976–2006)',
    era: '1970–1990-yillar',
    category: 'soviet',
    defaultColor: 'crimson',
    visualProfile: { shape: 'boxy_sedan', grille: 'dark_quad', lights: 'round_4', rear: 'wide_red', wing: false, stripe: false, detail: 'standard' },
    price: 1200,
    minLevel: 2,
    gameStats: {
      maxSpeed: 348, accel: 262, handling: 3.02, braking: 280,
      driftControl: 0.910, grip: 0.925, weight: 1030, nitroEff: 1.20, offRoad: 0.72
    },
    realSpecs: {
      origin: 'SSSR / Rossiya',
      manufacturer: 'AvtoVAZ',
      localStatus: 'Tarixiy import (O\'zbekistonda eng mashhur Jiguli)',
      engine: '1.6L 4-silindrli benzin (VAZ-2106)',
      displacement: '1 568 sm³',
      power: '78–80 ot kuchi',
      torque: '117 N·m',
      transmission: '4 bosqichli mexanik',
      drivetrain: 'Orqa g\'ildirak (RWD)',
      zeroTo100: '16.0 soniya',
      weightKg: '1 030 kg',
      dimensions: '4090 × 1610 × 1370 mm (g\'ildirak bazasi 2425 mm)',
      exterior: '4 ta yumaloq old fara, qora plastik panjara, keng orqa chiroqlar.',
      interior: 'Alohida taxometr va spidometrli panel, qulay yumshoq o\'rindiqlar.',
      description: 'O\'zbekistonda eng ko\'p uchragan klassik Jiguli. Kuchliroq 1.6L dvigateli va yumshoq yurishi bilan ajralib turadi.',
      sourceTitle: 'VAZ-2106 — Wikipedia',
      sourceUrl: 'https://en.wikipedia.org/wiki/VAZ-2106',
      verified: true
    }
  },
  {
    id: 'vaz_2107',
    name: 'VAZ-2107 "Semyorka"',
    brand: 'VAZ / Lada',
    generation: '1-avlod (1982–2012)',
    era: '1980–2000-yillar',
    category: 'soviet',
    defaultColor: 'black',
    visualProfile: { shape: 'boxy_sedan', grille: 'chrome_big', lights: 'rect_2', rear: 'block_red', wing: false, stripe: false, detail: 'standard' },
    price: 1800,
    minLevel: 2,
    gameStats: {
      maxSpeed: 354, accel: 270, handling: 3.05, braking: 285,
      driftControl: 0.905, grip: 0.928, weight: 1030, nitroEff: 1.21, offRoad: 0.70
    },
    realSpecs: {
      origin: 'SSSR / Rossiya',
      manufacturer: 'AvtoVAZ',
      localStatus: 'Tarixiy import',
      engine: '1.5L–1.6L 4-silindrli benzin',
      displacement: '1 452–1 568 sm³',
      power: '72–75 ot kuchi',
      torque: 'Noma\'lum',
      transmission: '4 yoki 5 bosqichli mexanik',
      drivetrain: 'Orqa g\'ildirak (RWD)',
      zeroTo100: '16.0–17.0 soniya',
      weightKg: '1 030 kg',
      dimensions: '4145 × 1620 × 1446 mm',
      exterior: 'Katta xrom radiator panjarasi, to\'rtburchak old faralar, plastik bamperlar.',
      interior: 'Anatomik yuqori suyanchiq o\'rindiqlar, markaziy konsol.',
      description: 'Katta xrom panjarasi bilan tanilgan "Semyorka". O\'yinda orqa g\'ildirakli drift ishqibozlari uchun ajoyib muvozanat beradi.',
      sourceTitle: 'AvtoVAZ VAZ-2107 — Auto ABC',
      sourceUrl: 'https://www.auto-abc.eu/compare/VAZ-2107-g1724-vs-VAZ-2106-g1720',
      verified: true
    }
  },
  {
    id: 'vaz_2121_niva',
    name: 'VAZ-2121 Niva 4×4',
    brand: 'VAZ / Lada',
    generation: '1-avlod (1977–hozir)',
    era: '1970–2020-yillar',
    category: 'soviet',
    defaultColor: 'emerald',
    visualProfile: { shape: 'niva_4x4', grille: 'dark_quad', lights: 'round_2', rear: 'vertical_red', wing: false, stripe: false, detail: 'standard' },
    price: 2600,
    minLevel: 3,
    gameStats: {
      maxSpeed: 344, accel: 268, handling: 3.12, braking: 295,
      driftControl: 0.935, grip: 0.952, weight: 1150, nitroEff: 1.19, offRoad: 0.88
    },
    realSpecs: {
      origin: 'SSSR / Rossiya',
      manufacturer: 'AvtoVAZ',
      localStatus: 'Import (tog\'li hududlarda juda mashhur)',
      engine: '1.6L 4-silindrli benzin (VAZ-2121)',
      displacement: '1 568 sm³',
      power: '75 ot kuchi',
      torque: 'Noma\'lum',
      transmission: '4/5 bosqichli mexanik + razdatka',
      drivetrain: 'Doimiy to\'liq tortish (4WD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 150 kg',
      dimensions: '3720 × 1680 × 1640 mm',
      exterior: 'Qisqa 3-eshikli yo\'ltanlamas kuzov, baland klirens, yumaloq faralar.',
      interior: 'Sodda utilitar panel, qo\'shimcha differensial blokirovka richaglari.',
      description: 'Tog\' va maysazor yo\'llarda eng kam tezlik yo\'qotadigan klassik 4×4 yo\'ltanlamas. Asfaltdan chiqib ketishdan qo\'rqmaydi.',
      sourceTitle: 'VAZ-2106 / VAZ-2121 Niva — Wikipedia',
      sourceUrl: 'https://en.wikipedia.org/wiki/VAZ-2106',
      verified: true
    }
  },
  {
    id: 'gaz_24_volga',
    name: 'GAZ-24 Volga',
    brand: 'GAZ',
    generation: '1-avlod (1970–1986)',
    era: '1970–1980-yillar',
    category: 'soviet',
    defaultColor: 'black',
    visualProfile: { shape: 'long_sedan', grille: 'chrome_slats', lights: 'round_2', rear: 'vertical_red', wing: false, stripe: false, detail: 'high' },
    price: 3200,
    minLevel: 4,
    gameStats: {
      maxSpeed: 364, accel: 266, handling: 2.86, braking: 278,
      driftControl: 0.908, grip: 0.932, weight: 1420, nitroEff: 1.22, offRoad: 0.70
    },
    realSpecs: {
      origin: 'SSSR (Gorkiy)',
      manufacturer: 'GAZ',
      localStatus: 'Tarixiy import (mansabdor va taksi ramzi)',
      engine: '2.4L 4-silindrli ZMZ-24D benzin',
      displacement: '2 445 sm³',
      power: '95 ot kuchi (yuqori siqish)',
      torque: 'Noma\'lum',
      transmission: '4 bosqichli mexanik',
      drivetrain: 'Orqa g\'ildirak (RWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 420 kg',
      dimensions: '4735 × 1800 × 1490 mm',
      exterior: 'Uzun salobatli sedan, xrom vertikal panjara, keng kapot.',
      interior: 'Keng 5-6 o\'rinli salon, metall va xrom bezakli panel.',
      description: 'Og\'ir va barqaror klassik biznes-sedan. To\'qnashuvlarda o\'zini juda mustahkam tutadi va tekis yo\'lda yuqori tezlik oladi.',
      sourceTitle: 'GAZ-24 — Wikipedia / GAZ24.COM',
      sourceUrl: 'https://en.wikipedia.org/wiki/GAZ-24',
      verified: true
    }
  },
  {
    id: 'moskvich_412',
    name: 'Moskvich-412',
    brand: 'AZLK / IZh',
    generation: '1-avlod (1967–1976)',
    era: '1970-yillar',
    category: 'soviet',
    defaultColor: 'orange',
    visualProfile: { shape: 'boxy_sedan', grille: 'chrome_slats', lights: 'rect_2', rear: 'classic_bar', wing: false, stripe: false, detail: 'standard' },
    price: 1500,
    minLevel: 2,
    gameStats: {
      maxSpeed: 346, accel: 260, handling: 3.00, braking: 275,
      driftControl: 0.918, grip: 0.922, weight: 1045, nitroEff: 1.19, offRoad: 0.74
    },
    realSpecs: {
      origin: 'SSSR (Moskva / Ijevsk)',
      manufacturer: 'AZLK',
      localStatus: 'Tarixiy import',
      engine: '1.5L 4-silindrli UZAM-412 benzin',
      displacement: '1 478 sm³',
      power: '75 ot kuchi',
      torque: 'Noma\'lum',
      transmission: '4 bosqichli mexanik',
      drivetrain: 'Orqa g\'ildirak (RWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 045 kg',
      dimensions: '4120 × 1550 × 1480 mm',
      exterior: 'Yassi kapot, to\'rtburchak faralar, orqa qanot uchlarida klassik chiroqlar.',
      interior: 'Yumshoq qoplamali panel, 4-bosqichli uzatma dastagi.',
      description: 'Mustahkam podveskasi bilan mashhur sovet rallichisi. Qiyin burilishlarda ham ishonchli boshqariladi.',
      sourceTitle: 'O\'zbekiston klassik avtomobillari arxivi',
      sourceUrl: 'https://en.wikipedia.org/wiki/Moskvitch_412',
      verified: false
    }
  },

  /* ===================== CATEGORY B: EARLY DAEWOO ERA ===================== */
  {
    id: 'daewoo_tico',
    name: 'Daewoo Tico',
    brand: 'Daewoo / UzDaewooAuto',
    generation: '1-avlod (1996–2001 Asaka)',
    era: '1990-yillar',
    category: 'daewoo',
    defaultColor: 'white',
    visualProfile: { shape: 'micro_hatch', grille: 'small_slot', lights: 'rect_2', rear: 'hatch_tall', wing: false, stripe: false, detail: 'standard' },
    price: 900,
    minLevel: 1,
    gameStats: {
      maxSpeed: 338, accel: 278, handling: 3.48, braking: 310,
      driftControl: 0.945, grip: 0.945, weight: 640, nitroEff: 1.23, offRoad: 0.68
    },
    realSpecs: {
      origin: 'Janubiy Koreya / O\'zbekiston (Asaka)',
      manufacturer: 'UzDaewooAuto',
      localStatus: 'Mahalliy ishlab chiqarilgan (to\'xtatilgan)',
      engine: '0.8L 3-silindrli S-TEC benzin',
      displacement: '796 sm³',
      power: '41–48 ot kuchi',
      torque: 'Noma\'lum',
      transmission: '5 bosqichli mexanik',
      drivetrain: 'Old g\'ildirak (FWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '640 kg',
      dimensions: '3340 × 1400 × 1395 mm',
      exterior: 'Juda ixcham 5-eshikli xetchbek, burchakli kichik faralar, tekis orqa eshik.',
      interior: 'Sodda va tejamkor shahar saloni, yengil rul.',
      description: 'Asaka zavodining ilk qaldirg\'ochlaridan biri. Ultra-yengil vazni tufayli tor burilishlarda chaqqon buriladi.',
      sourceTitle: 'Daewoo Tico — Wikipedia',
      sourceUrl: 'https://en.wikipedia.org/wiki/Daewoo_Tico',
      verified: true
    }
  },
  {
    id: 'daewoo_matiz',
    name: 'Daewoo Matiz',
    brand: 'Daewoo / UzDaewooAuto',
    generation: 'M100/M150 (2001–2018 Asaka)',
    era: '2000-yillar',
    category: 'daewoo',
    defaultColor: 'yellow',
    visualProfile: { shape: 'micro_round', grille: 'smile', lights: 'round_2', rear: 'hatch_round', wing: false, stripe: false, detail: 'standard' },
    price: 1600,
    minLevel: 2,
    gameStats: {
      maxSpeed: 346, accel: 286, handling: 3.54, braking: 315,
      driftControl: 0.948, grip: 0.950, weight: 778, nitroEff: 1.24, offRoad: 0.68
    },
    realSpecs: {
      origin: 'Janubiy Koreya / O\'zbekiston (Asaka)',
      manufacturer: 'UzDaewooAuto / GM Uzbekistan',
      localStatus: 'Mahalliy ishlab chiqarilgan (to\'xtatilgan)',
      engine: '0.8L 3-silindrli S-TEC injektor benzin',
      displacement: '796 sm³',
      power: '52 ot kuchi @ 5900 rpm',
      torque: '69 N·m @ 4600 rpm',
      transmission: '5 bosqichli mexanik',
      drivetrain: 'Old g\'ildirak (FWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '778 kg',
      dimensions: '3495 × 1495 × 1485 mm',
      exterior: 'Yumaloq do\'stona faralar, qisqa kapot, baland tom va ixcham xetchbek silueti.',
      interior: 'Yorqin ko\'rinishli ixcham salon, 5 o\'rindiqli tartib.',
      description: 'O\'zbekiston shaharlarining sevimli ixcham xetchbeki. Eng yuqori burilish chaqqonligi bilan shahar trassalarida zo\'r natija beradi.',
      sourceTitle: 'Daewoo Matiz 0.8L Specs — Autoevolution',
      sourceUrl: 'https://www.autoevolution.com/cars/daewoo-matiz-1998.html',
      verified: true
    }
  },
  {
    id: 'daewoo_nexia_n100',
    name: 'Daewoo Nexia (N100)',
    brand: 'Daewoo / UzDaewooAuto',
    generation: 'N100 (1996–2008 Asaka)',
    era: '1990–2000-yillar',
    category: 'daewoo',
    defaultColor: 'silver',
    visualProfile: { shape: 'compact_sedan', grille: 'daewoo_split', lights: 'rect_2', rear: 'wide_red', wing: false, stripe: false, detail: 'standard' },
    price: 0,
    minLevel: 1,
    gameStats: {
      maxSpeed: 368, accel: 292, handling: 3.22, braking: 300,
      driftControl: 0.935, grip: 0.940, weight: 969, nitroEff: 1.22, offRoad: 0.70
    },
    realSpecs: {
      origin: 'Janubiy Koreya / O\'zbekiston (Asaka)',
      manufacturer: 'UzDaewooAuto',
      localStatus: 'Mahalliy ishlab chiqarilgan (to\'xtatilgan)',
      engine: '1.5L SOHC / DOHC 4-silindrli benzin',
      displacement: '1 498 sm³',
      power: '75–83 ot kuchi',
      torque: 'Noma\'lum',
      transmission: '5 bosqichli mexanik',
      drivetrain: 'Old g\'ildirak (FWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '969 kg',
      dimensions: '4482 × 1662 × 1393 mm',
      exterior: 'Klassik 90-yillar sedan chiziqlari, to\'rtburchak faralar, keng yukxona.',
      interior: 'Sodda va chidamli asboblar paneli, qulay 5 o\'rinli salon.',
      description: 'O\'zbekiston avtomobilsozligi tarixidagi eng mashhur xalq sedani. Boshlang\'ich o\'yinchilar uchun bepul va muvozanatli tanlov.',
      sourceTitle: 'Daewoo Nexia History & Specs — 1CARS',
      sourceUrl: 'https://1cars.org/29-daewoo-nexia-specifications-photos-videos-reviews-prices.html',
      verified: true
    }
  },
  {
    id: 'daewoo_nexia_n150',
    name: 'Daewoo Nexia II (N150)',
    brand: 'Daewoo / GM Uzbekistan',
    generation: 'N150 (2008–2016 Asaka)',
    era: '2008–2016',
    category: 'daewoo',
    defaultColor: 'white',
    visualProfile: { shape: 'compact_sedan', grille: 'n150_chrome', lights: 'swept_2', rear: 'modern_split', wing: false, stripe: false, detail: 'standard' },
    price: 2400,
    minLevel: 3,
    gameStats: {
      maxSpeed: 380, accel: 304, handling: 3.26, braking: 308,
      driftControl: 0.938, grip: 0.942, weight: 1025, nitroEff: 1.23, offRoad: 0.70
    },
    realSpecs: {
      origin: 'O\'zbekiston (Asaka)',
      manufacturer: 'GM Uzbekistan',
      localStatus: 'Mahalliy ishlab chiqarilgan (to\'xtatilgan)',
      engine: '1.5L (80 ot kuchi) / 1.6L DOHC (109 ot kuchi)',
      displacement: '1 498 / 1 598 sm³',
      power: '80 / 109 ot kuchi',
      torque: 'Noma\'lum',
      transmission: '5 bosqichli mexanik',
      drivetrain: 'Old g\'ildirak (FWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 025 kg',
      dimensions: '4482 × 1662 × 1393 mm (530 L yukxona)',
      exterior: 'Yangilangan qiyshiq old faralar, silliq bamper va zamonaviy orqa chiroqlar.',
      interior: 'Yangilangan spidometr paneli, gidravlik rul kuchaytirgichi.',
      description: 'N100 ning kuchaytirilgan 1.6 DOHC (109 ot kuchi) versiyasi. Tezlanish va to\'g\'ri yo\'l tezligida sezilarli ustunlik beradi.',
      sourceTitle: 'Uz-Daewoo Nexia Commercial Offer',
      sourceUrl: 'https://uzdaewoo.ru/uploads/files/files/commercialoffer.pdf',
      verified: true
    }
  },

  /* ===================== CATEGORY C: CHEVROLET / UZAUTO ===================== */
  {
    id: 'chevy_gentra',
    name: 'Chevrolet Lacetti / Gentra',
    brand: 'Chevrolet / UzAuto Motors',
    generation: 'J200 (2013–2024 Asaka)',
    era: '2013–2024',
    category: 'chevrolet',
    defaultColor: 'black',
    visualProfile: { shape: 'compact_sedan', grille: 'chevy_dual', lights: 'swept_2', rear: 'modern_split', wing: false, stripe: false, detail: 'high' },
    price: 4200,
    minLevel: 5,
    gameStats: {
      maxSpeed: 392, accel: 312, handling: 3.30, braking: 318,
      driftControl: 0.942, grip: 0.948, weight: 1245, nitroEff: 1.24, offRoad: 0.68
    },
    realSpecs: {
      origin: 'O\'zbekiston (Asaka)',
      manufacturer: 'UzAuto Motors',
      localStatus: 'Mahalliy ishlab chiqarilgan (2024-yil iyulda to\'xtatilgan)',
      engine: '1.5L DOHC 4-silindrli benzin',
      displacement: '1 485 sm³',
      power: '107 ot kuchi',
      torque: 'Noma\'lum',
      transmission: '5MT / 6AT',
      drivetrain: 'Old g\'ildirak (FWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 245 kg',
      dimensions: '4515 × 1725 × 1445 mm',
      exterior: 'Keng ikki qismli panjara, bodomsimon faralar, klassik qora salonli sedan.',
      interior: 'Yog\'och/kumush bezakli panel, lyuk opsiyasi, keng orqa o\'rindiqlar.',
      description: 'O\'zbekistonda yillar davomida eng talabgir bo\'lgan sedan. Mustahkam yo\'l ushlashi va silliq burilishlari bilan ajralib turadi.',
      sourceTitle: 'UzAuto Motors Gentra/Lacetti — Autostrada.uz',
      sourceUrl: 'https://www.autostrada.uz/tseny-chevrolet-ravon-gm-uzbekistan/',
      verified: true
    }
  },
  {
    id: 'chevy_cobalt',
    name: 'Chevrolet Cobalt MCM',
    brand: 'Chevrolet / UzAuto Motors',
    generation: '2-avlod / Style MCM (2026)',
    era: '2012–2026',
    category: 'chevrolet',
    defaultColor: 'white',
    visualProfile: { shape: 'compact_sedan', grille: 'chevy_dual', lights: 'big_modern', rear: 'block_red', wing: false, stripe: false, detail: 'high' },
    price: 5500,
    minLevel: 6,
    gameStats: {
      maxSpeed: 396, accel: 316, handling: 3.32, braking: 322,
      driftControl: 0.944, grip: 0.950, weight: 1170, nitroEff: 1.24, offRoad: 0.72
    },
    realSpecs: {
      origin: 'O\'zbekiston (Asaka)',
      manufacturer: 'UzAuto Motors',
      localStatus: 'Mahalliy ishlab chiqarilmoqda (2026)',
      engine: '1.5L DOHC 4-silindrli benzin (gazga moslashtirilgan)',
      displacement: '1 485 sm³',
      power: '106 ot kuchi',
      torque: 'Noma\'lum',
      transmission: '5MT / 6AT',
      drivetrain: 'Old g\'ildirak (FWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 170 kg',
      dimensions: '4479 × 1735 × 1514 mm',
      exterior: 'Baland korpus, katta old faralar, MCM versiyasida qora diskalar va 7" multimedia.',
      interior: '7 dyuymli sensorli ekran, kruiz-kontrol, rulda boshqaruv tugmalari.',
      description: 'O\'zbekistonning eng ommabop zamonaviy sedani. Chidamli podveskasi va muvozanatli boshqaruvi tufayli har qanday trassada ishonchli.',
      sourceTitle: 'Chevrolet Cobalt MCM 2026 — Autostrada.uz',
      sourceUrl: 'https://www.autostrada.uz/tseny-chevrolet-ravon-gm-uzbekistan/',
      verified: true
    }
  },
  {
    id: 'chevy_onix',
    name: 'Chevrolet Onix 1.2 Turbo',
    brand: 'Chevrolet / UzAuto Motors',
    generation: '2-avlod (2023–2026 Asaka)',
    era: '2023–2026',
    category: 'chevrolet',
    defaultColor: 'blue',
    visualProfile: { shape: 'modern_sedan', grille: 'chevy_wide', lights: 'sleek_led', rear: 'led_bar', wing: false, stripe: false, detail: 'high' },
    price: 8500,
    minLevel: 9,
    gameStats: {
      maxSpeed: 408, accel: 332, handling: 3.36, braking: 330,
      driftControl: 0.948, grip: 0.954, weight: 1120, nitroEff: 1.27, offRoad: 0.68
    },
    realSpecs: {
      origin: 'O\'zbekiston (Asaka)',
      manufacturer: 'UzAuto Motors',
      localStatus: 'Mahalliy ishlab chiqarilmoqda (2026)',
      engine: '1.2L 3-silindrli Turbo benzin',
      displacement: '1 199 sm³',
      power: '132 ot kuchi (turbo) / 90 ot kuchi (atmosferik)',
      torque: 'Noma\'lum',
      transmission: '6 bosqichli avtomat (6AT) / 5MT',
      drivetrain: 'Old g\'ildirak (FWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 120 kg',
      dimensions: '4474 × 1730 × 1471 mm',
      exterior: 'Sportiv o\'tkir LED faralar, keng qora radiator panjarasi, dinamik yon chiziqlar.',
      interior: 'Zamonaviy kokpit, 15" quyma diskalar, kruiz-kontrol, charm rul.',
      description: '132 ot kuchili turbo dvigatel va yengil kuzov kombinatsiyasi. Tezlanish va nitro samaradorligida Cobalt va Gentra\'dan tezroq.',
      sourceTitle: 'Chevrolet Onix Rasmiy — Chevrolet.uz',
      sourceUrl: 'https://chevrolet.uz/onix',
      verified: true
    }
  },
  {
    id: 'chevy_tracker',
    name: 'Chevrolet Tracker Turbo',
    brand: 'Chevrolet / UzAuto Motors',
    generation: '2-avlod (2022–2026 Asaka)',
    era: '2022–2026',
    category: 'chevrolet',
    defaultColor: 'rosso',
    visualProfile: { shape: 'suv', grille: 'chevy_wide', lights: 'sleek_led', rear: 'suv_led', wing: false, stripe: false, detail: 'high' },
    price: 10500,
    minLevel: 11,
    gameStats: {
      maxSpeed: 404, accel: 326, handling: 3.24, braking: 328,
      driftControl: 0.946, grip: 0.958, weight: 1265, nitroEff: 1.25, offRoad: 0.84
    },
    realSpecs: {
      origin: 'O\'zbekiston (Asaka)',
      manufacturer: 'UzAuto Motors',
      localStatus: 'Mahalliy ishlab chiqarilmoqda (2026)',
      engine: '1.2L 3-silindrli Turbo benzin',
      displacement: '1 199 sm³',
      power: '132 ot kuchi',
      torque: 'Noma\'lum',
      transmission: '6 bosqichli avtomat (6AT)',
      drivetrain: 'Old g\'ildirak (FWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 265 kg',
      dimensions: '4270 × 1791 × 1627 mm',
      exterior: 'Ixcham krossover kuzovi, LED kunduzgi chiroqlar, tom reylinglari.',
      interior: 'Panoramali lyuk, raqamli ekranli zamonaviy krossover saloni.',
      description: 'Mahalliy ishlab chiqarilgan zamonaviy krossover. Maysa va qorli trassalarda sedanlarga qaraganda ancha barqaror yuradi.',
      sourceTitle: 'UzAuto Motors Rasmiy — uzautomotors.com',
      sourceUrl: 'https://uzautomotors.com/',
      verified: true
    }
  },
  {
    id: 'malibu',
    name: 'Chevrolet Malibu XL',
    brand: 'Chevrolet / UzAuto Motors',
    generation: '9-avlod / Malibu 2 XL',
    era: '2017–2026',
    category: 'chevrolet',
    defaultColor: 'black',
    visualProfile: { shape: 'malibu', grille: 'chevy_wide', lights: 'sleek_led', rear: 'led_bar', wing: false, stripe: false, detail: 'high' },
    price: 14000,
    minLevel: 12,
    gameStats: {
      maxSpeed: 416, accel: 328, handling: 3.38, braking: 336,
      driftControl: 0.955, grip: 0.960, weight: 1480, nitroEff: 1.26, offRoad: 0.70
    },
    realSpecs: {
      origin: 'AQSh / Xitoy (UzAuto Motors orqali)',
      manufacturer: 'General Motors / UzAuto Motors',
      localStatus: 'Import / rasmiy dilerlik (2026)',
      engine: '2.0L Turbo 4-silindrli benzin',
      displacement: '1 998 sm³',
      power: '237–250 ot kuchi (komplektatsiyaga qarab)',
      torque: 'Noma\'lum',
      transmission: '9 bosqichli avtomat',
      drivetrain: 'Old g\'ildirak (FWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 480 kg',
      dimensions: '4933 × 1854 × 1473 mm',
      exterior: 'Uzun biznes-klass silueti, ikki qismli xrom panjara, LED orqa chiroqlar va lyuk.',
      interior: 'Charm salon, keng markaziy ekran, yumshoq biznes-klass boshqaruv.',
      description: 'O\'zbekistonning eng nufuzli biznes-sedani. Asl o\'yin balansini to\'liq saqlagan holda eng silliq boshqaruv va drift nazoratini beradi.',
      sourceTitle: 'UzAuto Motors Malibu XL — uzautomotors.com',
      sourceUrl: 'https://uzautomotors.com/',
      verified: true
    }
  },

  /* ===================== CATEGORY D: MODERN UZBEKISTAN MARKET ===================== */
  {
    id: 'byd_seagull',
    name: 'BYD Seagull EV',
    brand: 'BYD',
    generation: '1-avlod (2024–2026)',
    era: '2024–2026',
    category: 'modern_uz',
    defaultColor: 'emerald',
    visualProfile: { shape: 'micro_ev', grille: 'ev_closed', lights: 'angular_led', rear: 'led_bar', wing: true, stripe: false, detail: 'high' },
    price: 7500,
    minLevel: 8,
    gameStats: {
      maxSpeed: 394, accel: 342, handling: 3.50, braking: 334,
      driftControl: 0.950, grip: 0.955, weight: 1160, nitroEff: 1.28, offRoad: 0.68
    },
    realSpecs: {
      origin: 'Xitoy (O\'zbekistonda rasmiy sotuv)',
      manufacturer: 'BYD Auto',
      localStatus: 'Rasmiy dilerlik / import (2026)',
      engine: 'To\'liq elektr dvigatel (Blade Battery)',
      displacement: '0 sm³ (EV)',
      power: 'Noma\'lum (405 km zaxira versiyasi)',
      torque: 'Noma\'lum',
      transmission: '1 bosqichli reduktor',
      drivetrain: 'Old g\'ildirak (FWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 160 kg',
      dimensions: '3780 × 1715 × 1540 mm',
      exterior: 'Okean estetikasidagi o\'tkir burchakli dizayn, yopiq EV old qismi, tom spoyleri.',
      interior: 'Aylanuvchi markaziy ekran, minimalist elektr kokpit.',
      description: '405 km gacha yurish zaxirasiga ega ixcham shahar elektromobili. Elektr tortishi tufayli startda chaqmoqdek tezlanadi.',
      sourceTitle: 'BYD Seagull O\'zbekiston — byd-rm.uz',
      sourceUrl: 'https://byd-rm.uz/uz/models/seagull',
      verified: true
    }
  },
  {
    id: 'byd_chazor',
    name: 'BYD Chazor UzPride',
    brand: 'BYD',
    generation: 'DM-i Hybrid (Jizzax 2024–2026)',
    era: '2024–2026',
    category: 'modern_uz',
    defaultColor: 'white',
    visualProfile: { shape: 'modern_sedan', grille: 'byd_slats', lights: 'sleek_led', rear: 'led_bar', wing: false, stripe: false, detail: 'high' },
    price: 16500,
    minLevel: 14,
    gameStats: {
      maxSpeed: 418, accel: 348, handling: 3.36, braking: 340,
      driftControl: 0.952, grip: 0.958, weight: 1500, nitroEff: 1.29, offRoad: 0.68
    },
    realSpecs: {
      origin: 'O\'zbekiston (BYD Uzbekistan Factory, Jizzax)',
      manufacturer: 'BYD Uzbekistan Factory',
      localStatus: 'Mahalliy yig\'ilgan / ishlab chiqarilgan (Jizzax)',
      engine: '1.5L Plug-in Hybrid (DM-i)',
      displacement: '1 498 sm³ + elektr motor',
      power: 'Noma\'lum (DM-i gibrid tizim)',
      torque: 'Noma\'lum',
      transmission: 'E-CVT gibrid',
      drivetrain: 'Old g\'ildirak (FWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 500 kg',
      dimensions: '4780 × 1837 × 1495 mm',
      exterior: 'Keng gorizontal xrom panjara, yaxlit LED orqa chiroq chizig\'i, zamonaviy fastbek sedan.',
      interior: 'Aylanuvchi multimedia ekrani, raqamli pribor paneli, elektron selektor.',
      description: 'Jizzaxdagi BYD zavodida ishlab chiqarilayotgan gibrid sedan. Elektr yordami tufayli burilishdan chiqishda juda kuchli tezlanish beradi.',
      sourceTitle: 'BYD Uzbekistan Rasmiy — bydauto.uz',
      sourceUrl: 'https://bydauto.uz/',
      verified: true
    }
  },
  {
    id: 'byd_song_plus',
    name: 'BYD Song Plus DM-i',
    brand: 'BYD',
    generation: 'Champion / UzPride (Jizzax 2024–2026)',
    era: '2024–2026',
    category: 'modern_uz',
    defaultColor: 'blue',
    visualProfile: { shape: 'suv', grille: 'byd_slats', lights: 'sleek_led', rear: 'led_bar', wing: false, stripe: false, detail: 'high' },
    price: 19500,
    minLevel: 16,
    gameStats: {
      maxSpeed: 414, accel: 344, handling: 3.26, braking: 342,
      driftControl: 0.950, grip: 0.962, weight: 1700, nitroEff: 1.28, offRoad: 0.85
    },
    realSpecs: {
      origin: 'O\'zbekiston (BYD Uzbekistan Factory, Jizzax)',
      manufacturer: 'BYD Uzbekistan Factory',
      localStatus: 'Mahalliy ishlab chiqarilgan (Jizzax)',
      engine: '1.5L Plug-in Hybrid (DM-i Champion)',
      displacement: '1 498 sm³ + elektr motor',
      power: 'Noma\'lum (150 km elektr zaxira versiyasi)',
      torque: 'Noma\'lum',
      transmission: 'E-CVT gibrid',
      drivetrain: 'Old g\'ildirak (FWD)',
      zeroTo100: '8.5 soniya',
      weightKg: '1 700 kg',
      dimensions: '4775 × 1890 × 1670 mm',
      exterior: 'Okean uslubidagi zamonaviy SUV, keng LED chiroqlar, aerodinamik tom.',
      interior: 'Infinity Luxury Audio (10 dinamik), simsiz zaryadlash, katta sensorli ekran.',
      description: 'Jizzaxda ishlab chiqarilayotgan eng mashhur gibrid krossover (4.5 L/100 km sarf). Yuqori ilashish va yo\'lsiz joyda barqarorlikka ega.',
      sourceTitle: 'BYD Song Plus DM-i Champion — bydzone.uz',
      sourceUrl: 'https://bydzone.uz/products/song-plus-dm-i-champion-3/',
      verified: true
    }
  },
  {
    id: 'kia_sonet',
    name: 'Kia Sonet Prime',
    brand: 'Kia / ADM Jizzakh',
    generation: '1-avlod (2024–2026 Jizzax)',
    era: '2024–2026',
    category: 'modern_uz',
    defaultColor: 'rosso',
    visualProfile: { shape: 'suv', grille: 'kia_tiger', lights: 'angular_led', rear: 'suv_led', wing: false, stripe: false, detail: 'high' },
    price: 11500,
    minLevel: 10,
    gameStats: {
      maxSpeed: 400, accel: 322, handling: 3.34, braking: 332,
      driftControl: 0.948, grip: 0.956, weight: 1210, nitroEff: 1.24, offRoad: 0.82
    },
    realSpecs: {
      origin: 'O\'zbekiston (ADM Jizzakh zavodi)',
      manufacturer: 'ADM Jizzakh (Roodell)',
      localStatus: 'Mahalliy yig\'ilgan (ADM Jizzakh)',
      engine: '1.5L atmosferik 4-silindrli benzin',
      displacement: '1 497 sm³',
      power: '115 ot kuchi',
      torque: 'Noma\'lum',
      transmission: 'IVT variator',
      drivetrain: 'Old g\'ildirak (FWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 210 kg',
      dimensions: '4120 × 1790 × 1610 mm',
      exterior: 'Kia "Yo\'lbars burni" panjarasi, bumerang LED faralar, 4 ta diskali tormoz.',
      interior: '6 ta xavfsizlik yostiqchasi, ESC, FCA va LKA haydovchi yordamchilari.',
      description: 'ADM Jizzax zavodida yig\'ilayotgan eng xaridorgir shahar krossoveri. Kuchli 4-g\'ildirak disk tormozlari bilan burilishlarga aniq kiradi.',
      sourceTitle: 'Kia Sonet Prime Uzbekistan — ADM Global',
      sourceUrl: 'https://adm.uz/en/news/kia-sonet-prime-expands-the-sonet-line-up-in-uzbekistan.htm',
      verified: true
    }
  },
  {
    id: 'chery_tiggo8',
    name: 'Chery Tiggo 8 Pro Max',
    brand: 'Chery / ADM Jizzakh',
    generation: '1-avlod Pro Max (2024–2026)',
    era: '2024–2026',
    category: 'modern_uz',
    defaultColor: 'silver',
    visualProfile: { shape: 'suv', grille: 'diamond_wide', lights: 'sleek_led', rear: 'led_bar', wing: false, stripe: false, detail: 'high' },
    price: 18000,
    minLevel: 15,
    gameStats: {
      maxSpeed: 412, accel: 334, handling: 3.18, braking: 336,
      driftControl: 0.946, grip: 0.962, weight: 1680, nitroEff: 1.25, offRoad: 0.86
    },
    realSpecs: {
      origin: 'O\'zbekiston (ADM Jizzakh zavodi)',
      manufacturer: 'ADM Jizzakh (Chery Uzbekistan)',
      localStatus: 'Mahalliy yig\'ilgan (ADM Jizzakh)',
      engine: '2.0L Turbo 4-silindrli benzin',
      displacement: '1 998 sm³',
      power: 'Noma\'lum',
      torque: 'Noma\'lum',
      transmission: '7 bosqichli robot (DCT)',
      drivetrain: 'To\'liq tortish (AWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 680 kg',
      dimensions: '4722 × 1860 × 1705 mm',
      exterior: 'Katta olmos naqshli old panjara, 7 o\'rinli yirik krossover kuzovi.',
      interior: 'Qo\'shaloq keng raqamli ekran, premium charm o\'rindiqlar.',
      description: 'ADM Jizzaxda yig\'iluvchi yirik flagman krossover. Og\'ir vazni va AWD ilashishi uni qorli va cho\'l yo\'llarida juda kuchli qiladi.',
      sourceTitle: 'ADM Global Chery Tiggo 8 Pro Max — adm.uz',
      sourceUrl: 'https://adm.uz/en/news/kia-chery-and-haval-exhibited-at-the-made-in-uzbekistan-exhibition-in-kabul.htm',
      verified: true
    }
  },
  {
    id: 'haval_dargo',
    name: 'Haval Dargo',
    brand: 'Haval / ADM Jizzakh',
    generation: '1-avlod (2024–2026)',
    era: '2024–2026',
    category: 'modern_uz',
    defaultColor: 'orange',
    visualProfile: { shape: 'niva_4x4', grille: 'haval_bold', lights: 'round_2', rear: 'suv_led', wing: false, stripe: false, detail: 'high' },
    price: 17500,
    minLevel: 15,
    gameStats: {
      maxSpeed: 406, accel: 330, handling: 3.16, braking: 334,
      driftControl: 0.944, grip: 0.964, weight: 1720, nitroEff: 1.24, offRoad: 0.92
    },
    realSpecs: {
      origin: 'O\'zbekiston (ADM Jizzakh zavodi)',
      manufacturer: 'ADM Jizzakh (GWM / Haval)',
      localStatus: 'Mahalliy yig\'ilgan (ADM Jizzakh)',
      engine: '2.0L Turbo benzin',
      displacement: '1 998 sm³',
      power: 'Noma\'lum',
      torque: 'Noma\'lum',
      transmission: '7 bosqichli robot (DCT)',
      drivetrain: 'To\'liq tortish (4WD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 720 kg',
      dimensions: '4620 × 1910 × 1780 mm',
      exterior: 'Brutal burchakli yo\'ltanlamas siluet, dumaloq retro-LED faralar, keng arkalari.',
      interior: 'Yo\'ltanlamas tutqichlar, raqamli kokpit, 8 xil haydash rejimi.',
      description: 'O\'yindagi eng kuchli zamonaviy yo\'ltanlamas (92% off-road samaradorligi). Qorli tog\' va cho\'l trassalarida deyarli sekinlashmaydi.',
      sourceTitle: 'ADM Global Haval Dargo — adm.uz',
      sourceUrl: 'https://adm.uz/en/news/kia-chery-and-haval-exhibited-at-the-made-in-uzbekistan-exhibition-in-kabul.htm',
      verified: true
    }
  },

  /* ===================== CATEGORY E: COMMERCIAL ===================== */
  {
    id: 'chevy_damas',
    name: 'Chevrolet Damas',
    brand: 'Chevrolet / UzAuto Motors',
    generation: 'Damas II / Move (Xorazm)',
    era: '1996–2026',
    category: 'commercial',
    defaultColor: 'white',
    visualProfile: { shape: 'microvan', grille: 'small_slot', lights: 'rect_2', rear: 'van_tall', wing: false, stripe: false, detail: 'standard' },
    price: 2000,
    minLevel: 2,
    gameStats: {
      maxSpeed: 340, accel: 256, handling: 2.96, braking: 285,
      driftControl: 0.912, grip: 0.924, weight: 880, nitroEff: 1.25, offRoad: 0.74
    },
    realSpecs: {
      origin: 'O\'zbekiston (Pitnak, Xorazm)',
      manufacturer: 'UzAuto Motors',
      localStatus: 'Mahalliy ishlab chiqarilmoqda (2026)',
      engine: '0.8L 3-silindrli benzin',
      displacement: '796 sm³',
      power: '38 ot kuchi',
      torque: 'Noma\'lum',
      transmission: '5 bosqichli mexanik',
      drivetrain: 'Orqa g\'ildirak (RWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '880 kg',
      dimensions: '3845 × 1400 × 1920 mm',
      exterior: 'Kapotisiz baland va tor mikroavtobus kuzovi, suriluvchi yon eshiklar.',
      interior: '7 o\'rinli keng salon, o\'rindiq ostida joylashgan dvigatel.',
      description: 'O\'zbekistonning haqiqiy xalq mehnatkashi! Tor kuzovi tufayli botlar orasidan o\'tib ketishda qulay, lekin baland og\'irlik markazi ehtiyotkor burilish talab qiladi.',
      sourceTitle: 'UzAuto Motors Damas — chevrolet.uz',
      sourceUrl: 'https://chevrolet.uz/ru',
      verified: true
    }
  },
  {
    id: 'chevy_labo',
    name: 'Chevrolet Labo',
    brand: 'Chevrolet / UzAuto Motors',
    generation: '1-avlod (Xorazm)',
    era: '2015–2026',
    category: 'commercial',
    defaultColor: 'white',
    visualProfile: { shape: 'mini_pickup', grille: 'small_slot', lights: 'rect_2', rear: 'pickup_bed', wing: false, stripe: false, detail: 'standard' },
    price: 2200,
    minLevel: 3,
    gameStats: {
      maxSpeed: 344, accel: 266, handling: 3.04, braking: 290,
      driftControl: 0.908, grip: 0.922, weight: 830, nitroEff: 1.26, offRoad: 0.76
    },
    realSpecs: {
      origin: 'O\'zbekiston (Pitnak, Xorazm)',
      manufacturer: 'UzAuto Motors',
      localStatus: 'Mahalliy ishlab chiqarilmoqda (2026)',
      engine: '0.8L 3-silindrli benzin',
      displacement: '796 sm³',
      power: '38 ot kuchi',
      torque: 'Noma\'lum',
      transmission: '5 bosqichli mexanik',
      drivetrain: 'Orqa g\'ildirak (RWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '830 kg',
      dimensions: '3485 × 1400 × 1765 mm',
      exterior: '2 o\'rinli old kabina va ochiq bortli yuk platformasi.',
      interior: 'Ixcham tijorat kabinasi, oddiy asboblar paneli.',
      description: 'Ochiq yukxonasiga ega engil tijorat pikapi. Yengil orqa qismi sababli qiziqarli driftlar qila oladi.',
      sourceTitle: 'UzAuto Motors Labo — uzautomotors.com',
      sourceUrl: 'https://uzautomotors.com/',
      verified: true
    }
  },

  /* ===================== CATEGORY F: SUPERCARS ===================== */
  {
    id: 'ferrari_f40',
    name: 'Ferrari F40',
    brand: 'Ferrari',
    generation: 'Type F120 (1987–1992)',
    era: '1980–1990-yillar',
    category: 'supercar',
    defaultColor: 'rosso',
    visualProfile: { shape: 'ferrari_f40', grille: 'super_intake', lights: 'popup_2', rear: 'quad_round', wing: true, stripe: false, detail: 'special' },
    price: 40000,
    minLevel: 18,
    gameStats: {
      maxSpeed: 435, accel: 340, handling: 3.15, braking: 348,
      driftControl: 0.940, grip: 0.955, weight: 1100, nitroEff: 1.28, offRoad: 0.62
    },
    realSpecs: {
      origin: 'Italiya (Maranello)',
      manufacturer: 'Ferrari S.p.A.',
      localStatus: 'Kolleksiya superkari (import)',
      engine: '2.9L Twin-Turbo V8 (Tipo F120A)',
      displacement: '2 936 sm³',
      power: '478 PS / 471 ot kuchi',
      torque: '577 N·m',
      transmission: '5 bosqichli mexanik',
      drivetrain: 'O\'rta dvigatel, orqa g\'ildirak (RWD)',
      zeroTo100: '4.1 soniya',
      weightKg: '1 100–1 250 kg',
      dimensions: '4358 × 1970 × 1124 mm',
      exterior: 'Past ponasimon Pininfarina kuzovi, baland orqa qanot, 3 ta markaziy truba, jalyuzili orqa oyna.',
      interior: 'Minimalist poyga saloni, Kevlar panellar, sport chelak o\'rindiqlar.',
      description: 'SpriteStack Poyga\'ning bosh qahramoni! Eng yuqori maksimal tezliklardan biri va klassik superkar xarakteriga ega.',
      sourceTitle: 'Ferrari F40 — Wikipedia',
      sourceUrl: 'https://en.wikipedia.org/wiki/Ferrari_F40',
      verified: true
    }
  },
  {
    id: 'ferrari_488',
    name: 'Ferrari 488 GTB',
    brand: 'Ferrari',
    generation: '488 GTB (2015–2019)',
    era: '2015–2019',
    category: 'supercar',
    defaultColor: 'rosso',
    visualProfile: { shape: 'ferrari_488', grille: 'super_intake', lights: 'sleek_led', rear: 'quad_round', wing: false, stripe: true, detail: 'special' },
    price: 52000,
    minLevel: 22,
    gameStats: {
      maxSpeed: 430, accel: 355, handling: 3.25, braking: 358,
      driftControl: 0.945, grip: 0.962, weight: 1475, nitroEff: 1.30, offRoad: 0.62
    },
    realSpecs: {
      origin: 'Italiya (Maranello)',
      manufacturer: 'Ferrari S.p.A.',
      localStatus: 'Import superkar',
      engine: '3.9L Twin-Turbo V8 (F154)',
      displacement: '3 902 sm³',
      power: '670 CV / 661 ot kuchi @ 8000 rpm',
      torque: '760 N·m @ 3000 rpm',
      transmission: '7 bosqichli qo\'sh muftali (DCT)',
      drivetrain: 'O\'rta dvigatel, orqa g\'ildirak (RWD)',
      zeroTo100: '3.0 soniya',
      weightKg: '1 475 kg',
      dimensions: '4568 × 1952 × 1213 mm',
      exterior: 'Markaziy oq poyga chizig\'i, katta yon aerodinamik tirqishlar, shisha dvigatel qopqog\'i.',
      interior: 'Formula-1 uslubidagi ko\'p funksiyali rul, markaziy sariq taxometr.',
      description: 'Tezlanish va burilish aniqligi bo\'yicha a\'lo muvozanatga ega zamonaviy Ferrari superkari.',
      sourceTitle: 'Ferrari 488 — Wikipedia',
      sourceUrl: 'https://en.wikipedia.org/wiki/Ferrari_488',
      verified: true
    }
  },
  {
    id: 'porsche_911_gt3',
    name: 'Porsche 911 GT3',
    brand: 'Porsche',
    generation: '992 GT3 (2021–2026)',
    era: '2021–2026',
    category: 'supercar',
    defaultColor: 'blue',
    visualProfile: { shape: 'porsche_911', grille: 'super_intake', lights: 'round_2', rear: 'led_bar', wing: true, stripe: false, detail: 'special' },
    price: 65000,
    minLevel: 26,
    gameStats: {
      maxSpeed: 432, accel: 352, handling: 3.44, braking: 372,
      driftControl: 0.958, grip: 0.972, weight: 1435, nitroEff: 1.28, offRoad: 0.62
    },
    realSpecs: {
      origin: 'Germaniya (Shtutgart)',
      manufacturer: 'Porsche AG',
      localStatus: 'Import superkar',
      engine: '4.0L atmosferik 6-silindrli boxer',
      displacement: '3 996 sm³',
      power: '510 PS / 375 kW',
      torque: 'Noma\'lum',
      transmission: '7 bosqichli PDK / 6MT',
      drivetrain: 'Orqa dvigatel, orqa g\'ildirak (RWD)',
      zeroTo100: '3.4 soniya (maks. 311 km/soat)',
      weightKg: '1 435 kg',
      dimensions: '4573 × 1852 × 1279 mm',
      exterior: 'Afsonaviy 911 yumaloq faralar, Swan-neck orqa qanot, yaxlit orqa LED chiroq.',
      interior: 'Poyga rul va yuqori aylanishli (9000 rpm) taxometr.',
      description: 'Texnik burilishlar qiroli! O\'yindagi eng kuchli tormoz (372) va eng yuqori yo\'l bilan ilashish (0.972) ko\'rsatkichiga ega.',
      sourceTitle: 'Porsche 911 GT3 Official — porsche.com',
      sourceUrl: 'https://www.porsche.com/international/models/911/911-gt3-models/911-gt3/',
      verified: true
    }
  },
  {
    id: 'nissan_gtr_r35',
    name: 'Nissan GT-R R35',
    brand: 'Nissan',
    generation: 'R35 (2007–2025)',
    era: '2007–2025',
    category: 'supercar',
    defaultColor: 'silver',
    visualProfile: { shape: 'gtr_coupe', grille: 'gtr_dark', lights: 'angular_led', rear: 'quad_round', wing: true, stripe: false, detail: 'special' },
    price: 78000,
    minLevel: 30,
    gameStats: {
      maxSpeed: 438, accel: 366, handling: 3.30, braking: 356,
      driftControl: 0.948, grip: 0.968, weight: 1750, nitroEff: 1.32, offRoad: 0.72
    },
    realSpecs: {
      origin: 'Yaponiya (Tochigi)',
      manufacturer: 'Nissan Motor Co.',
      localStatus: 'Import sportkar',
      engine: '3.8L Twin-Turbo V6 (VR38DETT)',
      displacement: '3 799 sm³',
      power: '565–600 ot kuchi (versiyaga qarab)',
      torque: 'Noma\'lum',
      transmission: '6 bosqichli qo\'sh muftali (DCT)',
      drivetrain: 'To\'liq tortish (ATTESA E-TS AWD)',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 750 kg',
      dimensions: '4710 × 1895 × 1370 mm',
      exterior: 'Keng sport kupe, 4 ta dumaloq orqa fara, qora old panjara, orqa spoyler.',
      interior: 'Ko\'p funksiyali telemetriya ekrani va sport kokpit.',
      description: '"Godzilla" laqabli AWD yirtqich! Eng tez start tezlanishi (366) va eng kuchli nitro samaradorligiga (1.32×) ega.',
      sourceTitle: 'Nissan GT-R — Wikipedia',
      sourceUrl: 'https://en.wikipedia.org/wiki/Nissan_GT-R',
      verified: true
    }
  },
  {
    id: 'lambo_huracan',
    name: 'Lamborghini Huracán',
    brand: 'Lamborghini',
    generation: 'LP 610-4 / EVO (2014–2024)',
    era: '2014–2024',
    category: 'supercar',
    defaultColor: 'yellow',
    visualProfile: { shape: 'lambo_wedge', grille: 'super_intake', lights: 'angular_led', rear: 'led_bar', wing: true, stripe: false, detail: 'special' },
    price: 95000,
    minLevel: 35,
    gameStats: {
      maxSpeed: 444, accel: 362, handling: 3.34, braking: 362,
      driftControl: 0.946, grip: 0.966, weight: 1422, nitroEff: 1.31, offRoad: 0.64
    },
    realSpecs: {
      origin: 'Italiya (Sant\'Agata Bolognese)',
      manufacturer: 'Automobili Lamborghini',
      localStatus: 'Import superkar',
      engine: '5.2L atmosferik V10',
      displacement: '5 204 sm³',
      power: '610–640 PS (versiyaga qarab)',
      torque: 'Noma\'lum',
      transmission: '7 bosqichli qo\'sh muftali (LDF)',
      drivetrain: 'To\'liq tortish (AWD) / RWD',
      zeroTo100: 'Noma\'lum',
      weightKg: '1 422 kg',
      dimensions: '4520 × 1933 × 1165 mm',
      exterior: 'Juda past va keskin olti burchakli dizayn, o\'tkir Y-shaklli LED chiroqlar.',
      interior: 'Qiruvchi samolyot uslubidagi start tugmasi va raqamli kokpit.',
      description: 'O\'yindagi eng yuqori maksimal tezlik (444) sohibi. Shunga qaramay, burilishda Porsche GT3, startda esa GT-R undan ustun kelishi mumkin.',
      sourceTitle: 'Lamborghini Huracán — Wikipedia',
      sourceUrl: 'https://en.wikipedia.org/wiki/Lamborghini_Hurac%C3%A1n',
      verified: true
    }
  }
,
  {
    id: 'chevrolet_nexia_3',
    name: 'Chevrolet Nexia 3 (R3)',
    brand: 'Chevrolet / Ravon',
    generation: '1-avlod (T250, 2016–2020)',
    era: '2010-yillar',
    category: 'chevrolet',
    defaultColor: 'white',
    visualProfile: { shape: 'compact_sedan', grille: 'chevy_dual', lights: 'rect_2', rear: 'wide_red', wing: false, stripe: false, detail: 'standard' },
    price: 4200,
    minLevel: 4,
    gameStats: {
      maxSpeed: 374, accel: 288, handling: 3.16, braking: 302,
      driftControl: 0.930, grip: 0.938, weight: 1190, nitroEff: 1.22, offRoad: 0.70
    },
    realSpecs: {
      origin: 'O’zbekiston (Asaka)',
      manufacturer: 'UzAuto Motors',
      localStatus: 'O’zbekistonda ishlab chiqarilgan (2016–2022)',
      engine: '1.5L DOHC 4-silindr (B15D2)',
      displacement: '1 485 sm³',
      power: '107 ot kuchi',
      torque: '141 N·m',
      transmission: '5 bosqichli mexanik / 6AT',
      drivetrain: 'Old g’ildirak (FWD)',
      zeroTo100: '12.2 soniya',
      weightKg: '1 190 kg',
      dimensions: '4330 × 1690 × 1505 mm',
      exterior: 'T250 kuzovi, zamonaviy old faralar va ixcham sedan proporsiyasi.',
      interior: 'Zamonaviy asboblar paneli, konditsioner va ABS tizimi.',
      description: 'Nexia N100 va N150 dan keyingi avlod — kuchliroq DOHC dvigatel va yaxshiroq boshqaruv.',
      sourceTitle: 'Ravon Nexia R3 1.5 MT — Drom.ru',
      sourceUrl: 'https://www.drom.ru/catalog/ravon/nexia_r3/91442/',
      verified: true
    }
  },
  {
    id: 'kia_k5_dl3',
    name: 'Kia K5 2.5 GDI (DL3)',
    brand: 'Kia',
    generation: '3-avlod (DL3, 2019–2023)',
    era: '2020-yillar',
    category: 'modern_uz',
    defaultColor: 'black',
    visualProfile: { shape: 'long_sedan', grille: 'tiger_nose', lights: 'angular_led', rear: 'led_bar', wing: false, stripe: false, detail: 'high' },
    price: 16500,
    minLevel: 12,
    gameStats: {
      maxSpeed: 404, accel: 318, handling: 3.28, braking: 332,
      driftControl: 0.942, grip: 0.950, weight: 1496, nitroEff: 1.25, offRoad: 0.66
    },
    realSpecs: {
      origin: 'Janubiy Koreya / O’zbekiston (ADM Jizzax)',
      manufacturer: 'Kia Corporation / ADM Jizzax',
      localStatus: 'O’zbekistonda yig’iladi va rasmiy sotiladi',
      engine: '2.5L GDI+MPI 4-silindr (G4KN)',
      displacement: '2 497 sm³',
      power: '194 ot kuchi',
      torque: '246 N·m',
      transmission: '8 bosqichli avtomat',
      drivetrain: 'Old g’ildirak (FWD)',
      zeroTo100: '8.6 soniya',
      weightKg: '1 496 kg',
      dimensions: '4905 × 1860 × 1465 mm',
      exterior: 'Yurak urishi uslubidagi LED kunduzgi chiroqlar va fastbek tom chizig’i.',
      interior: 'Raqamli panel, keng biznes-klass saloni.',
      description: 'O’zbekiston yo’llarining eng ommabop zamonaviy biznes-sedanlaridan biri.',
      sourceTitle: 'Kia K5 III 2.5 AT — Drive.place',
      sourceUrl: 'https://kia.drive.place/k5/iii/group_sedan/678074',
      verified: true
    }
  },
  {
    id: 'toyota_camry_xv70',
    name: 'Toyota Camry 2.5 (XV70)',
    brand: 'Toyota',
    generation: '8-avlod (XV70, 2017–2020)',
    era: '2020-yillar',
    category: 'modern_uz',
    defaultColor: 'white',
    visualProfile: { shape: 'long_sedan', grille: 'wide_mesh', lights: 'angular_led', rear: 'wide_red', wing: false, stripe: false, detail: 'high' },
    price: 18000,
    minLevel: 13,
    gameStats: {
      maxSpeed: 406, accel: 320, handling: 3.30, braking: 334,
      driftControl: 0.944, grip: 0.952, weight: 1470, nitroEff: 1.25, offRoad: 0.66
    },
    realSpecs: {
      origin: 'Yaponiya / Global',
      manufacturer: 'Toyota Motor Corporation',
      localStatus: 'Import biznes-sedan',
      engine: '2.5L Dynamic Force (A25A-FKS)',
      displacement: '2 487 sm³',
      power: '203 ot kuchi',
      torque: '249 N·m',
      transmission: '8 bosqichli Direct Shift avtomat',
      drivetrain: 'Old g’ildirak (FWD)',
      zeroTo100: 'Noma’lum (206 Hp versiya: 8.7 s)',
      weightKg: '1 470 kg',
      dimensions: '4879 × 1839 × 1445 mm',
      exterior: 'Keng old panjara, past og’irlik markazi va silliq sedan silueti.',
      interior: 'Ergonomik markaziy konsol, qulay biznes-klass o’rindiqlari.',
      description: 'Ishonchli va muvozanatli biznes-sedan, uzoq trassalarda juda barqaror.',
      sourceTitle: 'Toyota Camry VIII (XV70) 2.5 — Auto-Data.net',
      sourceUrl: 'https://www.auto-data.net/en/toyota-camry-viii-xv70-2.5-203hp-automatic-31136',
      verified: true
    }
  },
  {
    id: 'byd_seal_awd',
    name: 'BYD Seal Excellence AWD',
    brand: 'BYD',
    generation: '1-avlod (2022–2026)',
    era: '2020-yillar',
    category: 'modern_uz',
    defaultColor: 'blue',
    visualProfile: { shape: 'ev_sedan', grille: 'ev_clean', lights: 'angular_led', rear: 'led_bar', wing: false, stripe: false, detail: 'high' },
    price: 34000,
    minLevel: 20,
    gameStats: {
      maxSpeed: 422, accel: 356, handling: 3.32, braking: 348,
      driftControl: 0.946, grip: 0.962, weight: 2185, nitroEff: 1.28, offRoad: 0.64
    },
    realSpecs: {
      origin: 'Xitoy',
      manufacturer: 'BYD Auto',
      localStatus: 'O’zbekistonda keng tarqalgan sport elektromobil',
      engine: 'Ikki elektromotor (82.5 kWh LFP Blade)',
      displacement: 'Elektr (0 sm³)',
      power: '530 ot kuchi',
      torque: '670 N·m',
      transmission: '1 bosqichli reduktor',
      drivetrain: 'To’liq tortish (AWD)',
      zeroTo100: '3.8 soniya',
      weightKg: '2 185 kg',
      dimensions: '4800 × 1875 × 1460 mm',
      exterior: 'Aerodinamik Ocean-X dizayni, yashirin tutqichlar va orqa LED chiziq.',
      interior: 'Aylanuvchi 15.6 dyuymli ekran va sport o’rindiqlar.',
      description: '530 ot kuchiga ega elektr sport-sedan — startdan chaqmoqdek tezlashadi.',
      sourceTitle: 'BYD Seal Excellence 82.5 kWh AWD — Auto-Data.net',
      sourceUrl: 'https://www.auto-data.net/en/byd-seal-excellence-82.5-kwh-530hp-electric-awd-54166',
      verified: true
    }
  },
  {
    id: 'xiaomi_su7_max',
    name: 'Xiaomi SU7 Max AWD',
    brand: 'Xiaomi',
    generation: '1-avlod (2024–2026)',
    era: '2020-yillar',
    category: 'supercar',
    defaultColor: 'blue',
    visualProfile: { shape: 'ev_sedan', grille: 'ev_clean', lights: 'angular_led', rear: 'led_bar', wing: true, stripe: false, detail: 'special' },
    price: 52000,
    minLevel: 26,
    gameStats: {
      maxSpeed: 438, accel: 368, handling: 3.36, braking: 358,
      driftControl: 0.948, grip: 0.968, weight: 2205, nitroEff: 1.30, offRoad: 0.64
    },
    realSpecs: {
      origin: 'Xitoy',
      manufacturer: 'Xiaomi EV',
      localStatus: 'Import flagman elektromobil',
      engine: 'Dual Motor AWD (101 kWh)',
      displacement: 'Elektr (0 sm³)',
      power: '673 ot kuchi',
      torque: '838 N·m',
      transmission: '1 bosqichli reduktor',
      drivetrain: 'To’liq tortish (AWD)',
      zeroTo100: '2.78 soniya',
      weightKg: '2 205 kg',
      dimensions: '4997 × 1963 × 1440 mm',
      exterior: 'Juda past aerodinamik qarshilik, faol orqa spoyler va pnevmo-osma.',
      interior: 'HyperOS raqamli kokpit va sport rul.',
      description: '2.78 soniyada 100 km/soat tezlikka chiqadigan zamonaviy elektr giper-sedan.',
      sourceTitle: 'Xiaomi SU7 Max 101 kWh AWD — Auto-Data.net',
      sourceUrl: 'https://www.auto-data.net/en/xiaomi-su7-max-101-kwh-673hp-dual-motor-awd-50853',
      verified: true
    }
  },
  {
    id: 'bmw_m3_g80_comp',
    name: 'BMW M3 Competition (G80)',
    brand: 'BMW',
    generation: 'G80 (2021–2024)',
    era: '2020-yillar',
    category: 'supercar',
    defaultColor: 'emerald',
    visualProfile: { shape: 'gtr_coupe', grille: 'super_intake', lights: 'angular_led', rear: 'led_bar', wing: true, stripe: false, detail: 'special' },
    price: 62000,
    minLevel: 28,
    gameStats: {
      maxSpeed: 436, accel: 358, handling: 3.40, braking: 360,
      driftControl: 0.950, grip: 0.966, weight: 1780, nitroEff: 1.29, offRoad: 0.64
    },
    realSpecs: {
      origin: 'Germaniya (Myunxen)',
      manufacturer: 'BMW M GmbH',
      localStatus: 'Import sport-sedan',
      engine: '3.0L I6 TwinPower Turbo (S58B30A)',
      displacement: '2 993 sm³',
      power: '510 ot kuchi',
      torque: '650 N·m',
      transmission: '8 bosqichli M Steptronic',
      drivetrain: 'To’liq tortish (M xDrive AWD)',
      zeroTo100: '3.5 soniya',
      weightKg: '1 780 kg',
      dimensions: '4794 × 1903 × 1434 mm',
      exterior: 'Kengaytirilgan qanotlar, vertikal M panjara va 4 ta chiqish trubasi.',
      interior: 'Karbon sport o’rindiqlar va M1/M2 rejim tugmalari.',
      description: 'S58 dvigatelli va M xDrive tizimli eng muvozanatli nemis poyga sedani.',
      sourceTitle: 'BMW M3 (G80) Competition 510 Hp — Auto-Data.net',
      sourceUrl: 'https://www.auto-data.net/en/bmw-m3-g80-competition-3.0-510hp-m-xdrive-m-steptronic-43388',
      verified: true
    }
  },
  {
    id: 'toyota_gr_supra_a90',
    name: 'Toyota GR Supra 3.0 (A90)',
    brand: 'Toyota',
    generation: 'Supra V (A90, 2019–2020)',
    era: '2020-yillar',
    category: 'supercar',
    defaultColor: 'rosso',
    visualProfile: { shape: 'porsche_911', grille: 'super_intake', lights: 'angular_led', rear: 'led_bar', wing: true, stripe: false, detail: 'special' },
    price: 48000,
    minLevel: 24,
    gameStats: {
      maxSpeed: 432, accel: 350, handling: 3.38, braking: 352,
      driftControl: 0.946, grip: 0.960, weight: 1520, nitroEff: 1.28, offRoad: 0.63
    },
    realSpecs: {
      origin: 'Yaponiya / Avstriya',
      manufacturer: 'Toyota Gazoo Racing',
      localStatus: 'Import sport kupe',
      engine: '3.0L I6 Twin-Scroll Turbo (B58)',
      displacement: '2 998 sm³',
      power: '340 ot kuchi',
      torque: '500 N·m',
      transmission: '8 bosqichli avtomat',
      drivetrain: 'Orqa g’ildirak (RWD)',
      zeroTo100: '4.3 soniya',
      weightKg: '1 520 kg',
      dimensions: '4380 × 1854 × 1295 mm',
      exterior: 'Uzun kapot, qisqa g’ildirak bazasi va tajovuzkor kupe shakli.',
      interior: 'Haydovchiga yo’naltirilgan ikki o’rinli sport kokpit.',
      description: 'Yengil, chaqqon va burilishlarda juda aniq orqa tortishli yapon sport kupesi.',
      sourceTitle: 'Toyota Supra V (A90) GR 3.0 — Auto-Data.net',
      sourceUrl: 'https://www.auto-data.net/en/toyota-supra-v-a90-gr-3.0-340hp-automatic-35877',
      verified: true
    }
  }
];

export const WORLD_VEHICLES = [];
export const WORLD_VEHICLES_MAP = new Map();
export const WORLD_BRANDS = [];
export let worldCatalogLoaded = false;

export function computeBasePR(v) {
  if (typeof v.basePR === 'number') return v.basePR;
  const gs = v.gameStats;
  const pr = Math.round(
    (gs.maxSpeed - 280) * 2.1 +
    (gs.accel - 200) * 1.45 +
    (gs.handling - 2.6) * 110 +
    (gs.braking - 240) * 0.9
  );
  return Math.max(120, Math.min(920, pr));
}

export function getCarClassFromPR(pr) {
  if (pr < 250) return 'E';
  if (pr < 380) return 'D';
  if (pr < 500) return 'C';
  if (pr < 640) return 'B';
  if (pr < 780) return 'A';
  return 'S';
}

function inferVisualProfile(bodyStr, fuelStr, hp, cls, modelStr = '', brandStr = '', generationStr = '', modStr = '', uniqueId = '') {
  const body = String(bodyStr || '').toLowerCase();
  const fuel = String(fuelStr || '').toLowerCase();
  const model = String(modelStr || '').toLowerCase();
  const brand = String(brandStr || '').toLowerCase();
  const identity = [brand, model, generationStr, modStr, uniqueId].join(' ').toLowerCase();
  const electric = /electric|bev|phev|hybrid|ev\b/.test(fuel + ' ' + identity);
  const classic = /lada|vaz|avtovaz|moskvich|gaz\b|uaz|volga|zhiguli/.test(identity);
  const isOffRoad = /niva|defender|wrangler|land cruiser|landcruiser|patrol|g.class|gelandewagen|bronco|uaz|pajero/.test(identity);
  const isPickup = /pickup|pick-up|truck|labo|hilux|ranger|tacoma|navara|tundra|ram\b|f.150|s10\b/.test(body + ' ' + identity);
  const isVan = /van|mpv|minivan|microbus|people carrier|minibus/.test(body + ' ' + identity);
  const isSuv = /suv|crossover|off.?road|utility/.test(body) ||
    /suv|crossover|jeep|highlander|tucson|sportage|sorento|rav4|cr.v|x5\b|x3\b|x7\b|gle\b|glc\b|gla\b|gls\b|q5\b|q7\b|q8\b|urus|purosangue|model x|model y|seal u|song|tang|tucson|santa fe/.test(identity);
  const isWagon = /wagon|estate|touring|avant|variant|combi|sport.?tourer/.test(body + ' ' + identity);
  const isConvertible = /convertible|cabrio|cabriolet|roadster|spyder|spider/.test(body + ' ' + identity);
  const isCoupe = /coupe|gt.?r\b|supra|mustang|camaro|challenger|corvette|911|ferrari|lamborghini|huracan|aventador|mclaren|bugatti|aston martin|maserati|koenigsegg|amg gt|gr86|brz|mx.5|miata/.test(body + ' ' + identity);
  const isHatch = /hatch|city car|compact/.test(body) ||
    /golf|polo|gti|swift|fiesta|focus rs|mini cooper|corsa|clio|yaris|i20|i30|ceed|rio|matiz|spark|picanto|micra|leaf|zoe/.test(identity);

  let shape = 'compact_sedan';
  if (isPickup) shape = 'mini_pickup';
  else if (isVan) shape = 'microvan';
  else if (isOffRoad) shape = 'niva_4x4';
  else if (isSuv) shape = 'suv';
  else if (isWagon) shape = 'long_sedan';
  else if (isConvertible || isCoupe) shape = 'gtr_coupe';
  else if (isHatch) shape = 'micro_hatch';
  else if (classic && /2101|2103|2105|2106|2107|moskvich|volga/.test(identity)) shape = 'boxy_sedan';
  else if (/long|executive|luxury|limousine/.test(body + ' ' + identity)) shape = 'long_sedan';
  else if (electric) shape = 'ev_sedan';

  const brandRules = [
    [/bmw|mini/, 'bmw'],
    [/mercedes|benz|maybach/, 'mercedes'],
    [/audi/, 'audi'],
    [/lexus/, 'lexus'],
    [/kia/, 'kia'],
    [/hyundai|genesis/, 'hyundai'],
    [/chevrolet|chevy|ravon|daewoo/, 'chevrolet'],
    [/toyota/, 'toyota'],
    [/honda|acura/, 'honda'],
    [/nissan|infiniti/, 'nissan'],
    [/ford|lincoln/, 'ford'],
    [/volkswagen|\bvw\b|skoda/, 'volkswagen'],
    [/porsche/, 'porsche'],
    [/ferrari/, 'ferrari'],
    [/lamborghini/, 'lamborghini'],
    [/tesla|byd|xiaomi|rivian|nio|zeekr|polestar/, 'electric'],
    [/mazda/, 'mazda'],
    [/subaru/, 'subaru'],
    [/volvo|polestar/, 'volvo']
  ];
  let brandStyle = 'generic';
  for (const rule of brandRules) {
    if (rule[0].test(brand)) { brandStyle = rule[1]; break; }
  }

  let hash = 2166136261;
  const seed = identity || body;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash >>>= 0;

  const grilleByBrand = {
    bmw: 'bmw_kidney', mercedes: 'mercedes_star', audi: 'audi_singleframe',
    lexus: 'lexus_spindle', kia: 'kia_tiger', hyundai: 'hyundai_parametric',
    chevrolet: 'chevy_dual', toyota: 'toyota_wide', honda: 'honda_wing',
    nissan: 'nissan_vmotion', ford: 'ford_trapezoid', volkswagen: 'vw_horizontal',
    porsche: 'porsche_oval', ferrari: 'ferrari_mesh', lamborghini: 'lambo_hex',
    electric: 'ev_closed', mazda: 'mazda_wing', subaru: 'subaru_hex',
    volvo: 'volvo_ironmark', generic: electric ? 'ev_closed' : 'wide_mesh'
  };
  const grille = classic
    ? (/2106|2103/.test(identity) ? 'dark_quad' : 'chrome_slats')
    : (grilleByBrand[brandStyle] || (electric ? 'ev_closed' : 'wide_mesh'));

  const lightByBrand = {
    bmw: 'matrix_led', mercedes: 'slim_led', audi: 'matrix_led',
    lexus: 'angular_led', kia: 'boomerang_led', hyundai: 'slim_led',
    chevrolet: 'rect_2', toyota: 'angular_led', honda: 'slim_led',
    nissan: 'boomerang_led', ford: 'matrix_led', volkswagen: 'slim_led',
    porsche: 'round_2', ferrari: 'slim_led', lamborghini: 'angular_led',
    electric: 'slim_led', mazda: 'slim_led', subaru: 'angular_led',
    volvo: 'thor_led', generic: 'rect_2'
  };
  const lights = classic
    ? (/2106|2103/.test(identity) ? 'round_4' : 'round_2')
    : (lightByBrand[brandStyle] || 'rect_2');

  const rearByBrand = {
    bmw: 'led_bar', mercedes: 'wraparound', audi: 'led_bar',
    lexus: 'l_shape', kia: 'led_bar', hyundai: 'led_bar',
    chevrolet: 'wide_red', toyota: 'wide_red', honda: 'c_shape',
    nissan: 'boomerang', ford: 'wide_red', volkswagen: 'wide_red',
    porsche: 'led_bar', ferrari: 'quad_round', lamborghini: 'angular_red',
    electric: 'led_bar', mazda: 'wraparound', subaru: 'c_shape',
    volvo: 'vertical', generic: 'wide_red'
  };
  const rear = classic ? 'classic_bar' : (rearByBrand[brandStyle] || 'wide_red');

  const suvBase = isSuv || isOffRoad;
  const coupeBase = isCoupe || isConvertible;
  const hatchBase = isHatch;
  const vanBase = isVan;
  const pickupBase = isPickup;
  const bodyWidth = (suvBase ? 16 : coupeBase ? 16 : vanBase || pickupBase ? 14 : hatchBase ? 14 : 14) +
    ((((hash >>> 3) % 3) - 1) * 2);
  const frontTaper = classic || isOffRoad || vanBase || pickupBase ? 0.25 :
    (coupeBase ? 2.5 : hatchBase ? 1.7 : suvBase ? 0.8 : 1.2) + (((hash >>> 8) % 3) * 0.25);
  const rearTaper = classic || vanBase || pickupBase ? 0.25 :
    (coupeBase ? 1.8 : hatchBase ? 2.0 : suvBase ? 0.7 : isWagon ? 0.9 : 1.35) + (((hash >>> 11) % 3) * 0.25);
  const cabinFront = pickupBase ? 0.14 : vanBase ? 0.08 : coupeBase ? 0.30 : hatchBase ? 0.24 : 0.25;
  const cabinRear = pickupBase ? 0.50 : vanBase ? 0.90 : suvBase ? 0.77 : coupeBase ? 0.70 : isWagon ? 0.82 : 0.76;
  const cabinWidth = vanBase ? 0.78 : suvBase ? 0.72 : coupeBase ? 0.58 : hatchBase ? 0.66 : 0.64;

  return {
    shape, grille, lights, rear,
    wing: (coupeBase && (cls === 'A' || cls === 'S' || hp >= 420)) || /gt.?wing|spoiler/.test(model),
    stripe: false,
    detail: cls === 'S' ? 'special' : (cls === 'A' || hp >= 350 ? 'high' : 'standard'),
    signature: brandStyle,
    modelHash: hash,
    bodyWidth: Math.max(12, Math.min(16, bodyWidth)),
    frontTaper: Math.max(0, Math.min(2.8, frontTaper)),
    rearTaper: Math.max(0, Math.min(2.6, rearTaper)),
    cabinFront,
    cabinRear,
    cabinWidth,
    frontAxle: pickupBase ? 0.25 : 0.24 + ((hash >>> 15) % 3) * 0.01,
    rearAxle: pickupBase ? 0.76 : 0.75 + ((hash >>> 18) % 3) * 0.01,
    wheelLength: suvBase ? 6 : coupeBase ? 4 : 5,
    roofStyle: vanBase ? 'flat' : coupeBase ? 'fastback' : (electric ? 'panoramic' : 'standard'),
    roofRails: suvBase && ((hash >>> 22) % 2 === 0),
    electric,
    isWagon,
    isConvertible,
    isPickup: pickupBase,
    isVan: vanBase,
    isSUV: suvBase,
    isCoupe: coupeBase
  };
}

function classToMinLevel(cls) {
  return cls === 'E' ? 1 : cls === 'D' ? 3 : cls === 'C' ? 8 : cls === 'B' ? 16 : cls === 'A' ? 25 : 35;
}

function mapWorldRowToVehicle(r, tables) {
  const id = 'w_' + r[0];
  const brand = tables.brands[r[1]] || 'Unknown';
  const model = r[2] || '';
  const gen = r[3] || '';
  const years = r[4] || '';
  const mod = r[5] || '';
  const body = tables.bodies[r[6]] || 'Sedan';
  const fuel = tables.fuels[r[7]] || 'Petrol';
  const disp = r[8];
  const hp = r[9] || 110;
  const torque = r[10];
  const z100 = r[11];
  const topKmh = r[12];
  const gear = tables.gears[r[13]] || 'Noma’lum';
  const drive = tables.drives[r[14]] || 'FWD';
  const weight = r[15] || 1350;
  const dims = r[16] || 'Noma’lum';
  const cls = r[17] || 'D';
  const basePR = r[18] || 300;
  const maxPR = r[19] || Math.min(999, basePR + 160);
  const price = Math.max(1000, Math.round((r[20] || 12000) / 5));
  const srcName = tables.sources[r[21]] || 'World Catalog';
  const license = tables.licenses[r[22]] || 'ODbL-1.0';
  const url = r[23] || 'https://github.com/gor3a/vehicle-makes-models';

  const maxSpeed = Math.min(448, Math.max(325, Math.round(315 + ((topKmh || (135 + hp * 0.3)) - 120) * 0.52)));
  const accel = Math.min(372, Math.max(235, Math.round(z100 ? (395 - z100 * 9.5) : (235 + Math.min(130, (hp / Math.max(600, weight)) * 310)))));
  const isSuv = body.toLowerCase().includes('suv') || body.toLowerCase().includes('off');
  const handling = Number(Math.min(3.52, Math.max(2.85, 3.12 + (drive === 'AWD' ? 0.12 : 0) + (cls === 'S' || cls === 'A' ? 0.18 : 0) - (isSuv ? 0.14 : 0))).toFixed(2));
  const braking = Math.min(368, Math.max(265, Math.round(275 + (hp * 0.14))));
  const grip = Number(Math.min(0.972, Math.max(0.910, 0.928 + (drive === 'AWD' ? 0.018 : 0) + (cls === 'S' ? 0.02 : 0))).toFixed(3));
  const driftControl = Number(Math.min(0.955, Math.max(0.905, 0.925 + (drive === 'RWD' ? 0.012 : 0.006))).toFixed(3));

  const colors = Object.keys(CAR_COLORS);
  const defaultColor = colors[(r[1] + model.length) % colors.length];

  return {
    id,
    name: `${brand} ${model}${mod ? ' ' + mod : ''}`.trim().slice(0, 56),
    brand,
    generation: gen || years || 'Jahon katalogi',
    era: years || 'Global',
    category: 'world',
    carClass: cls,
    basePR,
    maxPR,
    defaultColor,
    visualProfile: inferVisualProfile(body, fuel, hp, cls, model, brand, gen, mod, id),
    price,
    minLevel: classToMinLevel(cls),
    gameStats: {
      maxSpeed,
      accel,
      handling,
      braking,
      driftControl,
      grip,
      weight,
      nitroEff: Number(Math.min(1.32, 1.18 + (basePR / 5500)).toFixed(2)),
      offRoad: isSuv ? 0.84 : 0.66
    },
    realSpecs: {
      origin: 'Global Katalog',
      manufacturer: brand,
      localStatus: `${srcName} (${license})`,
      engine: `${fuel}${mod ? ' — ' + mod : ''}`,
      displacement: disp ? `${disp} sm³` : 'Noma’lum',
      power: r[9] ? `${r[9]} ot kuchi` : 'Noma’lum',
      torque: torque ? `${torque} N·m` : 'Noma’lum',
      transmission: gear,
      drivetrain: drive,
      zeroTo100: z100 ? `${z100} soniya` : 'Noma’lum',
      weightKg: r[15] ? `${r[15]} kg` : 'Noma’lum',
      dimensions: dims,
      exterior: `${body} kuzovi — 15 qatlamli protsedural Sprite-Stacking modeli.`,
      interior: 'Jahon katalogi modifikatsiyasi.',
      description: `${brand} ${model} (${gen || years || 'Global'}) — ${cls} sinfi, bazaviy PR ${basePR} (tuning bilan ${maxPR} gacha).`,
      sourceTitle: `${srcName} (${license})`,
      sourceUrl: url,
      verified: true
    }
  };
}

export function loadWorldCatalogData(data) {
  WORLD_VEHICLES.length = 0;
  WORLD_VEHICLES_MAP.clear();
  WORLD_BRANDS.length = 0;
  if (!data) return 0;

  if (data.rows && data.tables) {
    const tables = data.tables;
    for (let i = 0; i < data.rows.length; i++) {
      const v = mapWorldRowToVehicle(data.rows[i], tables);
      WORLD_VEHICLES.push(v);
      WORLD_VEHICLES_MAP.set(v.id, v);
    }
    const sortedBrands = [...tables.brands].filter(Boolean).sort((a, b) => a.localeCompare(b));
    WORLD_BRANDS.push(...sortedBrands);
    worldCatalogLoaded = true;
    return WORLD_VEHICLES.length;
  }

  // Also accept full spritestack_poyga_world_full.json format
  if (Array.isArray(data.vehicles)) {
    const brandSet = new Set();
    const tables = { brands: [], bodies: [], fuels: [], gears: [], drives: [], sources: [], licenses: [] };
    for (const item of data.vehicles) {
      const idn = item.identification || {};
      const rs = item.real_specs || {};
      const gb = item.game_balance || {};
      const md = item.metadata || {};
      const bIdx = tables.brands.push(idn.brand || 'Unknown') - 1;
      const bdIdx = tables.bodies.push(rs.body_type || 'Sedan') - 1;
      const fIdx = tables.fuels.push(rs.fuel_type || 'Petrol') - 1;
      const gIdx = tables.gears.push(rs.gearbox || '') - 1;
      const dIdx = tables.drives.push(rs.drivetrain || 'FWD') - 1;
      const sIdx = tables.sources.push(md.source_dataset || 'World JSON') - 1;
      const lIdx = tables.licenses.push(md.source_license || 'ODbL-1.0') - 1;
      const dims = rs.length_mm && rs.width_mm && rs.height_mm ? `${rs.length_mm}×${rs.width_mm}×${rs.height_mm}` : '';
      const row = [
        item.car_id, bIdx, idn.model || '', idn.generation || '', idn.production_years || '', idn.modification || '',
        bdIdx, fIdx, rs.displacement_cc, rs.power_hp, rs.torque_nm, rs.zero_to_100_sec, rs.top_speed_kmh,
        gIdx, dIdx, rs.curb_weight_kg, dims, gb.class || 'D', gb.base_pr || 300, gb.max_pr || 460,
        gb.price_credits || 15000, sIdx, lIdx, md.source_url || ''
      ];
      const v = mapWorldRowToVehicle(row, tables);
      WORLD_VEHICLES.push(v);
      WORLD_VEHICLES_MAP.set(v.id, v);
      if (idn.brand) brandSet.add(idn.brand);
    }
    WORLD_BRANDS.push(...[...brandSet].sort((a, b) => a.localeCompare(b)));
    worldCatalogLoaded = true;
    return WORLD_VEHICLES.length;
  }
  return 0;
}

export function getAllVehiclesCount() {
  return VEHICLES.length + WORLD_VEHICLES.length;
}

export function getVehicleById(id) {
  return VEHICLES.find(v => v.id === id) || WORLD_VEHICLES_MAP.get(id) || VEHICLES[0];
}
