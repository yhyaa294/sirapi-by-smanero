
import cv2
import time
import requests
import asyncio
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from ultralytics import YOLO

app = FastAPI(title="SiRapi AI Engine - Vision Service")

# 1. Inisialisasi Model YOLOv8
# yolov8n.pt akan otomatis di-download jika belum ada di direktori
model = YOLO("yolov8n.pt")

# URL Backend (Dummy/Placeholder) untuk menerima log pelanggaran
BACKEND_URL = "http://localhost:8080/api/violation"

# 4. Fungsi Trigger Pelanggaran (Output untuk Backend nanti)
def send_violation_log_sync(violation_data: dict):
    """
    Fungsi sinkron untuk melakukan HTTP POST.
    """
    try:
        response = requests.post(BACKEND_URL, json=violation_data, timeout=3.0)
        print(f"[Violation Log] Data terkirim ke Backend. Status: {response.status_code}")
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] [Violation Log] Gagal mengirim log ke Backend (pastikan Backend menyala): {e}")

async def send_violation_log(violation_data: dict):
    """
    Background task asinkron yang membungkus fungsi sinkron agar tidak memblokir stream.
    """
    await asyncio.to_thread(send_violation_log_sync, violation_data)


# 2. Proses Inferensi (Computer Vision)
async def generate_frames():
    """
    Generator async untuk membaca frame dari webcam, deteksi YOLOv8, dan yield MJPEG.
    """
    # Inisialisasi tangkapan video dari webcam lokal
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Tidak dapat membuka webcam (ID 0).")
        return

    # Cooldown agar tidak spam request HTTP berulang kali dalam 1 detik
    last_violation_time = 0
    COOLDOWN_SECONDS = 5.0

    try:
        while True:
            # Baca frame secara non-blocking agar tidak mengunci event loop
            success, frame = await asyncio.to_thread(cap.read)
            if not success:
                print("Warning: Gagal membaca frame dari webcam.")
                break
                
            # Jalankan deteksi YOLOv8 pada setiap frame
            results = await asyncio.to_thread(model, frame, verbose=False)
            
            # Gambar bounding box hasil deteksi (plot bawaan Ultralytics)
            annotated_frame = results[0].plot()
            
            # === LOGIKA DUMMY PELANGGARAN ===
            # TODO: Nanti ganti TARGET_CLASS_ID ini menjadi class_id atribut seragam 
            # (misal: topi=1, dasi=2, dsb tergantung hasil training/model kustom).
            # Saat ini kita gunakan '0' yang merupakan ID default COCO untuk "person".
            TARGET_CLASS_ID = 0 
            
            for box in results[0].boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                
                # Jika terdeteksi objek person dan confidence cukup baik (> 50%)
                if class_id == TARGET_CLASS_ID and confidence > 0.5:
                    current_time = time.time()
                    
                    # Cek cooldown agar tidak membanjiri request per frame
                    if current_time - last_violation_time > COOLDOWN_SECONDS:
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        
                        violation_data = {
                            "timestamp": int(current_time * 1000), 
                            "camera_id": "cam01",
                            "detection": {
                                "class_id": class_id,
                                "class_name": model.names[class_id],
                                "confidence": round(confidence, 2),
                                "bbox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
                            }
                        }
                        
                        # Panggil fungsi trigger sebagai background job tanpa blokir loop
                        asyncio.create_task(send_violation_log(violation_data))
                        
                        last_violation_time = current_time
                        break # Cukup trigger 1x per frame untuk class tersebut
            
            # Render frame menjadi format JPEG untuk format HTTP MJPEG
            ret, buffer = await asyncio.to_thread(cv2.imencode, '.jpg', annotated_frame)
            if not ret:
                continue
                
            frame_bytes = buffer.tobytes()
            
            # Yield multipart spesifikasi MJPEG stream
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                   
            # Yield time untuk asyncio agar request async lain bisa dieksekusi concurrently
            await asyncio.sleep(0.01)
    finally:
        cap.release()

# 3. Endpoint Streaming (Output untuk Frontend nanti)
@app.get("/video_feed/cam01")
async def video_feed_cam01():
    """
    Endpoint endpoint yang me-return MJPEG stream / stream video.
    Akan dikonsumsi oleh elemen <img> pada FE.
    """
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

if __name__ == "__main__":
    import uvicorn
    # Jalankan service secara mandiri di port 5000
    print("=== STARTING SIRAPI AI VISION ENGINE ===")
    print("Membuka stream MJPEG di: http://localhost:5000/video_feed/cam01")
    uvicorn.run(app, host="0.0.0.0", port=5000)
