# SpriteStack Poyga 2.0 — O'zbekiston Avto Tarixi & Multiplayer

15 qatlamli 2.5D piksel-art (*Sprite-Stacking*) poyga o'yini, 25 ta tasdiqlangan avtomobil, 10 ta dinamik trassa va nol-bog'liqlikli (zero-dependency) Node.js WebSocket + UDP LAN Multiplayer serveri.

## Tezkor Ishga Tushirish (Nol `npm install`!)

Talab qilinadi: **Node.js 18+** (hech qanday tashqi paket o'rnatish shart emas).

```bash
# 1. Serverni ishga tushirish (HTTP + WebSocket + UDP LAN Discovery)
node server/index.js
```

Server ishga tushgach terminalda quyidagi manzillar ko'rinadi:
- Kompyuterda ochish: `http://localhost:3000`
- Bitta Wi-Fi tarmog'idagi boshqa telefon/kompyuterdan ochish: `http://<SIZNING_LAN_IP>:3000`

## Avtomatlashtirilgan Testlarni Ishga Tushirish

```bash
node tests/run_tests.mjs
```

## Qayta Yig'ish (Single-File Build)

```bash
python3 build.py
```

## Onlayn (Internet) Joylashtirish
`server/index.js` standart `PORT` muhit o'zgaruvchisini qo'llab-quvvatlaydi (`PORT=8080 node server/index.js`). Uni istalgan bepul/ochiq Node.js xostingida (Render, Railway, Fly.io yoki o'z VPS serveringizda) HTTPS/WSS (`wss://...`) orqali ishga tushirishingiz mumkin.
