# 📝 Convert Model to ONNX (Google Colab Method)

Since you're having Python path issues on Windows, the **easiest way** is to convert the model in Google Colab where you trained it.

## 🚀 Quick Conversion in Colab

Add this cell to your `assignment.ipynb` notebook and run it:

```python
from ultralytics import YOLO
from google.colab import files

# Load your trained model
model = YOLO("runs/detect/train/weights/best.pt")

# Export to ONNX
print("Exporting to ONNX...")
onnx_path = model.export(format="onnx", imgsz=640, simplify=True, opset=12)

print(f"✅ Export complete: {onnx_path}")

# Download the ONNX file
print("Downloading ONNX model...")
files.download(onnx_path)
```

This will download `best.onnx` to your computer.

---

## 📥 After Download

Once you have `best.onnx` downloaded:

### Windows:
```bash
# Copy to backend models directory
copy Downloads\best.onnx C:\Github\rayonix\backend\models\best.onnx
```

### Check it's there:
```bash
dir C:\Github\rayonix\backend\models\best.onnx
```

You should see a file around **5-6 MB** in size.

---

## ✅ Verify

```bash
cd C:\Github\rayonix

# Check file exists
dir backend\models\best.onnx

# Should show:
# best.onnx    ~5-6 MB
```

---

## 🚀 Next: Launch the App

Once the model is in place:

```bash
docker compose up --build
```

---

## 🐛 Alternative: Manual Conversion on Windows

If you really want to convert locally, try this:

### Option 1: Use Python from python.org
```bash
# 1. Download Python from python.org (not Windows Store)
# 2. Install it
# 3. Run:
pip install ultralytics
python convert_model.py
```

### Option 2: Use a Virtual Environment
```bash
# Create venv
python -m venv venv

# Activate it
.\venv\Scripts\activate

# Install ultralytics
pip install ultralytics

# Convert
python convert_model.py
```

### Option 3: Direct Python Command
```bash
python -c "from ultralytics import YOLO; model = YOLO('detect/train/weights/best.pt'); model.export(format='onnx', imgsz=640, simplify=True)"
```

---

## 💡 Recommended: Use Colab

The Colab method is **fastest and most reliable** since:
- ✅ All dependencies already installed
- ✅ Same environment where you trained
- ✅ No Windows path issues
- ✅ Takes 30 seconds

Just add the cell above to your notebook and run it! 🚀
