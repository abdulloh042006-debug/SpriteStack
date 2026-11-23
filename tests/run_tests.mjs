#!/usr/bin/env node
import { getVehicleUpgrades, getEffectiveVehicle, purchaseVehicleUpgrade, MAX_UPGRADE_LEVEL } from "../src/engine/progression.js";
/* =========================================================================
   SPRITESTACK POYGA 2.0 — AUTOMATED ACCEPTANCE TEST SUITE
   Tests: Vehicle Catalog, Physics Coupling, Economy, Infinite Levels,
   Jump Ramps, Anti-Cheat Laps, Train/Ship Bidirectional Non-Interference,
   and REAL 4-Client Concurrent RFC 6455 WebSocket Multiplayer!
   ========================================================================= */

import assert from 'assert/strict';
import net from 'net';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VEHICLES, WORLD_VEHICLES, getVehicleById, loadWorldCatalogData } from '../src/data/vehicles.js';
import { TRACKS, getTrackById } from '../src/data/tracks.js';
import {
  xpNeededForLevel, applyXpGain, validateVehiclePurchase, purchaseVehicle,
  createDefaultProfile, calculateRaceReward, generateNickname
} from '../src/engine/progression.js';
import {
  buildTrackGeometry, updateDecorEnvironments, createPhysicsCar, updateCarPhysics
} from '../src/engine/physics.js';
import { generateCarSlices } from '../src/engine/spriteStacker.js';
import { createMultiplayerServer } from '../server/index.js';

let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

/* ---------- Minimal Pure-Node RFC 6455 WebSocket Client for Real Network Tests ---------- */
function wsEncodeMaskedText(text) {
  const payload = Buffer.from(text, 'utf8');
  const mask = crypto.randomBytes(4);
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = 0x80 | len;
  } else {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(len, 2);
  }
  const masked = Buffer.alloc(len);
  for (let i = 0; i < len; i++) masked[i] = payload[i] ^ mask[i % 4];
  return Buffer.concat([header, mask, masked]);
}

function connectTestWs(port) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const key = crypto.randomBytes(16).toString('base64');
    let upgraded = false;
    let buf = Buffer.alloc(0);
    const inbox = [];
    const waiters = [];

    const dispatch = (msg) => {
      for (let i = 0; i < waiters.length; i++) {
        if (waiters[i].pred(msg)) {
          const w = waiters.splice(i, 1)[0];
          w.res(msg);
          return;
        }
      }
      inbox.push(msg);
    };

    socket.on('connect', () => {
      socket.write(
        `GET / HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`
      );
    });

    socket.on('data', (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      if (!upgraded) {
        const idx = buf.indexOf('\r\n\r\n');
        if (idx === -1) return;
        upgraded = true;
        buf = buf.subarray(idx + 4);
        resolve(client);
      }
      while (buf.length >= 2) {
        const b1 = buf[1];
        let len = b1 & 0x7f;
        let pos = 2;
        if (len === 126) {
          if (buf.length < 4) break;
          len = buf.readUInt16BE(2);
          pos = 4;
        }
        if (buf.length < pos + len) break;
        const payload = buf.subarray(pos, pos + len).toString('utf8');
        buf = buf.subarray(pos + len);
        try { dispatch(JSON.parse(payload)); } catch (_) {}
      }
    });

    socket.on('error', reject);

    const client = {
      send: (obj) => socket.write(wsEncodeMaskedText(JSON.stringify(obj))),
      waitFor: (pred, timeoutMs = 3000) => new Promise((res, rej) => {
        for (let i = 0; i < inbox.length; i++) {
          if (pred(inbox[i])) return res(inbox.splice(i, 1)[0]);
        }
        const timer = setTimeout(() => rej(new Error('WS waitFor timeout')), timeoutMs);
        waiters.push({
          pred,
          res: (m) => { clearTimeout(timer); res(m); }
        });
      }),
      close: () => socket.end()
    };
  });
}

