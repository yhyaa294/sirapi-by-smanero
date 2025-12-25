"""
SmartAPD AI - Model Training Script
====================================
Train YOLOv8 model dengan Construction Site Safety dataset

Classes:
0: Hardhat
1: Mask
2: NO-Hardhat
3: NO-Mask
4: NO-Safety Vest
5: Person
6: Safety Cone
7: Safety Vest
8: machinery
9: vehicle

Usage:
    python train_model.py            # Train dengan default settings
    python train_model.py --epochs 50 --batch 16
"""

import os
import sys
import argparse
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from ultralytics import YOLO
except ImportError:
    print("❌ Ultralytics tidak terinstall!")
    print("   Install dengan: pip install ultralytics")
    sys.exit(1)


# Paths
SCRIPT_DIR = Path(__file__).parent
AI_ENGINE_DIR = SCRIPT_DIR.parent
DATASET_DIR = AI_ENGINE_DIR / "datasets" / "construction-safety"
MODEL_OUTPUT_DIR = AI_ENGINE_DIR / "models"


def find_dataset():
    """Find the downloaded dataset"""
    # Check common kagglehub download locations
    possible_paths = [
        DATASET_DIR,
        DATASET_DIR / "css-data",
        Path.home() / ".cache" / "kagglehub" / "datasets" / "snehilsanyal" / "construction-site-safety-image-dataset-roboflow",
    ]
    
    for path in possible_paths:
        if path.exists():
            # Check for css-data subfolder
            css_data = path / "css-data"
            if css_data.exists():
                return css_data
            # Check for train folder
            if (path / "train").exists():
                return path
            # Check subdirectories
            for subdir in path.iterdir():
                if subdir.is_dir():
                    if (subdir / "train").exists():
                        return subdir
                    css_data = subdir / "css-data"
                    if css_data.exists():
                        return css_data
    
    return None


def create_dataset_yaml(dataset_path: Path) -> Path:
    """Create data.yaml for YOLOv8 training"""
    yaml_content = f'''# Construction Site Safety Dataset
# Auto-generated for SmartAPD AI training

path: {dataset_path}
train: train/images
val: valid/images
test: test/images

# Classes (10)
names:
  0: Hardhat
  1: Mask
  2: NO-Hardhat
  3: NO-Mask
  4: NO-Safety Vest
  5: Person
  6: Safety Cone
  7: Safety Vest
  8: machinery
  9: vehicle

# SmartAPD violation classes (for detection)
# Violations: NO-Hardhat (2), NO-Mask (3), NO-Safety Vest (4)
'''
    
    yaml_path = AI_ENGINE_DIR / "datasets" / "construction-safety.yaml"
    yaml_path.parent.mkdir(parents=True, exist_ok=True)
    yaml_path.write_text(yaml_content)
    print(f"✅ Created dataset config: {yaml_path}")
    return yaml_path


def train_model(epochs: int = 100, batch_size: int = 16, img_size: int = 640):
    """Train YOLOv8 model"""
    print("=" * 60)
    print("SmartAPD AI - Model Training")
    print("=" * 60)
    
    # Find dataset
    print("\n🔍 Looking for dataset...")
    dataset_path = find_dataset()
    
    if not dataset_path:
        print("❌ Dataset tidak ditemukan!")
        print("   Jalankan download_dataset.py terlebih dahulu")
        print(f"   Expected path: {DATASET_DIR}")
        return None
    
    print(f"✅ Dataset found: {dataset_path}")
    
    # Create dataset YAML
    yaml_path = create_dataset_yaml(dataset_path)
    
    # Model output
    MODEL_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    run_name = f"smartapd_ppe_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    print(f"\n📋 Training configuration:")
    print(f"   Dataset: {dataset_path}")
    print(f"   Epochs: {epochs}")
    print(f"   Batch size: {batch_size}")
    print(f"   Image size: {img_size}")
    print(f"   Output: {MODEL_OUTPUT_DIR}")
    
    # Load base model
    print("\n🚀 Starting training...")
    model = YOLO("yolov8n.pt")  # Start from pretrained nano model
    
    # Train
    results = model.train(
        data=str(yaml_path),
        epochs=epochs,
        batch=batch_size,
        imgsz=img_size,
        project=str(MODEL_OUTPUT_DIR),
        name=run_name,
        exist_ok=True,
        patience=20,  # Early stopping
        save=True,
        plots=True,
        device="0" if os.environ.get("CUDA_VISIBLE_DEVICES") else "cpu",
    )
    
    # Copy best model to ai-engine root
    best_model_path = MODEL_OUTPUT_DIR / run_name / "weights" / "best.pt"
    if best_model_path.exists():
        final_model_path = AI_ENGINE_DIR / "smartapd_ppe_model.pt"
        import shutil
        shutil.copy(best_model_path, final_model_path)
        print(f"\n✅ Best model saved to: {final_model_path}")
    
    print("\n" + "=" * 60)
    print("✅ Training selesai!")
    print(f"   Results: {MODEL_OUTPUT_DIR / run_name}")
    print("=" * 60)
    
    return results


def main():
    parser = argparse.ArgumentParser(description="Train SmartAPD PPE Detection Model")
    parser.add_argument("--epochs", type=int, default=100, help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--img-size", type=int, default=640, help="Image size")
    
    args = parser.parse_args()
    
    train_model(
        epochs=args.epochs,
        batch_size=args.batch,
        img_size=args.img_size
    )


if __name__ == "__main__":
    main()
