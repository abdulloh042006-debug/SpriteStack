/* =========================================================================
   SPRITESTACK POYGA — 15-LAYER 2.5D SPRITE-STACKING RENDERER & AVATARS
   Generates distinct 18x34x15 pixel-art slices for every vehicle model,
   plus cosmetic tuning (rims, spoilers, stripes, neon), trees & avatars.
   ========================================================================= */

import { CAR_COLORS } from '../data/vehicles.js';

const spriteCache = new Map();

function buildCarVisualStyle(vehicle, vp) {
  const brand = String(vehicle.brand || '').toLowerCase();
  const name = String(vehicle.name || '').toLowerCase();
  const shape = String(vp.shape || 'compact_sedan');
  const identity = [brand, name, vehicle.generation || '', shape].join(' ').toLowerCase();
  let hash = 2166136261;
  for (let i = 0; i < identity.length; i++) {
    hash ^= identity.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash >>>= 0;

  const isMicro = ['micro_hatch', 'micro_round', 'micro_ev'].includes(shape);
  const isVan = shape === 'microvan' || vp.isVan === true;
  const isPickup = shape === 'mini_pickup' || vp.isPickup === true;
  const isSUV = ['suv', 'niva_4x4', 'offroad_suv'].includes(shape) || vp.isSUV === true;
  const isSuper = ['ferrari_f40', 'ferrari_488', 'porsche_911', 'gtr_coupe', 'lambo_wedge', 'sports_coupe', 'fastback_coupe', 'roadster'].includes(shape) || vp.isCoupe === true;
  const isLong = ['long_sedan', 'malibu', 'luxury_sedan', 'wagon'].includes(shape) || vp.isWagon === true;
  const isBoxy = ['boxy_sedan', 'niva_4x4'].includes(shape) || isVan || isPickup;
  const isHatch = ['micro_hatch', 'micro_round', 'compact_hatch'].includes(shape);
  const isEV = vp.electric === true || ['ev_sedan', 'micro_ev'].includes(shape) || /tesla|byd|xiaomi|polestar|rivian|nio|zeekr/.test(identity);

  const brandGrille = [
    [/bmw|mini/, 'bmw_kidney'], [/mercedes|benz|maybach/, 'mercedes_star'],
    [/audi/, 'audi_singleframe'], [/lexus/, 'lexus_spindle'],
    [/kia/, 'kia_tiger'], [/hyundai|genesis/, 'hyundai_parametric'],
    [/chevrolet|chevy|ravon|daewoo/, 'chevy_dual'], [/toyota/, 'toyota_wide'],
    [/honda|acura/, 'honda_wing'], [/nissan|infiniti/, 'nissan_vmotion'],
    [/ford|lincoln/, 'ford_trapezoid'], [/volkswagen|\bvw\b|skoda/, 'vw_horizontal'],
    [/porsche/, 'porsche_oval'], [/ferrari/, 'ferrari_mesh'],
    [/lamborghini/, 'lambo_hex'], [/tesla|byd|xiaomi|polestar|rivian|nio|zeekr/, 'ev_closed'],
    [/mazda/, 'mazda_wing'], [/subaru/, 'subaru_hex'], [/volvo/, 'volvo_ironmark']
  ];
  let makeGrille = '';
  for (const rule of brandGrille) { if (rule[0].test(identity)) { makeGrille = rule[1]; break; } }

  const brandLights = [
    [/bmw|audi|ford/, 'matrix_led'], [/mercedes|hyundai|honda|volkswagen|skoda/, 'slim_led'],
    [/kia|nissan/, 'boomerang_led'], [/lamborghini|lexus|toyota|subaru/, 'angular_led'],
    [/porsche/, 'round_2'], [/ferrari/, 'slim_led'], [/tesla|byd|xiaomi|polestar|rivian|nio|zeekr/, 'slim_led']
  ];
  let makeLights = '';
  for (const rule of brandLights) { if (rule[0].test(identity)) { makeLights = rule[1]; break; } }

  const brandRear = [
    [/bmw|audi|kia|hyundai|porsche/, 'led_bar'], [/mercedes|mazda/, 'wraparound'],
    [/lexus/, 'l_shape'], [/honda|subaru/, 'c_shape'], [/volvo/, 'vertical'],
    [/lamborghini/, 'angular_red'], [/ferrari/, 'quad_round'],
    [/tesla|byd|xiaomi|polestar|rivian|nio|zeekr/, 'led_bar']
  ];
  let makeRear = '';
  for (const rule of brandRear) { if (rule[0].test(identity)) { makeRear = rule[1]; break; } }

  const bodyWidthBase = isSUV ? 16 : (isSuper ? 16 : (isMicro ? 12 : 14));
  const bodyWidth = Number(vp.bodyWidth) || Math.max(12, Math.min(16, bodyWidthBase + ((((hash >>> 3) % 3) - 1) * 2)));
  const frontTaper = Number.isFinite(vp.frontTaper) ? vp.frontTaper :
    (isBoxy ? 0.2 : isSuper ? 2.4 : isHatch ? 1.8 : isSUV ? 0.8 : 1.25) + (((hash >>> 8) % 3) * 0.22);
  const rearTaper = Number.isFinite(vp.rearTaper) ? vp.rearTaper :
    (isBoxy ? 0.2 : isSuper ? 1.9 : isHatch ? 1.9 : isSUV ? 0.65 : 1.35) + (((hash >>> 11) % 3) * 0.22);

  return {
    shape, isMicro, isVan, isPickup, isSUV, isSuper, isLong, isBoxy, isHatch, isEV,
    grille: vp.grille || makeGrille || (isEV ? 'ev_closed' : 'wide_mesh'),
    lights: vp.lights || makeLights || 'rect_2',
    rear: vp.rear || makeRear || 'wide_red',
    bodyWidth,
    frontTaper: Math.max(0, Math.min(2.8, frontTaper)),
    rearTaper: Math.max(0, Math.min(2.8, rearTaper)),
    cabinFront: Number.isFinite(vp.cabinFront) ? vp.cabinFront : (isPickup ? 0.14 : isVan ? 0.08 : isSuper ? 0.30 : isHatch ? 0.24 : 0.25),
    cabinRear: Number.isFinite(vp.cabinRear) ? vp.cabinRear : (isPickup ? 0.50 : isVan ? 0.90 : isSUV ? 0.77 : isSuper ? 0.70 : isLong ? 0.82 : 0.76),
    cabinWidth: Number.isFinite(vp.cabinWidth) ? vp.cabinWidth : (isVan ? 0.78 : isSUV ? 0.72 : isSuper ? 0.58 : isHatch ? 0.66 : 0.64),
    frontAxle: Number.isFinite(vp.frontAxle) ? vp.frontAxle : 0.25,
    rearAxle: Number.isFinite(vp.rearAxle) ? vp.rearAxle : 0.75,
    wheelLength: Number(vp.wheelLength) || (isSUV ? 6 : isSuper ? 4 : 5),
    roofStyle: vp.roofStyle || (isVan ? 'flat' : isSuper ? 'fastback' : (isEV ? 'panoramic' : 'standard')),
    roofRails: vp.roofRails === true || (isSUV && (hash >>> 22) % 2 === 0),
    signature: vp.signature || (makeGrille ? makeGrille : 'generic'),
    isConvertible: vp.isConvertible === true,
    hasStripe: Boolean(vp.stripe)
  };
}

export function generateCarSlices(vehicle, colorKey, tuning = {}) {
  const vp = vehicle.visualProfile || {};
  const style = buildCarVisualStyle(vehicle, vp);
  const rimStyle = tuning.rimStyle || 'sport';
  const spoilerOpt = tuning.spoiler || 'stock';
  const hasStripe = tuning.stripe !== undefined ? Boolean(tuning.stripe || style.hasStripe) : style.hasStripe;
  const hasWing = spoilerOpt === 'gt_wing' || (spoilerOpt === 'stock' && vp.wing === true);
  const cacheKey = [vehicle.id, colorKey, rimStyle, hasStripe, hasWing].join('_');
  if (spriteCache.has(cacheKey)) return spriteCache.get(cacheKey);

  const pal = CAR_COLORS[colorKey] || CAR_COLORS.rosso;
  const W = 18, H = 34, SLICES = 15;
  const slices = [];
  const yStart = style.isMicro ? 5 : (style.isLong || style.isSuper ? 1 : 2);
  const yEnd = style.isMicro ? H - 5 : (style.isLong ? H - 1 : H - 2);
  const bodyH = yEnd - yStart;
  const xPad = Math.max(1, Math.floor((W - style.bodyWidth) / 2));
  const bodyW = W - xPad * 2;
  const frontWheelY = yStart + Math.round(bodyH * style.frontAxle);
  const rearWheelY = yStart + Math.round(bodyH * style.rearAxle);
  const wheelH = Math.max(4, Math.min(6, style.wheelLength));
  const rimColor = rimStyle === 'gold' ? '#facc15' : (rimStyle === 'black' ? '#334155' : (rimStyle === 'chrome' ? '#e2e8f0' : '#94a3b8'));
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  for (let z = 0; z < SLICES; z++) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;

    const px = (x, y, col) => {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || x >= W || y < 0 || y >= H) return;
      g.fillStyle = col; g.fillRect(x, y, 1, 1);
    };
    const rect = (x, y, w, h, col) => {
      x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
      if (w <= 0 || h <= 0) return;
      g.fillStyle = col; g.fillRect(x, y, w, h);
    };
    const taperAt = (t) => {
      let taper = 0;
      if (t < 0.18) taper += style.frontTaper * (1 - t / 0.18);
      if (t > 0.82) taper += style.rearTaper * ((t - 0.82) / 0.18);
      return clamp(Math.round(taper), 0, Math.max(0, Math.floor((bodyW - 5) / 2)));
    };
    const fillBodyRows = (color, fromY, toY, extraInset = 0) => {
      const span = Math.max(1, toY - fromY - 1);
      for (let yy = fromY; yy < toY; yy++) {
        const t = (yy - fromY) / span;
        const inset = taperAt(t) + extraInset;
        const xx = xPad + inset;
        const ww = bodyW - inset * 2;
        rect(xx, yy, ww, 1, color);
      }
    };

    // Layer 0-1: tires and low chassis. Wheelbase is model-specific.
    if (z <= 1) {
      const tire = z === 0 ? '#090c12' : '#1b202a';
      for (const wy of [frontWheelY, rearWheelY]) {
        rect(xPad - 1, wy - Math.floor(wheelH / 2), 2, wheelH, tire);
        rect(W - xPad - 1, wy - Math.floor(wheelH / 2), 2, wheelH, tire);
        if (z === 1) {
          px(xPad - 1, wy - 1, rimColor); px(xPad - 1, wy, rimColor);
          px(W - xPad, wy - 1, rimColor); px(W - xPad, wy, rimColor);
        }
      }
      if (z === 1) fillBodyRows('#131923', yStart + 2, yEnd - 2, 1);
    }

    // Layer 2-3: chassis, wheel arches, bumper and make-specific grille.
    else if (z <= 3) {
      fillBodyRows(z === 2 ? pal.trim : pal.dark, yStart + 1, yEnd - 1, z === 2 ? 0 : 0.25);
      for (const wy of [frontWheelY, rearWheelY]) {
        rect(xPad - 1, wy - Math.floor(wheelH / 2), 2, wheelH, '#111721');
        rect(W - xPad - 1, wy - Math.floor(wheelH / 2), 2, wheelH, '#111721');
      }
      rect(xPad + 1, yStart, bodyW - 2, 1, pal.trim);
      rect(xPad + 1, yEnd - 1, bodyW - 2, 1, pal.trim);

      if (z === 3) {
        const gy = yStart;
        const center = Math.floor(W / 2);
        const dark = '#0b1220';
        const chrome = '#cbd5e1';
        const grille = style.grille;
        if (grille === 'chrome_slats' || grille === 'chrome_big') {
          rect(xPad + 3, gy, Math.max(2, bodyW - 6), 1, chrome);
          if (grille === 'chrome_big') rect(xPad + 4, gy + 1, Math.max(2, bodyW - 8), 1, '#e2e8f0');
        } else if (grille === 'dark_quad') {
          rect(xPad + 2, gy, bodyW - 4, 2, dark);
          px(center - 2, gy, chrome); px(center + 1, gy, chrome);
        } else if (grille === 'bmw_kidney') {
          rect(center - 3, gy, 2, 2, '#0b1720'); rect(center + 1, gy, 2, 2, '#0b1720');
          px(center - 2, gy, '#94a3b8'); px(center + 1, gy, '#94a3b8');
        } else if (grille === 'mercedes_star') {
          rect(center - 3, gy, 6, 1, '#111827'); px(center, gy + 1, '#e2e8f0');
          px(center - 1, gy, '#cbd5e1'); px(center + 1, gy, '#cbd5e1');
        } else if (grille === 'audi_singleframe' || grille === 'porsche_oval') {
          rect(center - 3, gy, 6, 2, '#0b1220');
          rect(center - 2, gy, 4, 1, '#64748b');
        } else if (grille === 'lexus_spindle' || grille === 'lambo_hex') {
          rect(center - 2, gy, 4, 2, '#0b1220');
          px(center - 3, gy, '#94a3b8'); px(center + 2, gy, '#94a3b8');
        } else if (grille === 'kia_tiger' || grille === 'hyundai_parametric' || grille === 'mazda_wing') {
          rect(xPad + 2, gy, bodyW - 4, 1, dark);
          px(xPad + 2, gy + 1, chrome); px(W - xPad - 3, gy + 1, chrome);
        } else if (grille === 'nissan_vmotion' || grille === 'ford_trapezoid') {
          rect(center - 4, gy, 8, 1, dark); px(center - 4, gy + 1, chrome); px(center + 3, gy + 1, chrome);
        } else if (grille === 'vw_horizontal' || grille === 'toyota_wide' || grille === 'volvo_ironmark') {
          rect(xPad + 2, gy, bodyW - 4, 1, chrome); rect(xPad + 3, gy + 1, bodyW - 6, 1, dark);
        } else if (grille === 'subaru_hex' || grille === 'ferrari_mesh' || grille === 'wide_mesh' || grille === 'super_intake') {
          rect(center - 3, gy, 6, 2, dark); px(center - 2, gy + 1, chrome); px(center + 2, gy + 1, chrome);
        } else if (grille === 'chevy_dual' || grille === 'chevy_wide' || grille === 'n150_chrome') {
          rect(xPad + 2, gy, bodyW - 4, 1, dark); rect(xPad + 4, gy + 1, bodyW - 8, 1, '#94a3b8');
        } else if (grille === 'ev_closed') {
          rect(xPad + 3, gy, bodyW - 6, 2, pal.light);
        } else {
          rect(xPad + 2, gy, bodyW - 4, 1, dark);
        }
      }
    }

    // Layer 4-7: distinct body outline, lamps, hood, side lines and rear treatment.
    else if (z <= 7) {
      const bodyCol = z <= 5 ? pal.main : pal.light;
      const sideCol = z <= 5 ? pal.dark : pal.main;
      fillBodyRows(bodyCol, yStart + 1, yEnd - 1, 0);
      const midY = Math.round((yStart + yEnd) / 2);
      rect(xPad, yStart + 3, 1, Math.max(1, bodyH - 6), sideCol);
      rect(W - xPad - 1, yStart + 3, 1, Math.max(1, bodyH - 6), sideCol);

      if (z === 5 || z === 6) {
        // Front lamps: geometry changes with make and generation.
        const ly = yStart;
        if (style.lights === 'round_4') {
          px(xPad + 1, ly, '#fef08a'); px(xPad + 3, ly, '#fef08a');
          px(W - xPad - 2, ly, '#fef08a'); px(W - xPad - 4, ly, '#fef08a');
        } else if (style.lights === 'round_2') {
          rect(xPad + 1, ly, 2, 1, '#fef08a'); rect(W - xPad - 3, ly, 2, 1, '#fef08a');
        } else if (style.lights === 'boomerang_led') {
          px(xPad + 1, ly, '#e0f2fe'); px(xPad + 2, ly + 1, '#fef08a');
          px(W - xPad - 2, ly, '#e0f2fe'); px(W - xPad - 3, ly + 1, '#fef08a');
        } else if (style.lights === 'vertical_led' || style.lights === 'thor_led') {
          rect(xPad + 1, ly, 1, 3, '#e0f2fe'); rect(W - xPad - 2, ly, 1, 3, '#e0f2fe');
        } else if (style.lights === 'matrix_led') {
          rect(xPad + 1, ly, 3, 1, '#e0f2fe'); rect(W - xPad - 4, ly, 3, 1, '#e0f2fe');
          px(xPad + 2, ly + 1, '#fef08a'); px(W - xPad - 3, ly + 1, '#fef08a');
        } else if (style.lights === 'slim_led' || style.lights === 'angular_led') {
          rect(xPad + 1, ly, 3, 1, '#e0f2fe'); rect(W - xPad - 4, ly, 3, 1, '#e0f2fe');
        } else {
          rect(xPad + 1, ly, 3, 2, '#fef08a'); rect(W - xPad - 4, ly, 3, 2, '#fef08a');
        }

        // Rear signature: full-width light bars, classic pairs or vertical lamps.
        const ry = yEnd - 1;
        if (style.rear === 'quad_round') {
          px(xPad + 2, ry, '#ff1e38'); px(xPad + 4, ry, '#ff1e38');
          px(W - xPad - 3, ry, '#ff1e38'); px(W - xPad - 5, ry, '#ff1e38');
        } else if (style.rear === 'led_bar' || style.rear === 'wraparound') {
          rect(xPad + 1, ry, bodyW - 2, 1, '#ff1e38');
          if (style.rear === 'wraparound') { px(xPad, ry - 1, '#ff1e38'); px(W - xPad - 1, ry - 1, '#ff1e38'); }
        } else if (style.rear === 'vertical') {
          rect(xPad + 1, ry - 2, 1, 3, '#ff1e38'); rect(W - xPad - 2, ry - 2, 1, 3, '#ff1e38');
        } else if (style.rear === 'l_shape' || style.rear === 'c_shape' || style.rear === 'boomerang' || style.rear === 'angular_red') {
          rect(xPad + 1, ry - 1, 1, 2, '#ff1e38'); rect(W - xPad - 2, ry - 1, 1, 2, '#ff1e38');
          px(xPad + 2, ry, '#ff1e38'); px(W - xPad - 3, ry, '#ff1e38');
        } else {
          rect(xPad + 1, ry, 3, 1, '#ff1e38'); rect(W - xPad - 4, ry, 3, 1, '#ff1e38');
        }
      }

      if (z === 5 || z === 6) {
        // Bonnet creases and model-specific hood volume.
        const hoodEnd = yStart + Math.max(4, Math.round(bodyH * 0.22));
        px(xPad + 2, hoodEnd, pal.light); px(W - xPad - 3, hoodEnd, pal.light);
        if (style.isSuper) {
          rect(xPad + 3, yStart + 4, 1, 5, pal.dark);
          rect(W - xPad - 4, yStart + 4, 1, 5, pal.dark);
        }
        if (style.isEV && z === 6) rect(xPad + 3, yStart + 3, bodyW - 6, 1, pal.light);
      }

      if (hasStripe) rect(Math.floor(W / 2) - 1, yStart + 1, 2, bodyH - 2, '#f8fafc');

      // Pickup bed is visually separate from the cabin.
      if (style.isPickup && z >= 5) {
        const bedY = yStart + Math.round(bodyH * 0.54);
        rect(xPad + 2, bedY, bodyW - 4, yEnd - bedY - 2, z === 5 ? '#334155' : '#1e293b');
        rect(xPad + 1, bedY, 1, yEnd - bedY - 2, pal.light);
        rect(W - xPad - 2, bedY, 1, yEnd - bedY - 2, pal.light);
        rect(xPad + 2, yEnd - 2, bodyW - 4, 1, pal.dark);
      }

      // Door seams, mirrors and side character lines.
      if (z === 6 || z === 7) {
        const doorY = yStart + Math.round(bodyH * 0.54);
        rect(xPad + 1, doorY, 1, 4, pal.dark);
        rect(W - xPad - 2, doorY, 1, 4, pal.dark);
        px(xPad - 1, yStart + 7, pal.light); px(W - xPad, yStart + 7, pal.light);
      }

      if (hasWing && z === 7) {
        rect(xPad, yEnd - 4, bodyW, 2, pal.light);
        rect(xPad + 1, yEnd - 4, bodyW - 2, 1, pal.dark);
      }
    }

    // Layer 8-10: windshield, side windows, rear glass and roof signature.
    else if (z <= 10) {
      const cabStart = yStart + Math.round(bodyH * style.cabinFront);
      const cabEnd = yStart + Math.round(bodyH * style.cabinRear);
      const cabW = Math.max(6, Math.min(bodyW - 2, Math.round(bodyW * style.cabinWidth)));
      const cabPad = Math.floor((bodyW - cabW) / 2);
      const cabX = xPad + cabPad;
      const glass = z === 8 ? '#263447' : (z === 9 ? '#33485f' : '#475d73');
      const shell = z === 8 ? pal.main : (z === 9 ? pal.light : pal.main);
      rect(cabX, cabStart, cabW, cabEnd - cabStart, shell);
      rect(cabX + 1, cabStart + 1, Math.max(2, cabW - 2), 2, glass);
      rect(cabX + 1, cabEnd - 3, Math.max(2, cabW - 2), 2, '#1e293b');
      if (!style.isVan && !style.isPickup) {
        rect(cabX, cabStart + 4, 1, Math.max(1, cabEnd - cabStart - 8), '#0f172a');
        rect(cabX + cabW - 1, cabStart + 4, 1, Math.max(1, cabEnd - cabStart - 8), '#0f172a');
        if (z >= 9) {
          rect(cabX + 2, cabStart + 4, 1, Math.max(1, cabEnd - cabStart - 8), '#64748b');
          rect(cabX + cabW - 3, cabStart + 4, 1, Math.max(1, cabEnd - cabStart - 8), '#64748b');
        }
      } else if (style.isVan) {
        for (let wi = 0; wi < 3; wi++) {
          const wy = cabStart + 5 + wi * 5;
          if (wy < cabEnd - 3) {
            rect(cabX, wy, cabW, 2, '#334155');
            rect(cabX, wy + 1, 1, 1, '#94a3b8');
          }
        }
      }

      if (z === 10) {
        const roofInset = style.roofStyle === 'fastback' ? 2 : 1;
        rect(cabX + roofInset, cabStart + 5, Math.max(3, cabW - roofInset * 2), Math.max(3, cabEnd - cabStart - 10), style.roofStyle === 'panoramic' ? '#253b50' : pal.main);
        if (style.roofStyle === 'panoramic') {
          rect(cabX + 2, cabStart + 6, Math.max(2, cabW - 4), Math.max(2, cabEnd - cabStart - 12), '#263e55');
          px(cabX + 2, cabStart + 6, '#94a3b8');
        } else {
          rect(cabX + 2, cabStart + 6, Math.max(2, cabW - 4), 1, '#64748b');
        }
      }
      if (hasWing && z === 10) rect(xPad, cabEnd - 1, bodyW, 1, pal.light);
    }

    // Layer 11-14: raised roof crown, panoramic panel, rails and rear aero.
    else {
      const step = z - 11;
      const cabStart = yStart + Math.round(bodyH * style.cabinFront);
      const cabEnd = yStart + Math.round(bodyH * style.cabinRear);
      if (style.isPickup) {
        // Pickup roof only rises above its short front cab.
        const inset = 2 + Math.min(2, step);
        rect(xPad + inset, cabStart + 1 + step, Math.max(3, bodyW - inset * 2), Math.max(2, cabEnd - cabStart - 3 - step), step >= 2 ? pal.light : pal.main);
      } else {
        const inset = (style.isVan ? 1 : 2) + (step >= 2 ? 1 : 0);
        const roofTop = cabStart + (style.roofStyle === 'fastback' ? 3 : 2) + step;
        const roofBottom = cabEnd - 2 - step;
        if (roofBottom > roofTop) {
          rect(xPad + inset, roofTop, Math.max(3, bodyW - inset * 2), roofBottom - roofTop, step >= 2 ? pal.light : pal.main);
          if (step === 0) {
            rect(xPad + inset + 1, roofTop + 1, Math.max(2, bodyW - inset * 2 - 2), 2, '#334155');
          }
          if (style.roofStyle === 'panoramic' && step <= 1) {
            rect(xPad + inset + 2, roofTop + 3, Math.max(2, bodyW - inset * 2 - 4), Math.max(2, roofBottom - roofTop - 6), '#1e3a50');
          }
        }
      }

      if (style.roofRails && step <= 2) {
        rect(xPad + 1, yStart + 8 + step, 1, Math.max(5, bodyH - 17), '#94a3b8');
        rect(W - xPad - 2, yStart + 8 + step, 1, Math.max(5, bodyH - 17), '#94a3b8');
      }
      if (style.isSuper && step === 3) {
        rect(xPad + 4, yEnd - 11, Math.max(3, bodyW - 8), 3, '#1e293b');
      }
      if (hasWing && step === 0) rect(xPad, yEnd - 4, bodyW, 2, pal.light);
    }
    slices.push(c);
  }

  spriteCache.set(cacheKey, slices);
  return slices;
}
export function drawSpriteStack(ctx, slices, x, y, headingRad, scale, spacing, shadowAlpha = 0.38, elevationZ = 0, neonColor = 'none') {
  const w = slices[0].width * scale;
  const h = slices[0].height * scale;
  const rot = headingRad + Math.PI / 2;

  // Ground shadow separates vertically when airborne (Jump Ramp!)
  if (shadowAlpha > 0) {
    ctx.save();
    const shadowScale = Math.max(0.55, 1 - elevationZ * 0.004);
    ctx.translate(x + 2 + elevationZ * 0.12, y + 4);
    ctx.rotate(rot);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.56 * shadowScale, h * 0.52 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Optional cosmetic underglow neon (visual only)
    if (neonColor && neonColor !== 'none' && elevationZ < 10) {
      ctx.strokeStyle = neonColor;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // Slight visual zoom boost while airborne
  const airScale = 1 + elevationZ * 0.0045;
  const dw = w * airScale;
  const dh = h * airScale;

  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < slices.length; i++) {
    ctx.save();
    ctx.translate(x, y - elevationZ - i * spacing * airScale);
    ctx.rotate(rot);
    ctx.drawImage(slices[i], -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  }
}

export function drawPixelAvatar(ctx, seed, bgColor, size = 40) {
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = bgColor || '#ef233c';
  ctx.fillRect(0, 0, size, size);

  const cell = size / 8;
  let s = (Number(seed) || 1234) + 17;
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

  // Symmetric pixel-art racing helmet / robot icon
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  for (let y = 1; y < 7; y++) {
    for (let x = 1; x < 4; x++) {
      if (rand() > 0.45) {
        ctx.fillRect(x * cell, y * cell, cell, cell);
        ctx.fillRect((7 - x) * cell, y * cell, cell, cell);
      }
    }
  }
  // Visor band
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(2 * cell, 3 * cell, 4 * cell, cell);
}

/* Deterministic compact QR-style visual matrix + URL payload renderer */
export function drawInviteQR(canvas, text) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  const N = 21;
  const cell = Math.floor(size / (N + 2));
  const off = Math.floor((size - cell * N) / 2);

  const drawFinder = (gx, gy) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(off + gx * cell, off + gy * cell, 7 * cell, 7 * cell);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(off + (gx + 1) * cell, off + (gy + 1) * cell, 5 * cell, 5 * cell);
    ctx.fillStyle = '#000000';
    ctx.fillRect(off + (gx + 2) * cell, off + (gy + 2) * cell, 3 * cell, 3 * cell);
  };

  drawFinder(0, 0);
  drawFinder(N - 7, 0);
  drawFinder(0, N - 7);

  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  ctx.fillStyle = '#000000';
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const inFinder = (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
      if (inFinder) continue;
      hash = Math.imul(hash ^ (x * 31 + y * 17), 16777619);
      if ((hash >>> 0) % 2 === 0) {
        ctx.fillRect(off + x * cell, off + y * cell, cell, cell);
      }
    }
  }
}
