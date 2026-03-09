# 📋 SiRapi Project Summary

> **Identitas Proyek:** Sistem Deteksi Seragam Berbasis Computer Vision  
> **Sasaran Pengguna:** SMAN Ngoro Jombang  
> **Tujuan:** Edukasi dan Pengawasan Kedisiplinan Atribut Seragam  

---

## 🎯 Status Keseluruhan

| Modul | Status | Keterangan |
|-------|--------|----------|
| 🎨 Frontend Dashboard | 🔄 Refactoring | Sedang diubah dari dashboard industri "SmartAPD" ke dashboard akademik "SiRapi". |
| 🤖 AI Engine (YOLOv8) | 🔄 Refactoring | Model deteksi APD (Helm, Rompi) akan diganti dengan atribut sekolah (Topi, Dasi, dsb). |
| 🔧 Backend API (Go) | ✅ Selesai / Stabil | Endpoint, Websocket, dan koneksi ke SQLite sudah siap. |
| 📱 Telegram Bot | 🔄 Penyesuaian | Perlu diubah pesannya dari peringatan pekerja proyek ke pelanggaran tata tertib sekolah. |

---

## 🖥️ Rencana Struktur Frontend

Sistem *dashboard* secara umum akan mempertahankan fungsi aslinya, namun disesuaikan dengan konteks kedisiplinan sekolah.

### Dashboard Utama (`/dashboard`)

- ✅ Pemantauan Gerbang dan Kelas (CCTV Grid)
- ✅ Kartu KPI (Tingkat Kepatuhan Atribut, Jumlah Pelanggaran Hari Ini)

### Single Monitoring View (`/dashboard/monitor/[id]`)

- ✅ Video Split Screen (CCTV Asli & Hasil Deteksi Bbox)
- ✅ Pencatatan Status *Topi, Dasi, Sabuk, Bed, Sepatu*
- ✅ Live Logging Pelanggaran Seragam

### Analytics & Reports (`/dashboard/analytics`)

- ✅ Grafik Tren Kedatangan & Kepatuhan
- ✅ Analisis Jenis Pelanggaran (Banyak siswa lupa dasi vs topi)
- ✅ Export PDF Laporan Harian/Mingguan ke Guru BK / Kesiswaan

### Incident Alert Center (`/dashboard/alerts`)

- ✅ Catatan History Ketidakdisiplinan
- ✅ Manajemen Tindak Lanjut oleh Guru Piket

---

## 🛠️ Tech Stack

```text
Frontend:  Next.js 14 + TypeScript + TailwindCSS
Backend:   Go 1.21+ + Fiber Framework + GORM
AI:        Python 3.10+ + YOLOv8 + OpenCV
Database:  SQLite
Alerts:    Telegram Bot API
Charts:    Recharts
Maps:      React-Leaflet
```

---

## 🏆 Informasi Lomba / Proyek Cikal Bakal

SiRapi adalah pengembangan lebih lanjut yang diikutkan pada kompetisi **YOUNG CHANGE-MAKER SUMMIT 2026 (Innovative Technology for Sustainability)**.
Penerapan program ini diharapkan dapat mendukung pencapaian **SDGs Tujuan 4 (Pendidikan Berkualitas)** dan **Tujuan 9 (Inovasi & Infrastruktur)** dalam mewujudkan Smart City di Jombang.

---

**© 2026 SiRapi Team (SMAN Ngoro Jombang)**
