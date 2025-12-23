# 🚀 SMARTAPD DEVELOPMENT ROADMAP

> **Dokumen Rencana Pengembangan & Deployment**
>
> Last Updated: 23 Desember 2024
> Deadline: **1 Minggu (30 Desember 2024)**
> Target: **Lomba Essay Safety Competition 2026**

---

## 📋 RINGKASAN KEPUTUSAN

### A. Deployment & Hosting

| Pertanyaan | Jawaban |
|------------|---------|
| Platform Hosting | **Vercel** (Frontend) + **Railway/Render** (Backend + AI) |
| Budget | **Gratis** (Free Tier) |
| Domain | Belum ada (pakai subdomain gratis) |

### B. Kamera & Video Stream

| Pertanyaan | Jawaban |
|------------|---------|
| Sumber Kamera | **Webcam Laptop** (untuk demo) |
| Lokasi Kamera | Sama dengan komputer lokal |
| Jumlah Kamera | **1 Webcam** (TITIK A = Live), TITIK B/C/D = Gambar/Video Simulasi |
| Display Mode | TITIK A = **Video Stream Real-time**, Lainnya = Placeholder |

### C. AI Detection

| Pertanyaan | Jawaban |
|------------|---------|
| AI Engine Lokasi | **Komputer Lokal** (Edge Computing) |
| Spesifikasi | AMD Ryzen 5 6600H + Radeon 680M (Integrated GPU) |
| Interval Deteksi | **Setiap 5 detik** (hemat resource) |

### D. Data & Database

| Pertanyaan | Jawaban |
|------------|---------|
| Database | **Supabase** (PostgreSQL gratis + API) |
| Data Disimpan | Semua: Log, Screenshot, Video klip, Statistik, Data pekerja |
| Retensi Data | **90 hari** |

### E. Notifikasi

| Pertanyaan | Jawaban |
|------------|---------|
| Channel | Telegram, Email, Push Notification Browser |
| Penerima | Semua level atasan/manajemen |

### F. User & Auth

| Pertanyaan | Jawaban |
|------------|---------|
| Sistem Login | **Ya**, tapi simple (1 admin) |
| Role | **1 Admin** saja untuk demo |

### G. Prioritas

| Pertanyaan | Jawaban |
|------------|---------|
| Tujuan | **Lomba/Kompetisi** |
| Deadline | **1 Minggu** |
| Fitur Prioritas | **SEMUA** (Live cam, AI detection, Dashboard, Alert, PDF) |
| Lokasi Final | **Konstruksi** |

### H. Tambahan

| Pertanyaan | Jawaban |
|------------|---------|
| GPU Training | **Google Colab** |
| Model AI | **Custom** (trained untuk PPE detection) |

---

## 🔥 PERTANYAAN LANJUTAN (PERLU DIJAWAB)

Sebelum lanjut implementasi, tolong jawab pertanyaan berikut:

### 🎯 Pertanyaan Teknis

**1. Webcam Configuration:**

- Webcam internal laptop atau USB external?
- Resolusi webcam (720p / 1080p)?

**2. Browser di Mana:**

- Apakah browser (untuk lihat dashboard) di komputer yang SAMA dengan webcam?
- Atau ada komputer lain yang akses via network?

**3. Demo Scenario:**

- Siapa yang akan jadi "pekerja demo" di depan kamera?
- APD apa yang tersedia untuk demo (helm, rompi, sarung tangan)?
- Apakah perlu skenario "pelanggaran" (sengaja tidak pakai helm)?

**4. Telegram Bot:**

- Sudah punya Bot Token? (dari @BotFather)
- Sudah punya Chat ID?
- Kalau belum, mau saya buatkan panduan?

**5. Email Notification:**

- Email pengirim mau pakai apa? (Gmail?)
- Perlu setup SMTP atau pakai service seperti Resend/SendGrid?

**6. Login Page:**

