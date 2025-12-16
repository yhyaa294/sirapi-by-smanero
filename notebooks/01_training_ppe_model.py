# SmartAPD - PPE Detection Training Guide
# ========================================
# Notebook untuk training model YOLOv8 deteksi APD
# Lengkap dengan dokumentasi untuk lomba

"""
=============================================================================
                    SMARTAPD - PPE DETECTION TRAINING
                    Panduan Lengkap untuk Kompetisi
=============================================================================

DAFTAR ISI:
1. Setup Environment
2. Download Dataset
3. Prepare Dataset
4. Training Model
5. Evaluasi & Metrics (untuk lomba)
6. Export Model (ONNX untuk AMD GPU)
7. Testing Model

REQUIREMENTS:
- Python 3.10+
- ultralytics (YOLOv8)
- onnxruntime-directml (untuk AMD GPU)
"""

# =============================================================================
# STEP 1: SETUP ENVIRONMENT
# =============================================================================

import subprocess
import sys

def install_requirements():
    """Install semua dependencies yang dibutuhkan"""
    packages = [
        "ultralytics",           # YOLOv8
        "onnxruntime-directml",  # AMD GPU support
        "opencv-python",         # Video/Image processing
        "matplotlib",            # Visualisasi
        "seaborn",              # Confusion matrix
        "pandas",               # Data analysis
        "roboflow",             # Dataset download
        "albumentations",       # Data augmentation
    ]
    
    for package in packages:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package, "-q"])
    
    print("✅ Semua dependencies terinstall!")

# Uncomment untuk install:
# install_requirements()

# =============================================================================
# STEP 2: DOWNLOAD DATASET
# =============================================================================

from roboflow import Roboflow
import os

def download_ppe_dataset(api_key="YOUR_ROBOFLOW_API_KEY"):
    """
    Download dataset PPE dari Roboflow
    
    Dataset yang direkomendasikan:
    1. "ppe-detection" - 5000+ images
    2. "construction-safety" - 3000+ images
    3. "safety-helmet-detection" - 2000+ images
    
    Cara dapat API Key:
    1. Daftar di roboflow.com (gratis)
    2. Buka Settings > API Key
    3. Copy API Key
    """
    
    # Contoh download dataset PPE
    rf = Roboflow(api_key=api_key)
    
    # Dataset 1: PPE Detection (Helm, Rompi, dll)
    project = rf.workspace("roboflow-universe-projects").project("construction-site-safety")
    dataset = project.version(2).download("yolov8")
    
    print(f"✅ Dataset downloaded to: {dataset.location}")
    return dataset.location

# =============================================================================
# STEP 3: PREPARE DATASET
# =============================================================================

import shutil
from pathlib import Path

def prepare_dataset(dataset_path, output_path="./training/dataset"):
    """
    Menyiapkan struktur dataset untuk training YOLOv8
    
    Struktur yang dibutuhkan:
    dataset/
    ├── train/
    │   ├── images/
    │   └── labels/
    ├── valid/
    │   ├── images/
    │   └── labels/
    └── data.yaml
    """
    
    output = Path(output_path)
    output.mkdir(parents=True, exist_ok=True)
    
    # Copy dataset
    if Path(dataset_path).exists():
        shutil.copytree(dataset_path, output, dirs_exist_ok=True)
    
    # Buat data.yaml jika belum ada
    data_yaml = output / "data.yaml"
    if not data_yaml.exists():
        yaml_content = """
# SmartAPD Dataset Configuration
path: ./training/dataset
train: train/images
val: valid/images

# Kelas APD yang akan dideteksi
names:
  0: helmet        # Helm safety
  1: no_helmet     # Tidak pakai helm
  2: vest          # Rompi safety
  3: no_vest       # Tidak pakai rompi
  4: gloves        # Sarung tangan
  5: no_gloves     # Tidak pakai sarung tangan
  6: boots         # Sepatu safety
  7: no_boots      # Tidak pakai sepatu safety
  8: person        # Orang (untuk tracking)

nc: 9  # Jumlah kelas
"""
        data_yaml.write_text(yaml_content)
    
    print(f"✅ Dataset prepared at: {output}")
    return str(output)

# =============================================================================
# STEP 4: TRAINING MODEL
# =============================================================================

