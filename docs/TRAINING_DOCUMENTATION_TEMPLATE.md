# SmartAPD - Dokumentasi Training untuk Lomba

## 📊 Template Dokumentasi Hasil Training

Dokumen ini berisi template untuk dokumentasi hasil training model PPE Detection yang diperlukan untuk kompetisi.

---

## 1. Informasi Dataset

### 1.1 Statistik Dataset

| Kategori | Jumlah |
|----------|--------|
| Total Images | [JUMLAH] |
| Training Set | [JUMLAH] |
| Validation Set | [JUMLAH] |
| Test Set | [JUMLAH] |

### 1.2 Distribusi Kelas

| Kelas | Jumlah Annotasi | Persentase |
|-------|-----------------|------------|
| Helmet (Helm) | [JUMLAH] | [%] |
| No Helmet | [JUMLAH] | [%] |
| Vest (Rompi) | [JUMLAH] | [%] |
| No Vest | [JUMLAH] | [%] |
| Gloves (Sarung Tangan) | [JUMLAH] | [%] |
| No Gloves | [JUMLAH] | [%] |
| Boots (Sepatu Safety) | [JUMLAH] | [%] |
| No Boots | [JUMLAH] | [%] |
| Person | [JUMLAH] | [%] |

### 1.3 Sumber Dataset

- **Dataset Utama**: [Nama Dataset dari Roboflow/sumber lain]
- **Dataset Tambahan**: [Foto sendiri/koleksi]
- **Augmentasi**: Ya/Tidak

---

## 2. Konfigurasi Training

### 2.1 Hardware

| Komponen | Spesifikasi |
|----------|-------------|
| CPU | AMD Ryzen 5 6000 Series |
| GPU | AMD Radeon 680M (iGPU) |
| RAM | [JUMLAH] GB |
| Storage | [TIPE] SSD |

### 2.2 Software

| Software | Versi |
|----------|-------|
| Python | 3.10 |
| PyTorch | 2.x |
| Ultralytics | 8.x |
| ONNX Runtime | 1.x |
| OpenCV | 4.x |

### 2.3 Hyperparameters

| Parameter | Nilai |
|-----------|-------|
| Model | YOLOv8s (Small) |
| Epochs | 100 |
| Batch Size | 8 |
| Image Size | 640x640 |
| Learning Rate | 0.01 (auto) |
| Optimizer | AdamW |
| Augmentation | Mosaic, MixUp |

---

## 3. Hasil Training

### 3.1 Training Metrics

#### Loss Curve
![Training Loss](./images/train_loss.png)

| Epoch | Box Loss | Cls Loss | DFL Loss |
|-------|----------|----------|----------|
| 10 | [VALUE] | [VALUE] | [VALUE] |
| 50 | [VALUE] | [VALUE] | [VALUE] |
| 100 | [VALUE] | [VALUE] | [VALUE] |

### 3.2 Validation Metrics

| Metric | Value | Interpretation |
|--------|-------|----------------|
| **Precision** | [0.XX] | Ketepatan prediksi positif |
| **Recall** | [0.XX] | Kelengkapan deteksi |
| **mAP@50** | [0.XX] | Mean Average Precision @ IoU 0.5 |
| **mAP@50-95** | [0.XX] | Mean Average Precision @ IoU 0.5:0.95 |
| **F1 Score** | [0.XX] | Harmonic mean of P & R |

### 3.3 Per-Class Performance

| Kelas | Precision | Recall | mAP@50 | mAP@50-95 |
|-------|-----------|--------|--------|-----------|
| helmet | [0.XX] | [0.XX] | [0.XX] | [0.XX] |
| no_helmet | [0.XX] | [0.XX] | [0.XX] | [0.XX] |
| vest | [0.XX] | [0.XX] | [0.XX] | [0.XX] |
| no_vest | [0.XX] | [0.XX] | [0.XX] | [0.XX] |
| gloves | [0.XX] | [0.XX] | [0.XX] | [0.XX] |
| no_gloves | [0.XX] | [0.XX] | [0.XX] | [0.XX] |
| boots | [0.XX] | [0.XX] | [0.XX] | [0.XX] |
| no_boots | [0.XX] | [0.XX] | [0.XX] | [0.XX] |
| person | [0.XX] | [0.XX] | [0.XX] | [0.XX] |

---

## 4. Confusion Matrix

### 4.1 Confusion Matrix Visualization
![Confusion Matrix](./images/confusion_matrix.png)

### 4.2 Confusion Matrix Table

|  | Pred: helmet | Pred: no_helmet | Pred: vest | ... |
|--|--------------|-----------------|------------|-----|
| **True: helmet** | [TP] | [FN] | ... | ... |
| **True: no_helmet** | [FP] | [TP] | ... | ... |
| **True: vest** | ... | ... | [TP] | ... |

---

## 5. Precision-Recall Curve

### 5.1 PR Curve Visualization
![PR Curve](./images/pr_curve.png)

### 5.2 PR Curve Data Points

| Recall | Precision |
|--------|-----------|
| 0.0 | 1.0 |
| 0.1 | [VALUE] |
| 0.2 | [VALUE] |
| ... | ... |
| 1.0 | [VALUE] |

---

## 6. Inference Performance

### 6.1 Speed Benchmark

| Metric | ONNX (DirectML) | PyTorch (CPU) |
|--------|-----------------|---------------|
| Preprocess | [X] ms | [X] ms |
| Inference | [X] ms | [X] ms |
| Postprocess | [X] ms | [X] ms |
| **Total** | **[X] ms** | **[X] ms** |
| **FPS** | **[X]** | **[X]** |

### 6.2 Model Size

| Format | Size |
|--------|------|
| PyTorch (.pt) | [X] MB |
| ONNX (.onnx) | [X] MB |

---

## 7. Contoh Hasil Deteksi

### 7.1 True Positive (Deteksi Benar)
![TP Example 1](./images/example_tp_1.jpg)
![TP Example 2](./images/example_tp_2.jpg)

### 7.2 False Positive (Deteksi Salah)
![FP Example](./images/example_fp.jpg)

### 7.3 False Negative (Tidak Terdeteksi)
![FN Example](./images/example_fn.jpg)

---

## 8. Kesimpulan & Rekomendasi

### 8.1 Kesimpulan
- Model SmartAPD mencapai akurasi **[X]%** dalam mendeteksi penggunaan APD
- Performa terbaik pada kelas: [KELAS]
- Performa perlu ditingkatkan pada kelas: [KELAS]

### 8.2 Rekomendasi Pengembangan
1. Tambah data training untuk kelas [X]
2. Gunakan augmentasi lebih agresif
3. Pertimbangkan model yang lebih besar jika GPU tersedia

### 8.3 Limitasi
- Model dioptimalkan untuk kondisi pencahayaan indoor
- Performa menurun pada objek dengan oklusi tinggi
- Resolusi minimum yang disarankan: 640x640

---

## 9. Lampiran

### 9.1 File Model
- `ppe_detector.pt` - Model PyTorch
- `ppe_detector.onnx` - Model ONNX (untuk AMD GPU)

### 9.2 File Konfigurasi
- `data.yaml` - Konfigurasi dataset
- `hyp.yaml` - Hyperparameters

### 9.3 Script
- `01_training_ppe_model.py` - Script training
- `detector_realtime.py` - Script inference real-time

---

*Dokumen ini dibuat oleh SmartAPD Team untuk keperluan kompetisi.*
*Tanggal: [TANGGAL]*
*Versi: 1.0*