- Username/password yang diinginkan untuk demo?
- Contoh: admin / smartapd2024

**7. Branding:**

- Nama perusahaan/institusi untuk tampil di dashboard?
- Logo sudah ada di project atau mau pakai yang baru?

**8. Presentasi:**

- Kapan tanggal presentasi lomba?
- Perlu fitur "Demo Mode" yang auto-generate detections?

---

## 📅 TIMELINE 1 MINGGU

### Hari 1-2 (23-24 Des): Setup & Foundation

- [ ] Fix current errors & cleanup
- [ ] Setup Supabase database
- [ ] Setup Vercel deployment (Frontend)
- [ ] Konfigurasi environment variables

### Hari 3-4 (25-26 Des): AI Integration

- [ ] Integrasi webcam ke AI Engine
- [ ] Setup WebSocket untuk live stream
- [ ] Koneksi AI → Backend → Frontend
- [ ] Testing deteksi real-time

### Hari 5 (27 Des): Features

- [ ] Implementasi notifikasi (Telegram + Browser Push)
- [ ] Login page simple
- [ ] Export PDF dengan data real

### Hari 6 (28 Des): Polish & Testing

- [ ] Full system testing
- [ ] UI/UX polish
- [ ] Performance optimization
- [ ] Bug fixes

### Hari 7 (29 Des): Demo Prep

- [ ] Prepare demo scenario
- [ ] Documentation
- [ ] Backup & final deployment
- [ ] Rehearsal

---

## 🏗️ ARSITEKTUR SISTEM (FINAL)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SMARTAPD ARCHITECTURE v2.0                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐                                                   │
│   │   WEBCAM    │ ←── Laptop Camera (HD 720p/1080p)                │
│   └──────┬──────┘                                                   │
│          │                                                          │
│          ▼                                                          │
│   ┌─────────────────────────────────────────┐                      │
│   │          AI-ENGINE (Python)              │                      │
│   │  ┌─────────────────────────────────┐    │                      │
│   │  │ YOLOv8 Custom Model            │    │                      │
│   │  │ • Helmet Detection             │    │                      │
│   │  │ • Vest Detection               │    │                      │
│   │  │ • Gloves Detection             │    │                      │
│   │  │ • Boots Detection              │    │                      │
│   │  └─────────────────────────────────┘    │                      │
│   │                                          │                      │
│   │  Detection every 5 seconds              │                      │
│   │  Output: JSON + Screenshot (if alert)   │                      │
│   └──────────────┬──────────────────────────┘                      │
│                  │                                                  │
│          ┌───────┴───────┐                                         │
│          │     HTTP      │                                         │
│          │     POST      │                                         │
│          ▼               ▼                                         │
│   ┌──────────────┐ ┌──────────────┐                               │
│   │   BACKEND    │ │   TELEGRAM   │                               │
│   │   (Golang)   │ │   BOT API    │                               │
│   │              │ │              │                               │
│   │ • Fiber API  │ │ • Instant    │                               │
│   │ • WebSocket  │ │   Alerts     │                               │
│   │ • Auth       │ │ • Photos     │                               │
│   └───────┬──────┘ └──────────────┘                               │
│           │                                                        │
│           │ REST API + WebSocket                                   │
│           ▼                                                        │
│   ┌──────────────────────────────────────┐                        │
│   │         SUPABASE (Cloud DB)          │                        │
│   │  • PostgreSQL                        │                        │
│   │  • Real-time subscriptions          │                        │
│   │  • Storage (screenshots)            │                        │
│   │  • Auth (optional)                  │                        │
│   └───────┬──────────────────────────────┘                        │
│           │                                                        │
│           │ Supabase Client                                       │
│           ▼                                                        │
│   ┌──────────────────────────────────────┐                        │
│   │         FRONTEND (Next.js)           │                        │
│   │                                      │   ┌─────────────────┐  │
│   │  • Dashboard Monitor                 │   │     VERCEL      │  │
│   │  • Live Camera Feed (TITIK A)        │   │   (Deployed)    │  │
│   │  • AI Detection Overlay              │   └─────────────────┘  │
│   │  • Analytics Charts                  │                        │
│   │  • Incident Center                   │                        │
│   │  • PDF Reports                       │                        │
│   └──────────────────────────────────────┘                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 💰 ESTIMASI BIAYA (FREE TIER)

