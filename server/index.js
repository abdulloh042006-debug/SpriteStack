#!/usr/bin/env node
/* =========================================================================
   SPRITESTACK POYGA — ZERO-DEPENDENCY MULTIPLAYER SERVER & LAN DISCOVERY
   Uses Node.js built-ins only (http, crypto, dgram, fs, path, os).
   Supports:
   - Real RFC 6455 WebSocket multiplayer (up to 4 human players per room)
   - Separate Local Wi-Fi (LAN) vs Online room scopes + UDP LAN Discovery
   - Public / Private / Password-protected rooms (salted SHA-256)
   - 6-char human-friendly room codes, Random Join, Reconnection, Host Migration
   - Server-authoritative lap/finish/reward validation & emote rate limiting
   ========================================================================= */

import http from 'http';
import crypto from 'crypto';
import dgram from 'dgram';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { calculateRaceReward } from '../src/engine/progression.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const LAN_UDP_PORT = Number(process.env.LAN_UDP_PORT || 41234);
const GRACE_MS = Number(process.env.RECONNECT_GRACE_MS || 30000);
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function hashPassword(password, salt) {
  if (!password) return null;
  const s = salt || crypto.randomBytes(8).toString('hex');
  const h = crypto.createHash('sha256').update(`${s}:${password}`).digest('hex');
  return `${s}$${h}`;
}

function verifyPassword(password, stored) {
  if (!stored) return true;
  if (!password) return false;
  const [salt] = stored.split('$');
  return hashPassword(password, salt) === stored;
}

function generateRoomCode(existingCodes) {
  for (let attempt = 0; attempt < 50; attempt++) {
    let code = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    if (!existingCodes.has(code)) return code;
  }
  return 'PX' + Date.now().toString(36).slice(-4).toUpperCase();
}

function getLocalLanIPs() {
  const ips = [];
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const net of ifaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
    }
  }
  return ips;
}

/* ---------- Minimal RFC 6455 WebSocket Helpers (Zero Dependencies) ---------- */
function wsEncodeText(text) {
  const payload = Buffer.from(text, 'utf8');
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, payload]);
}

function wsDecodeFrames(buffer) {
  const messages = [];
  let offset = 0;
  while (offset + 2 <= buffer.length) {
    const b0 = buffer[offset];
    const b1 = buffer[offset + 1];
    const opcode = b0 & 0x0f;
    const masked = (b1 & 0x80) !== 0;
    let payloadLen = b1 & 0x7f;
    let pos = offset + 2;

    if (payloadLen === 126) {
      if (pos + 2 > buffer.length) break;
      payloadLen = buffer.readUInt16BE(pos);
      pos += 2;
    } else if (payloadLen === 127) {
      if (pos + 8 > buffer.length) break;
      payloadLen = Number(buffer.readBigUInt64BE(pos));
      pos += 8;
    }

    const maskLen = masked ? 4 : 0;
    if (pos + maskLen + payloadLen > buffer.length) break;

    let payload = Buffer.alloc(payloadLen);
    if (masked) {
      const mask = buffer.subarray(pos, pos + 4);
      pos += 4;
      for (let i = 0; i < payloadLen; i++) {
        payload[i] = buffer[pos + i] ^ mask[i % 4];
      }
    } else {
      buffer.copy(payload, 0, pos, pos + payloadLen);
    }
    pos += payloadLen;
    offset = pos;

    if (opcode === 0x8) {
      messages.push({ type: 'close' });
    } else if (opcode === 0x9) {
      messages.push({ type: 'ping', data: payload });
    } else if (opcode === 0x1) {
      messages.push({ type: 'text', data: payload.toString('utf8') });
    }
  }
  return { messages, remaining: buffer.subarray(offset) };
}

