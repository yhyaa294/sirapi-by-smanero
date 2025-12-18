"""
SmartAPD - Fast Detector (Optimized for CPU)
============================================
Versi ringan untuk CPU dengan performa lebih smooth.
"""

import cv2
import time
import numpy as np
from pathlib import Path

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("❌ Install ultralytics: pip install ultralytics")

def run_fast_detection(
    camera_id: int = 0,
    model_path: str = "./yolov8n.pt",
    input_size: int = 320,  # Smaller = Faster
    skip_frames: int = 2,   # Process every Nth frame
    conf_threshold: float = 0.4
):
    """
    Fast detection optimized for CPU
    
    Optimizations:
    - Input size 320 (vs 640) = 4x faster
    - Skip frames = smoother video
    - Lower confidence = still catches most
    """
    
    if not YOLO_AVAILABLE:
        print("❌ YOLO not available")
        return
    
    print("\n" + "="*50)
    print("   🚀 SmartAPD FAST MODE (CPU Optimized)")
    print("="*50)
    print(f"📦 Model: {model_path}")
    print(f"📐 Input size: {input_size}x{input_size}")
    print(f"⏭️  Skip frames: {skip_frames}")
    print(f"🎯 Confidence: {conf_threshold}")
    
    # Load model
    print("\n⏳ Loading model...")
    model = YOLO(model_path)
    print("✅ Model loaded!")
    
    # Open webcam
    cap = cv2.VideoCapture(camera_id)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)  # Lower resolution
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Reduce buffer delay
    
    if not cap.isOpened():
        print("❌ Cannot open webcam")
        return
    
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"📷 Webcam: {w}x{h}")
    print("\nPress 'q' to quit\n")
    
    frame_count = 0
    fps_time = time.time()
    fps = 0
    detections = []
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        # Only run detection on Nth frame
        if frame_count % skip_frames == 0:
            # Run inference with smaller size
            results = model(
                frame, 
                imgsz=input_size,
                conf=conf_threshold,
                verbose=False
            )
            
            # Get detections
            detections = []
            for r in results:
                for box in r.boxes:
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                    name = model.names[cls]
                    detections.append({
                        "name": name,
                        "conf": conf,
                        "box": (x1, y1, x2, y2)
                    })
        
        # Draw detections (every frame for smooth display)
        for det in detections:
            x1, y1, x2, y2 = det["box"]
            name = det["name"]
            conf = det["conf"]
            
            # Color: green for person, red for others
            color = (0, 255, 0) if name == "person" else (0, 0, 255)
            
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            label = f"{name}: {conf*100:.0f}%"
            cv2.putText(frame, label, (x1, y1-10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        # Calculate FPS
        if time.time() - fps_time >= 1.0:
            fps = frame_count
            frame_count = 0
            fps_time = time.time()
        
        # Draw FPS
        cv2.putText(frame, f"FPS: {fps}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, f"Detections: {len(detections)}", (10, 60),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Show
        cv2.imshow("SmartAPD Fast", frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print("\n✅ Stopped")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--camera", type=int, default=0)
    parser.add_argument("--model", type=str, default="./yolov8n.pt")
    parser.add_argument("--size", type=int, default=320, help="Input size (320/416/640)")
    parser.add_argument("--skip", type=int, default=2, help="Skip N frames")
    args = parser.parse_args()
    
    run_fast_detection(
        camera_id=args.camera,
        model_path=args.model,
        input_size=args.size,
        skip_frames=args.skip
    )
