/* =========================================================================
   SPRITESTACK POYGA — PHYSICS, TRACK GEOMETRY, AI & ISOLATED ENVIRONMENTS
   Pure deterministic logic testable in both Browser and Node.js.
   CRITICAL: Trains & Ships are strictly isolated from car physics & AI.
   ========================================================================= */

export const AI_PERSONALITIES = [
  { id: 'afsona',     name: 'AFSONA BOT',    bonus: 1.03, brakeAgg: 1.04, driftPref: 1.0,  laneBias: 0 },
  { id: 'aggressive', name: 'TURBO ALISHER', bonus: 1.00, brakeAgg: 1.02, driftPref: 1.15, laneBias: -14 },
  { id: 'smooth',     name: 'SHAMOL BOT',    bonus: 0.99, brakeAgg: 0.98, driftPref: 0.85, laneBias: 10 },
  { id: 'drift',      name: 'DRIFT MASTER',  bonus: 0.97, brakeAgg: 0.96, driftPref: 1.35, laneBias: -8 },
  { id: 'defensive',  name: 'TEZKOR BOT',    bonus: 0.95, brakeAgg: 0.95, driftPref: 0.95, laneBias: 16 }
];

export function buildTrackGeometry(trackDef) {
  const pts = trackDef.controlPoints;
  const n = pts.length;
  const samples = [];
  const segSteps = 22;

  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    for (let s = 0; s < segSteps; s++) {
      const t = s / segSteps;
      const t2 = t * t;
      const t3 = t2 * t;
      const x = 0.5 * (
        (2 * p1[0]) +
        (-p0[0] + p2[0]) * t +
        (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
        (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3
      );
      const y = 0.5 * (
        (2 * p1[1]) +
        (-p0[1] + p2[1]) * t +
        (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
        (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3
      );
      samples.push({ x, y });
    }
  }

  const M = samples.length;
  let totalLen = 0;
  for (let i = 0; i < M; i++) {
    const prev = samples[(i - 1 + M) % M];
    const curr = samples[i];
    const next = samples[(i + 1) % M];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    curr.tx = dx / len;
    curr.ty = dy / len;
    curr.nx = -curr.ty;
    curr.ny = curr.tx;
    curr.angle = Math.atan2(curr.ty, curr.tx);

    const prev2 = samples[(i - 4 + M) % M];
    const next2 = samples[(i + 4) % M];
    const a1 = Math.atan2(curr.y - prev2.y, curr.x - prev2.x);
    const a2 = Math.atan2(next2.y - curr.y, next2.x - curr.x);
    let da = a2 - a1;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    curr.curvature = Math.abs(da);

    if (i > 0) totalLen += Math.hypot(curr.x - prev.x, curr.y - prev.y);
    curr.dist = totalLen;
    curr.inTunnel = false;
    curr.rampPower = 0;
  }

  // Mark tunnel segments
  const tunnels = (trackDef.tunnels || []).map(t => {
    const sIdx = Math.floor(t.startFrac * M);
    const eIdx = Math.floor(t.endFrac * M);
    for (let i = sIdx; i <= eIdx; i++) samples[i % M].inTunnel = true;
    return { ...t, startIdx: sIdx, endIdx: eIdx };
  });

  // Mark jump ramps
  const ramps = (trackDef.ramps || []).map(r => {
    const idx = Math.floor(r.frac * M) % M;
    for (let k = -2; k <= 2; k++) samples[(idx + k + M) % M].rampPower = r.power;
    return { idx, power: r.power, pt: samples[idx] };
  });

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of samples) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  // Trackside trees (skip water side)
  const halfW = trackDef.trackWidth / 2;
  const trees = [];
  let seed = (trackDef.id + 1) * 7919;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < 105; i++) {
    const tx = minX - 280 + rand() * (maxX - minX + 560);
    const ty = minY - 280 + rand() * (maxY - minY + 560);
    if (trackDef.water) {
      if (trackDef.water.side === 'east' && tx > trackDef.water.xEdge - 45) continue;
      if (trackDef.water.side === 'west' && tx < trackDef.water.xEdge + 45) continue;
    }
    let safe = true;
    for (let j = 0; j < M; j += 3) {
      if (Math.hypot(tx - samples[j].x, ty - samples[j].y) < halfW + 58) { safe = false; break; }
    }
    if (safe) trees.push({ x: tx, y: ty, scale: 1.9 + rand() * 0.75 });
  }

  // Strictly isolated decorative trains & ships (NEVER interact with cars!)
  const decorTrains = (trackDef.trains || []).map(tr => ({
    ...tr,
    x: tr.xStart,
    y: tr.y
  }));
  const decorShips = (trackDef.ships || []).map(sh => ({
    ...sh,
    x: sh.x,
    y: sh.yStart
  }));

  // 7 sequential anti-shortcut checkpoint gates along the actual road corridor
  const checkpointGates = [];
  for (let g = 1; g <= 7; g++) {
    const gIdx = Math.floor((g / 8) * M) % M;
    checkpointGates.push({ gate: g, idx: gIdx, pt: samples[gIdx] });
  }

  return {
    id: trackDef.id,
    theme: trackDef.theme,
    samples,
    checkpointGates,
    halfW,
    totalLen,
    tunnels,
    ramps,
    water: trackDef.water || null,
    decorTrains,
    decorShips,
    trees,
    bounds: { minX: minX - 220, maxX: maxX + 220, minY: minY - 220, maxY: maxY + 220 }
  };
}

/* Strictly isolated environmental update: ZERO access to race cars or AI */
export function updateDecorEnvironments(track, dt) {
  for (const tr of track.decorTrains) {
    tr.x += tr.dir * tr.speed * dt;
    if (tr.dir > 0 && tr.x > tr.xEnd) tr.x = tr.xStart;
    if (tr.dir < 0 && tr.x < tr.xEnd) tr.x = tr.xStart;
  }
  for (const sh of track.decorShips) {
    sh.y += sh.dir * sh.speed * dt;
    if (sh.dir > 0 && sh.y > sh.yEnd) sh.y = sh.yStart;
    if (sh.dir < 0 && sh.y < sh.yEnd) sh.y = sh.yStart;
  }
}

export function findNearestSample(car, track) {
  const S = track.samples;
  const M = S.length;
  let bestIdx = car.wpIndex || 0;
  let bestD2 = Infinity;
  for (let offset = -18; offset <= 24; offset++) {
    const idx = (bestIdx + offset + M) % M;
    const dx = car.x - S[idx].x;
    const dy = car.y - S[idx].y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD2) { bestD2 = d2; bestIdx = idx; }
  }
  if (bestD2 > 220 * 220) {
    for (let i = 0; i < M; i++) {
      const dx = car.x - S[i].x;
      const dy = car.y - S[i].y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) { bestD2 = d2; bestIdx = i; }
    }
  }
  return { idx: bestIdx, dist: Math.sqrt(bestD2), sample: S[bestIdx] };
}

