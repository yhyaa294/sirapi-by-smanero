# 📋 SmartAPD Project Summary

> **Last Updated:** 23 Desember 2024

---

## 🎯 Status Proyek

| Modul | Status | Progress |
|-------|--------|----------|
| 🎨 Frontend Dashboard | ✅ Completed | 100% |
| 🤖 AI Engine (YOLOv8) | ✅ Completed | 100% |
| 🔧 Backend API (Go) | ✅ Completed | 100% |
| 📱 Telegram Bot | ✅ Completed | 100% |
| 🗄️ Database (SQLite) | ✅ Completed | 100% |

---

## 🖥️ Halaman Frontend yang Tersedia

### Dashboard Utama (`/dashboard`)

- ✅ Grid CCTV 4 Kamera (TITIK A, B, C, D)
- ✅ KPI Cards (Compliance Score, Violations, Workers)
- ✅ Navigasi ke Single Camera View
- ✅ Real-time status indicators

### Single Camera View (`/dashboard/monitor/[id]`)

- ✅ Layout Split 70-30 (Video Player + AI Panel)
- ✅ AI Detection Overlay (Bounding Boxes)
- ✅ Real-time Logs & Detection Stats
- ✅ Quick Navigation Tabs (ALL, TITIK A-D)
- ✅ APD Status Panel (Helmet, Vest, Gloves, Boots)

### Analytics (`/dashboard/analytics`)

- ✅ Area Chart - Tren Kepatuhan 24 Jam
- ✅ Bar Chart - Jenis Pelanggaran
- ✅ Pie Chart - Distribusi Zona
- ✅ KPI Stats Cards
- ✅ Export PDF Report (jspdf)

### Unified Incident Center (`/dashboard/alerts`)

- ✅ Live Alerts Section (Glowing Cards)
- ✅ Incident History Table with Filters
- ✅ Search, Status Filter, Type Filter
- ✅ Status Management (Open/Investigating/Resolved)
- ✅ Export CSV/PDF

### Peta Lokasi (`/dashboard/map`)

- ✅ Leaflet Map dengan CCTV Markers
- ✅ FOV (Field of View) Visualization
- ✅ Optimized dengan React.memo & useMemo

### Halaman Lainnya

- ✅ Profile (`/dashboard/profile`)
- ✅ Settings (`/dashboard/settings`)
- ✅ Reports (`/dashboard/reports`)
- ✅ Login (`/login`)
- ✅ Landing Page (`/`)

---

## 🛠️ Tech Stack

```
Frontend:  Next.js 14 + TypeScript + TailwindCSS
Backend:   Go 1.21 + Fiber Framework + GORM
AI:        Python 3.10 + YOLOv8 + OpenCV
Database:  SQLite
Alerts:    Telegram Bot API
Charts:    Recharts
Maps:      React-Leaflet
PDF:       jspdf + jspdf-autotable
```

---

## 📁 Struktur Folder (Cleaned)

```
smartapd/
├── ai-engine/          # Python AI Detection
├── backend/            # Go API Server
├── frontend/           # Next.js Dashboard
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── alerts/       # Unified Incident Center
│   │   │   ├── analytics/    # Charts & Reports
│   │   │   ├── map/          # Leaflet Map
│   │   │   ├── monitor/[id]/ # Single Camera View
│   │   │   ├── profile/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── login/
│   │   └── page.tsx          # Landing Page
│   ├── components/
│   └── public/images/
├── docs/               # Documentation
├── notebooks/          # Jupyter Notebooks
├── paduan_lomba/       # Competition Files
└── tests/              # Test Files
```

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/yhyaa294/SmartAPD.git
cd smartapd

# Frontend
cd frontend && npm install && npm run dev

# Backend (separate terminal)
cd backend && go run cmd/server/main.go

# AI Engine (separate terminal)
cd ai-engine && python detector_realtime.py --camera 0
```

---

## 🏆 Safety Competition 2026

Proyek ini dibuat untuk **Lomba Esai Safety Competition 2026** yang diselenggarakan oleh **HIMATEKK3 PPNS**.

**Tema:** *Menciptakan Lingkungan Kerja yang Sehat dan Nyaman sebagai Upaya Menumbuhkan Budaya K3 serta Meningkatkan Produktivitas di Era Modern*

---

## 👨‍💻 Tim Pengembang

| Nama | Role |
|------|------|
| Yahya Syarifuddin | Lead Developer |

**Contact:** [WhatsApp](https://wa.me/6282330919114) | [@syarfddn_yhya](https://instagram.com/syarfddn_yhya)

---

© 2024 SmartAPD Team
