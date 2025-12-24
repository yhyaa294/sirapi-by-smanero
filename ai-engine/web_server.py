"""
SmartAPD - AI Engine Web Server
================================

Menjalankan AI detection dengan streaming video ke browser.
Gunakan FastAPI + OpenCV untuk stream video dengan AI detection.

Endpoint:
- GET /video_feed - MJPEG stream untuk dashboard
- GET /stream_feed/{camera_id} - Stream per kamera
- GET /status - Status engine
"""

import cv2
import time
import json
import requests
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List, Tuple
from threading import Thread, Lock
import base64

# FastAPI imports
from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

# Import detector
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("⚠️ Ultralytics tidak terinstall")

# =============================================================================
# GLOBALS
# =============================================================================

app = FastAPI(title="SmartAPD AI Engine", version="2.0")

# CORS untuk frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Camera state
camera_lock = Lock()
current_frame = None
current_detections = []
camera_active = False
total_violations = 0
total_detections = 0

# Real-time violation counters
violation_counts = {
    "no_helmet": 0,
    "no_vest": 0,
    "no_gloves": 0,
    "no_boots": 0,
}

# Telegram bot
telegram_bot = None

# Detection settings
BACKEND_URL = "http://localhost:8080"
CONFIDENCE_THRESHOLD = 0.4  # Lowered for better detection
VIOLATION_COOLDOWN = 30  # seconds
last_violation_time = {}

# Violation classes
VIOLATION_CLASSES = {"no_helmet", "no_vest", "no_gloves", "no_boots"}

# Class mapping for YOLOv8 PPE detection
# Adjust based on your trained model
CLASS_NAMES = {
    0: "person",
    1: "helmet", 
    2: "no_helmet",
    3: "vest",
    4: "no_vest",
    5: "gloves",
    6: "no_gloves", 
    7: "boots",
    8: "no_boots"
}

# Colors (BGR)
COLORS = {
    "helmet": (0, 255, 0),      # Green
    "no_helmet": (0, 0, 255),   # Red
    "vest": (0, 255, 0),
    "no_vest": (0, 0, 255),
    "gloves": (0, 255, 0),
    "no_gloves": (0, 0, 255),
    "boots": (0, 255, 0),
    "no_boots": (0, 0, 255),
    "person": (255, 255, 0),    # Cyan
}

# Load model
model = None
if YOLO_AVAILABLE:
    try:
        # Try to load PPE model first
        model_paths = [
            "./ai-engine/models/ppe_detector.pt",
            "./ai-engine/yolov8n.pt",
            "./models/ppe_detector.pt",
            "./yolov8n.pt"
        ]
        for model_path in model_paths:
            if Path(model_path).exists():
                model = YOLO(model_path)
                print(f"✅ Model loaded: {model_path}")
                break
        if model is None:
            print("⚠️ No model found, using demo mode")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")


# =============================================================================
# DETECTION FUNCTIONS
# =============================================================================

