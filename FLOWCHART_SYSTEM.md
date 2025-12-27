# 🗺️ SmartAPD System Flowcharts

Dokumentasi ini berisi diagram alur (flowchart) lengkap yang menjelaskan cara kerja sistem internal SmartAPD, mulai dari input kamera, pemrosesan AI, hingga notifikasi ke pengguna.

---

## 🏗️ 1. High-Level System Architecture

Gambaran umum bagaimana semua komponen sistem terhubung.

```mermaid
graph TB
    subgraph "External World"
        Worker[👷 Worker]
        Camera[📷 CCTV/Webcam]
        Admin[👤 Safety Admin]
    end

    subgraph "SmartAPD System"
        direction TB
        
        subgraph "AI Processing Unit"
            ImgCap[📸 Image Capture]
            YOLO[🤖 YOLOv8 Model]
            Logic[⚙️ Violation Logic]
        end

        subgraph "Backend Core"
            API[🌐 HTTP API (Fiber)]
            WS[⚡ WebSocket Hub]
            DB[(💾 SQLite DB)]
        end

        subgraph "Interfaces"
            Dash[🖥️ Web Dashboard]
            Tele[📱 Telegram Bot]
        end
    end

    Worker -- "Activity" --> Camera
    Camera -- "RTSP/USB Stream" --> ImgCap
    ImgCap -- "Frames" --> YOLO
    YOLO -- "Detections" --> Logic
    Logic -- "POST /detections" --> API
    Logic -- "Send Photo" --> Tele
    
    API -- "Broadcast" --> WS
    API -- "Store" --> DB
    
    WS -- "Live Data" --> Dash
    Tele -- "Alert Message" --> Admin
    Dash -- "Monitoring" --> Admin
```

---

## 🤖 2. Alur Proses AI Engine (Python)

Detail bagaimana sistem melakukan deteksi dan menentukan pelanggaran.

```mermaid
flowchart TD
    Start([🚀 Start AI Engine]) --> Init[Load Config & YOLOv8 Model]
    Init --> ConnectCam{Connect Camera?}
    
    ConnectCam -- No --> Error[❌ Log Error & Retry]
    ConnectCam -- Yes --> Loop[🔄 Frame Loop]
    
    Loop --> Capture[📸 Capture Frame]
    Capture --> Infer[🔍 Run YOLOv8 Inference]
    Infer --> Filter[🧹 Filter Low Confidence < 0.5]
    
    Filter --> Classify{Check Classes}
    
    Classify -- "No Helmet/Vest" --> Violation[⚠️ Violation Detected]
    Classify -- "Full PPE" --> Compliance[✅ Compliant]
    
    Violation --> Draw[✏️ Draw Red Box & Label]
    Compliance --> DrawGreen[✏️ Draw Green Box]
    
    Draw --> Payload[📦 Prepare JSON Payload]
    DrawGreen --> Payload
    
    Payload --> SendAPI{Send to Backend?}
    
    SendAPI -- Yes --> POST[🌐 HTTP POST /api/v1/detections]
    
    Violation --> TeleCheck{Telegram Enabled?}
    TeleCheck -- Yes --> SendTele[📱 Send Photo to Telegram]
    TeleCheck -- No --> Continue
    
    POST --> Display[📺 Show Window (Optional)]
    SendTele --> Display
    Continue --> Display
    
    Display --> Loop
```

---

## 🔧 3. Alur Data Backend (Golang)

Bagaimana backend menerima data deteksi dan menyebarkannya.

```mermaid
sequenceDiagram
    participant AI as 🤖 AI Engine
    participant API as 🔧 Backend API
    participant DB as 💾 Database
    participant WS as ⚡ WebSocket
    participant Client as 💻 Frontend Client

    Note over AI, API: Proses Pengiriman Data Deteksi
    
    AI->>API: POST /api/v1/detections (JSON Data)
    activate API
    
    API->>API: Validate Request
    API->>DB: Save Detection Record
    activate DB
    DB-->>API: Success ID
    deactivate DB
    
    API->>WS: Broadcast(DetectionEvent)
    activate WS
    WS-->>Client: Push Real-time Update
    deactivate WS
    
    API-->>AI: 201 Created
    deactivate API
```

---

## 📱 4. Alur Notifikasi & Tindakan

Bagaimana sistem menangani insiden kritis.

```mermaid
stateDiagram-v2
    [*] --> Monitoring
    
    state "🔍 Monitoring Live" as Monitoring
    state "⚠️ Pelanggaran Terdeteksi" as Violation
    state "📢 Alert Generation" as Alert
    state "📱 Notifikasi Terkirim" as Sent
    state "👮 Tindakan Admin" as Action
    
    Monitoring --> Violation: AI detects 'no_helmet'
    Violation --> Alert: Capture Evidence (Photo)
    Alert --> Sent: Send to Telegram & Dashboard
    
    Sent --> Action: Admin receives alert
    
    state Action {
        [*] --> Review: Buka Dashboard/HP
        Review --> Acknowledge: Klik "Acknowledge"
        Review --> Ignore: Abaikan (False Alarm)
    }
    
    Acknowledge --> [*]: Insiden Ditutup
    Ignore --> [*]: Kembali Monitoring
```

---

## 💾 5. Struktur Data (ER Diagram)

Skema database sederhana yang digunakan.

```mermaid
erDiagram
    DETECTIONS ||--o{ EVIDENCE : has
    CAMERAS ||--o{ DETECTIONS : captures
    
    CAMERAS {
        string id PK
        string name
        string rtsp_url
        string location
        boolean is_active
    }

    DETECTIONS {
        int id PK
        string camera_id FK
        timestamp created_at
        float confidence
        string type "helmet|vest|gloves|boots"
        boolean is_compliant
    }

    EVIDENCE {
        int id PK
        int detection_id FK
        string image_path
        timestamp captured_at
    }
```
