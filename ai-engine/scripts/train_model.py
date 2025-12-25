"""
SmartAPD AI - Model Training Script
====================================
Train YOLOv8 model dengan Construction Site Safety dataset
Based on Kaggle notebook: https://www.kaggle.com/code/snehilsanyal

Classes (10):
0: Hardhat
1: Mask
2: NO-Hardhat  (Violation)
3: NO-Mask     (Violation)
4: NO-Safety Vest (Violation)
5: Person
6: Safety Cone
7: Safety Vest
8: machinery
9: vehicle

Usage:
    python train_model.py                    # Train dengan default settings
    python train_model.py --epochs 80 --batch 16
    python train_model.py --debug           # Quick test (3 epochs)
"""

import os
import sys
import argparse
import warnings
from pathlib import Path
from datetime import datetime

warnings.filterwarnings("ignore")

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))


# =============================================================================
# CONFIGURATION (Based on Kaggle Notebook)
# =============================================================================
class CFG:
    DEBUG = False
    SEED = 88

    # Classes (from Roboflow CSS dataset)
    CLASSES = [
        'Hardhat', 'Mask', 'NO-Hardhat', 'NO-Mask',
        'NO-Safety Vest', 'Person', 'Safety Cone',
        'Safety Vest', 'machinery', 'vehicle'
    ]
    NUM_CLASSES = len(CLASSES)

    # Training settings
    EPOCHS = 3 if DEBUG else 80
    BATCH_SIZE = 16
    IMG_SIZE = 640

    # Model
    BASE_MODEL = 'yolov8s'  # yolov8n (fast), yolov8s (balanced), yolov8m, yolov8l, yolov8x (accurate)
    BASE_MODEL_WEIGHTS = f'{BASE_MODEL}.pt'

    # Optimizer settings
    OPTIMIZER = 'auto'  # SGD, Adam, Adamax, AdamW, NAdam, RAdam, RMSProp, auto
    LR = 1e-3
    LR_FACTOR = 0.01
    WEIGHT_DECAY = 5e-4
    DROPOUT = 0.025
    PATIENCE = 25
    LABEL_SMOOTHING = 0.0

    # Paths
    SCRIPT_DIR = Path(__file__).parent
    AI_ENGINE_DIR = SCRIPT_DIR.parent
    DATASET_DIR = AI_ENGINE_DIR / "datasets" / "construction-safety"
    OUTPUT_DIR = AI_ENGINE_DIR / "models"


# =============================================================================
# FUNCTIONS
# =============================================================================
def find_dataset():
    """Find the downloaded dataset from Kaggle"""
    possible_paths = [
        CFG.DATASET_DIR / "css-data",
        CFG.DATASET_DIR,
        Path.home() / ".cache" / "kagglehub" / "datasets" / "snehilsanyal" / "construction-site-safety-image-dataset-roboflow",
    ]
    
    for path in possible_paths:
        if not path.exists():
            continue
        # Look for valid dataset structure (train/images, train/labels)
        for root in [path] + list(path.glob("**/css-data")):
            if (root / "train" / "images").exists():
                return root
    
    return None


def create_data_yaml(dataset_path: Path) -> Path:
    """Create data.yaml file for YOLOv8 training (matching Kaggle notebook format)"""
    import yaml
    
    yaml_content = {
        'train': str(dataset_path / 'train'),
        'val': str(dataset_path / 'valid'),
        'test': str(dataset_path / 'test'),
        'nc': CFG.NUM_CLASSES,
        'names': CFG.CLASSES
    }
    
    yaml_path = CFG.AI_ENGINE_DIR / "datasets" / "data.yaml"
    yaml_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(yaml_path, 'w') as f:
        yaml.dump(yaml_content, f, default_flow_style=False)
    
    print(f"✅ Created data.yaml: {yaml_path}")
    return yaml_path


