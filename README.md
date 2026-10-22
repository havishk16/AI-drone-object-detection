# 🚁 Drone Object Detection System

YOLO11n trained on VisDrone dataset with full-stack web application for real-time object detection in aerial imagery.

## � Deliverables Location

| Requirement | Location | Notes |
|------------|----------|-------|
| **Training Notebook** | [`assignment.ipynb`](./assignment.ipynb) | Complete training process in Colab |
| **ONNX Model** | [`backend/models/best.onnx`](./backend/models/best.onnx) | 10.18 MB - exported from PyTorch |
| **Application Code** | [`backend/`](./backend) & [`frontend/`](./frontend) | FastAPI + React |
| **Docker Compose** | [`docker-compose.yml`](./docker-compose.yml) | One-command deployment |
| **Results & Decisions** | This README | See sections below |

---

## 📊 Training Results

### Model Configuration
- **Model**: YOLO11n 
- **Dataset**: VisDrone 
- **Training**: 30 epochs, 640×640 resolution, Tesla T4 GPU

### Final Performance Metrics (Training results)

| Metric | Value | Description |
|--------|-------|-------------|
| **mAP50** | **29.8%** | Detection accuracy at 50% IoU |
| **mAP50-95** | **16.4%** | Strict metric (50-95% IoU range) |
| **Precision** | 42.4% | Accuracy of positive predictions |
| **Recall** | 31.2% | Coverage of actual objects |


### Final Performance Metrics (Validation results using ONNX model)

| Metric | Value | Description |
|--------|-------|-------------|
| **mAP50** | **28.8%** | Detection accuracy at 50% IoU |
| **mAP50-95** | **16.1%** | Strict metric (50-95% IoU range) |
| **Precision** | 41.3% | Accuracy of positive predictions |
| **Recall** | 31.4% | Coverage of actual objects |


## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- 8GB RAM recommended

### Setup (3 steps)

```bash
# 1. Clone repository
git clone https://github.com/havishk16/AI-drone-object-detection.git
cd AI-drone-object-detection

# 2. Start application
docker compose up --build

# 3. Open browser
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

**First launch takes 3-5 minutes to build. Subsequent starts are instant.**


## 🔑 Key Technical Decisions


### 1. YOLO11n for model
**Why**:  Preferred over YOLOv8n because it offers better detection accuracy with fewer parameters and less computation 


### 2. ONNX for Production Inference
**Why**: 3-5× faster than PyTorch, no heavy dependencies, smaller size (~10MB vs ~20MB)  


### 3. FastAPI Backend
**Why**: Modern async framework, automatic API docs, type safety with Pydantic  

### 4. React + Vite Frontend
**Why**: Fast HMR, smaller bundles, modern tooling  


### 5. Canvas for Bounding Boxes
**Why**: Better performance with many boxes, scales naturally with image  


### 6. PostgreSQL Database
**Why**: Production-ready, good concurrency, JSONB support for detection data  


### 7. Docker Compose
**Why**: True one-command deployment, environment consistency, easy scaling  

---

## 🔮 What I will improve with more time

Given more time, I would implement:

### Performance Optimizations

- [ ] **Model optimization**: Quantize ONNX model (FP16/INT8) for faster inference
- [ ] **Batch processing**: Support multiple image uploads

### Features

- [ ] **Stats dashboard**: Charts showing object distribution over time
- [ ] **Video support**: Frame-by-frame detection on drone videos
- [ ] **Export results**: Download detection results as JSON/CSV
- [ ] **Comparison mode**: Compare detections between different models

### Model Improvements

- [ ] **Larger input size**: Train at 1280x1280 for better small-object detection
- [ ] **Custom augmentation**: Domain-specific data augmentation for drones
- [ ] **Training with more epochs**: Instead of 30 I will train for more epochs

### UI/UX

- [ ] **Zoom controls**: Zoom into bounding boxes
- [ ] **Class color coding**: Consistent colors per class