from ultralytics import YOLO
import torch

def train_model(
    data_yaml="./training/dataset/data.yaml",
    model_size="n",  # n=nano, s=small, m=medium, l=large, x=xlarge
    epochs=100,
    batch_size=16,
    img_size=640,
    project_name="smartapd_training"
):
    """
    Training YOLOv8 untuk deteksi PPE
    
    REKOMENDASI untuk AMD Radeon 680M:
    - model_size: "n" atau "s" (nano atau small)
    - batch_size: 8-16
    - img_size: 640
    
    Tips untuk lomba:
    - Epochs 100+ untuk akurasi tinggi
    - Gunakan augmentasi data
    - Pastikan dataset seimbang
    """
    
    # Load pretrained model
    model = YOLO(f"yolov8{model_size}.pt")
    
    # Check device
    device = "cpu"  # AMD GPU tidak support CUDA
    print(f"🔧 Training on: {device}")
    print(f"📦 Model: YOLOv8{model_size}")
    print(f"📊 Epochs: {epochs}")
    
    # Training
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        batch=batch_size,
        imgsz=img_size,
        device=device,
        project=project_name,
        name="ppe_detection",
        
        # Augmentasi untuk dataset kecil
        augment=True,
        mosaic=1.0,
        mixup=0.1,
        copy_paste=0.1,
        
        # Early stopping
        patience=20,
        
        # Save settings
        save=True,
        save_period=10,
        
        # Logging untuk dokumentasi lomba
        plots=True,
        verbose=True,
    )
    
    print("✅ Training selesai!")
    print(f"📁 Model tersimpan di: {project_name}/ppe_detection/weights/best.pt")
    
    return results

# =============================================================================
# STEP 5: EVALUASI & METRICS (UNTUK LOMBA)
# =============================================================================

import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd
from pathlib import Path

def generate_competition_metrics(model_path, data_yaml, output_dir="./docs/training_results"):
    """
    Generate semua metrics yang dibutuhkan untuk lomba:
    1. Confusion Matrix
    2. Precision-Recall Curve
    3. F1 Score per class
    4. mAP Scores
    5. Training curves
    """
    
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    
    # Load model
    model = YOLO(model_path)
    
    # Validasi
    metrics = model.val(data=data_yaml, plots=True)
    
    # ===== 1. CONFUSION MATRIX =====
    print("\n📊 Generating Confusion Matrix...")
    
    # Metrics dari validasi
    precision = metrics.box.mp  # mean precision
    recall = metrics.box.mr     # mean recall
    map50 = metrics.box.map50   # mAP@0.5
    map50_95 = metrics.box.map  # mAP@0.5:0.95
    
    # ===== 2. SUMMARY TABLE =====
    print("\n📋 Generating Summary Table...")
    
    summary_data = {
        "Metric": ["Precision", "Recall", "mAP@50", "mAP@50-95", "F1 Score"],
        "Value": [
            f"{precision:.4f}",
            f"{recall:.4f}",
            f"{map50:.4f}",
            f"{map50_95:.4f}",
            f"{2 * precision * recall / (precision + recall):.4f}"
        ],
        "Percentage": [
            f"{precision*100:.2f}%",
            f"{recall*100:.2f}%",
            f"{map50*100:.2f}%",
            f"{map50_95*100:.2f}%",
            f"{2 * precision * recall / (precision + recall)*100:.2f}%"
        ]
    }
    
    df_summary = pd.DataFrame(summary_data)
    
    # Save to CSV
    df_summary.to_csv(output / "metrics_summary.csv", index=False)
    
    # Print table
    print("\n" + "="*60)
    print("         SMARTAPD - PPE DETECTION METRICS")
    print("="*60)
    print(df_summary.to_string(index=False))
    print("="*60)
    
    # ===== 3. GENERATE MARKDOWN REPORT =====
    report = f"""
# SmartAPD - Hasil Training Model PPE Detection

## 📊 Ringkasan Performa Model

| Metric | Value | Percentage |
|--------|-------|------------|
| Precision | {precision:.4f} | {precision*100:.2f}% |
| Recall | {recall:.4f} | {recall*100:.2f}% |
| mAP@50 | {map50:.4f} | {map50*100:.2f}% |
| mAP@50-95 | {map50_95:.4f} | {map50_95*100:.2f}% |
| F1 Score | {2*precision*recall/(precision+recall):.4f} | {2*precision*recall/(precision+recall)*100:.2f}% |

## 📈 Interpretasi Hasil

### Precision (Ketepatan)
- **{precision*100:.2f}%** dari prediksi model adalah benar
- Semakin tinggi = semakin sedikit false positive

### Recall (Kelengkapan)  
- Model berhasil mendeteksi **{recall*100:.2f}%** dari semua objek
- Semakin tinggi = semakin sedikit yang terlewat

### mAP (Mean Average Precision)
- **mAP@50**: {map50*100:.2f}% - Akurasi dengan IoU threshold 50%
- **mAP@50-95**: {map50_95*100:.2f}% - Akurasi rata-rata semua threshold

## 🎯 Kesimpulan

Model SmartAPD mencapai akurasi **{map50*100:.2f}%** dalam mendeteksi 
penggunaan APD (Alat Pelindung Diri) pada pekerja konstruksi.

---
*Generated by SmartAPD Training Pipeline*
"""
    
    (output / "TRAINING_REPORT.md").write_text(report)
    print(f"\n✅ Report saved to: {output / 'TRAINING_REPORT.md'}")
    
    return metrics