def train_model(epochs: int = None, batch_size: int = None, debug: bool = False):
    """Train YOLOv8 model with CSS dataset"""
    try:
        from ultralytics import YOLO
    except ImportError:
        print("❌ Ultralytics tidak terinstall!")
        print("   Install dengan: pip install ultralytics")
        return None

    # Override settings if provided
    if debug:
        CFG.DEBUG = True
        epochs = 3
        print("🔧 DEBUG MODE: Training for 3 epochs only")
    
    epochs = epochs or CFG.EPOCHS
    batch_size = batch_size or CFG.BATCH_SIZE
    
    print("=" * 60)
    print("SmartAPD AI - PPE Detection Model Training")
    print("Based on Roboflow Construction Site Safety Dataset")
    print("=" * 60)
    
    # Find dataset
    print("\n🔍 Looking for dataset...")
    dataset_path = find_dataset()
    
    if not dataset_path:
        print("❌ Dataset tidak ditemukan!")
        print("   Jalankan download_dataset.py terlebih dahulu")
        print(f"   Expected path: {CFG.DATASET_DIR}")
        return None
    
    print(f"✅ Dataset found: {dataset_path}")
    
    # Create data.yaml
    yaml_path = create_data_yaml(dataset_path)
    
    # Model output
    CFG.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    exp_name = f'smartapd_ppe_{epochs}_epochs_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
    
    print(f"\n📋 Training Configuration:")
    print(f"   Dataset: {dataset_path}")
    print(f"   Model: {CFG.BASE_MODEL_WEIGHTS}")
    print(f"   Epochs: {epochs}")
    print(f"   Batch size: {batch_size}")
    print(f"   Image size: {CFG.IMG_SIZE}")
    print(f"   Classes: {CFG.NUM_CLASSES}")
    print(f"   Output: {CFG.OUTPUT_DIR}")
    
    # Load pretrained model
    print(f"\n📥 Loading pretrained model: {CFG.BASE_MODEL_WEIGHTS}")
    model = YOLO(CFG.BASE_MODEL_WEIGHTS)
    
    # Train
    print("\n🚀 Starting training...")
    results = model.train(
        data=str(yaml_path),
        task='detect',
        epochs=epochs,
        batch=batch_size,
        imgsz=CFG.IMG_SIZE,
        
        # Optimizer settings (from Kaggle notebook)
        optimizer=CFG.OPTIMIZER,
        lr0=CFG.LR,
        lrf=CFG.LR_FACTOR,
        weight_decay=CFG.WEIGHT_DECAY,
        dropout=CFG.DROPOUT,
        patience=CFG.PATIENCE,
        label_smoothing=CFG.LABEL_SMOOTHING,
        
        # Output settings
        project=str(CFG.OUTPUT_DIR),
        name=exp_name,
        exist_ok=True,
        seed=CFG.SEED,
        
        # Training options
        val=True,
        amp=True,
        verbose=True,
        device='0' if os.environ.get('CUDA_VISIBLE_DEVICES') else 'cpu',
    )
    
    # Copy best model to ai-engine root
    best_model_path = CFG.OUTPUT_DIR / exp_name / "weights" / "best.pt"
    if best_model_path.exists():
        import shutil
        final_model_path = CFG.AI_ENGINE_DIR / "smartapd_ppe_model.pt"
        shutil.copy(best_model_path, final_model_path)
        print(f"\n✅ Best model saved to: {final_model_path}")
    
    # Export to ONNX (optional)
    try:
        model.export(format='onnx', imgsz=CFG.IMG_SIZE)
        print("✅ Model exported to ONNX format")
    except Exception as e:
        print(f"⚠️ ONNX export failed: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Training Complete!")
    print(f"   Results: {CFG.OUTPUT_DIR / exp_name}")
    print(f"   Model: {CFG.AI_ENGINE_DIR / 'smartapd_ppe_model.pt'}")
    print("=" * 60)
    
    return results


def main():
    parser = argparse.ArgumentParser(description="Train SmartAPD PPE Detection Model")
    parser.add_argument("--epochs", type=int, default=80, help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--debug", action="store_true", help="Debug mode (3 epochs)")
    
    args = parser.parse_args()
    
    train_model(
        epochs=args.epochs,
        batch_size=args.batch,
        debug=args.debug
    )


if __name__ == "__main__":
    main()
