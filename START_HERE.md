# 🚀 START HERE - Complete Setup in 3 Steps

## ⚡ Quick Setup

### Step 1: Convert Model to ONNX
```bash
python convert_model.py
```
**Expected output**: ✅ Model copied to `backend/models/best.onnx`

### Step 2: Launch Application
```bash
docker compose up --build
```
**Expected output**: 
- ✅ Database ready
- ✅ Backend running on :8000
- ✅ Frontend running on :3000

### Step 3: Test It
Open your browser: **http://localhost:3000**

Upload a drone image and click "Detect Objects"!

---

## 📚 Documentation Guide

Depending on what you need:

| I want to... | Read this file |
|-------------|---------------|
| 🏃 Get started immediately | `QUICKSTART.md` |
| 📖 Understand the full project | `README.md` |
| 🔧 Set up for production | `DEPLOYMENT.md` |
| 📊 See project summary | `PROJECT_SUMMARY.md` |
| ✅ Know what's next | `NEXT_STEPS.md` |

---

## 🆘 Troubleshooting

### "Model file not found"
```bash
python convert_model.py
```

### "Port already in use"
```bash
docker compose down
docker compose up --build
```

### "Docker not found"
Install Docker Desktop: https://www.docker.com/products/docker-desktop

---

## 🎯 What This Project Does

Upload a drone aerial image → Get object detections with bounding boxes

**Detects**: Cars, pedestrians, trucks, bicycles, buses, and more!

**Tech Stack**: YOLO11n + FastAPI + React + PostgreSQL + Docker

---

## ✨ Quick Test

```bash
# Test the API
python test_api.py

# With your own image
python test_api.py path/to/your/drone-image.jpg
```

---

**Need help?** Check `QUICKSTART.md` or the full `README.md`

**Ready to deploy?** See `DEPLOYMENT.md`

Happy detecting! 🚁
