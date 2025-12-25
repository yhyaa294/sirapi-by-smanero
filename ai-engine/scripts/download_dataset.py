"""
SmartAPD AI - Dataset Download Script
=====================================
Download Construction Site Safety dataset dari Kaggle

Setup:
1. pip install kagglehub
2. Download Kaggle API key dari https://www.kaggle.com/settings
3. Simpan ke ~/.kaggle/kaggle.json
"""

import os
import sys
import zipfile
from pathlib import Path

# Try kagglehub first, fallback to kaggle API
try:
    import kagglehub
    USE_KAGGLEHUB = True
except ImportError:
    USE_KAGGLEHUB = False
    try:
        import kaggle
        USE_KAGGLE = True
    except ImportError:
        USE_KAGGLE = False
        print("❌ Tidak ada library kaggle terinstall!")
        print("   Install dengan: pip install kagglehub")
        sys.exit(1)

# Dataset info
DATASET_NAME = "snehilsanyal/construction-site-safety-image-dataset-roboflow"
OUTPUT_DIR = Path(__file__).parent.parent / "datasets" / "construction-safety"


def download_with_kagglehub():
    """Download using kagglehub library"""
    print("📥 Downloading dataset using kagglehub...")
    path = kagglehub.dataset_download(DATASET_NAME)
    print(f"✅ Downloaded to: {path}")
    return path


def download_with_kaggle_api():
    """Download using kaggle API"""
    print("📥 Downloading dataset using kaggle API...")
    kaggle.api.authenticate()
    kaggle.api.dataset_download_files(
        DATASET_NAME,
        path=str(OUTPUT_DIR),
        unzip=True
    )
    print(f"✅ Downloaded to: {OUTPUT_DIR}")
    return str(OUTPUT_DIR)


def main():
    print("=" * 60)
    print("SmartAPD AI - Dataset Downloader")
    print("=" * 60)
    print(f"Dataset: {DATASET_NAME}")
    print(f"Output: {OUTPUT_DIR}")
    print()

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Download
    if USE_KAGGLEHUB:
        dataset_path = download_with_kagglehub()
    else:
        dataset_path = download_with_kaggle_api()

    print()
    print("=" * 60)
    print("✅ Download selesai!")
    print(f"   Path: {dataset_path}")
    print()
    print("Next step: Jalankan train_model.py untuk training")
    print("=" * 60)
    
    return dataset_path


if __name__ == "__main__":
    main()
