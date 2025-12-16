# SmartAPD Backend (Golang)

Backend API server untuk SmartAPD menggunakan **Go** dengan **Fiber** framework.

## 🛠 Tech Stack

- **Go 1.21+** - Bahasa pemrograman
- **Fiber v2** - Web framework (mirip Express.js)
- **GORM** - ORM untuk database
- **SQLite** - Database (bisa diganti PostgreSQL)
- **WebSocket** - Real-time updates

## 📁 Struktur Folder

```
backend/
├── cmd/
│   └── server/
│       └── main.go          # Entry point
├── internal/
│   ├── config/
│   │   └── config.go        # Configuration loader
│   ├── database/
│   │   └── database.go      # Database connection
│   ├── handlers/
│   │   ├── alert.go         # Alert API handlers
│   │   ├── camera.go        # Camera API handlers
│   │   ├── detection.go     # Detection API handlers
│   │   ├── report.go        # Report API handlers
│   │   └── websocket.go     # WebSocket handler
│   ├── middleware/          # Custom middleware
│   ├── models/
│   │   └── models.go        # Database models
│   └── services/            # Business logic
├── pkg/
│   └── utils/               # Shared utilities
├── go.mod
├── go.sum
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
go mod tidy
```

### 2. Run Server
```bash
go run cmd/server/main.go
```

Server akan berjalan di `http://localhost:8080`

### 3. Build Binary
```bash
go build -o smartapd-backend cmd/server/main.go
./smartapd-backend
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Detections
```
GET    /api/v1/detections           # List all detections
GET    /api/v1/detections/:id       # Get single detection
POST   /api/v1/detections           # Create detection
GET    /api/v1/detections/stats     # Get statistics
```

### Alerts
```
GET    /api/v1/alerts               # List all alerts
POST   /api/v1/alerts               # Create alert
PUT    /api/v1/alerts/:id/acknowledge  # Acknowledge alert
```

### Cameras
```
GET    /api/v1/cameras              # List all cameras
GET    /api/v1/cameras/:id          # Get single camera
POST   /api/v1/cameras              # Create camera
PUT    /api/v1/cameras/:id          # Update camera
DELETE /api/v1/cameras/:id          # Delete camera
```

### Reports
```
GET    /api/v1/reports/daily        # Daily report
GET    /api/v1/reports/weekly       # Weekly report
GET    /api/v1/reports/export       # Export report
```

### WebSocket
```
WS     /ws                          # Real-time updates
```

## 🔧 Environment Variables

```env
PORT=8080
DATABASE_URL=../data/detections.db
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
ENVIRONMENT=development
```

## 📦 Build untuk Production

```bash
# Linux
GOOS=linux GOARCH=amd64 go build -o smartapd-backend-linux cmd/server/main.go

# Windows
GOOS=windows GOARCH=amd64 go build -o smartapd-backend.exe cmd/server/main.go
```
