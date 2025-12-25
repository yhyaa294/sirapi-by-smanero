# 🔐 Panduan Konfigurasi Secret & Environment Variables

Dokumen ini menjelaskan semua environment variables yang dibutuhkan untuk menjalankan SmartAPD.

## ⚠️ PENTING

**JANGAN** commit file `.env` ke Git! File tersebut sudah ada di `.gitignore`.

---

## Backend (Go Fiber)

| Variable | Deskripsi | Contoh | Wajib? |
|----------|-----------|--------|--------|
| `DATABASE_URL` | Path ke database SQLite atau connection string PostgreSQL | `./data/smartapd.db` | ✅ |
| `JWT_SECRET` | Secret key untuk signing JWT token. **HARUS DIGANTI DI PRODUCTION!** | `your-super-secret-key-min-32-chars` | ✅ |
| `PORT` | Port server backend | `8080` | ❌ (default: 8080) |
| `ENVIRONMENT` | Mode aplikasi | `development` / `production` | ❌ |
| `TELEGRAM_BOT_TOKEN` | Token bot Telegram untuk notifikasi | `123456:ABC...` | ❌ |
| `TELEGRAM_CHAT_ID` | Chat ID tujuan notifikasi | `-100123456789` | ❌ |
| `RATE_LIMIT_DEFAULT` | Limit request per menit (global) | `100` | ❌ (default: 100) |
| `RATE_LIMIT_AUTH` | Limit request per menit (login) | `10` | ❌ (default: 10) |

---

## Frontend (Next.js)

| Variable | Deskripsi | Contoh | Wajib? |
|----------|-----------|--------|--------|
| `NEXT_PUBLIC_API_URL` | Base URL API backend | `http://localhost:8080/api/v1` | ✅ |

---

## AI Engine (Python)

| Variable | Deskripsi | Contoh | Wajib? |
|----------|-----------|--------|--------|
| `BACKEND_URL` | URL backend untuk mengirim deteksi | `http://localhost:8080` | ✅ |
| `CAMERA_SOURCE` | Sumber kamera (0 = webcam, atau RTSP URL) | `0` | ❌ |

---

## Contoh File `.env`

```env
# Backend
DATABASE_URL=./data/smartapd.db
JWT_SECRET=ganti-dengan-secret-yang-kuat-minimal-32-karakter
PORT=8080
ENVIRONMENT=development

# Telegram (opsional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# AI Engine
BACKEND_URL=http://localhost:8080
CAMERA_SOURCE=0
```

---

## 🚀 Tips Production

1. **Gunakan secret manager** (HashiCorp Vault, AWS Secrets Manager, dll.)
2. **Generate JWT_SECRET yang kuat**:

   ```bash
   openssl rand -base64 32
   ```

3. **Jangan gunakan default secret** di production
4. **Set ENVIRONMENT=production** untuk menonaktifkan debug features
