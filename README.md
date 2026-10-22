# 🚁 Drone Object Detection - YOLO11n on VisDrone

A complete web application for detecting objects in drone aerial footage using YOLO11n fine-tuned on the VisDrone dataset.

## 📋 Overview

This project consists of:
- **Model Training**: YOLO11n fine-tuned on VisDrone dataset (Google Colab)
- **Backend API**: FastAPI with ONNX inference engine
- **Frontend**: React application with image upload and visualization
- **Database**: PostgreSQL for storing detection history
- **Deployment**: Docker Compose for one-command setup

## 🎯 Features

### Core Features
- ✅ Upload drone images for object detection
- ✅ Real-time ONNX inference with bounding box visualization
- ✅ Detection history with pagination
- ✅ PostgreSQL database for persistence
- ✅ One-command deployment with Docker Compose

### Bonus Features
- ✅ **Stats chart** showing object counts per class with visual bar chart
- ✅ **Confidence threshold slider** - Adjust detection sensitivity in real-time
- ✅ **IoU threshold slider** - Control Non-Maximum Suppression
- ✅ **History filters** - Filter by filename, object count range, and sort options
- ✅ **Responsive design** - Works on desktop and mobile

### Detected Objects (VisDrone Classes)
1. Pedestrian
2. People
3. Bicycle
4. Car
5. Van
6. Truck
7. Tricycle
8. Awning-tricycle
9. Bus
10. Motor

## 📊 Model Performance

**Model**: YOLO11n (nano) - 2.6M parameters  
**Dataset**: VisDrone (6,471 training images, 548 validation images)  
**Training**: 30 epochs at 640x640 resolution on Google Colab (Tesla T4 GPU)

### Results

| Metric | Value |
|--------|-------|
| **mAP50** | **0.2978** (29.78%) |
| **mAP50-95** | **0.1638** (16.38%) |
| **Precision** | 0.4238 |
| **Recall** | 0.3121 |
| Inference Time | ~50-100ms per image (CPU) |

*Note: VisDrone is a challenging dataset with small objects captured from drones at high altitudes. The scores above are typical for this dataset - it's significantly harder than COCO due to small object sizes, dense occlusion, and varying perspectives.*

### Training Progress
- **Epochs**: 30 (converged around epoch 28)
- **Best epoch performance**: Epoch 30
- **Training time**: ~3640 seconds (~1 hour) on Tesla T4 GPU
- **Batch size**: 16
- **Image size**: 640x640

### Per-Class Performance
The model detects 10 object classes from the VisDrone dataset. Performance varies by class, with larger objects (cars, trucks, buses) typically having higher AP than smaller objects (pedestrians, bicycles).

## 🏗️ Project Structure

```
rayonix/
├── assignment.ipynb          # Training notebook (Google Colab)
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── database.py      # Database connection
│   │   ├── config.py        # Configuration
│   │   └── inference.py     # ONNX inference engine
│   ├── models/
│   │   └── best.onnx        # Trained model (ONNX format)
│   ├── uploads/             # Uploaded images
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── utils/          # API utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Docker and Docker Compose
- ONNX model file (`best.onnx`) from training

### Step 1: Clone and Setup

```bash
git clone <your-repo-url>
cd rayonix
```

### Step 2: Add the ONNX Model

Place your trained ONNX model in the backend models directory:

```bash
# If you have best.pt from training, convert it to ONNX:
# (Run this in your Colab notebook or locally with ultralytics)
# from ultralytics import YOLO
# model = YOLO("runs/detect/train/weights/best.pt")
# model.export(format="onnx", imgsz=640)

# Then copy to project:
cp best.onnx backend/models/
```

### Step 3: Launch the Application

```bash
docker compose up --build
```

This will:
1. Start PostgreSQL database
2. Build and launch FastAPI backend (port 8000)
3. Build and launch React frontend (port 3000)

### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📖 API Documentation

### Endpoints

#### POST `/predict`
Upload an image for object detection.

**Parameters:**
- `file`: Image file (multipart/form-data)
- `conf_threshold`: Confidence threshold (optional, default: 0.25)
- `iou_threshold`: IoU threshold for NMS (optional, default: 0.45)

**Response:**
```json
{
  "id": 1,
  "image_filename": "uuid.jpg",
  "image_url": "/uploads/uuid.jpg",
  "detections": [
    {
      "class_name": "car",
      "confidence": 0.85,
      "bbox": {
        "x1": 100.5,
        "y1": 150.2,
        "x2": 200.8,
        "y2": 250.6
      }
    }
  ],
  "total_objects": 1,
  "created_at": "2026-10-22T15:30:00Z"
}
```

#### GET `/history`
Get paginated detection history.

**Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 10, max: 100)

#### GET `/detection/{detection_id}`
Get detailed information about a specific detection.

## 🔧 Configuration

### Environment Variables

Backend (`.env`):
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/drone_detection
UPLOAD_DIR=./uploads
MODEL_PATH=./models/best.onnx
CONF_THRESHOLD=0.25
IOU_THRESHOLD=0.45
```