export function createPhysicsCar(opts) {
  const gs = opts.gameStats;
  return {
    id: opts.id,
    isPlayer: Boolean(opts.isPlayer),
    isRemote: Boolean(opts.isRemote),
    name: opts.name,
    vehicleId: opts.vehicleId,
    carName: opts.carName,
    colorKey: opts.colorKey || 'rosso',
    x: opts.x,
    y: opts.y,
    z: 0,
    vz: 0,
    vx: 0,
    vy: 0,
    angle: opts.angle,
    speed: 0,
    // Directly coupled from vehicle.gameStats:
    maxSpeed: gs.maxSpeed,
    accel: gs.accel,
    handling: gs.handling,
    braking: gs.braking,
    driftControl: gs.driftControl,
    grip: gs.grip,
    weight: gs.weight,
    nitroEff: gs.nitroEff,
    offRoad: gs.offRoad,
    nitro: 100,
    nitroActive: false,
    drifting: false,
    onGrass: false,
    inTunnel: false,
    airborne: false,
    jumpCooldown: 0,
    jumpsCount: 0,
    driftScore: 0,
    lap: 1,
    wpIndex: opts.wpIndex || 0,
    nextGate: 1, // Strict 7-gate sequential corridor check (1..7 -> 8 ready for finish)
    totalProgress: 0,
    finished: false,
    eliminated: false,
    finishTime: 0,
    botSkill: opts.botSkill || null,
    personality: opts.personality || null,
    laneOffset: opts.laneOffset || 0
  };
}

