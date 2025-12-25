# Telegram Bot Integration - SmartAPD

## Overview

SmartAPD menggunakan **Central Bot** architecture - satu bot dikelola server, admin hanya perlu mendaftarkan chat.

**Bot:** [@SmartAPDbyAI_bot](https://t.me/SmartAPDbyAI_bot)

---

## Environment Variables

```env
# WAJIB - simpan di secret manager, JANGAN commit
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
SECRET_KEY=your_secret_key_for_hmac

# OPSIONAL
TELEGRAM_BOT_USERNAME=SmartAPDbyAI_bot
REDIS_URL=redis://localhost:6379
REPORT_BASE_URL=http://localhost:3000
COOLDOWN_SECONDS=60
TELEGRAM_SENDER_RATE_LIMIT=40
```

---

## Quick Start

### 1. Set Environment

```powershell
# Windows - buat file backend/.env
$env:TELEGRAM_BOT_TOKEN="your_token"
$env:SECRET_KEY="your_secret"
```

### 2. Run Backend

```powershell
cd backend
go run cmd/server/main.go
```

### 3. Register Chat

**Via API:**

```bash
# Create registration link
curl -X POST http://localhost:8080/api/v1/telegram/registrations/create
# Returns: { deep_link: "https://t.me/SmartAPDbyAI_bot?start=reg_abc123" }

# Manual add (after validation)
curl -X POST http://localhost:8080/api/v1/telegram/chats/manual-add \
  -H "Content-Type: application/json" \
  -d '{"chat_id": 123456789}'
```

### 4. Test Connection

```bash
curl -X POST http://localhost:8080/api/v1/telegram/chats/123456789/test
```

### 5. Test Notification

```bash
curl -X POST http://localhost:8080/api/v1/test/notify \
  -H "Content-Type: application/json" \
  -d '{
    "detection_id": 1,
    "camera_id": 1,
    "violation_type": "no_helmet",
    "location": "Gudang A",
    "confidence": 0.95
  }'
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/telegram/status` | Get bot status |
| POST | `/api/v1/telegram/registrations/create` | Create registration link |
| POST | `/api/v1/telegram/chats/manual-add` | Add chat manually |
| GET | `/api/v1/telegram/chats` | List registered chats |
| POST | `/api/v1/telegram/chats/:id/test` | Send test message |
| DELETE | `/api/v1/telegram/chats/:id` | Remove chat |
| POST | `/api/v1/test/notify` | Test notification |
| POST | `/api/telegram/webhook` | Telegram webhook |

---

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Register chat + welcome |
| `/dashboard` | Quick KPI summary |
| `/monitor` | Paged detection list |
| `/status` | Safety score |
| `/subscribe` | Enable notifications |
| `/help` | Show help |

---

## Security

### HMAC-Signed Callbacks

Semua inline button callback di-sign dengan HMAC-SHA256:

```
data = "action:detection_id:chat_id:expiry"
signature = HMAC_SHA256(SECRET_KEY, data)
token = base64url(data + "." + signature)
```

### Rate Limiting

- Global: 25 msg/sec (configurable)
- Per-chat: 60s cooldown (configurable)

---

## Webhook Setup (Production)

```bash
# Set webhook
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
  -d "url=https://yourdomain.com/api/telegram/webhook"

# Verify
curl "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo"
```

---

## Troubleshooting

**Bot tidak merespon:**

1. Cek `TELEGRAM_BOT_TOKEN` sudah di-set
2. Cek log: `🤖 Telegram Bot polling started`
3. Cek koneksi: `curl "https://api.telegram.org/bot$TOKEN/getMe"`

**Pesan tidak terkirim:**

1. Cek chat terdaftar: `GET /api/v1/telegram/chats`
2. Cek cooldown (default 60s)
3. Cek sent_messages_log di database

**Callback error "Token tidak valid":**

1. Pastikan `SECRET_KEY` konsisten
2. Token expire setelah 24 jam