def detect_ppe(frame: np.ndarray) -> List[Dict]:
    """Run PPE detection on frame"""
    global total_detections
    
    if model is None:
        # Demo mode - random detections
        import random
        if random.random() < 0.15:  # 15% chance
            h, w = frame.shape[:2]
            cls = random.choice(["no_helmet", "no_vest", "helmet", "vest", "person"])
            total_detections += 1
            return [{
                "class": cls,
                "confidence": random.uniform(0.6, 0.95),
                "bbox": [
                    random.randint(50, w//3),
                    random.randint(50, h//3),
                    random.randint(w//2, w-50),
                    random.randint(h//2, h-50)
                ],
                "is_violation": cls in VIOLATION_CLASSES
            }]
        return []
    
    # Real detection
    results = model(frame, conf=CONFIDENCE_THRESHOLD, verbose=False)
    detections = []
    
    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            
            # Map class name - use model's class names if available
            if hasattr(model, 'names') and cls_id in model.names:
                class_name = model.names[cls_id]
            else:
                class_name = CLASS_NAMES.get(cls_id, f"class_{cls_id}")
            
            # Check if it's a PPE violation (simple heuristic)
            is_violation = "no_" in class_name.lower() or class_name in VIOLATION_CLASSES
            
            total_detections += 1
            detections.append({
                "class": class_name,
                "confidence": conf,
                "bbox": [x1, y1, x2, y2],
                "is_violation": is_violation
            })
    
    return detections


def draw_detections(frame: np.ndarray, detections: List[Dict]) -> np.ndarray:
    """Draw bounding boxes on frame"""
    for det in detections:
        x1, y1, x2, y2 = det["bbox"]
        class_name = det["class"]
        conf = det["confidence"]
        is_violation = det["is_violation"]
        
        # Color based on violation
        color = (0, 0, 255) if is_violation else (0, 255, 0)
        color = COLORS.get(class_name, color)
        
        # Draw box
        thickness = 3 if is_violation else 2
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)
        
        # Label
        label = f"{class_name}: {conf*100:.0f}%"
        (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(frame, (x1, y1-lh-10), (x1+lw, y1), color, -1)
        cv2.putText(frame, label, (x1, y1-5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)
        
        # Violation warning
        if is_violation:
            cv2.putText(frame, "VIOLATION!", (x1, y2+25), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,255), 2)
    
    return frame


def process_violations(frame: np.ndarray, detections: List[Dict]):
    """Process violations - send to backend and Telegram with screenshot"""
    global total_violations, last_violation_time, violation_counts, telegram_bot
    
    current_time = time.time()
    
    for det in detections:
        if not det["is_violation"]:
            continue
            
        class_name = det["class"]
        
        # Check cooldown
        if class_name in last_violation_time:
            if current_time - last_violation_time[class_name] < VIOLATION_COOLDOWN:
                continue
        
        # Update violation counter
        if class_name in violation_counts:
            violation_counts[class_name] += 1
        
        # Save screenshot
        screenshot_dir = Path("./data/screenshots")
        screenshot_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        screenshot_path = screenshot_dir / f"{class_name}_{timestamp}.jpg"
        cv2.imwrite(str(screenshot_path), frame)
        
        # Send to backend
        try:
            payload = {
                "camera_id": 1,
                "violation_type": class_name,
                "confidence": det["confidence"],
                "image_path": str(screenshot_path),
                "location": "Gudang Utama",
                "is_violation": True
            }
            
            response = requests.post(
                f"{BACKEND_URL}/api/v1/detections",
                json=payload,
                timeout=5
            )
            
            if response.status_code == 201:
                print(f"🚨 VIOLATION: {class_name} ({det['confidence']*100:.0f}%) - Sent to backend")
                total_violations += 1
                last_violation_time[class_name] = current_time
                
                # Send Telegram notification
                try:
                    import asyncio
                    from telegram_bot import send_violation_notification, update_stats
                    
                    violation_data = {
                        "type": class_name,
                        "location": "TITIK A - Gudang Utama",
                        "time": datetime.now().strftime("%H:%M:%S"),
                        "confidence": int(det["confidence"] * 100)
                    }
                    
                    # Update Telegram bot stats
                    update_stats({
                        "total_detections": total_detections,
                        "violations_today": total_violations,
                        "compliance_rate": 100 - (total_violations / max(total_detections, 1) * 100),
                        "no_helmet": violation_counts.get("no_helmet", 0),
                        "no_vest": violation_counts.get("no_vest", 0),
                        "no_gloves": violation_counts.get("no_gloves", 0),
                        "no_boots": violation_counts.get("no_boots", 0),
                        "last_violation": violation_data
                    })
                    
                    # Send notification async
                    loop = asyncio.new_event_loop()
                    loop.run_until_complete(send_violation_notification(violation_data, str(screenshot_path)))
                    loop.close()
                    print("📱 Telegram notification sent!")
                except Exception as tg_err:
                    print(f"⚠️ Telegram error: {tg_err}")
                    
            else:
                print(f"⚠️ Backend error: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Backend error: {e}")


# =============================================================================
# CAMERA THREAD
# =============================================================================

def camera_thread(camera_id: int = 0):
    """Background thread for camera capture and detection"""
    global current_frame, current_detections, camera_active
    
    print(f"📷 Starting camera {camera_id}...")
    cap = cv2.VideoCapture(camera_id)
    
    if not cap.isOpened():
        print("❌ Failed to open camera!")
        return
    
    # Set resolution
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    camera_active = True
    last_detection_time = 0
    detection_interval = 0.5  # Run detection every 0.5 seconds
    
    print("✅ Camera started!")
    
    while camera_active:
        ret, frame = cap.read()
        if not ret:
            continue
        
        current_time = time.time()
        
        # Run detection at interval
        if current_time - last_detection_time >= detection_interval:
            detections = detect_ppe(frame)
            
            with camera_lock:
                current_detections = detections
            
            # Process violations
            if detections:
                process_violations(frame, detections)
            
            last_detection_time = current_time
        
        # Draw detections on frame
        with camera_lock:
            display_frame = draw_detections(frame.copy(), current_detections)
            
            # Add timestamp
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(display_frame, timestamp, (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            
            # Add stats
            cv2.putText(display_frame, f"Violations: {total_violations}", (10, 60),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
            
            current_frame = display_frame
    
    cap.release()
    print("📷 Camera stopped")


# =============================================================================
# API ENDPOINTS
# =============================================================================

def generate_frames():
    """Generator for MJPEG stream"""
    global current_frame
    
    while True:
        if current_frame is None:
            # Create placeholder frame
            placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(placeholder, "Waiting for camera...", (150, 240),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            frame = placeholder
        else:
            with camera_lock:
                frame = current_frame.copy()
        
        # Encode to JPEG
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        time.sleep(0.033)  # ~30 FPS


@app.get("/video_feed")
async def video_feed():
    """MJPEG video stream endpoint"""
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@app.get("/stream_feed/{camera_id}")
async def stream_feed(camera_id: str):
    """Stream per camera ID"""
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@app.get("/status")
async def get_status():
    """Get engine status"""
    return {
        "status": "running" if camera_active else "stopped",
        "camera_active": camera_active,
        "total_detections": total_detections,
        "total_violations": total_violations,
        "model_loaded": model is not None
    }


@app.get("/snapshot")
async def get_snapshot():
    """Get current frame as base64"""
    global current_frame
    
    if current_frame is None:
        return JSONResponse({"error": "No frame available"}, status_code=503)
    
    with camera_lock:
        _, buffer = cv2.imencode('.jpg', current_frame)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
    
    return {
        "image": f"data:image/jpeg;base64,{frame_base64}",
        "detections": current_detections,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/screenshots/{filename}")
async def get_screenshot(filename: str):
    """Serve a violation screenshot"""
    screenshot_path = Path("./data/screenshots") / filename
    if screenshot_path.exists():
        return FileResponse(screenshot_path, media_type="image/jpeg")
    return JSONResponse({"error": "Screenshot not found"}, status_code=404)


@app.get("/screenshots")
async def list_screenshots():
    """List all violation screenshots"""
    screenshot_dir = Path("./data/screenshots")
    screenshot_dir.mkdir(parents=True, exist_ok=True)
    
    screenshots = []
    for f in sorted(screenshot_dir.glob("*.jpg"), key=lambda x: x.stat().st_mtime, reverse=True):
        screenshots.append({
            "filename": f.name,
            "url": f"http://localhost:8000/screenshots/{f.name}",
            "timestamp": datetime.fromtimestamp(f.stat().st_mtime).isoformat()
        })
    
    return {"screenshots": screenshots[:50]}  # Return latest 50


@app.get("/api/realtime-stats")
async def get_realtime_stats():
    """Get real-time statistics from AI detection"""
    global total_detections, total_violations, violation_counts
    
    compliance_rate = 100.0
    if total_detections > 0:
        compliance_rate = 100 - (total_violations / total_detections * 100)
    
    return {
        "total_detections": total_detections,
        "violations_today": total_violations,
        "compliance_rate": round(compliance_rate, 1),
        "cameras_online": 1 if camera_active else 0,
        "no_helmet": violation_counts.get("no_helmet", 0),
        "no_vest": violation_counts.get("no_vest", 0),
        "no_gloves": violation_counts.get("no_gloves", 0),
        "no_boots": violation_counts.get("no_boots", 0),
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/telegram/settings")
async def get_telegram_settings():
    """Get current Telegram bot settings"""
    try:
        from telegram_bot import load_settings
        settings = load_settings()
        return settings
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/telegram/settings")
async def save_telegram_settings(request: dict):
    """Save Telegram bot settings and restart bot"""
    try:
        from telegram_bot import save_settings, start_bot, stop_bot, load_settings
        
        # Merge with existing settings
        current = load_settings()
        current.update(request)
        save_settings(current)
        
        # Restart bot if token and chat_id are provided
        if current.get("bot_token") and current.get("chat_id"):
            try:
                stop_bot()
            except:
                pass
            start_bot(current["bot_token"], current["chat_id"])
            return {"success": True, "message": "Settings saved and bot restarted"}
        
        return {"success": True, "message": "Settings saved"}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/telegram/test")
async def test_telegram_connection(request: dict):
    """Proxy Telegram API test to avoid CORS issues"""
    try:
        bot_token = request.get("bot_token")
        chat_id = request.get("chat_id")
        
        if not bot_token or not chat_id:
            return {"ok": False, "description": "Token dan Chat ID harus diisi!"}
        
        # Send test message via requests (no CORS issues)
        response = requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            json={
                "chat_id": chat_id,
                "text": "🔔 *SmartAPD Test Connection*\n\n✅ Koneksi Telegram berhasil!\n\nSistem notifikasi siap digunakan.",
                "parse_mode": "Markdown"
            },
            timeout=10
        )
        
        data = response.json()
        return data
        
    except requests.exceptions.Timeout:
        return {"ok": False, "description": "Koneksi timeout. Cek internet Anda."}
    except Exception as e:
        return {"ok": False, "description": str(e)}


@app.post("/api/email/send")
async def send_email(request: dict):
    """Send email report (requires SMTP configuration)"""
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        recipient = request.get("recipient")
        subject = request.get("subject", "SmartAPD - Laporan Harian")
        body = request.get("body", "")
        
        if not recipient:
            return {"success": False, "error": "Email penerima harus diisi"}
        
        # Load SMTP settings from environment or config
        smtp_host = request.get("smtp_host", "smtp.gmail.com")
        smtp_port = int(request.get("smtp_port", 587))
        smtp_user = request.get("smtp_user", "")
        smtp_pass = request.get("smtp_pass", "")
        
        if not smtp_user or not smtp_pass:
            return {
                "success": False, 
                "error": "SMTP belum dikonfigurasi. Masukkan email pengirim dan password aplikasi.",
                "help": "Untuk Gmail, buat App Password di: https://myaccount.google.com/apppasswords"
            }
        
        # Create email
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = recipient
        msg['Subject'] = subject
        
        # Create HTML body
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #f97316; margin: 0;">🛡️ SmartAPD</h1>
                    <p style="color: #64748b;">HSE Command Center</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <div style="color: #334155;">
                    {body}
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                    Laporan ini dikirim otomatis oleh sistem SmartAPD.<br>
                    Waktu: {datetime.now().strftime('%d %B %Y, %H:%M WIB')}
                </p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        # Send email
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        
        return {"success": True, "message": f"Email berhasil dikirim ke {recipient}"}
        
    except smtplib.SMTPAuthenticationError:
        return {"success": False, "error": "Login SMTP gagal. Cek email dan password aplikasi."}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/email/settings")
async def get_email_settings():
    """Get email settings info"""
    return {
        "configured": False,
        "help": "Untuk menggunakan email, Anda perlu:",
        "steps": [
            "1. Gunakan Gmail dengan App Password",
            "2. Buat App Password di: https://myaccount.google.com/apppasswords",
            "3. Masukkan email dan App Password di pengaturan"
        ]
    }


@app.on_event("startup")
async def startup_event():
    """Start camera thread and Telegram bot on server startup"""
    # Start camera
    thread = Thread(target=camera_thread, args=(0,), daemon=True)
    thread.start()
    
    # Start Telegram bot
    try:
        from telegram_bot import start_bot, load_settings
        settings = load_settings()
        if settings.get("bot_token") and settings.get("chat_id"):
            start_bot(settings["bot_token"], settings["chat_id"])
            print("📱 Telegram bot started!")
        else:
            print("⚠️ Telegram bot not configured - set token in settings")
    except Exception as e:
        print(f"⚠️ Telegram bot failed to start: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Stop camera on shutdown"""
    global camera_active
    camera_active = False


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    print("\n" + "="*60)
    print("       🚀 SMARTAPD AI WEB SERVER STARTING")
    print("="*60)
    print(f"📹 Video stream: http://localhost:8000/video_feed")
    print(f"📊 Status: http://localhost:8000/status")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
