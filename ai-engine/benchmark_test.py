import cv2
import argparse
import time
from ultralytics import YOLO

# Dictionary untuk memetakan nama repository ke konfigurasi default (konseptual)
# Kita menggunakan YOLOv8 di SiRapi, jadi kita deploy model dari masing-masing dataset/repo jika tersedia format .pt nya.
REPO_CONFIGS = {
    "muzammil": {
        "description": "Muhammad-Muzammil-Shah/School-Uniform-detection (YOLOv8)",
        "default_weights": "yolov8n.pt", # Gunakan weights custom jika sudah di-download (misal: best_muzammil.pt)
        # Asumsi kelas (bisa disesuaikan setelah melihat data training aslinya)
        "classes": {0: "Tie", 1: "Badge", 2: "Belt", 3: "Black Shoes"} 
    },
    "korea_girls": {
        "description": "hynjxn/uniform-detection-using-YOLOv5 (YOLOv5 translated to v8 context)",
        "default_weights": "yolov8n.pt", # Gunakan weights custom jika ada
        "classes": {0: "Winter Uniform", 1: "Summer Uniform", 2: "Gym Clothes", 3: "Casual", 4: "Padding"}
    },
    "attendance": {
        "description": "NOMANSAEEDSOOMRO/Attendance-System",
        "default_weights": "yolov8n.pt", 
        "classes": {0: "Student", 1: "Uniform", 2: "No Uniform"}
    },
    "sirapi_base": {
        "description": "SiRapi Default (Base YOLOv8 Nano)",
        "default_weights": "yolov8n.pt", # Base model untuk testing kapabilitas dasar
        "classes": None # Pakai kelas bawaan COCO (80 classes) untuk tes
    }
}

def parse_args():
    parser = argparse.ArgumentParser(description="SiRapi AI Microservice Benchmark Tool")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Path ke custom weights (.pt file)")
    parser.add_argument("--repo", type=str, choices=list(REPO_CONFIGS.keys()), default="sirapi_base", help="Pilih konfigurasi repo untuk simulasi label")
    parser.add_argument("--cam", type=int, default=0, help="Webcam ID (default: 0)")
    parser.add_argument("--conf", type=float, default=0.5, help="Confidence threshold (0.0 - 1.0)")
    return parser.parse_args()

def main():
    args = parse_args()
    config = REPO_CONFIGS[args.repo]
    
    print("=" * 50)
    print("🔬 SIRAPI AI BENCHMARK TEST")
    print("=" * 50)
    print(f"Konfigurasi Repo : {config['description']}")
    print(f"Model Weights    : {args.model}")
    print(f"Kamera ID        : {args.cam}")
    print(f"Confidence (min) : {args.conf}")
    print("=" * 50)
    print("Sedang memuat model...")

    try:
        model = YOLO(args.model)
        print("✅ Model berhasil dimuat!")
    except Exception as e:
        print(f"❌ Gagal memuat model: {e}")
        print("Pastikan file .pt ada di direktori yang benar.")
        return

    # Inisialisasi Webcam
    cap = cv2.VideoCapture(args.cam)
    if not cap.isOpened():
        print(f"❌ Gagal membuka webcam dengan ID {args.cam}.")
        return

    print("\n🚀 Memulai Video Stream... Tekan 'q' pada jendela video untuk keluar.")
    
    # Optional: Set resolusi kamera untuk performa yang lebih baik
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    # Variables for FPS calculation
    prev_time = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Gagal mengambil frame dari kamera.")
            break

        # Calculate FPS
        curr_time = time.time()
        fps = 1 / (curr_time - prev_time)
        prev_time = curr_time

        # Jalankan deteksi
        # Verbose=False agar CLI tidak penuh dengan log per-frame
        results = model(frame, conf=args.conf, verbose=False)
        
        # Ambil frame yang sudah digambar bounding box bawaan YOLO
        annotated_frame = results[0].plot()

        # Custom Labels overlay jika pakai konfigurasi spesifik repo
        if config["classes"] is not None:
             for box in results[0].boxes:
                 cls_id = int(box.cls[0].item())
                 # Override label bawaan dengan label mapping dari repo jika ada
                 if cls_id in config["classes"]:
                     label_name = config["classes"][cls_id]
                     conf_score = float(box.conf[0].item())
                     
                     # Gambar ulang box manual (opsional, karena plot() sudah menggambar)
                     # Ini hanya untuk menunjukkan cara override
                     x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                     cv2.putText(annotated_frame, f"REMAP: {label_name} {conf_score:.2f}", 
                                 (x1, y1 - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

        # Draw Stats (FPS & Model Info)
        cv2.putText(annotated_frame, f"FPS: {fps:.1f}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(annotated_frame, f"Model: {args.model}", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(annotated_frame, "Tekan 'q' untuk keluar", (20, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # Tampilkan
        cv2.imshow("SiRapi AI Benchmark", annotated_frame)

        # Keluar jika tekan 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Bersihkan
    cap.release()
    cv2.destroyAllWindows()
    print("🛑 Benchmark dihentikan.")

if __name__ == "__main__":
    main()
