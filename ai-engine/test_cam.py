import cv2
import math
import time
from ultralytics import YOLO

# --- KONFIGURASI ---
# Gunakan 'yolov8n.pt' (Nano) biar ringan di laptop. 
# Nanti kalau sudah training, ganti ini jadi 'best.pt'
model_path = 'yolov8n.pt' 

# Set Webcam (0 biasanya webcam laptop, 1 kalau pakai USB cam)
cap = cv2.VideoCapture(0)
cap.set(3, 1280) # Lebar
cap.set(4, 720)  # Tinggi

# Load Model
print(f"🔄 Memuat model AI: {model_path}...")
model = YOLO(model_path)
print("✅ Model siap! Menyalakan kamera...")

# Warna (BGR Format)
COLOR_SAFE = (0, 255, 0)    # Hijau
COLOR_WARN = (0, 165, 255)  # Orange
COLOR_DANGER = (0, 0, 255)  # Merah

while True:
    success, img = cap.read()
    if not success:
        print("❌ Gagal membaca kamera. Cek koneksi!")
        break

    # 1. AI Melakukan Deteksi (Stream mode biar cepat)
    results = model(img, stream=True, verbose=False)

    # 2. Proses Hasil Deteksi
    for r in results:
        boxes = r.boxes
        for box in boxes:
            # Ambil koordinat kotak (x1, y1, x2, y2)
            x1, y1, x2, y2 = box.xyxy[0]
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

            # Ambil Confidence (Tingkat keyakinan AI)
            conf = math.ceil((box.conf[0] * 100)) / 100
            
            # Ambil Nama Class (Objek apa ini?)
            cls = int(box.cls[0])
            currentClass = model.names[cls]

            # --- LOGIKA SMART APD (SIMULASI) ---
            # Karena kita belum training helm/rompi, kita pakai logika dummy dulu:
            # Jika terdeteksi 'person' (orang) -> Anggap saja BELUM PAKE HELM (Merah)
            # Nanti kalau sudah training, logikanya diganti.
            
            if currentClass == "person" and conf > 0.5:
                # Gambar Kotak Merah (Bahaya)
                cv2.rectangle(img, (x1, y1), (x2, y2), COLOR_DANGER, 3)
                
                # Label di atas kotak
                label = f'{currentClass} (UNSAFE) {conf}'
                t_size = cv2.getTextSize(label, 0, fontScale=0.6, thickness=1)[0]
                c2 = x1 + t_size[0], y1 - t_size[1] - 3
                cv2.rectangle(img, (x1, y1), c2, COLOR_DANGER, -1, cv2.LINE_AA) # Background text
                cv2.putText(img, label, (x1, y1 - 2), 0, 0.6, [255, 255, 255], thickness=1, lineType=cv2.LINE_AA)

                # Print Log ke Terminal
                print(f"⚠️ [ALERT] Terdeteksi: {currentClass} | Lokasi: {x1},{y1} | Akurasi: {conf}")

            # Deteksi objek lain (biar gak sepi)
            elif conf > 0.5:
                cv2.rectangle(img, (x1, y1), (x2, y2), COLOR_SAFE, 2)
                cv2.putText(img, f'{currentClass} {conf}', (x1, y1 - 10), 0, 0.6, COLOR_SAFE, 2)

    # 3. Tampilkan Layar
    cv2.imshow("SmartAPD - Terminal Test (Press 'Q' to Exit)", img)

    # Tekan 'Q' untuk keluar
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("🛑 Program dihentikan.")