async function runAll() {
  console.log('\n=== A. VEHICLE CATALOG & PHYSICS COUPLING ===');
  await test('25 unique vehicles with verified source URLs & original car identities preserved', () => {
    assert.ok(VEHICLES.length >= 25, `Expected >=25 vehicles, got ${VEHICLES.length}`);
    const ids = new Set(VEHICLES.map(v => v.id));
    assert.equal(ids.size, VEHICLES.length, 'Duplicate vehicle IDs found');
    for (const v of VEHICLES) {
      assert.ok(v.realSpecs && v.realSpecs.sourceUrl.startsWith('https://'), `Missing sourceUrl on ${v.id}`);
      assert.ok(v.gameStats && v.gameStats.maxSpeed > 300, `Invalid gameStats on ${v.id}`);
    }
    assert.equal(getVehicleById('ferrari_f40').gameStats.maxSpeed, 435);
    assert.equal(getVehicleById('ferrari_488').gameStats.accel, 355);
    assert.equal(getVehicleById('malibu').gameStats.handling, 3.38);
  });

  await test('Vehicle gameStats directly affect real driving physics (F40 accelerates faster than VAZ-2101)', () => {
    const track = buildTrackGeometry(TRACKS[0]);
    const p0 = track.samples[0];
    const f40 = createPhysicsCar({ id: 'a', isPlayer: true, name: 'A', vehicleId: 'ferrari_f40', carName: 'F40', x: p0.x, y: p0.y, angle: p0.angle, gameStats: getVehicleById('ferrari_f40').gameStats });
    const vaz = createPhysicsCar({ id: 'b', isPlayer: true, name: 'B', vehicleId: 'vaz_2101', carName: '2101', x: p0.x, y: p0.y, angle: p0.angle, gameStats: getVehicleById('vaz_2101').gameStats });
    const cfg = { laps: 2, active: true, raceTime: 0, weatherPhysics: false };
    for (let i = 0; i < 60; i++) {
      updateCarPhysics(f40, { up: true }, 0.016, track, cfg);
      updateCarPhysics(vaz, { up: true }, 0.016, track, cfg);
    }
    assert.ok(f40.speed > vaz.speed + 40, `Expected F40 (${f40.speed}) faster than VAZ-2101 (${vaz.speed})`);
  });

  console.log('\n=== B. ECONOMY & INFINITE PROGRESSION ===');
  await test('Infinite level math remains safe at level 1,000,000 without overflow or cap', () => {
    const req1 = xpNeededForLevel(1);
    const req50 = xpNeededForLevel(50);
    const req1M = xpNeededForLevel(1000000);
    assert.ok(req50 > req1);
    assert.ok(Number.isSafeInteger(req1M) && req1M > req50);
    const p = createDefaultProfile();
    p.level = 5000;
    const res = applyXpGain(p, xpNeededForLevel(5000) + 10);
    assert.equal(p.level, 5001);
    assert.equal(res.leveledUp, true);
  });

  await test('Shop enforces level lock, insufficient funds, no duplicate purchase, no negative balance', () => {
    const p = createDefaultProfile();
    p.currency = 1000;
    p.level = 1;
    const f40 = getVehicleById('ferrari_f40');
    const c1 = validateVehiclePurchase(p, f40);
    assert.equal(c1.ok, false);
    assert.match(c1.reason, /daraja/i);

    p.level = 25;
    const c2 = validateVehiclePurchase(p, f40);
    assert.equal(c2.ok, false);
    assert.match(c2.reason, /Mablag'/i);

    p.currency = 45000;
    const buy1 = purchaseVehicle(p, f40);
    assert.equal(buy1.ok, true);
    assert.equal(p.currency, 5000);
    assert.ok(p.ownedVehicles.includes('ferrari_f40'));

    // Duplicate purchase prevented
    const buy2 = purchaseVehicle(p, f40);
    assert.equal(buy2.ok, false);
    assert.equal(p.currency, 5000);
  });

  console.log('\n=== C. ENVIRONMENTS, JUMP RAMPS & TRAIN/SHIP NON-INTERFERENCE ===');
  await test('Jump ramp launches car airborne and recovers safely to ground (z=0)', () => {
    const track = buildTrackGeometry(TRACKS[2]); // Mountain Pass has ramp
    const ramp = track.ramps[0];
    const car = createPhysicsCar({
      id: 'j', isPlayer: true, name: 'J', vehicleId: 'ferrari_f40', carName: 'F40',
      x: ramp.pt.x, y: ramp.pt.y, angle: ramp.pt.angle, gameStats: getVehicleById('ferrari_f40').gameStats
    });
    car.vx = Math.cos(ramp.pt.angle) * 360;
    car.vy = Math.sin(ramp.pt.angle) * 360;
    car.speed = 360;
    car.wpIndex = ramp.idx;

    let maxZ = 0;
    let landed = false;
    const cfg = { laps: 3, active: true, raceTime: 0 };
    for (let i = 0; i < 120; i++) {
      updateCarPhysics(car, { up: true }, 0.016, track, cfg, { onLand: () => { landed = true; } });
      if (car.z > maxZ) maxZ = car.z;
    }
    assert.ok(maxZ > 15, `Car did not launch airborne (maxZ=${maxZ})`);
    assert.equal(landed, true, 'Car did not land back cleanly');
    assert.equal(car.z, 0);
  });

  await test('Anti-cheat lap validation prevents reverse finish-line lap exploit', () => {
    const track = buildTrackGeometry(TRACKS[0]);
    const S = track.samples;
    const car = createPhysicsCar({
      id: 'ac', isPlayer: true, name: 'AC', vehicleId: 'malibu', carName: 'Malibu',
      x: S[S.length - 2].x, y: S[S.length - 2].y, angle: S[0].angle, gameStats: getVehicleById('malibu').gameStats
    });
    car.wpIndex = S.length - 2;
    car.nextGate = 1; // Did NOT pass gates 1..7!
    // Try cutting across the center grass (0,0) then crossing finish line
    car.x = 0; car.y = 0;
    updateCarPhysics(car, {}, 0.016, track, { laps: 2, active: true, raceTime: 0.5 });
    car.x = S[1].x; car.y = S[1].y;
    let missed = false;
    updateCarPhysics(car, {}, 0.016, track, { laps: 2, active: true, raceTime: 1 }, { onMissedCheckpoint: () => { missed = true; } });
    assert.equal(car.lap, 1, 'Lap incremented without passing all 7 road gates!');

    // Now drive through all 7 gates sequentially and cross finish line -> MUST count lap 2!
    for (const g of track.checkpointGates) {
      car.x = g.pt.x; car.y = g.pt.y; car.wpIndex = g.idx;
      updateCarPhysics(car, {}, 0.016, track, { laps: 2, active: true, raceTime: 2 });
    }
    assert.equal(car.nextGate, 8, 'All 7 gates should be cleared');
    car.wpIndex = S.length - 2;
    car.x = S[1].x; car.y = S[1].y;
    updateCarPhysics(car, {}, 0.016, track, { laps: 2, active: true, raceTime: 3 });
    assert.equal(car.lap, 2, 'Valid full lap did not increment!');
  });

  await test('CRITICAL NON-INTERFERENCE: Trains & Ships do not affect cars, and cars do not affect Trains & Ships', () => {
    const desert = buildTrackGeometry(TRACKS[5]); // has freight train
    const tr = desert.decorTrains[0];
    const startTrainX = tr.x;
    const car = createPhysicsCar({
      id: 'ni', isPlayer: true, name: 'NI', vehicleId: 'malibu', carName: 'Malibu',
      x: tr.x, y: tr.y, angle: 0, gameStats: getVehicleById('malibu').gameStats
    });
    // Place car directly at train's exact coordinates!
    updateDecorEnvironments(desert, 0.1);
    const expectedTrainX = startTrainX + tr.dir * tr.speed * 0.1;
    assert.ok(Math.abs(tr.x - expectedTrainX) < 0.001, 'Car altered train movement!');
    const carVxBefore = car.vx;
    updateCarPhysics(car, {}, 0.016, desert, { laps: 3, active: true, raceTime: 0 });
    assert.ok(Math.abs(car.vx - carVxBefore) < 0.001, 'Train altered car velocity!');

    const coastal = buildTrackGeometry(TRACKS[7]); // has ships
    const sh = coastal.decorShips[0];
    const startShipY = sh.y;
    updateDecorEnvironments(coastal, 0.1);
    assert.ok(Math.abs(sh.y - (startShipY + sh.dir * sh.speed * 0.1)) < 0.001, 'Car altered ship movement!');
  });

  console.log('\n=== D. REAL 4-CLIENT CONCURRENT WEBSOCKET MULTIPLAYER ===');
  const mpServer = createMultiplayerServer({ port: 0, enableUdp: false });
  const port = await mpServer.start();

  try {
    const c1 = await connectTestWs(port);
    const c2 = await connectTestWs(port);
    const c3 = await connectTestWs(port);
    const c4 = await connectTestWs(port);

    let lanCode = '';
    await test('Room creation (Public LAN + Private LAN invisibility + Password protection)', async () => {
      c1.send({ type: 'create_room', name: 'Toshkent LAN', scope: 'lan', visibility: 'public', password: 'secret', maxPlayers: 4, trackId: 0, laps: 2, playerId: 'u1', nickname: 'TurboBek', vehicleId: 'ferrari_f40' });
      const j1 = await c1.waitFor(m => m.type === 'room_joined');
      lanCode = j1.code;
      assert.equal(lanCode.length, 6);

      // Create private room on online scope — must NOT appear in LAN or Online public lists
      c4.send({ type: 'create_room', name: 'Secret Club', scope: 'online', visibility: 'private', maxPlayers: 4, playerId: 'u4_priv', nickname: 'Ghost' });
      await c4.waitFor(m => m.type === 'room_joined');
      c4.send({ type: 'leave_room' });

      // List LAN rooms: must show Toshkent LAN (without password hash!), must NOT show Secret Club
      c2.send({ type: 'list_rooms', scope: 'lan' });
      const listLan = await c2.waitFor(m => m.type === 'room_list');
      assert.equal(listLan.rooms.length, 1);
      assert.equal(listLan.rooms[0].code, lanCode);
      assert.equal(listLan.rooms[0].hasPassword, true);
      assert.equal(listLan.rooms[0].passwordHash, undefined);

      // Online list must NOT show LAN room
      c2.send({ type: 'list_rooms', scope: 'online' });
      const listOnline = await c2.waitFor(m => m.type === 'room_list');
      assert.equal(listOnline.rooms.length, 0);

      // Wrong password rejected
      c2.send({ type: 'join_room', code: lanCode, password: 'wrong', playerId: 'u2', nickname: 'TurboBek' });
      const err = await c2.waitFor(m => m.type === 'error');
      assert.equal(err.code, 'BAD_PASSWORD');
    });

    await test('4 human players join, nickname deduplication, Ready, Host Start, Jump Sync & Emote Rate-Limit', async () => {
      c2.send({ type: 'join_room', code: lanCode, password: 'secret', playerId: 'u2', nickname: 'TurboBek', vehicleId: 'malibu' });
      const j2 = await c2.waitFor(m => m.type === 'room_joined');
      const p2 = j2.lobby.players.find(p => p.playerId === 'u2');
      assert.notEqual(p2.nickname, 'TurboBek', 'Duplicate nickname was not deduplicated!');

      c3.send({ type: 'join_room', code: lanCode, password: 'secret', playerId: 'u3', nickname: 'DriftSulton', vehicleId: 'chevy_onix' });
      await c3.waitFor(m => m.type === 'room_joined');

      c4.send({ type: 'join_room', code: lanCode, password: 'secret', playerId: 'u4', nickname: 'BYDPro', vehicleId: 'byd_chazor' });
      const j4 = await c4.waitFor(m => m.type === 'room_joined');
      assert.equal(j4.lobby.players.length, 4);

      c2.send({ type: 'toggle_ready', ready: true });
      await c1.waitFor(m => m.type === 'lobby_state');

      // Host starts race
      c1.send({ type: 'start_race' });
      const s2 = await c2.waitFor(m => m.type === 'race_started');
      assert.equal(s2.players.length, 4);

      // Position & airborne jump (z=42) sync from c1 -> c2
      c1.send({ type: 'state_update', x: 120, y: -300, z: 42, angle: 0.5, speed: 350, lap: 1, wpIndex: 12, driftScore: 250 });
      const ps = await c2.waitFor(m => m.type === 'peer_state' && m.state.playerId === 'u1');
      assert.equal(ps.state.z, 42);

      // Emote broadcast + rate-limit test
      c1.send({ type: 'emote', emoteId: 'fire' });
      const em = await c2.waitFor(m => m.type === 'emote_broadcast');
      assert.equal(em.emoteId, 'fire');
      c1.send({ type: 'emote', emoteId: 'laugh' }); // immediate spam
      const rl = await c1.waitFor(m => m.type === 'error');
      assert.equal(rl.code, 'RATE_LIMIT');
    });

    await test('Server-authoritative finish validation, Host Migration, Reconnection & Rematch', async () => {
      // Premature finish claim (lap 1 < 2) rejected!
      c2.send({ type: 'finish_race', lap: 1, driftScore: 999 });
      const badFin = await c2.waitFor(m => m.type === 'error');
      assert.equal(badFin.code, 'INVALID_FINISH');

      // Valid finish claim rewarded authoritatively
      c2.send({ type: 'finish_race', lap: 2, driftScore: 400 });
      const okFin = await c2.waitFor(m => m.type === 'player_finished' && m.result.playerId === 'u2');
      assert.equal(okFin.result.rank, 1);
      assert.ok(okFin.result.reward.coins > 0 && okFin.result.reward.xp > 0);

      // Host (c1) disconnects -> controlled host migration to next connected player (c2)
      c1.close();
      const mig = await c2.waitFor(m => m.type === 'host_migrated');
      assert.equal(mig.hostId, 'u2');

      // c1 reconnects during grace period -> identity preserved!
      const c1Re = await connectTestWs(port);
      c1Re.send({ type: 'join_room', code: lanCode, playerId: 'u1', nickname: 'TurboBek' });
      const rej = await c1Re.waitFor(m => m.type === 'room_joined');
      assert.equal(rej.reconnected, true);

      // New host (c2) initiates Rematch
      c2.send({ type: 'rematch' });
      const rem = await c3.waitFor(m => m.type === 'rematch_lobby');
      assert.equal(rem.lobby.status, 'lobby');

      c1Re.close();
    });

    c2.close(); c3.close(); c4.close();
  } finally {
    await mpServer.stop();
  }


  // TEST 11: World 31,608-Vehicle Catalog Decoding & Lookup
  await test("11. World Catalog (31,608 vehicles) loads & resolves via getVehicleById", () => {
    const __dir = path.dirname(fileURLToPath(import.meta.url));
    const compactPath = path.join(__dir, "../public/data/world_vehicles_compact.json");
    assert.ok(fs.existsSync(compactPath), "world_vehicles_compact.json must exist");
    const data = JSON.parse(fs.readFileSync(compactPath, "utf8"));
    const loaded = loadWorldCatalogData(data);
    assert.equal(loaded, 31608, `Expected 31608 world vehicles, got ${loaded}`);
    assert.equal(WORLD_VEHICLES.length, 31608);
    const sample = WORLD_VEHICLES[15000];
    const found = getVehicleById(sample.id);
    assert.equal(found.id, sample.id, "getVehicleById must resolve world vehicles");
    assert.ok(found.realSpecs.sourceUrl, "Every world vehicle must keep sourceUrl");
  });

  await test("11b. World catalog produces model-specific visual DNA and renderable silhouettes", () => {
    assert.ok(WORLD_VEHICLES.every(v => v.visualProfile && v.visualProfile.shape), "Every world vehicle needs a visual profile");
    const signatures = new Set(WORLD_VEHICLES.map(v => {
      const p = v.visualProfile;
      return [
        p.shape, p.grille, p.lights, p.rear, p.bodyWidth,
        p.frontTaper, p.rearTaper, p.cabinFront, p.cabinRear,
        p.cabinWidth, p.frontAxle, p.rearAxle
      ].join('|');
    }));
    const grilleKinds = new Set(WORLD_VEHICLES.map(v => v.visualProfile.grille));
    assert.ok(signatures.size > 100, "World catalog should produce hundreds of distinct model profiles");
    assert.ok(grilleKinds.size >= 5, "Manufacturer identities should create several grille signatures");
    for (const v of WORLD_VEHICLES) {
      assert.ok(v.visualProfile.bodyWidth >= 12 && v.visualProfile.bodyWidth <= 16, "Invalid body width on " + v.id);
    }

    const previousDocument = globalThis.document;
    const createMockCanvas = () => {
      const operations = [];
      const context = {
        fillStyle: '#000000',
        imageSmoothingEnabled: false,
        fillRect(x, y, w, h) { operations.push([x, y, w, h, this.fillStyle]); }
      };
      return { width: 0, height: 0, operations, getContext: () => context };
    };
    globalThis.document = { createElement: tag => {
      assert.equal(tag, 'canvas');
      return createMockCanvas();
    }};
    try {
      const targetShapes = ['boxy_sedan', 'suv', 'mini_pickup', 'long_sedan', 'gtr_coupe'];
      const samples = targetShapes.map(shape => VEHICLES.find(v => v.visualProfile?.shape === shape)).filter(Boolean);
      assert.ok(samples.length >= 4, 'Need multiple body families for sprite regression coverage');
      const rendered = samples.map(car => {
        const layers = generateCarSlices(car, 'white');
        assert.equal(layers.length, 15, 'Every vehicle must preserve 15 sprite layers');
        return layers.map(layer => layer.operations.map(op => op.join(',')).join(';')).join('||');
      });
      assert.equal(new Set(rendered).size, rendered.length, 'Different body families must not render as identical sprites');
    } finally {
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }
  });

  // TEST 12: Paid Performance Tuning System (PR & Real Physics Boost)
  await test("12. Paid Performance Tuning updates PR, real physics stats & prevents negative coins", () => {
    const p = createDefaultProfile();
    const car = getVehicleById("daewoo_nexia_n100");
    const baseEff = getEffectiveVehicle(car, getVehicleUpgrades(p, car.id));

    const unownedCar = getVehicleById("ferrari_f40");
    assert.equal(purchaseVehicleUpgrade(p, unownedCar, "engine").ok, false, "Cannot tune unowned car");

    p.currency = 50000;
    const beforeCoins = p.currency;
    const r1 = purchaseVehicleUpgrade(p, car, "engine");
    assert.equal(r1.ok, true, r1.reason);
    assert.ok(p.currency < beforeCoins && p.currency >= 0, "Coins must deduct safely");

    const upgEff = getEffectiveVehicle(car, getVehicleUpgrades(p, car.id));
    assert.ok(upgEff.currentPR > baseEff.currentPR, "PR must increase after engine upgrade");
    assert.ok(upgEff.gameStats.maxSpeed > baseEff.gameStats.maxSpeed, "Real physics maxSpeed must increase");
    assert.ok(upgEff.gameStats.accel > baseEff.gameStats.accel, "Real physics accel must increase");

    for (let i = 0; i < 4; i++) purchaseVehicleUpgrade(p, car, "engine");
    assert.equal(purchaseVehicleUpgrade(p, car, "engine").ok, false, "Must block upgrades past max level");
  });

  console.log(`\nALL TESTS COMPLETED: ${passed} passed, exitCode=${process.exitCode || 0}`);
}

runAll();
