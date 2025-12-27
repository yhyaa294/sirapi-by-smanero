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
from typing import Optional, Dict, List, Tuple
from threading import Thread, Lock
import base64

# --- WINDOWS PATHLIB PATCH (WinError 1337 Fix) ---
import pathlib
import os

_orig_exists = pathlib.Path.exists

def safe_exists(self):
    try:
        return _orig_exists(self)
    except OSError:
        # Catch WinError 1337 or other permission errors silently
        return False

pathlib.Path.exists = safe_exists
# -------------------------------------------------

from pathlib import Path
from datetime import datetime

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
    allow_origins=["http://localhost:3000"], # SECURED: Only allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount screenshots directory for frontend access
# Ensure directory exists first
Path("data/screenshots").mkdir(parents=True, exist_ok=True)
app.mount("/data/screenshots", StaticFiles(directory="data/screenshots"), name="screenshots")

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
CONFIDENCE_THRESHOLD = 0.25  # Lowered drastically to debug "no detection" issue
VIOLATION_COOLDOWN = 3  # Reduced to 3s as per user request
BRIGHTNESS_ALPHA = 1.3   # Contrast control (1.0-3.0)
BRIGHTNESS_BETA = 30     # Brightness control (0-100)
last_violation_time = {}

# Violation classes (from HuggingFace model)
VIOLATION_CLASSES = {"no_helmet", "no_mask", "no_glove", "no_goggles", "no_shoes"}

# Class mapping for YOLOv8 PPE detection
# HuggingFace keremberke/yolov8m-protective-equipment-detection
CLASS_NAMES = {
    0: "glove",
    1: "goggles", 
    2: "helmet",
    3: "mask",
    4: "no_glove",
    5: "no_goggles",
    6: "no_helmet",
    7: "no_mask", 
    8: "no_shoes",
    9: "shoes"
}

# Colors (BGR) - Optimized for SmartAPD Dashboard
COLORS = {
    # Safe - Green
    "helmet": (0, 255, 0),
    "vest": (0, 255, 0),
    "gloves": (0, 255, 0),
    "boots": (0, 255, 0),
    "goggles": (0, 255, 0),
    "person": (0, 255, 255),  # Yellow for person

    # Unsafe - Red
    "no_helmet": (0, 0, 255),
    "no_vest": (0, 0, 255),
    "no_gloves": (0, 0, 255),
    "no_boots": (0, 0, 255),
    "no_goggles": (0, 0, 255),
}

# Mapping ID to Name (Fallback if model.names is missing)
CLASS_NAMES = {
    0: "helmet", 1: "gloves", 2: "vest", 3: "boots", 4: "goggles",
    5: "none", 6: "person", 7: "no_helmet", 8: "no_goggle", 
    9: "no_gloves", 10: "no_boots"
}

