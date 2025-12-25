# Security & Authentication Documentation

## Overview

SmartAPD uses JWT (JSON Web Tokens) for API authentication and WebSocket authorization.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for signing JWTs | `smartapd-secret-key-2024` (DEV ONLY!) |
| `ACCESS_TOKEN_EXP_MIN` | Access token expiration in minutes | `60` (1 hour) |
| `REFRESH_TOKEN_EXP_DAYS` | Refresh token expiration in days | `7` |
| `RATE_LIMIT_DEFAULT` | Default requests per minute per IP | `100` |
| `RATE_LIMIT_AUTH` | Auth endpoint requests per minute | `10` |
| `RATE_LIMIT_SENSITIVE` | Sensitive endpoint requests per minute | `20` |

> ⚠️ **IMPORTANT**: Change `JWT_SECRET` to a secure random string in production!

## API Endpoints

### Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@smartapd.id", "password": "admin123"}'
```

Response:

```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@smartapd.id",
    "role": "admin"
  }
}
```

### Refresh Token

```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "eyJhbGci..."}'
```

### Logout

```bash
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "eyJhbGci..."}'
```

### Protected Endpoint

```bash
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```

## WebSocket Authentication

Connect to WebSocket with token:

```javascript
const ws = new WebSocket('ws://localhost:8080/ws?token=<access_token>');
```

## Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Default API | 100 req | 1 min |
| Auth (Login) | 10 req | 1 min |
| Sensitive (POST /detections, /alerts) | 20 req | 1 min |

When rate limited, response includes `Retry-After: 60` header.

## Role-Based Access

Roles: `admin`, `supervisor`, `operator`, `viewer`

Use `RequireRole("admin")` middleware to protect routes.

## Seed Admin User

```bash
cd backend/cmd/seed
go run main.go
```

This creates:

- Email: `admin@smartapd.id`
- Password: `admin123`
- Role: `admin`

## Security Best Practices

1. ✅ Use HTTPS in production
2. ✅ Set strong `JWT_SECRET` (32+ chars)
3. ✅ Use short-lived access tokens
4. ✅ Store tokens securely (httpOnly cookies preferred)
5. ✅ Implement CSRF protection
