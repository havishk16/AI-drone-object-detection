"""
Convert the trained PyTorch model to ONNX format and place it in the backend.
Run this script to prepare your model for deployment.
"""

import os
import shutil
from pathlib import Path

print("="*60)
print("Converting YOLO11n Model to ONNX")
print("="*60)

# Check if best.pt exists
model_path = Path("detect/train/weights/best.pt")
if not model_path.exists():
    print(f"❌ Model file not found: {model_path}")
    print("\nPlease ensure you've extracted the runs.zip file.")
    exit(1)

print(f"✓ Found model: {model_path}")

try:
    import sys
    print(f"\nPython executable: {sys.executable}")
    print(f"Python version: {sys.version}")
    
    from ultralytics import YOLO
    
    # Load the trained model
    print("\nLoading model...")
    model = YOLO(str(model_path))
    
    # Export to ONNX
    print("Exporting to ONNX format...")
    print("(This may take a minute...)")
    
    export_path = model.export(
        format="onnx",
        imgsz=640,
        simplify=True,
        opset=12
    )
    
    print(f"✓ ONNX model created: {export_path}")
    
    # Create backend/models directory if it doesn't exist
    backend_models = Path("backend/models")
    backend_models.mkdir(parents=True, exist_ok=True)
    
    # Copy to backend/models/
    dest = backend_models / "best.onnx"
    if Path(export_path).exists():
        shutil.copy2(export_path, dest)
        print(f"✓ Model copied to: {dest}")
        
        # Get file size
        size_mb = dest.stat().st_size / (1024 * 1024)
        print(f"✓ Model size: {size_mb:.2f} MB")
    else:
        print(f"❌ Export file not found: {export_path}")
        exit(1)
    
    print("\n" + "="*60)
    print("✅ SUCCESS! Model is ready for deployment")
    print("="*60)
    print("\nNext steps:")
    print("1. Run: docker compose up --build")
    print("2. Open: http://localhost:3000")
    print("3. Upload an image and test!")
    
except ImportError:
    print("\n❌ Error: ultralytics package not found")
    print("\nTo convert the model, you need to install ultralytics:")
    print("  pip install ultralytics")
    print("\nAlternatively, convert it in Google Colab where you trained it:")
    print("  model = YOLO('runs/detect/train/weights/best.pt')")
    print("  model.export(format='onnx', imgsz=640, simplify=True)")
    print("  files.download('runs/detect/train/weights/best.onnx')")
    exit(1)
    
except Exception as e:
    print(f"\n❌ Error during conversion: {e}")
    print("\nTry converting manually in your training environment.")
    exit(1)
