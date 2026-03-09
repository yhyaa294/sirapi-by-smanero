# 🛡️ SiRapi - Sistem Deteksi Kerapihan Seragam Sekolah

<div align="center">

<img src="frontend/public/images/logo.png" alt="SiRapi Logo" width="180" style="border-radius: 24px; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);"/>

### **Sistem Monitoring Kedisiplinan Berbasis AI & Computer Vision**

*Hadir untuk mewujudkan lingkungan edukasi yang disiplin dan inovatif.*

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Go](https://img.shields.io/badge/Backend-Go%20Fiber-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://gofiber.io/)
[![Python](https://img.shields.io/badge/AI-YOLOv8%20Pro-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://ultralytics.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

</div>

---

## 🎯 Tentang SiRapi

**SiRapi** (Sistem Kerapihan Berbasis AI) adalah inovasi teknologi yang dikembangkan untuk membantu otomatisasi pengawasan tata tertib atribut seragam di sekolah (khususnya studi kasus: SMAN Ngoro Jombang). 

Memanfaatkan teknologi **Computer Vision (YOLOv8)** melalui kamera pengawas (CCTV), SiRapi mampu mendeteksi tingkat kepatuhan siswa dalam mengenakan atribut wajib seperti **Topi, Dasi, Sabuk**, serta **Sepatu Hitam** secara *real-time* saat mereka memasuki gerbang sekolah.

Mengambil semangat *"Tech for Education"*, sistem pencatatan yang dulunya manual dan memakan tenaga kini dapat dikonversi menjadi sebuah *dashboard report* yang akurat, obyektif, dan langsung terhubung dengan notifikasi otomatis ke Guru Piket atau Guru BK melalui asisten cerdas Telegram.

---

## ✨ Fitur Utama

- 🧠 **CCTV Vision AI:** Proses *inference* deteksi seragam menggunakan model spesifik dan dioptimisasi untuk berjalan kencang pada pemrosesan CPU lokal.
- 📊 **Premium Live Dashboard:** Antarmuka pemantauan data kedisiplinan berdesain *enterprise-level* yang bersih, elegan, dan menonjolkan analisis tren secara instan.
- ⚡ **Real-time Engine:** Didukung jembatan komunikasi Go-Fiber dan WebSocket yang menjamin latensi serendah mungkin saat mencatatkan pelanggaran ke UI maupun DB.
- 📱 **Telegram Auto-Alert:** Notifikasi instan beserta gambar bukti (snapshot CCTV) dikirim saat itu juga jika kelas atau individu terdeteksi tidak menaati aturan hari ini.

---

## 🏗️ Arsitektur Teknologi

SiRapi adalah arsitektur *microservice* modern:

1. **AI Microservice (`/ai-engine`)** - Mengambil *stream* video, mendeteksi bbox pelanggaran dengan model `.pt` kustom, memberikan *bounding* gambar MJPEG, dan melempar *Violation JSON Trigger*.
2. **Backend API (`/backend`)** - Service penampung database *SQLite*, memancarkan data melalui Websockets, dan mengamankan rute via JWT Auth.
3. **Frontend App (`/frontend`)** - Dashboard eksekutif yang solid, menggunakan NextJS 14 *App Router* berfokus pada UI *clean, elegant,* layaknya SaaS Profesional.

---

## 🚀 Instalasi & Menjalankan SiRapi

SiRapi sudah dimodifikasi berstandar tinggi dan berjalan penuh secara sinkron dengan satu tekan skrip. 

### Prasyarat:
* Git, Python 3.10+, Go 1.22+, Node.js 18+

### Menjalankan Sistem
1. Lakukan *clone* repository:
   ```bash
   git clone https://github.com/yhyaa294/sirapi-by-smanero.git
   cd sirapi-by-smanero
   ```
2. Pastikan Anda telah mengonfigurasi `SECRETS.md` dan `.env` jika memerlukan fungsionalitas lanjutan (Koneksi *Real* DB/Telegram).
3. Untuk tahap *Dev/Demo*, cukup klik **2x** file `start-all-external.bat` (Window OS). Skrip otomatis akan:
   - Me-*load* server Go Fiber di `localhost:8080`.
   - Mengaktifkan FastAPI YOLOv8 Model di `localhost:5000`.
   - Meluncurkan UI Dashboard di `localhost:3000`.

---

## 👨‍💻 Dikembangkan Oleh
Dipersembahkan dalam rangka riset **YOUNG CHANGE-MAKER SUMMIT 2026** (SDGs Tujuan 4 & Tujuan 9).

Tim Peneliti **SMAN Ngoro Jombang**:
- Muhammad Syarifuddin Yahya
- Nurjanah Favela Asma'ul Qhusna
- Gendis Hasnaa' Muflih

*Pembimbing*: Rohma Wati, S.Pd., Gr.

Hak Cipta © 2026 SiRapi Team. All Rights Reserved.