| Service | Tier | Limit | Cukup untuk Demo? |
|---------|------|-------|-------------------|
| **Vercel** | Hobby (Free) | 100GB bandwidth, 100 deployments | ✅ Ya |
| **Supabase** | Free | 500MB DB, 1GB Storage, 2M requests | ✅ Ya |
| **Railway** | Trial | $5 credit free | ✅ Ya (1 bulan) |
| **Telegram** | Free | Unlimited | ✅ Ya |
| **Google Colab** | Free | GPU for training | ✅ Ya |

**Total: Rp 0 (GRATIS)**

---

## 🛠️ TECH STACK FINAL

| Layer | Technology | Hosting |
|-------|------------|---------|
| **Frontend** | Next.js 14 + TailwindCSS | Vercel |
| **Backend** | Go + Fiber | Railway / Local |
| **Database** | PostgreSQL | Supabase |
| **AI Engine** | Python + YOLOv8 | Local (Laptop) |
| **Stream** | WebSocket / Server-Sent Events | - |
| **Storage** | Supabase Storage | Cloud |
| **Notifications** | Telegram Bot, Push API, Email | - |

---

## ✅ CHECKLIST IMPLEMENTASI

### Phase 1: Foundation (Hari 1-2)

- [ ] Fix frontend errors
- [ ] Create Supabase project
- [ ] Setup database schema
- [ ] Deploy frontend to Vercel
- [ ] Configure environment variables

### Phase 2: AI Pipeline (Hari 3-4)

- [ ] Webcam capture integration
- [ ] YOLOv8 inference setup
- [ ] Detection → Backend API
- [ ] WebSocket for real-time updates
- [ ] Screenshot capture on violation

### Phase 3: Features (Hari 5)

- [ ] Telegram Bot integration
- [ ] Browser Push Notifications
- [ ] Simple Login (username/password)
- [ ] PDF Export with real data

### Phase 4: Polish (Hari 6-7)

- [ ] Full end-to-end testing
- [ ] UI improvements
- [ ] Performance tuning
- [ ] Demo preparation
- [ ] Documentation

---

## 🎬 DEMO SCENARIO

### Setup

1. Laptop dengan webcam menghadap area demo
2. Browser buka dashboard SmartAPD
3. AI Engine running di background

### Flow Demo

1. **Intro**: Tampilkan landing page dan fitur
2. **Normal**: Pekerja dengan APD lengkap → Status AMAN (hijau)
3. **Violation**: Pekerja lepas helm → Deteksi dalam 5 detik → Alert merah
4. **Telegram**: Notifikasi masuk ke HP
5. **Dashboard**: Statistik update real-time
6. **Report**: Generate PDF laporan

---

## 📝 NOTES

### Known Issues

1. Integrated GPU (Radeon 680M) tidak support CUDA, perlu ONNX Runtime
2. Interval 5 detik cukup untuk CPU-based inference
3. Free tier Vercel/Supabase cukup untuk demo

### Recommendations

1. Gunakan YOLOv8n (nano) untuk speed
2. Optimize model ke ONNX format
3. Compress screenshots sebelum upload

---

## 🔗 RESOURCES

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Railway Dashboard](https://railway.app/dashboard)
- [Telegram BotFather](https://t.me/BotFather)
- [YOLOv8 Docs](https://docs.ultralytics.com/)

---

**Silakan jawab pertanyaan lanjutan di atas, kemudian kita lanjut implementasi! 🚀**