# =============================================================================
# STEP 6: EXPORT MODEL (ONNX untuk AMD GPU)
# =============================================================================

def export_to_onnx(model_path, output_path="./ai-engine/models"):
    """
    Export model ke format ONNX untuk inference dengan AMD GPU
    
    AMD GPU menggunakan DirectML yang support ONNX format
    """
    
    output = Path(output_path)
    output.mkdir(parents=True, exist_ok=True)
    
    # Load model
    model = YOLO(model_path)
    
    # Export ke ONNX
    model.export(
        format="onnx",
        imgsz=640,
        simplify=True,
        opset=12,
    )
    
    # Move ke output folder
    onnx_path = Path(model_path).with_suffix(".onnx")
    if onnx_path.exists():
        shutil.move(str(onnx_path), str(output / "ppe_detector.onnx"))
    
    print(f"✅ Model exported to: {output / 'ppe_detector.onnx'}")
    return str(output / "ppe_detector.onnx")

# =============================================================================
# STEP 7: TESTING MODEL
# =============================================================================

def test_model(model_path, image_path):
    """
    Test model dengan gambar
    """
    model = YOLO(model_path)
    results = model(image_path)
    
    # Tampilkan hasil
    for r in results:
        print(f"Detected {len(r.boxes)} objects:")
        for box in r.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            print(f"  - Class {cls}: {conf*100:.1f}%")
    
    # Save result
    results[0].save(filename="test_result.jpg")
    print("✅ Result saved to: test_result.jpg")

# =============================================================================
# MAIN - JALANKAN SEMUA STEP
# =============================================================================

if __name__ == "__main__":
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║           SMARTAPD - PPE DETECTION TRAINING               ║
    ║              Panduan Training untuk Lomba                 ║
    ╚═══════════════════════════════════════════════════════════╝
    
    LANGKAH-LANGKAH:
    
    1. Jalankan install_requirements() untuk install dependencies
    2. Download dataset dari Roboflow atau siapkan dataset sendiri
    3. Jalankan prepare_dataset() untuk menyiapkan struktur folder
    4. Jalankan train_model() untuk training (butuh waktu)
    5. Jalankan generate_competition_metrics() untuk dokumentasi lomba
    6. Jalankan export_to_onnx() untuk deploy ke AMD GPU
    
    CONTOH PENGGUNAAN:
    
    # Install dependencies
    install_requirements()
    
    # Prepare dataset (jika sudah punya)
    prepare_dataset("path/to/your/dataset")
    
    # Training
    train_model(
        data_yaml="./training/dataset/data.yaml",
        model_size="s",  # small untuk AMD GPU
        epochs=100,
        batch_size=8
    )
    
    # Generate metrics untuk lomba
    generate_competition_metrics(
        model_path="smartapd_training/ppe_detection/weights/best.pt",
        data_yaml="./training/dataset/data.yaml"
    )
    
    # Export ke ONNX
    export_to_onnx("smartapd_training/ppe_detection/weights/best.pt")
    """)