export function updateCarPhysics(car, input, dt, track, raceConfig, callbacks = {}) {
  if (car.eliminated || car.isRemote) return;

  const nearest = findNearestSample(car, track);
  const M = track.samples.length;
  const prevIdx = car.wpIndex;
  car.wpIndex = nearest.idx;

  // Strict 7-gate sequential corridor validation:
  // Car MUST physically pass within the road corridor of gates 1..7 in order.
  // Cutting across the middle grass will NOT trigger gates or count a lap!
  const gateCorridor = track.halfW + 34;
  if (car.nextGate <= 7 && track.checkpointGates) {
    const gObj = track.checkpointGates[car.nextGate - 1];
    if (gObj) {
      const dg = Math.hypot(car.x - gObj.pt.x, car.y - gObj.pt.y);
      if (dg <= gateCorridor) {
        car.nextGate++;
      }
    }
  }
  const distToFinish = Math.hypot(car.x - track.samples[0].x, car.y - track.samples[0].y);
  const crossedForward = prevIdx > M * 0.82 && car.wpIndex < M * 0.18;
  if (crossedForward && distToFinish <= gateCorridor && !car.airborne) {
    if (car.nextGate >= 8) {
      car.nextGate = 1;
      car.lap++;
      if (callbacks.onLap) callbacks.onLap(car);
      if (car.lap > raceConfig.laps && !car.finished) {
        car.finished = true;
        car.finishTime = raceConfig.raceTime;
        if (callbacks.onFinish) callbacks.onFinish(car);
      }
    } else if (car.isPlayer && callbacks.onMissedCheckpoint) {
      callbacks.onMissedCheckpoint(car);
    }
  }

  const gateFloor = Math.max(0, car.nextGate - 1) * (M / 8);
  car.totalProgress = (car.lap - 1) * M + (car.nextGate >= 8 && car.wpIndex > M * 0.75 ? car.wpIndex : Math.min(car.wpIndex, gateFloor + M / 8));
  car.onGrass = !car.airborne && nearest.dist > track.halfW + 10;
  car.inTunnel = Boolean(nearest.sample.inTunnel);

  // Jump Ramp Detection & Airborne Physics (gravity + safe recovery)
  if (car.jumpCooldown > 0) car.jumpCooldown -= dt;
  if (!car.airborne && car.jumpCooldown <= 0 && nearest.sample.rampPower > 0 && car.speed > 175 && nearest.dist < track.halfW) {
    car.airborne = true;
    car.vz = nearest.sample.rampPower * Math.min(1.25, car.speed / 360);
    car.jumpsCount++;
    car.jumpCooldown = 1.4;
    if (callbacks.onJump) callbacks.onJump(car);
  }
  if (car.airborne) {
    car.z += car.vz * dt;
    car.vz -= 540 * dt; // Gravity
    if (car.z > 140) { car.z = 140; if (car.vz > 0) car.vz = 0; } // Anti-infinite airborne clamp
    if (car.z <= 0) {
      car.z = 0;
      car.vz = 0;
      car.airborne = false;
      if (callbacks.onLand) callbacks.onLand(car);
    }
  }

  let throttle = 0;
  let steer = 0;
  let wantDrift = false;
  let wantNitro = false;

  if (car.isPlayer && !car.finished && raceConfig.active) {
    throttle = (input.up ? 1 : 0) - (input.down ? 1 : 0);
    steer = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    wantDrift = Boolean(input.drift);
    wantNitro = Boolean(input.nitro) && car.nitro > 4 && throttle > 0;
  } else {
    // AI Driver (strictly ignores environmental trains & ships!)
    const sk = car.botSkill || { speedMul: 0.9, cornerBrake: 0.82, lookahead: 12, laneNoise: 12, nitroChance: 0.01 };
    const pers = car.personality || AI_PERSONALITIES[1];
    const lookIdx = (car.wpIndex + sk.lookahead) % M;
    const farIdx = (car.wpIndex + sk.lookahead + 10) % M;
    const targetPt = track.samples[lookIdx];
    const farPt = track.samples[farIdx];

    const noise = Math.sin(raceConfig.raceTime * 0.85 + car.laneOffset) * sk.laneNoise;
    const offset = (car.laneOffset + pers.laneBias) * 0.5 + noise;
    const tx = targetPt.x + targetPt.nx * offset;
    const ty = targetPt.y + targetPt.ny * offset;

    const desiredAngle = Math.atan2(ty - car.y, tx - car.x);
    let diff = desiredAngle - car.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    steer = Math.max(-1, Math.min(1, diff * 2.85));
    const curve = Math.max(targetPt.curvature, farPt.curvature);
    const cornerFactor = curve > 0.34 ? Math.min(1.0, sk.cornerBrake * pers.brakeAgg) : 1.0;
    const targetSpd = car.maxSpeed * sk.speedMul * pers.bonus * cornerFactor;

    if (car.speed < targetSpd) throttle = 1;
    else if (car.speed > targetSpd * 1.12) throttle = -0.55;
    else throttle = 0.25;

    wantDrift = Math.abs(diff) > (0.42 / pers.driftPref) && car.speed > 205;
    if (!car.finished && curve < 0.14 && car.nitro > 35 && Math.random() < sk.nitroChance) {
      car.nitroActive = true;
    }
    if (car.nitroActive && (curve > 0.28 || car.nitro < 5)) car.nitroActive = false;
    wantNitro = car.nitroActive && throttle > 0;
  }

  // Nitro management (regen: 6/s normal, 22/s drifting)
  if (wantNitro && car.nitro > 0 && !car.airborne) {
    car.nitroActive = true;
    car.nitro = Math.max(0, car.nitro - 36 * dt);
  } else {
    car.nitroActive = false;
    const regen = wantDrift && car.speed > 145 && !car.airborne ? 22 : 6;
    car.nitro = Math.min(100, car.nitro + regen * dt);
  }

  // Steering (reduced control while airborne!)
  const speedMag = Math.hypot(car.vx, car.vy);
  const steerStrength = Math.min(1, speedMag / 85) * (car.airborne ? 0.18 : 1.0);
  const dirSign = (car.vx * Math.cos(car.angle) + car.vy * Math.sin(car.angle)) >= -10 ? 1 : -1;
  const driftTurnBoost = wantDrift && !car.airborne ? 1.24 : 1.0;
  car.angle += steer * car.handling * driftTurnBoost * steerStrength * dirSign * dt;

  const fx = Math.cos(car.angle);
  const fy = Math.sin(car.angle);
  const rx = -fy;
  const ry = fx;

  let forwardVel = car.vx * fx + car.vy * fy;
  let lateralVel = car.vx * rx + car.vy * ry;

  const weatherGrip = raceConfig.weatherPhysics ? (raceConfig.weatherGripMul || 1.0) : 1.0;
  const nitroMult = car.nitroActive ? car.nitroEff : 1.0;
  const grassMult = car.onGrass ? car.offRoad : 1.0;
  const botMul = car.isPlayer ? 1.0 : ((car.botSkill ? car.botSkill.speedMul : 1.0) * (car.personality ? car.personality.bonus : 1.0));
  const effectiveMax = car.maxSpeed * nitroMult * grassMult * botMul;

  if (!car.airborne) {
    if (throttle > 0) {
      forwardVel += car.accel * throttle * (car.nitroActive ? 1.55 : 1.0) * dt;
    } else if (throttle < 0) {
      const brakeForce = forwardVel > 10 ? car.braking : car.accel * 0.75;
      forwardVel += brakeForce * throttle * dt;
    } else {
      forwardVel *= Math.pow(0.45, dt);
    }
    if (forwardVel > effectiveMax) {
      forwardVel += (effectiveMax - forwardVel) * Math.min(1, dt * 5);
    }
    if (forwardVel < -115) forwardVel = -115;

    const baseGrip = wantDrift ? Math.max(0.84, car.driftControl - 0.06) : car.grip;
    const finalGrip = Math.max(0.82, Math.min(0.985, (car.onGrass ? baseGrip - 0.04 : baseGrip) * weatherGrip));
    lateralVel *= Math.pow(finalGrip, dt * 60);
  }

  car.vx = fx * forwardVel + rx * lateralVel;
  car.vy = fy * forwardVel + ry * lateralVel;
  car.x += car.vx * dt;
  car.y += car.vy * dt;
  car.speed = Math.hypot(car.vx, car.vy);

  car.drifting = !car.airborne && (Math.abs(lateralVel) > 46 || (wantDrift && Math.abs(steer) > 0.2)) && car.speed > 130;
  if (car.drifting && !car.onGrass) {
    car.driftScore += Math.round((Math.abs(lateralVel) * 0.45 + car.speed * 0.12) * dt * 10);
  }
}

