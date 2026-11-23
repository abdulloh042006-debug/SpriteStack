/* =========================================================================
   SPRITESTACK POYGA — 15-LAYER 2.5D SPRITE-STACKING RENDERER & AVATARS
   Generates distinct 18x34x15 pixel-art slices for every vehicle model,
   plus cosmetic tuning (rims, spoilers, stripes, neon), trees & avatars.
   ========================================================================= */

import { CAR_COLORS } from '../data/vehicles.js';

const spriteCache = new Map();

export function generateCarSlices(vehicle, colorKey, tuning = {}) {
  const vp = vehicle.visualProfile || { shape: 'compact_sedan', grille: 'chevy_dual', lights: 'rect_2', rear: 'wide_red', wing: false, stripe: false };
  const rimStyle = tuning.rimStyle || 'sport';
  const spoilerOpt = tuning.spoiler || 'stock';
  const hasStripe = tuning.stripe !== undefined ? Boolean(tuning.stripe || vp.stripe) : Boolean(vp.stripe);
  const hasWing = spoilerOpt === 'gt_wing' || (spoilerOpt === 'stock' && vp.wing);

  const cacheKey = `${vehicle.id}_${colorKey}_${rimStyle}_${hasStripe}_${hasWing}`;
  if (spriteCache.has(cacheKey)) return spriteCache.get(cacheKey);

  const pal = CAR_COLORS[colorKey] || CAR_COLORS.rosso;
  const W = 18;
  const H = 34;
  const SLICES = 15;
  const slices = [];

  const shape = vp.shape;
  const isMicro = shape === 'micro_hatch' || shape === 'micro_round' || shape === 'micro_ev';
  const isVan = shape === 'microvan';
  const isPickup = shape === 'mini_pickup';
  const isSUV = shape === 'suv' || shape === 'niva_4x4';
  const isSuper = ['ferrari_f40', 'ferrari_488', 'porsche_911', 'gtr_coupe', 'lambo_wedge'].includes(shape);
  const isLong = shape === 'long_sedan' || shape === 'malibu';
  const isBoxy = shape === 'boxy_sedan' || shape === 'niva_4x4' || isVan || isPickup;

  // Vehicle proportions within 18x34 pixel grid
  const yStart = isMicro ? 5 : (isLong ? 1 : 2);
  const yEnd = isMicro ? H - 5 : (isLong ? H - 1 : H - 2);
  const bodyH = yEnd - yStart;
  const xPad = isVan || isPickup ? 3 : (isSuper ? 1 : 2);
  const bodyW = W - xPad * 2;

  const rimColor = rimStyle === 'gold' ? '#facc15' : (rimStyle === 'black' ? '#334155' : (rimStyle === 'chrome' ? '#e2e8f0' : '#94a3b8'));

  for (let z = 0; z < SLICES; z++) {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;

    const px = (x, y, col) => {
      if (x < 0 || x >= W || y < 0 || y >= H) return;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    };
    const rect = (x, y, w, h, col) => {
      if (w <= 0 || h <= 0) return;
      g.fillStyle = col;
      g.fillRect(x, y, w, h);
    };

    const fwY = yStart + 3;
    const rwY = yEnd - 9;

    // Slices 0-1: Tires & ground underbody
    if (z <= 1) {
      const tireCol = z === 0 ? '#0b0d11' : '#171b24';
      rect(xPad - 1, fwY, 2, 6, tireCol);
      rect(W - xPad - 1, fwY, 2, 6, tireCol);
      rect(xPad - 1, rwY, 2, 6, tireCol);
      rect(W - xPad - 1, rwY, 2, 6, tireCol);
      if (z === 1) {
        rect(xPad + 1, yStart + 2, bodyW - 2, bodyH - 4, '#13161e');
      }
    }

    // Slices 2-3: Lower chassis, wheel wells, bumpers, grilles, exhausts
    else if (z <= 3) {
      const col = z === 2 ? pal.trim : pal.dark;
      rect(xPad, yStart + 1, bodyW, bodyH - 2, col);
      if (!isBoxy) {
        rect(xPad + 1, yStart, bodyW - 2, 1, col);
        rect(xPad + 1, yEnd - 1, bodyW - 2, 1, col);
      } else {
        rect(xPad, yStart, bodyW, 1, col);
        rect(xPad, yEnd - 1, bodyW, 1, col);
      }

      // Wheels + rims
      rect(xPad - 1, fwY, 2, 6, '#151921');
      rect(W - xPad - 1, fwY, 2, 6, '#151921');
      rect(xPad - 1, rwY, 2, 6, '#151921');
      rect(W - xPad - 1, rwY, 2, 6, '#151921');
      px(xPad - 1, fwY + 2, rimColor); px(xPad - 1, fwY + 3, rimColor);
      px(W - xPad, fwY + 2, rimColor); px(W - xPad, fwY + 3, rimColor);
      px(xPad - 1, rwY + 2, rimColor); px(xPad - 1, rwY + 3, rimColor);
      px(W - xPad, rwY + 2, rimColor); px(W - xPad, rwY + 3, rimColor);

      // Front grille per model
      if (vp.grille === 'chrome_slats' || vp.grille === 'chrome_big') {
        rect(5, yStart, W - 10, 1, '#cbd5e1');
        if (vp.grille === 'chrome_big') rect(6, yStart, W - 12, 2, '#e2e8f0');
      } else if (vp.grille === 'chevy_dual' || vp.grille === 'chevy_wide' || vp.grille === 'n150_chrome') {
        rect(4, yStart, W - 8, 1, '#1e293b');
        rect(6, yStart, W - 12, 1, '#94a3b8');
      } else if (vp.grille === 'ev_closed') {
        rect(5, yStart, W - 10, 1, pal.light);
      } else {
        rect(4, yStart, W - 8, 1, '#0f172a');
      }

      // Exhaust tips
      if (shape === 'ferrari_f40') {
        px(6, yEnd - 1, '#e2e8f0'); px(8, yEnd - 1, '#e2e8f0'); px(10, yEnd - 1, '#e2e8f0');
      } else if (vp.grille !== 'ev_closed') {
        px(5, yEnd - 1, '#cbd5e1');
        if (isSuper || isLong) px(W - 6, yEnd - 1, '#cbd5e1');
      }
    }

    // Slices 4-7: Main body shell, headlights, taillights, side intakes, pickup bed
    else if (z <= 7) {
      const bodyCol = z <= 5 ? pal.main : pal.light;
      const sideCol = z <= 5 ? pal.dark : pal.main;
      rect(xPad, yStart + 1, bodyW, bodyH - 2, bodyCol);
      rect(xPad + 1, yStart, bodyW - 2, 1, bodyCol);
      rect(xPad + 1, yEnd - 1, bodyW - 2, 1, bodyCol);
      rect(xPad, yStart + 2, 1, bodyH - 4, sideCol);
      rect(W - xPad - 1, yStart + 2, 1, bodyH - 4, sideCol);

      if (hasStripe) {
        rect(7, yStart, 4, bodyH, '#f8fafc');
      }

      // Pickup open cargo bed (Labo)
      if (isPickup && z >= 5) {
        rect(xPad + 1, yStart + 11, bodyW - 2, bodyH - 13, z === 5 ? '#334155' : '#1e293b');
      }

      // Side intakes for supercars
      if (isSuper && (z === 5 || z === 6)) {
        rect(xPad, yStart + 14, 1, 6, '#0f172a');
        rect(W - xPad - 1, yStart + 14, 1, 6, '#0f172a');
      }

      // Headlights (z=4..5)
      if (z === 4 || z === 5) {
        if (vp.lights === 'round_4') {
          px(xPad + 1, yStart, '#fef08a'); px(xPad + 3, yStart, '#fef08a');
          px(W - xPad - 2, yStart, '#fef08a'); px(W - xPad - 4, yStart, '#fef08a');
        } else if (vp.lights === 'round_2') {
          rect(xPad + 1, yStart, 2, 1, '#fef08a');
          rect(W - xPad - 3, yStart, 2, 1, '#fef08a');
        } else if (vp.lights === 'sleek_led' || vp.lights === 'angular_led') {
          rect(xPad + 1, yStart, 3, 1, '#e0f2fe');
          rect(W - xPad - 4, yStart, 3, 1, '#e0f2fe');
          px(xPad + 1, yStart + 1, '#fef08a');
          px(W - xPad - 2, yStart + 1, '#fef08a');
        } else {
          rect(xPad + 1, yStart, 3, 2, '#fef08a');
          rect(W - xPad - 4, yStart, 3, 2, '#fef08a');
        }
      }

      // Taillights (z=5..6)
      if (z === 5 || z === 6) {
        if (vp.rear === 'quad_round') {
          rect(xPad + 1, yEnd - 1, bodyW - 2, 1, '#1e1b24');
          px(xPad + 2, yEnd - 1, '#ff1e38'); px(xPad + 4, yEnd - 1, '#ff1e38');
          px(W - xPad - 3, yEnd - 1, '#ff1e38'); px(W - xPad - 5, yEnd - 1, '#ff1e38');
        } else if (vp.rear === 'led_bar') {
          rect(xPad + 1, yEnd - 1, bodyW - 2, 1, '#ff1e38');
        } else {
          rect(xPad + 1, yEnd - 1, 3, 1, '#ff1e38');
          rect(W - xPad - 4, yEnd - 1, 3, 1, '#ff1e38');
        }
      }

      // Engine cover details on slice 7
      if (z === 7 && shape === 'ferrari_f40') {
        rect(5, yEnd - 11, W - 10, 7, '#1e293b');
        rect(6, yEnd - 10, W - 12, 1, '#991b1b');
        rect(6, yEnd - 8, W - 12, 1, '#991b1b');
        rect(6, yEnd - 6, W - 12, 1, '#991b1b');
      } else if (z === 7 && (shape === 'ferrari_488' || shape === 'lambo_wedge')) {
        rect(6, yEnd - 11, W - 12, 6, '#1e293b');
      }

      // Wing uprights
      if (hasWing && z === 7) {
        rect(xPad + 1, yEnd - 4, 2, 3, pal.main);
        rect(W - xPad - 3, yEnd - 4, 2, 3, pal.main);
      }
    }

    // Slices 8-10: Greenhouse / Cabin / Windshield / Wing
    else if (z <= 10) {
      if (isPickup) {
        // Only front cab rises
        const cabTop = yStart + 2 + (z - 8);
        const cabH = 9 - (z - 8);
        rect(xPad + 1, cabTop, bodyW - 2, cabH, z === 8 ? pal.main : pal.light);
        rect(xPad + 2, cabTop, bodyW - 4, 3, '#475569');
      } else if (isVan) {
        // Tall microvan cabin spanning almost entire length
        const inset = z === 8 ? 0 : 1;
        rect(xPad + inset, yStart + 1, bodyW - inset * 2, bodyH - 2, z === 8 ? pal.main : pal.light);
        rect(xPad + inset + 1, yStart + 1, bodyW - (inset + 1) * 2, 3, '#475569');
        rect(xPad + inset, yStart + 5, 1, bodyH - 8, '#1e293b');
        rect(W - xPad - inset - 1, yStart + 5, 1, bodyH - 8, '#1e293b');
      } else {
        const topOff = isSUV || isMicro ? (z - 7) + 4 : (z - 7) * 2 + 4;
        const botOff = isSUV || isMicro ? (z - 7) + 2 : (z - 7) + 5;
        const insetX = z === 8 ? xPad + 1 : xPad + 2;
        const ghW = W - insetX * 2;
        const ghH = Math.max(4, yEnd - botOff - (yStart + topOff));
        rect(insetX, yStart + topOff, ghW, ghH, z === 8 ? pal.main : pal.light);

        // Windshield + glass shine
        const glassCol = z === 8 ? '#334155' : (z === 9 ? '#475569' : '#64748b');
        rect(insetX + 1, yStart + topOff, ghW - 2, 4, glassCol);
        px(insetX + 2, yStart + topOff + 1, '#94a3b8');
        // Side & rear windows
        rect(insetX, yStart + topOff + 3, 1, Math.max(1, ghH - 6), '#1e293b');
        rect(W - insetX - 1, yStart + topOff + 3, 1, Math.max(1, ghH - 6), '#1e293b');
        rect(insetX + 1, yStart + topOff + ghH - 3, ghW - 2, 3, '#1e293b');

        if (hasStripe && z === 8) {
          rect(7, yStart + topOff, 4, ghH, '#f8fafc');
          rect(insetX + 1, yStart + topOff, ghW - 2, 3, glassCol);
        }
      }

      if (hasWing && !isVan && !isPickup) {
        if (z <= 9) {
          rect(xPad + 1, yEnd - 4, 2, 3, pal.main);
          rect(W - xPad - 3, yEnd - 4, 2, 3, pal.main);
        } else {
          rect(xPad, yEnd - 4, bodyW, 3, pal.light);
          rect(xPad, yEnd - 4, bodyW, 1, pal.dark);
        }
      }
    }

    // Slices 11-14: Roof crown
    else {
      const step = z - 11;
      if (isPickup) {
        if (step <= 2) {
          rect(xPad + 2, yStart + 4 + step, bodyW - 4, Math.max(2, 6 - step), pal.light);
        }
      } else if (isVan) {
        const inset = step >= 2 ? 2 : 1;
        rect(xPad + inset, yStart + 2 + step, bodyW - inset * 2, Math.max(4, bodyH - 4 - step * 2), step >= 2 ? pal.light : pal.main);
      } else if (isSuper && step === 3) {
        // Low sleek supercars stop slightly lower than tall SUVs!
        rect(6, yStart + 13, 6, 4, pal.light);
      } else {
        const insetX = step >= 2 ? xPad + 3 : xPad + 2;
        const rTop = yStart + (isSUV || isMicro ? 7 : 10) + step;
        const rBot = yEnd - (isSUV || isMicro ? 4 : 8) - step;
        const rH = Math.max(2, rBot - rTop);
        const rW = Math.max(4, W - insetX * 2);
        rect(insetX, rTop, rW, rH, step >= 2 ? pal.light : pal.main);

        if (step === 0) {
          rect(insetX + 1, rTop, rW - 2, 2, '#475569');
        }
        if (hasStripe) {
          rect(7, rTop, 4, rH, '#ffffff');
        }
        if ((shape === 'malibu' || shape === 'suv') && step === 2) {
          rect(6, rTop + 1, W - 12, Math.max(2, rH - 3), '#1e293b');
        }
        if (hasWing && step === 0) {
          rect(xPad, yEnd - 4, bodyW, 2, pal.light);
        }
      }
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
