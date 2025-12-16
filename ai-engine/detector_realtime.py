"""
SmartAPD - AI Engine untuk Deteksi PPE Real-time
================================================

Script ini menjalankan deteksi APD dari webcam secara real-time
dan mengirim hasil ke Backend (Golang) via HTTP API.

Fitur:
- Deteksi real-time dari webcam
- Support AMD GPU via ONNX + DirectML
- Kirim hasil deteksi ke backend
- Simpan screenshot pelanggaran
- Rate limiting untuk mencegah spam

Author: SmartAPD Team
"""

import cv2
import time
import json
import requests
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List, Tuple
import threading
import queue

# Coba import ONNX Runtime dengan DirectML (AMD GPU)
try:
    import onnxruntime as ort
    # Check DirectML provider
    providers = ort.get_available_providers()
    if 'DmlExecutionProvider' in providers:
        INFERENCE_PROVIDER = ['DmlExecutionProvider', 'CPUExecutionProvider']
        print("✅ AMD GPU (DirectML) tersedia!")
    else:
        INFERENCE_PROVIDER = ['CPUExecutionProvider']
        print("⚠️ DirectML tidak tersedia, menggunakan CPU")
except ImportError:
    INFERENCE_PROVIDER = None
    print("⚠️ ONNX Runtime tidak terinstall")

# Coba import Ultralytics untuk fallback
try:
    from ultralytics import YOLO
    ULTRALYTICS_AVAILABLE = True
except ImportError:
    ULTRALYTICS_AVAILABLE = False