Frontend:
```
VITE_API_URL=http://localhost:8000
```

## 🧪 Testing

### Test the Backend API

```bash
# Health check
curl http://localhost:8000/

# Upload an image
curl -X POST "http://localhost:8000/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.jpg"

# Get history
curl http://localhost:8000/history?page=1&page_size=10
```

### Test the Frontend

1. Open http://localhost:3000
2. Click "Upload" and select a drone image
3. Click "Detect Objects"
4. View results with bounding boxes
5. Navigate to "History" to see past detections

## 🎨 Key Design Decisions

### 1. **ONNX for Inference**
- Faster inference compared to PyTorch
- No PyTorch/CUDA dependencies needed in production
- Smaller deployment footprint
- Cross-platform compatibility

### 2. **FastAPI Backend**
- Modern async Python framework
- Automatic API documentation (Swagger UI)
- Easy integration with ONNX Runtime
- Type safety with Pydantic

### 3. **React + Vite Frontend**
- Fast development with Hot Module Replacement
- Clean component architecture
- Canvas-based bounding box visualization
- Responsive design

### 4. **PostgreSQL Database**
- Reliable persistence for detection history
- JSON support for storing detection arrays
- Easy pagination with SQLAlchemy

### 5. **Docker Compose**
- Single command deployment
- Isolated environments
- Easy to replicate across machines
- Development and production parity

## 🔮 Future Improvements

Given more time, I would implement:

### Performance Optimizations
- [ ] **Model optimization**: Quantize ONNX model (FP16/INT8) for faster inference
- [ ] **Batch processing**: Support multiple image uploads
- [ ] **Async inference**: Queue system with Celery/Redis for heavy loads
- [ ] **Image tiling**: Split large images into tiles for better small-object detection

### Features
- [ ] **Confidence threshold slider**: Adjust detection sensitivity in real-time
- [ ] **History filters**: Filter by date, object count, specific classes
- [ ] **Stats dashboard**: Charts showing object distribution over time
- [ ] **Video support**: Frame-by-frame detection on drone videos
- [ ] **Export results**: Download detection results as JSON/CSV
- [ ] **Comparison mode**: Compare detections between different models

### Model Improvements
- [ ] **Larger input size**: Train at 1280x1280 for better small-object detection
- [ ] **Test-time augmentation**: Multi-scale inference for improved recall
- [ ] **Model ensemble**: Combine predictions from multiple models
- [ ] **Custom augmentation**: Domain-specific data augmentation for drones
- [ ] **Active learning**: Flag low-confidence predictions for re-training

### Infrastructure
- [ ] **Cloud deployment**: Deploy on AWS/GCP with auto-scaling
- [ ] **CDN for images**: Store uploads in S3/Cloud Storage
- [ ] **Monitoring**: Prometheus + Grafana for metrics
- [ ] **CI/CD pipeline**: Automated testing and deployment
- [ ] **Rate limiting**: Prevent API abuse
- [ ] **User authentication**: Multi-user support with auth

### UI/UX
- [ ] **Real-time preview**: Show detection as it processes
- [ ] **Zoom controls**: Zoom into bounding boxes
- [ ] **Class color coding**: Consistent colors per class
- [ ] **Mobile responsive**: Better mobile experience
- [ ] **Dark mode**: Theme toggle

## 📝 Training Notes

### Dataset Characteristics
- Small objects at high altitudes (challenging!)
- Variable lighting and weather conditions
- Dense crowded scenes with occlusion
- 10 classes focused on traffic/pedestrian scenarios

### Training Strategy
- Started with COCO-pretrained weights
- 30 epochs sufficient for convergence
- Could benefit from longer training (50-100 epochs)
- Data augmentation: mosaic, HSV adjustments, flips

### Limitations
- Small object detection is challenging at 640px
- Training on full dataset would require more GPU time
- Free Colab GPU has session limits

## 🤝 Contributing

Feel free to open issues or submit pull requests for improvements!

## 📄 License

This project is for educational purposes as part of the Rayonix technical assessment.

## 🙏 Acknowledgments

- [Ultralytics YOLO](https://github.com/ultralytics/ultralytics) for the training framework
- [VisDrone Dataset](http://aiskyeye.com/) for the dataset
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [React](https://react.dev/) for the frontend library
