"""
Script to export YOLO11n model to ONNX format.
Run this in your Google Colab after training or locally if you have the .pt file.
"""

from ultralytics import YOLO

# Load the best trained model
model = YOLO("runs/detect/train/weights/best.pt")

# Validate and print metrics
print("Validating model...")
metrics = model.val(
    data="VisDrone.yaml",
    split="val",
    imgsz=640,
    device=0  # Use 0 for GPU, 'cpu' for CPU
)

# Print overall metrics
print("\n" + "="*50)
print("VALIDATION RESULTS")
print("="*50)
print(f"mAP50: {metrics.box.map50:.4f}")
print(f"mAP50-95: {metrics.box.map:.4f}")

# Print per-class AP50
print("\nPer-class AP50:")
print("-"*50)
for i, name in model.names.items():
    ap50 = metrics.box.maps[i]
    print(f"{name:20s}: {ap50:.4f}")

# Export to ONNX
print("\n" + "="*50)
print("EXPORTING TO ONNX")
print("="*50)
model.export(
    format="onnx",
    imgsz=640,
    simplify=True,
    opset=12
)

print("\n✅ Export complete!")
print("Download 'best.onnx' and place it in: backend/models/best.onnx")
