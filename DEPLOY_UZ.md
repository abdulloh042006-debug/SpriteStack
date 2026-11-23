# SpriteStack Poyga — GitHub Actions (APK) va Render.com (Bepul Server) Qo‘llanmasi

Shaxsiy domen ham, Android Studio ham kerak emas. Quyidagi 3 ta qadam yetarli:

## 1. Loyihani GitHub’ga yuklash va APK olish
1. GitHub’da yangi repozitoriy yarating (masalan, `spritestack-poyga`).
2. Ushbu papkadagi barcha fayllarni (`.github/`, `public/`, `src/`, `server/`, `package.json`, `capacitor.config.json`, `render.yaml`) GitHub’ga yuklang (`main` branch’ga).
3. GitHub’da **Actions** bo‘limiga kiring → **Build SpriteStack Poyga APK** ishga tushadi (~3–4 daqiqa).
4. Tugagach, pastdagi **Artifacts** bo‘limidan **`SpriteStackPoyga-APK`** faylini yuklab oling va telefonga o‘rnating.
   - Barcha **31 608 ta avtomobil** (`public/data/world_vehicles_compact.json`) APK ichida bo‘ladi — **internetsiz ham** to‘liq ishlaydi!

## 2. Domensiz bepul onlayn multiplayer server (Render.com)
1. [Render.com](https://render.com) saytiga GitHub orqali kiring.
2. **New + → Blueprint** (yoki **Web Service**) ni bosing va `spritestack-poyga` repozitoriyingizni tanlang.
3. Render `render.yaml` faylini avtomatik o‘qiydi va **Free** tarifda ishga tushiradi.
4. Tayyor bo‘lgach, sizga bepul doimiy manzil beriladi, masalan:
   `https://spritestack-poyga-server.onrender.com`

## 3. APK’ni serverga ulash
1. Telefonda **SpriteStack Poyga** APK’ni oching → **Multiplayer** bo‘limiga kiring.
2. Server manzili maydoniga Render bergan manzilni `wss://` ko‘rinishida yozing:
   `wss://spritestack-poyga-server.onrender.com`
3. Xona yarating, 6 xonali kod yoki QR orqali 4 kishigacha onlayn poyga o‘ynang!

*(Eslatma: Render Free tarifda 15 daqiqa hech kim kirmasa server uxlaydi va birinchi ulanishda ~1 daqiqada uyg‘onadi; poyga davomida uxlamaydi.)*
