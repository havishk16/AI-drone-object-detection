# 📦 Training Artifacts

Due to file size constraints, training artifacts are available separately:

## 🔗 Download Links

### Training Results
- **runs.zip** (19 MB) - Complete training logs, metrics, and plots
  - Contains: results.csv, confusion matrices, training curves
  - [Download from Google Drive](YOUR_LINK_HERE)

### Model Weights  
- **weights.zip** (5 MB) - PyTorch model weights
  - Contains: best.pt, last.pt
  - [Download from Google Drive](YOUR_LINK_HERE)

### VisDrone Dataset
- **Note**: Dataset is publicly available from VisDrone official website
  - The dataset is automatically downloaded during training
  - Size: ~3.8 GB
  - Source: http://aiskyeye.com/

## ✅ What's Already Included in Repository

- ✅ `assignment.ipynb` - Complete training notebook
- ✅ `backend/models/best.onnx` - Exported model (10.18 MB)
- ✅ Training metrics in README.md (mAP50, mAP50-95, per-class AP)
- ✅ Training configuration in `detect/train/args.yaml`

## 📊 Training Metrics Summary

From `runs/detect/train/results.csv`:

| Metric | Value |
|--------|-------|
| mAP50 | 0.2978 (29.78%) |
| mAP50-95 | 0.1638 (16.38%) |
| Precision | 0.4238 |
| Recall | 0.3121 |

All metrics are documented in the main README.md file.

## 🔧 Reproducing Training

To reproduce the training:

```bash
# In Google Colab
!pip install ultralytics

from ultralytics import YOLO
model = YOLO("yolo11n.pt")
model.train(data="VisDrone.yaml", epochs=30, imgsz=640, device=0)
```

The VisDrone dataset will be downloaded automatically by Ultralytics.
