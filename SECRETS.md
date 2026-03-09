# 🔐 Panduan Konfigurasi Secret & Environment Variables

Dokumen ini menjelaskan semua environment variables yang dibutuhkan untuk menjalankan **SiRapi**.

## ⚠️ PENTING

**JANGAN** commit file `.env` ke Git! File tersebut sudah ada di `.gitignore`.

---

## Backend (Go Fiber)

| Variable | Deskripsi | Contoh | Wajib? |
|----------|-----------|--------|--------|
| `DATABASE_URL` | Path ke database SQLite atau connection string PostgreSQL | `./data/sirapi.db` | ✅ |
| `JWT_SECRET` | Secret key untuk signing JWT token. **HARUS DIGANTI DI PRODUCTION!** | `your-super-secret-key-min-32-chars` | ✅ |
| `PORT` | Port server backend | `8080` | ❌ (default: 8080) |
| `ENVIRONMENT` | Mode aplikasi | `development` / `production` | ❌ |
| `TELEGRAM_BOT_TOKEN` | Token bot Telegram untuk notifikasi pelanggaran | `123456:ABC...` | ❌ |
| `TELEGRAM_CHAT_ID` | Chat ID tujuan notifikasi guru BK/Piket | `-100123456789` | ❌ |

---

## Frontend (Next.js)

| Variable | Deskripsi | Contoh | Wajib? |
|----------|-----------|--------|--------|
| `NEXT_PUBLIC_API_URL` | Base URL API backend | `http://localhost:8080/api/v1` | ✅ |

---

## AI Engine (Python)

AI didesain sebagai subservice tersendiri menggunakan FastAPI.

| Variable | Deskripsi | Contoh | Wajib? |
|----------|-----------|--------|--------|
| `BACKEND_URL` | URL backend untuk mengirim deteksi pelanggaran atribut | `http://localhost:8080/api/violation` | ✅ |

---

## Contoh File `.env` (Global)

```env
# Backend
DATABASE_URL=./data/sirapi.db
JWT_SECRET=rahasia-sirapi-super-aman-2026-minimal-32-karakter
PORT=8080
ENVIRONMENT=development

# Telegram (Notifikasi Guru)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Frontend (bisa di .env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# AI Engine
BACKEND_URL=http://localhost:8080/api/violation
```