class PPEDetector:
    """
    Detector untuk PPE (Personal Protective Equipment)
    
    Support:
    - ONNX model (untuk AMD GPU via DirectML)
    - PyTorch model (via Ultralytics)
    """
    
    # Mapping kelas deteksi
    CLASS_NAMES = {
        0: "helmet",
        1: "no_helmet", 
        2: "vest",
        3: "no_vest",
        4: "gloves",
        5: "no_gloves",
        6: "boots",
        7: "no_boots",
        8: "person"
    }
    
    # Kelas yang dianggap pelanggaran
    VIOLATION_CLASSES = {"no_helmet", "no_vest", "no_gloves", "no_boots"}
    
    # Warna untuk visualisasi (BGR)
    COLORS = {
        "helmet": (0, 255, 0),      # Hijau
        "no_helmet": (0, 0, 255),   # Merah
        "vest": (0, 255, 0),
        "no_vest": (0, 0, 255),
        "gloves": (0, 255, 0),
        "no_gloves": (0, 0, 255),
        "boots": (0, 255, 0),
        "no_boots": (0, 0, 255),
        "person": (255, 255, 0),    # Cyan
    }
    
    def __init__(
        self,
        model_path: str = "./ai-engine/models/ppe_detector.onnx",
        confidence_threshold: float = 0.5,
        iou_threshold: float = 0.45,
        input_size: Tuple[int, int] = (640, 640)
    ):
        """
        Initialize PPE Detector
        
        Args:
            model_path: Path ke model (ONNX atau .pt)
            confidence_threshold: Minimum confidence untuk deteksi
            iou_threshold: IoU threshold untuk NMS
            input_size: Ukuran input model (width, height)
        """
        self.model_path = Path(model_path)
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        self.input_size = input_size
        
        self.model = None
        self.session = None
        self.use_onnx = False
        
        self._load_model()
    
    def _load_model(self):
        """Load model berdasarkan format file"""
        
        if not self.model_path.exists():
            print(f"⚠️ Model tidak ditemukan: {self.model_path}")
            print("   Gunakan mode DEMO (tanpa AI)")
            return
        
        # ONNX Model (untuk AMD GPU)
        if self.model_path.suffix == ".onnx":
            if INFERENCE_PROVIDER:
                print(f"📦 Loading ONNX model: {self.model_path}")
                self.session = ort.InferenceSession(
                    str(self.model_path),
                    providers=INFERENCE_PROVIDER
                )
                self.use_onnx = True
                print("✅ ONNX model loaded!")
            else:
                print("❌ ONNX Runtime tidak tersedia")
        
        # PyTorch Model (via Ultralytics)
        elif self.model_path.suffix == ".pt":
            if ULTRALYTICS_AVAILABLE:
                print(f"📦 Loading PyTorch model: {self.model_path}")
                self.model = YOLO(str(self.model_path))
                print("✅ PyTorch model loaded!")
            else:
                print("❌ Ultralytics tidak terinstall")
    
    def preprocess(self, frame: np.ndarray) -> np.ndarray:
        """Preprocess frame untuk inference"""
        # Resize
        img = cv2.resize(frame, self.input_size)
        # BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        # Normalize
        img = img.astype(np.float32) / 255.0
        # HWC to CHW
        img = np.transpose(img, (2, 0, 1))
        # Add batch dimension
        img = np.expand_dims(img, axis=0)
        return img
    
    def postprocess(
        self, 
        outputs: np.ndarray, 
        original_shape: Tuple[int, int]
    ) -> List[Dict]:
        """
        Postprocess output dari model
        
        Returns:
            List of detections: [{"class": str, "confidence": float, "bbox": [x1,y1,x2,y2]}]
        """
        detections = []
        
        # Output shape: [1, num_classes + 4, num_detections]
        # Transpose to [num_detections, num_classes + 4]
        outputs = outputs[0].T
        
        h, w = original_shape
        scale_x = w / self.input_size[0]
        scale_y = h / self.input_size[1]
        
        for detection in outputs:
            # Format: [x_center, y_center, width, height, class_scores...]
            x_center, y_center, width, height = detection[:4]
            class_scores = detection[4:]
            
            class_id = np.argmax(class_scores)
            confidence = class_scores[class_id]
            
            if confidence < self.confidence_threshold:
                continue
            
            # Convert to corner format
            x1 = int((x_center - width / 2) * scale_x)
            y1 = int((y_center - height / 2) * scale_y)
            x2 = int((x_center + width / 2) * scale_x)
            y2 = int((y_center + height / 2) * scale_y)
            
            # Clamp to image bounds
            x1 = max(0, min(x1, w))
            y1 = max(0, min(y1, h))
            x2 = max(0, min(x2, w))
            y2 = max(0, min(y2, h))
            
            class_name = self.CLASS_NAMES.get(class_id, f"class_{class_id}")
            
            detections.append({
                "class": class_name,
                "class_id": int(class_id),
                "confidence": float(confidence),
                "bbox": [x1, y1, x2, y2],
                "is_violation": class_name in self.VIOLATION_CLASSES
            })
        
        # Apply NMS
        detections = self._apply_nms(detections)
        
        return detections
    
    def _apply_nms(self, detections: List[Dict]) -> List[Dict]:
        """Apply Non-Maximum Suppression"""
        if len(detections) == 0:
            return []
        
        boxes = np.array([d["bbox"] for d in detections])
        scores = np.array([d["confidence"] for d in detections])
        
        indices = cv2.dnn.NMSBoxes(
            boxes.tolist(),
            scores.tolist(),
            self.confidence_threshold,
            self.iou_threshold
        )
        
        if len(indices) > 0:
            indices = indices.flatten()
            return [detections[i] for i in indices]
        return []
    
    def detect(self, frame: np.ndarray) -> List[Dict]:
        """
        Jalankan deteksi pada frame
        
        Args:
            frame: BGR image dari OpenCV
            
        Returns:
            List of detections
        """
        # Jika tidak ada model, return dummy detection untuk demo
        if self.session is None and self.model is None:
            return self._demo_detection(frame)
        
        # ONNX inference
        if self.use_onnx and self.session:
            input_tensor = self.preprocess(frame)
            input_name = self.session.get_inputs()[0].name
            outputs = self.session.run(None, {input_name: input_tensor})
            return self.postprocess(outputs[0], frame.shape[:2])
        
        # Ultralytics inference
        if self.model:
            results = self.model(frame, conf=self.confidence_threshold)
            detections = []
            for r in results:
                for box in r.boxes:
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    class_name = self.CLASS_NAMES.get(cls, f"class_{cls}")
                    detections.append({
                        "class": class_name,
                        "class_id": cls,
                        "confidence": conf,
                        "bbox": [int(x1), int(y1), int(x2), int(y2)],
                        "is_violation": class_name in self.VIOLATION_CLASSES
                    })
            return detections
        
        return []
    
    def _demo_detection(self, frame: np.ndarray) -> List[Dict]:
        """Demo detection ketika tidak ada model"""
        # Simulasi deteksi random untuk demo
        import random
        
        h, w = frame.shape[:2]
        
        if random.random() < 0.3:  # 30% chance ada deteksi
            classes = ["helmet", "no_helmet", "vest", "person"]
            cls = random.choice(classes)
            
            return [{
                "class": cls,
                "class_id": list(self.CLASS_NAMES.values()).index(cls) if cls in self.CLASS_NAMES.values() else 0,
                "confidence": random.uniform(0.7, 0.95),
                "bbox": [
                    random.randint(50, w//2),
                    random.randint(50, h//2),
                    random.randint(w//2, w-50),
                    random.randint(h//2, h-50)
                ],
                "is_violation": cls in self.VIOLATION_CLASSES
            }]
        
        return []
    
    def draw_detections(self, frame: np.ndarray, detections: List[Dict]) -> np.ndarray:
        """Draw bounding boxes dan labels pada frame"""
        
        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            class_name = det["class"]
            confidence = det["confidence"]
            is_violation = det["is_violation"]
            
            # Warna berdasarkan kelas
            color = self.COLORS.get(class_name, (255, 255, 255))
            
            # Draw box
            thickness = 3 if is_violation else 2
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)
            
            # Label
            label = f"{class_name}: {confidence*100:.1f}%"
            
            # Background untuk label
            (label_w, label_h), baseline = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2
            )
            cv2.rectangle(
                frame,
                (x1, y1 - label_h - 10),
                (x1 + label_w, y1),
                color,
                -1  # Filled
            )
            
            # Text
            cv2.putText(
                frame, label,
                (x1, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6, (255, 255, 255), 2
            )
            
            # Warning icon untuk pelanggaran
            if is_violation:
                cv2.putText(
                    frame, "⚠ VIOLATION",
                    (x1, y2 + 25),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7, (0, 0, 255), 2
                )
        
        return frame


class SmartAPDEngine:
    """
    Main engine untuk SmartAPD
    
    Mengelola:
    - Webcam capture
    - PPE Detection
    - Sending results ke backend
    - Screenshot pelanggaran
    """
    
    def __init__(
        self,
        camera_id: int = 0,
        backend_url: str = "http://localhost:8080",
        model_path: str = "./ai-engine/models/ppe_detector.onnx",
        screenshot_dir: str = "./data/screenshots",
        detection_interval: float = 0.5,  # Deteksi setiap 0.5 detik
        violation_cooldown: float = 30.0,  # Cooldown antar alert (detik)
    ):
        self.camera_id = camera_id
        self.backend_url = backend_url
        self.screenshot_dir = Path(screenshot_dir)
        self.detection_interval = detection_interval
        self.violation_cooldown = violation_cooldown
        
        # Create screenshot directory
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize detector
        self.detector = PPEDetector(model_path=model_path)
        
        # State
        self.running = False
        self.last_detection_time = 0
        self.last_violation_time = {}  # {class_name: timestamp}
        
        # Stats
        self.total_detections = 0
        self.total_violations = 0
        
    def start(self):
        """Start AI engine"""
        print("\n" + "="*60)
        print("         🚀 SMARTAPD AI ENGINE STARTING")
        print("="*60)
        
        # Open webcam
        cap = cv2.VideoCapture(self.camera_id)
        
        if not cap.isOpened():
            print("❌ Gagal membuka webcam!")
            return
        
        # Set resolution
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        print(f"📷 Webcam opened: {int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))}x{int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))}")
        print(f"🔧 Detection interval: {self.detection_interval}s")
        print(f"🌐 Backend URL: {self.backend_url}")
        print("\nPress 'q' to quit\n")
        
        self.running = True
        fps_time = time.time()
        frame_count = 0
        
        try:
            while self.running:
                ret, frame = cap.read()
                if not ret:
                    break
                
                current_time = time.time()
                
                # Run detection at interval
                detections = []
                if current_time - self.last_detection_time >= self.detection_interval:
                    detections = self.detector.detect(frame)
                    self.last_detection_time = current_time
                    
                    # Process detections
                    self._process_detections(frame, detections)
                
                # Draw detections
                display_frame = self.detector.draw_detections(frame.copy(), detections)
                
                # Draw stats
                self._draw_stats(display_frame, frame_count, fps_time)
                
                # Show frame
                cv2.imshow("SmartAPD - PPE Detection", display_frame)
                
                # FPS counter
                frame_count += 1
                if current_time - fps_time >= 1.0:
                    fps_time = current_time
                    frame_count = 0
                
                # Key handler
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    break
                elif key == ord('s'):
                    # Manual screenshot
                    self._save_screenshot(frame, "manual")
                    
        finally:
            self.running = False
            cap.release()
            cv2.destroyAllWindows()
            print("\n✅ SmartAPD AI Engine stopped")
    
    def _process_detections(self, frame: np.ndarray, detections: List[Dict]):
        """Process detections: send to backend, save screenshots"""
        
        current_time = time.time()
        
        for det in detections:
            self.total_detections += 1
            
            if det["is_violation"]:
                class_name = det["class"]
                
                # Check cooldown
                last_time = self.last_violation_time.get(class_name, 0)
                if current_time - last_time < self.violation_cooldown:
                    continue
                
                self.total_violations += 1
                self.last_violation_time[class_name] = current_time
                
                # Save screenshot
                screenshot_path = self._save_screenshot(frame, class_name)
                
                # Send to backend
                self._send_to_backend(det, screenshot_path)
                
                print(f"🚨 VIOLATION: {class_name} ({det['confidence']*100:.1f}%)")
    
    def _save_screenshot(self, frame: np.ndarray, prefix: str) -> str:
        """Save screenshot"""
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"{prefix}_{timestamp}.jpg"
        filepath = self.screenshot_dir / filename
        cv2.imwrite(str(filepath), frame)
        return str(filepath)
    
    def _send_to_backend(self, detection: Dict, screenshot_path: str):
        """Send detection to backend API"""
        try:
            payload = {
                "camera_id": self.camera_id,
                "violation_type": detection["class"],
                "confidence": detection["confidence"],
                "image_path": screenshot_path,
                "location": f"Camera {self.camera_id}",
                "is_violation": detection["is_violation"]
            }
            
            response = requests.post(
                f"{self.backend_url}/api/v1/detections",
                json=payload,
                timeout=5
            )
            
            if response.status_code == 201:
                print(f"   ✅ Sent to backend")
            else:
                print(f"   ⚠️ Backend error: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"   ⚠️ Backend tidak tersedia")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    def _draw_stats(self, frame: np.ndarray, fps: int, fps_time: float):
        """Draw stats overlay"""
        h, w = frame.shape[:2]
        
        # Background
        cv2.rectangle(frame, (10, 10), (300, 120), (0, 0, 0), -1)
        cv2.rectangle(frame, (10, 10), (300, 120), (255, 255, 255), 1)
        
        # Title
        cv2.putText(frame, "SmartAPD Monitor", (20, 35),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        # Stats
        cv2.putText(frame, f"Detections: {self.total_detections}", (20, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.putText(frame, f"Violations: {self.total_violations}", (20, 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
        cv2.putText(frame, f"FPS: {fps}", (20, 100),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="SmartAPD AI Engine")
    parser.add_argument("--camera", type=int, default=0, help="Camera ID")
    parser.add_argument("--backend", type=str, default="http://localhost:8080", help="Backend URL")
    parser.add_argument("--model", type=str, default="./ai-engine/models/ppe_detector.onnx", help="Model path")
    parser.add_argument("--interval", type=float, default=0.5, help="Detection interval (seconds)")
    
    args = parser.parse_args()
    
    engine = SmartAPDEngine(
        camera_id=args.camera,
        backend_url=args.backend,
        model_path=args.model,
        detection_interval=args.interval
    )
    
    engine.start()