/* ---------- Core Authoritative Multiplayer Server ---------- */
export function createMultiplayerServer(options = {}) {
  const port = options.port !== undefined ? options.port : PORT;
  const enableUdp = options.enableUdp !== false;
  const publicHtmlPath = options.publicHtmlPath || path.resolve(__dirname, '../public/index.html');

  const rooms = new Map(); // code -> room
  const peers = new Map(); // clientId -> { socket, playerId, roomCode, lastEmoteAt }
  const discoveredLanPeers = new Map(); // remoteUrl -> { rooms, lastSeen }

  function sendJson(socket, obj) {
    if (!socket || socket.destroyed) return;
    try {
      socket.write(wsEncodeText(JSON.stringify(obj)));
    } catch (_) {}
  }

  function broadcastRoom(room, obj, exceptPlayerId = null) {
    for (const p of room.players) {
      if (p.connected && p.socket && p.playerId !== exceptPlayerId) {
        sendJson(p.socket, obj);
      }
    }
  }

  function serializeRoomPublic(room) {
    return {
      code: room.code,
      name: room.name,
      scope: room.scope,
      visibility: room.visibility,
      hasPassword: Boolean(room.passwordHash),
      maxPlayers: room.maxPlayers,
      playerCount: room.players.filter(p => p.connected || p.reconnectUntil > Date.now()).length,
      trackId: room.settings.trackId,
      laps: room.settings.laps,
      weather: room.settings.weather,
      raceMode: room.settings.raceMode,
      aiEnabled: room.settings.aiEnabled,
      status: room.status,
      hostName: (room.players.find(p => p.playerId === room.hostId) || {}).nickname || 'Host'
    };
  }

  function serializeLobby(room) {
    return {
      code: room.code,
      name: room.name,
      scope: room.scope,
      visibility: room.visibility,
      hasPassword: Boolean(room.passwordHash),
      maxPlayers: room.maxPlayers,
      hostId: room.hostId,
      status: room.status,
      settings: room.settings,
      players: room.players.map(p => ({
        playerId: p.playerId,
        nickname: p.nickname,
        avatarSeed: p.avatarSeed,
        avatarColor: p.avatarColor,
        level: p.level,
        vehicleId: p.vehicleId,
        colorKey: p.colorKey,
        ready: p.ready,
        connected: p.connected,
        isHost: p.playerId === room.hostId
      }))
    };
  }

  function deduplicateNickname(room, baseName, playerId) {
    const clean = String(baseName || 'Poygachi').trim().slice(0, 18) || 'Poygachi';
    const others = new Set(room.players.filter(p => p.playerId !== playerId).map(p => p.nickname.toLowerCase()));
    if (!others.has(clean.toLowerCase())) return clean;
    for (let i = 2; i < 20; i++) {
      const cand = `${clean.slice(0, 15)}_${i}`;
      if (!others.has(cand.toLowerCase())) return cand;
    }
    return `${clean.slice(0, 12)}_${Math.floor(Math.random() * 99)}`;
  }

  function cleanupExpiredPlayers(room) {
    const now = Date.now();
    room.players = room.players.filter(p => p.connected || p.reconnectUntil > now);
    if (room.players.length === 0) {
      rooms.delete(room.code);
      return true;
    }
    // Controlled Host Migration if host disconnected and grace expired (or immediately if no connected host)
    const host = room.players.find(p => p.playerId === room.hostId);
    if (!host || !host.connected) {
      const nextHost = room.players.find(p => p.connected);
      if (nextHost && nextHost.playerId !== room.hostId) {
        room.hostId = nextHost.playerId;
        broadcastRoom(room, { type: 'host_migrated', hostId: room.hostId, hostName: nextHost.nickname });
        broadcastRoom(room, { type: 'lobby_state', lobby: serializeLobby(room) });
      }
    }
    return false;
  }

  function handleWsMessage(client, msg) {
    if (!msg || typeof msg !== 'object') return;
    const t = msg.type;

    if (t === 'list_rooms') {
      const scope = msg.scope === 'lan' ? 'lan' : 'online';
      const list = [];
      for (const room of rooms.values()) {
        cleanupExpiredPlayers(room);
        if (room.visibility === 'public' && room.scope === scope && room.status === 'lobby') {
          list.push(serializeRoomPublic(room));
        }
      }
      sendJson(client.socket, { type: 'room_list', scope, rooms: list });
      return;
    }

    if (t === 'create_room') {
      const code = generateRoomCode(rooms);
      const maxPlayers = Math.max(2, Math.min(4, Number(msg.maxPlayers) || 4));
      const scope = msg.scope === 'lan' ? 'lan' : 'online';
      const visibility = msg.visibility === 'private' ? 'private' : 'public';
      const playerId = String(msg.playerId || crypto.randomBytes(6).toString('hex'));

      const room = {
        code,
        name: String(msg.name || 'SpriteStack Arena').trim().slice(0, 32) || 'SpriteStack Arena',
        scope,
        visibility,
        passwordHash: msg.password ? hashPassword(String(msg.password)) : null,
        maxPlayers,
        hostId: playerId,
        status: 'lobby',
        settings: {
          trackId: Math.max(0, Math.min(9, Number(msg.trackId) || 0)),
          laps: Math.max(1, Math.min(20, Number(msg.laps) || 3)),
          aiEnabled: msg.aiEnabled !== false,
          aiCount: Math.max(0, Math.min(5, Number(msg.aiCount ?? 2))),
          weather: String(msg.weather || 'clear'),
          raceMode: String(msg.raceMode || 'classic'),
          collisions: msg.collisions !== false
        },
        players: [],
        results: new Map(), // playerId -> validated finish record
        raceStartedAt: 0
      };

      const player = {
        playerId,
        nickname: deduplicateNickname(room, msg.nickname, playerId),
        avatarSeed: Number(msg.avatarSeed) || 101,
        avatarColor: String(msg.avatarColor || '#ef233c'),
        level: Math.max(1, Number(msg.level) || 1),
        vehicleId: String(msg.vehicleId || 'daewoo_nexia_n100'),
        colorKey: String(msg.colorKey || 'rosso'),
        ready: true,
        connected: true,
        reconnectUntil: 0,
        socket: client.socket,
        lastState: null
      };
      room.players.push(player);
      rooms.set(code, room);
      client.playerId = playerId;
      client.roomCode = code;

      sendJson(client.socket, { type: 'room_joined', code, playerId, lobby: serializeLobby(room) });
      return;
    }

    if (t === 'join_room' || t === 'random_join') {
      let room = null;
      if (t === 'random_join') {
        const scope = msg.scope === 'lan' ? 'lan' : 'online';
        const candidates = [];
        for (const r of rooms.values()) {
          cleanupExpiredPlayers(r);
          if (r.visibility === 'public' && r.scope === scope && r.status === 'lobby') {
            const activeCount = r.players.filter(p => p.connected || p.reconnectUntil > Date.now()).length;
            if (activeCount < r.maxPlayers) candidates.push(r);
          }
        }
        // Prefer password-free rooms first
        candidates.sort((a, b) => Number(Boolean(a.passwordHash)) - Number(Boolean(b.passwordHash)));
        room = candidates.find(r => !r.passwordHash) || candidates[0] || null;
        if (!room) {
          sendJson(client.socket, { type: 'error', code: 'NO_ROOM', message: 'Mos ochiq xona topilmadi. Yangi xona yarating!' });
          return;
        }
      } else {
        const code = String(msg.code || '').toUpperCase().trim();
        room = rooms.get(code);
        if (!room) {
          sendJson(client.socket, { type: 'error', code: 'NOT_FOUND', message: 'Xona topilmadi yoki yopilgan.' });
          return;
        }
      }

      cleanupExpiredPlayers(room);
      const playerId = String(msg.playerId || crypto.randomBytes(6).toString('hex'));
      const existing = room.players.find(p => p.playerId === playerId);

      // Reconnection path (preserves identity, vehicle & race state)
      if (existing) {
        existing.connected = true;
        existing.socket = client.socket;
        existing.reconnectUntil = 0;
        client.playerId = playerId;
        client.roomCode = room.code;
        sendJson(client.socket, { type: 'room_joined', code: room.code, playerId, reconnected: true, lobby: serializeLobby(room) });
        broadcastRoom(room, { type: 'player_reconnected', playerId, nickname: existing.nickname }, playerId);
        broadcastRoom(room, { type: 'lobby_state', lobby: serializeLobby(room) });
        return;
      }

      if (room.status !== 'lobby') {
        sendJson(client.socket, { type: 'error', code: 'IN_PROGRESS', message: 'Bu xonada poyga allaqachon boshlangan.' });
        return;
      }
      if (room.players.length >= room.maxPlayers) {
        sendJson(client.socket, { type: 'error', code: 'ROOM_FULL', message: 'Xona to\'lgan (maks. 4 o\'yinchi).' });
        return;
      }
      if (room.passwordHash && !verifyPassword(msg.password, room.passwordHash)) {
        sendJson(client.socket, { type: 'error', code: 'BAD_PASSWORD', message: 'Parol noto\'g\'ri.' });
        return;
      }

      const player = {
        playerId,
        nickname: deduplicateNickname(room, msg.nickname, playerId),
        avatarSeed: Number(msg.avatarSeed) || 202,
        avatarColor: String(msg.avatarColor || '#38bdf8'),
        level: Math.max(1, Number(msg.level) || 1),
        vehicleId: String(msg.vehicleId || 'daewoo_nexia_n100'),
        colorKey: String(msg.colorKey || 'blue'),
        ready: false,
        connected: true,
        reconnectUntil: 0,
        socket: client.socket,
        lastState: null
      };
      room.players.push(player);
      client.playerId = playerId;
      client.roomCode = room.code;

      sendJson(client.socket, { type: 'room_joined', code: room.code, playerId, lobby: serializeLobby(room) });
      broadcastRoom(room, { type: 'lobby_state', lobby: serializeLobby(room) });
      return;
    }

    const room = client.roomCode ? rooms.get(client.roomCode) : null;
    if (!room) return;
    const player = room.players.find(p => p.playerId === client.playerId);
    if (!player) return;

    if (t === 'toggle_ready') {
      player.ready = msg.ready !== undefined ? Boolean(msg.ready) : !player.ready;
      broadcastRoom(room, { type: 'lobby_state', lobby: serializeLobby(room) });
      return;
    }

    if (t === 'select_vehicle') {
      player.vehicleId = String(msg.vehicleId || player.vehicleId);
      player.colorKey = String(msg.colorKey || player.colorKey);
      broadcastRoom(room, { type: 'lobby_state', lobby: serializeLobby(room) });
      return;
    }

    if (t === 'update_settings' && room.hostId === player.playerId && room.status === 'lobby') {
      if (msg.trackId !== undefined) room.settings.trackId = Math.max(0, Math.min(9, Number(msg.trackId)));
      if (msg.laps !== undefined) room.settings.laps = Math.max(1, Math.min(20, Number(msg.laps)));
      if (msg.weather !== undefined) room.settings.weather = String(msg.weather);
      if (msg.raceMode !== undefined) room.settings.raceMode = String(msg.raceMode);
      if (msg.aiEnabled !== undefined) room.settings.aiEnabled = Boolean(msg.aiEnabled);
      broadcastRoom(room, { type: 'lobby_state', lobby: serializeLobby(room) });
      return;
    }

    if (t === 'kick_player' && room.hostId === player.playerId) {
      const target = room.players.find(p => p.playerId === msg.targetId && p.playerId !== room.hostId);
      if (target) {
        sendJson(target.socket, { type: 'kicked', message: 'Host sizni xonadan chiqardi.' });
        room.players = room.players.filter(p => p.playerId !== target.playerId);
        broadcastRoom(room, { type: 'lobby_state', lobby: serializeLobby(room) });
      }
      return;
    }

    if (t === 'start_race' && room.hostId === player.playerId && room.status === 'lobby') {
      room.status = 'racing';
      room.results.clear();
      room.raceStartedAt = Date.now();
      broadcastRoom(room, {
        type: 'race_started',
        settings: room.settings,
        players: serializeLobby(room).players,
        startedAt: room.raceStartedAt
      });
      return;
    }

    if (t === 'state_update' && room.status === 'racing') {
      player.lastState = {
        playerId: player.playerId,
        x: Number(msg.x) || 0,
        y: Number(msg.y) || 0,
        z: Math.max(0, Math.min(150, Number(msg.z) || 0)),
        angle: Number(msg.angle) || 0,
        speed: Number(msg.speed) || 0,
        drifting: Boolean(msg.drifting),
        nitroActive: Boolean(msg.nitroActive),
        lap: Number(msg.lap) || 1,
        wpIndex: Number(msg.wpIndex) || 0,
        driftScore: Number(msg.driftScore) || 0
      };
      broadcastRoom(room, { type: 'peer_state', state: player.lastState }, player.playerId);
      return;
    }

    if (t === 'emote') {
      const now = Date.now();
      if (now - client.lastEmoteAt < 1200) {
        sendJson(client.socket, { type: 'error', code: 'RATE_LIMIT', message: 'Emote juda tez yuborildi.' });
        return;
      }
      client.lastEmoteAt = now;
      broadcastRoom(room, {
        type: 'emote_broadcast',
        playerId: player.playerId,
        nickname: player.nickname,
        emoteId: String(msg.emoteId || 'wave')
      });
      return;
    }

    if (t === 'finish_race' && room.status === 'racing') {
      // Server-authoritative validation: prevent duplicate finishes & invalid lap claims
      if (room.results.has(player.playerId)) return;
      const reportedLap = Number(msg.lap) || 0;
      if (reportedLap < room.settings.laps) {
        sendJson(client.socket, { type: 'error', code: 'INVALID_FINISH', message: 'Aylanishlar soni yetarli emas.' });
        return;
      }
      const finishTime = Math.max(1, (Date.now() - room.raceStartedAt) / 1000);
      const rank = room.results.size + 1;
      const totalRacers = room.players.length + (room.settings.aiEnabled ? room.settings.aiCount : 0);
      const reward = calculateRaceReward({
        rank,
        totalRacers,
        stageId: room.settings.trackId,
        laps: room.settings.laps,
        driftScore: Math.max(0, Math.min(50000, Number(msg.driftScore) || 0)),
        completed: true,
        isMultiplayer: true
      });
      const rec = {
        playerId: player.playerId,
        nickname: player.nickname,
        vehicleId: player.vehicleId,
        rank,
        finishTime: Number(finishTime.toFixed(2)),
        reward
      };
      room.results.set(player.playerId, rec);
      broadcastRoom(room, { type: 'player_finished', result: rec });

      const connectedCount = room.players.filter(p => p.connected).length;
      if (room.results.size >= connectedCount) {
        room.status = 'finished';
        broadcastRoom(room, { type: 'race_complete', results: Array.from(room.results.values()) });
      }
      return;
    }

    if (t === 'rematch' && room.hostId === player.playerId) {
      room.status = 'lobby';
      room.results.clear();
      for (const p of room.players) p.ready = (p.playerId === room.hostId);
      broadcastRoom(room, { type: 'rematch_lobby', lobby: serializeLobby(room) });
      return;
    }

    if (t === 'leave_room') {
      room.players = room.players.filter(p => p.playerId !== player.playerId);
      client.roomCode = null;
      if (!cleanupExpiredPlayers(room)) {
        broadcastRoom(room, { type: 'lobby_state', lobby: serializeLobby(room) });
      }
    }
  }

  function handleDisconnect(client) {
    peers.delete(client.id);
    if (!client.roomCode) return;
    const room = rooms.get(client.roomCode);
    if (!room) return;
    const player = room.players.find(p => p.playerId === client.playerId);
    if (player) {
      player.connected = false;
      player.socket = null;
      player.reconnectUntil = Date.now() + GRACE_MS;
      broadcastRoom(room, { type: 'player_disconnected', playerId: player.playerId, nickname: player.nickname, graceMs: GRACE_MS });
      cleanupExpiredPlayers(room);
    }
  }

  // HTTP server (serves single-file game + discovery JSON APIs)
  const server = http.createServer((req, res) => {
    const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (urlObj.pathname === '/api/info') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, port: server.address().port, lanIPs: getLocalLanIPs(), roomsCount: rooms.size }));
      return;
    }

    if (urlObj.pathname === '/api/rooms') {
      const scope = urlObj.searchParams.get('scope') === 'lan' ? 'lan' : 'online';
      const list = [];
      for (const room of rooms.values()) {
        cleanupExpiredPlayers(room);
        if (room.visibility === 'public' && room.scope === scope && room.status === 'lobby') {
          list.push(serializeRoomPublic(room));
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ scope, rooms: list }));
      return;
    }

    if (urlObj.pathname === '/data/world_vehicles_compact.json') {
      const dataPath = path.join(__dirname, '../public/data/world_vehicles_compact.json');
      if (fs.existsSync(dataPath)) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
        fs.createReadStream(dataPath).pipe(res);
        return;
      }
    }

    if (urlObj.pathname === '/' || urlObj.pathname === '/index.html') {
      if (fs.existsSync(publicHtmlPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(publicHtmlPath).pipe(res);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('SpriteStack Poyga Server running. Build public/index.html first.');
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  // WebSocket Upgrade Handler (RFC 6455)
  server.on('upgrade', (req, socket) => {
    const key = req.headers['sec-websocket-key'];
    if (!key) { socket.destroy(); return; }
    const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
    );

    const client = {
      id: crypto.randomBytes(6).toString('hex'),
      socket,
      playerId: null,
      roomCode: null,
      lastEmoteAt: 0,
      buf: Buffer.alloc(0)
    };
    peers.set(client.id, client);

    socket.on('data', (chunk) => {
      client.buf = Buffer.concat([client.buf, chunk]);
      const { messages, remaining } = wsDecodeFrames(client.buf);
      client.buf = remaining;
      for (const m of messages) {
        if (m.type === 'close') {
          socket.end();
          handleDisconnect(client);
          return;
        }
        if (m.type === 'ping') {
          const pong = Buffer.concat([Buffer.from([0x8a, m.data.length]), m.data]);
          socket.write(pong);
        } else if (m.type === 'text') {
          try {
            handleWsMessage(client, JSON.parse(m.data));
          } catch (_) {
            sendJson(socket, { type: 'error', code: 'BAD_JSON', message: 'Noto\'g\'ri xabar formati.' });
          }
        }
      }
    });

    const onDrop = () => { if (!client.dropped) { client.dropped = true; handleDisconnect(client); } };
    socket.on('end', () => { try { socket.destroy(); } catch (_) {} onDrop(); });
    socket.on('close', onDrop);
    socket.on('error', onDrop);
  });

  // UDP LAN Discovery Beacon (same Wi-Fi subnet auto-discovery)
  let udpSocket = null;
  let udpInterval = null;
  if (enableUdp) {
    try {
      udpSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
      udpSocket.on('error', () => {});
      udpSocket.on('message', (msg, rinfo) => {
        try {
          const pkt = JSON.parse(msg.toString('utf8'));
          if (pkt && pkt.app === 'spritestack_poyga') {
            discoveredLanPeers.set(`${rinfo.address}:${pkt.port}`, { rooms: pkt.rooms || [], lastSeen: Date.now() });
          }
        } catch (_) {}
      });
      udpSocket.bind(LAN_UDP_PORT, () => {
        try { udpSocket.setBroadcast(true); } catch (_) {}
      });
      udpInterval = setInterval(() => {
        const lanRooms = [];
        for (const r of rooms.values()) {
          if (r.visibility === 'public' && r.scope === 'lan' && r.status === 'lobby') {
            lanRooms.push(serializeRoomPublic(r));
          }
        }
        if (lanRooms.length > 0 && server.address()) {
          const payload = Buffer.from(JSON.stringify({ app: 'spritestack_poyga', port: server.address().port, rooms: lanRooms }));
          try { udpSocket.send(payload, 0, payload.length, LAN_UDP_PORT, '255.255.255.255'); } catch (_) {}
        }
      }, 2000);
    } catch (_) {}
  }

  return {
    server,
    rooms,
    start: () => new Promise((resolve) => {
      server.listen(port, '0.0.0.0', () => resolve(server.address().port));
    }),
    stop: () => new Promise((resolve) => {
      if (udpInterval) clearInterval(udpInterval);
      if (udpSocket) { try { udpSocket.close(); } catch (_) {} }
      for (const c of peers.values()) { try { c.socket.destroy(); } catch (_) {} }
      server.close(() => resolve());
    })
  };
}

// Direct CLI execution
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const mp = createMultiplayerServer();
  mp.start().then((actualPort) => {
    const ips = getLocalLanIPs();
    console.log(`SpriteStack Poyga Server ishga tushdi: http://localhost:${actualPort}`);
    for (const ip of ips) console.log(`  Mahalliy Wi-Fi (LAN) manzili: http://${ip}:${actualPort}`);
    console.log(`  UDP LAN Discovery porti: ${LAN_UDP_PORT}`);
  });
}