# Load model
model = None
if YOLO_AVAILABLE:
    try:
        # Try to load PPE model first - use paths relative to this script
        script_dir = Path(__file__).parent
        model_paths = [
            script_dir / "model_snehil.pt", # Priority 1: New best model
            script_dir / "yolov8s_custom.pt",
            script_dir / "smartapd_ppe_model.pt",    # Pre-trained model
            script_dir / "models/ppe_detector.pt",
            script_dir / "yolov8n.pt",
            Path("./model_snehil.pt"),
            Path("./yolov8s_custom.pt"),
            Path("./smartapd_ppe_model.pt"),
            Path("./yolov8n.pt"),
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
    # Optimization: Resize to standard VGA for inference if frame is huge
    inference_frame = frame
    h, w = frame.shape[:2]
    scale_x, scale_y = 1.0, 1.0

    if w > 640:
        inference_frame = cv2.resize(frame, (640, 480))
        h_inf, w_inf = inference_frame.shape[:2]
        scale_x = w / w_inf
        scale_y = h / h_inf
        
    # DEBUG: Use a very low threshold for raw internal check
    results = model(inference_frame, conf=0.10, verbose=False)
    detections = []
    
    # Whitelist classes
    ALLOWED_CLASSES = {
        "person", "helmet", "no_helmet", "vest", "no_vest", 
        "gloves", "no_gloves", "boots", "no_boots", "goggles", "no_goggle",
        "mask", "no_mask" # Added mask classes
    }

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            
            # --- FIX: SCALE COORDINATES BACK TO ORIGINAL FRAME ---
            x1 = int(x1 * scale_x)
            y1 = int(y1 * scale_y)
            x2 = int(x2 * scale_x)
            y2 = int(y2 * scale_y)
            
            # Map class name - use model's class names if available
            raw_class_name = ""
            if hasattr(model, 'names') and cls_id in model.names:
                raw_class_name = model.names[cls_id]
            else:
                raw_class_name = CLASS_NAMES.get(cls_id, f"class_{cls_id}")
            
            # --- CLASS MAPPING LOGIC (New Model to Backend Standard) ---
            # Model Snehil Classes: 
            # {0: 'Hardhat', 1: 'Mask', 2: 'NO-Hardhat', 3: 'NO-Mask', 
            # 4: 'NO-Safety Vest', 5: 'Person', 6: 'Safety Cone', 
            # 7: 'Safety Vest', 8: 'machinery', 9: 'vehicle'}
            
            normalized_name = raw_class_name.lower()
            
            # Mapping map keys
            if "no-hardhat" in normalized_name:
                normalized_name = "no_helmet"
            elif "no-mask" in normalized_name:
                normalized_name = "no_mask"
            elif "no-safety vest" in normalized_name or "no-vest" in normalized_name:
                normalized_name = "no_vest"
            elif "hardhat" in normalized_name:
                normalized_name = "helmet"
            elif "safety vest" in normalized_name:
                normalized_name = "vest"
            elif "mask" in normalized_name:
                normalized_name = "mask"
            elif "person" in normalized_name:
                normalized_name = "person"
            
            # Use mapped name primarily
            class_name = normalized_name

            # DEBUG PRINT
            # print(f"DEBUG RAW: {raw_class_name} -> {class_name} ({conf:.2f})")
            
            # Filter out unwanted classes
            if class_name not in ALLOWED_CLASSES:
                continue
                
            # Filter by actual user threshold
            if conf < CONFIDENCE_THRESHOLD:
                continue

            # Check if it's a PPE violation (simple heuristic)
            is_violation = "no_" in class_name or class_name in VIOLATION_CLASSES
            
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


def process_violations(detections: List[Dict], frame: np.ndarray):
    """Process violations - send to backend and Telegram with screenshot"""
    global total_violations, last_violation_time, violation_counts, telegram_bot
    
    current_time = time.time()
    
    for det in detections:
        if not det["is_violation"]:
            continue
            
        class_name = det["class"]
        
        # Check cooldown (Per Camera + Violation Type)
        # BUG FIX: Previously shared global cooldown across all cameras
        cooldown_key = f"{camera_id}_{class_name}"
        last_time = last_violation_time.get(cooldown_key, 0)
        
        if current_time - last_time < VIOLATION_COOLDOWN:
            continue
            
        last_violation_time[cooldown_key] = current_time
        if class_name in violation_counts:
            violation_counts[class_name] += 1
        
        # Save screenshot with annotations
        screenshot_dir = Path("./data/screenshots")
        screenshot_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        screenshot_path = screenshot_dir / f"{class_name}_{timestamp}.jpg"
        
        # Create annotated frame for evidence
        evidence_frame = frame.copy()
        draw_detections(evidence_frame, detections) # Apply bounding boxes
        cv2.imwrite(str(screenshot_path), evidence_frame)
        
        # Send to backend (NON-BLOCKING)
        def send_report_async(payload, class_name, det, current_time, stats_snapshot):
            try:
                response = requests.post(
                    f"{BACKEND_URL}/api/v1/detections",
                    json=payload,
                    timeout=5
                )
                
                if response.status_code == 201:
                    print(f"🚨 VIOLATION: {class_name} ({det['confidence']*100:.0f}%) - Sent to backend")
                    
                    # Send Telegram notification (Nested Async)
                    try:
                        import asyncio
                        from telegram_bot import send_violation_notification, update_stats
                        
                        violation_data = {
                            "type": class_name,
                            "location": "disini", 
                            "time": datetime.now().strftime("%H:%M:%S"),
                            "confidence": int(det["confidence"] * 100)
                        }
                        
                        # Update Telegram bot stats using SNAPSHOT
                        update_stats(stats_snapshot)
                        
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
                print(f"❌ Reporting error: {e}")

        # Execute in separate thread
        payload = {
            "camera_id": 1,
            "violation_type": class_name,
            "confidence": det["confidence"],
            "image_path": f"/data/screenshots/{class_name}_{timestamp}.jpg", # RELATIVE PATH for web access
            "location": "Gudang Utama",
            "is_violation": True
        }
        
        # Update counters immediately
        total_violations += 1
        last_violation_time[class_name] = current_time

        # CAPTURE SNAPSHOT for thread safety
        stats_snapshot = {
            "total_detections": total_detections,
            "violations_today": total_violations,
            "compliance_rate": 100 - (total_violations / max(total_detections, 1) * 100),
            "no_helmet": violation_counts.get("no_helmet", 0),
            "no_vest": violation_counts.get("no_vest", 0),
            "no_gloves": violation_counts.get("no_gloves", 0),
            "no_boots": violation_counts.get("no_boots", 0),
            "last_violation": {
                 "type": class_name,
                 "location": "disini",
                 "time": datetime.now().strftime("%H:%M:%S"),
                 "confidence": int(det["confidence"] * 100)
            }
        }

        reporting_thread = Thread(target=send_report_async, args=(payload, class_name, det, current_time, stats_snapshot))
        reporting_thread.daemon = True
        reporting_thread.start()


# =============================================================================
# CAMERA THREAD
# =============================================================================

def camera_thread(camera_id: int = 0):
    """Background thread for camera capture and detection"""
    global current_frame, current_detections, camera_active
    # Smart Camera Initialization (Scan indices 0, 1)
    cap = None
    for index in [0, 1]:
        print(f"🎥 Trying to open camera (Index {index})...")
        temp_cap = cv2.VideoCapture(index, cv2.CAP_DSHOW)
        
        # Optimize settings immediately
        temp_cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        temp_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        if temp_cap.isOpened():
            # Strict check: Try reading a frame
            ret, _ = temp_cap.read()
            if ret:
                print(f"✅ Camera found at Index {index}!")
                cap = temp_cap
                break
            else:
                print(f"⚠️ Camera opened at Index {index} but returned no frame.")
                temp_cap.release()
        else:
            print(f"❌ Failed to open camera at Index {index}")

    if cap is None:
        print("❌ CRITICAL: No working camera found on Index 0 or 1.")
        # Don't exit, keep camera_active=True so reconnection loop can try later
        # But we need a dummy cap for the loop or handle it inside
        print("⚠️ Entering wait loop for manual connection...")
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW) # Dummy init for loop structure
    
    print("✅ Camera thread fully initialized!")
    camera_active = True
    
    frame_count = 0
    last_processed_detections = [] # Cache for frame skipping
    
    # Outer loop for reconnection
    while camera_active:
        if not cap.isOpened():
            print("⚠️ Camera disconnected. Reconnecting in 3s...")
            time.sleep(3)
            # Try re-opening with smart scan again
            temp_cap = None
            for index in [0, 1]:
                 temp_cap = cv2.VideoCapture(index, cv2.CAP_DSHOW)
                 if temp_cap.isOpened():
                     ret_check, _ = temp_cap.read()
                     if ret_check:
                         print(f"✅ Camera reconnected at Index {index}!")
                         cap = temp_cap
                         break
                     else:
                         temp_cap.release()
            
            if cap is None or not cap.isOpened():
                continue # Retry loop
                
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

        ret, frame = cap.read()
        if not ret:
            # If video file ends, rewind
            if isinstance(VIDEO_SOURCE, str) and not VIDEO_SOURCE.isdigit() and not VIDEO_SOURCE.startswith(("rtsp", "http")):
                # Check if file exists, then rewind
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                print("🔄 Video ended. Rewinding...")
                continue
                
            print("❌ Failed to read frame. Restarting camera...")
            cap.release()
            continue

        # --- IMAGE ENHANCEMENT (BRIGHTNESS & CONTRAST) ---
        # Param: alpha 1.3 (Contrast), beta 30 (Brightness)
        frame = cv2.convertScaleAbs(frame, alpha=BRIGHTNESS_ALPHA, beta=BRIGHTNESS_BETA) # Changed alpha/beta to use constants
        
        current_time = time.time()
        
        # Run detection at interval (Stabilization Logic)
        # Skip frames to reduce jitter (every 3 frames = ~10 FPS detection on 30 FPS stream)
        frame_count += 1
        with camera_lock: # Lock for shared resources
            # --- OPTIMIZATION: Process frame every 3rd frame ---
            # Reuse last detections for other frames to save CPU
            if frame_count % 3 == 0:
                current_detections = detect_ppe(frame)
                last_processed_detections = current_detections
            else:
                current_detections = last_processed_detections
            
            # Process violations (throttled) based on current detections
            process_violations(current_detections, frame)

            # Draw detections (always draw to keep UI responsive)
            frame_with_detections = draw_detections(frame.copy(), current_detections)
            
            # Add timestamp
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(frame_with_detections, timestamp, (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            
            # Add stats
            cv2.putText(frame_with_detections, f"Violations: {total_violations}", (10, 60),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
            
            current_frame = frame_with_detections
            
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
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70]) # Lower quality slightly for speed
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        time.sleep(0.125)  # ~8 FPS to reduce lag significantly


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


# Static files mount
app.mount("/screenshots", StaticFiles(directory="data/screenshots"), name="screenshots")
app.mount("/data", StaticFiles(directory="data"), name="data")

@app.get("/list_screenshots")
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


@app.get("/screenshots/{filename}/blur")
async def get_blurred_screenshot(filename: str, level: int = 5):
    """Serve a blurred version of a violation screenshot (Face Redaction)"""
    screenshot_path = Path("./data/screenshots") / filename
    if not screenshot_path.exists():
        return JSONResponse({"error": "Screenshot not found"}, status_code=404)

    # Read image
    img = cv2.imread(str(screenshot_path))
    if img is None:
        return JSONResponse({"error": "Failed to read image"}, status_code=500)

    # Face detection (using standard OpenCV Haar Cascade)
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_cascade = cv2.CascadeClassifier(face_cascade_path)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        # Blur faces (Pixelation)
        for (x, y, w, h) in faces:
            roi = img[y:y+h, x:x+w]
            
            # Pixelate factor
            k = 15 # Block size
            h_roi, w_roi = roi.shape[:2]
            if h_roi > 0 and w_roi > 0:
                # Scale down
                temp = cv2.resize(roi, (max(1, w_roi//k), max(1, h_roi//k)), interpolation=cv2.INTER_LINEAR)
                # Scale up
                blur_roi = cv2.resize(temp, (w_roi, h_roi), interpolation=cv2.INTER_NEAREST)
                img[y:y+h, x:x+w] = blur_roi
    except Exception as e:
        print(f"Blur error: {e}")
        # If face detection fails, return original or error? returning original for now with header
        pass

    # Encode
    _, buffer = cv2.imencode('.jpg', img)
    return Response(content=buffer.tobytes(), media_type="image/jpeg")


@app.get("/api/realtime-stats")
async def get_realtime_stats():
    """Get real-time statistics from AI detection"""
    global total_detections, total_violations, violation_counts
    
    compliance_rate = 100.0
    if total_detections > 0:
        compliance_rate = 100 - (total_violations / total_detections * 100)
    else:
        compliance_rate = 100.0 # Default to 100% if no activity
    
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


# =============================================================================
# STARTUP/SHUTDOWN
# =============================================================================

@app.on_event("startup")
async def startup_event():
    """Start camera thread on server startup"""
    thread = Thread(target=camera_thread, args=(0,), daemon=True)
    thread.start()
    print("📷 Camera thread started")

    # Start Telegram Bot if configured
    try:
        from telegram_bot import start_bot, load_settings
        settings = load_settings()
        token = settings.get("bot_token", "")
        chat_id = settings.get("chat_id", "")
        
        if token and chat_id:
            if start_bot(token, chat_id):
                print(f"✅ Telegram Bot started (Chat ID: {chat_id})")
            else:
                print("⚠️ Telegram Bot failed to start")
        else:
            print("ℹ️ Telegram Bot skipped (Token/Chat ID missing)")
    except Exception as e:
        print(f"⚠️ Telegram Bot error: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Stop camera on shutdown"""
    global camera_active
    camera_active = False


@app.post("/camera/start")
async def start_camera():
    """Start camera detection"""
    global camera_active
    
    if camera_active:
        return {"status": "already_running"}
        
    camera_active = True
    thread = Thread(target=camera_thread, args=(0,), daemon=True)
    thread.start()
    return {"status": "started"}


@app.post("/camera/stop")
async def stop_camera():
    """Stop camera detection"""
    global camera_active
    
    if not camera_active:
        return {"status": "already_stopped"}
        
    camera_active = False
    return {"status": "stopped"}



# =============================================================================
# MAIN
# =============================================================================

def cleanup_old_data():
    """Delete screenshots older than 7 days"""
    DATA_DIR = "data/screenshots" # Define locally to be safe
    while True:
        try:
            cutoff = time.time() - (7 * 24 * 3600) # 7 days
            count = 0
            
            if os.path.exists(DATA_DIR):
                # Walk through data directory
                for root, dirs, files in os.walk(DATA_DIR):
                    for file in files:
                        if file.endswith((".jpg", ".png")):
                            path = os.path.join(root, file)
                            try:
                                if os.path.getmtime(path) < cutoff:
                                    os.remove(path)
                                    count += 1
                            except OSError:
                                pass
            
            if count > 0:
                print(f"🧹 Auto-Cleanup: Deleted {count} old screenshots")
                
        except Exception as e:
            print(f"⚠️ Cleanup error: {e}")
            
        time.sleep(3600 * 24) # Check once per day

if __name__ == "__main__":
    print("\n" + "="*60)
    print("       🚀 SMARTAPD AI ENGINE STARTING")
    print("="*60)
    print(f"📹 Video stream: http://localhost:8000/video_feed")
    print(f"📊 Status: http://localhost:8000/status")
    print(f"📈 Real-time Stats: http://localhost:8000/api/realtime-stats")
    print("="*60)
    print("NOTE: Telegram/Email handled by Go Backend (port 8080)")
    print("="*60 + "\n")
    
    # Start cleanup thread
    # Fix: Use 'Thread' directly since 'from threading import Thread' was used
    cleanup_thread = Thread(target=cleanup_old_data, daemon=True)
    cleanup_thread.start()
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
