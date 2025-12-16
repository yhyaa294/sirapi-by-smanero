# SmartAPD - AI Engine

Engine AI untuk deteksi APD (Alat Pelindung Diri) secara real-time.

## 🛠 Tech Stack

- **Python 3.10+**
- **YOLOv8** - Object detection model
- **ONNX Runtime + DirectML** - AMD GPU acceleration
- **OpenCV** - Video capture & processing

## 📁 Struktur Folder

```
ai-engine/
├── config.py              # Konfigurasi (dari sebelumnya)
├── database.py            # Database handler (dari sebelumnya)
├── detector.py            # PPE Detector class (dari sebelumnya)
├── detector_realtime.py   # Real-time detection dari webcam
├── rules_engine.py        # Business logic rules
├── smart_bot.py           # Telegram bot
├── telegram_bot.py        # Telegram notification
├── utils.py               # Utility functions
├── models/                # Folder untuk model
│   └── ppe_detector.onnx  # Model ONNX (setelah training)
└── requirements.txt       # Dependencies
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ai-engine
pip install -r requirements.txt
```

### 2. Training Model (Jika belum ada)

Buka notebook training:
```bash
cd ../notebooks
python 01_training_ppe_model.py
```

### 3. Jalankan Deteksi Real-time

```bash
python detector_realtime.py --camera 0 --backend http://localhost:8080
```

## 📡 Arsitektur

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Webcam     │─────▶│  AI Engine   │─────▶│   Backend    │
│              │      │  (Python)    │      │   (Golang)   │
└──────────────┘      └──────────────┘      └──────────────┘
                            │
                            ▼
                      ┌──────────────┐
                      │  Screenshots │
                      │   (JPG)      │
                      └──────────────┘
```

## 🎯 Kelas Deteksi

| ID | Kelas | Deskripsi | Tipe |
|----|-------|-----------|------|
| 0 | helmet | Pakai helm | ✅ Patuh |
| 1 | no_helmet | Tidak pakai helm | ⚠️ Pelanggaran |
| 2 | vest | Pakai rompi | ✅ Patuh |
| 3 | no_vest | Tidak pakai rompi | ⚠️ Pelanggaran |
| 4 | gloves | Pakai sarung tangan | ✅ Patuh |
| 5 | no_gloves | Tidak pakai sarung tangan | ⚠️ Pelanggaran |
| 6 | boots | Pakai sepatu safety | ✅ Patuh |
| 7 | no_boots | Tidak pakai sepatu safety | ⚠️ Pelanggaran |
| 8 | person | Orang (untuk tracking) | ℹ️ Info |

## ⚙️ Konfigurasi

### Environment Variables

```env
# Backend
BACKEND_URL=http://localhost:8080

# Telegram (opsional)
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id

# Detection
CONFIDENCE_THRESHOLD=0.5
DETECTION_INTERVAL=0.5
```

### Command Line Arguments

```bash
python detector_realtime.py \
  --camera 0 \                    # Camera ID (default: 0)
  --backend http://localhost:8080 \ # Backend URL
  --model ./models/ppe_detector.onnx \ # Model path
  --interval 0.5                  # Detection interval in seconds
```

## 🔧 Untuk AMD GPU

AMD Radeon tidak support CUDA, jadi kita pakai **ONNX Runtime + DirectML**:

1. Export model ke ONNX (lihat notebook training)
2. Install `onnxruntime-directml`
3. DirectML akan otomatis digunakan jika tersedia

```python
# Check provider
import onnxruntime as ort
print(ort.get_available_providers())
# Output yang diharapkan: ['DmlExecutionProvider', 'CPUExecutionProvider']
```

## 📊 Untuk Lomba

Lihat dokumentasi lengkap di:
- `../docs/TRAINING_DOCUMENTATION_TEMPLATE.md` - Template dokumentasi
- `../notebooks/01_training_ppe_model.py` - Script training dengan metrics

## 🐛 Troubleshooting

### Webcam tidak terdeteksi
```bash
# Test webcam
python -c "import cv2; cap = cv2.VideoCapture(0); print('OK' if cap.isOpened() else 'FAIL')"
```

### DirectML tidak tersedia
```bash
# Install DirectML
pip install onnxruntime-directml --upgrade
```

### Model tidak ditemukan
- Pastikan sudah training dan export model
- Atau download pretrained model dari Roboflow