export function resolveCarCollisions(cars, onImpact) {
  const minDist = 28;
  for (let i = 0; i < cars.length; i++) {
    for (let j = i + 1; j < cars.length; j++) {
      const a = cars[i], b = cars[j];
      if (a.eliminated || b.eliminated) continue;
      if (Math.abs(a.z - b.z) > 18) continue; // Airborne car flies cleanly over ground cars!
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.01 && d < minDist) {
        const nx = dx / d;
        const ny = dy / d;
        const totalW = (a.weight || 1200) + (b.weight || 1200);
        const aShare = (b.weight || 1200) / totalW;
        const bShare = (a.weight || 1200) / totalW;
        const overlap = (minDist - d);
        a.x -= nx * overlap * aShare;
        a.y -= ny * overlap * aShare;
        b.x += nx * overlap * bShare;
        b.y += ny * overlap * bShare;

        const dvx = b.vx - a.vx;
        const dvy = b.vy - a.vy;
        const vn = dvx * nx + dvy * ny;
        if (vn < 0) {
          const imp = -vn * 1.25;
          a.vx -= nx * imp * aShare;
          a.vy -= ny * imp * aShare;
          b.vx += nx * imp * bShare;
          b.vy += ny * imp * bShare;
          if (onImpact) onImpact(a, b, Math.abs(vn));
        }
      }
    }
  }
}
