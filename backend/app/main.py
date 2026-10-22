from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import json
import os
import uuid
from datetime import datetime

from .database import engine, get_db, Base
from .models import Detection
from .schemas import PredictionResponse, HistoryItem, DetectionObject
from .inference import get_inference_engine
from .config import get_settings

# Create database tables
Base.metadata.create_all(bind=engine)

settings = get_settings()

app = FastAPI(
    title="Drone Object Detection API",
    description="API for detecting objects in drone aerial footage using YOLO11n",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for serving images
os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Drone Object Detection API",
        "model": "YOLO11n fine-tuned on VisDrone"
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(
    file: UploadFile = File(...),
    conf_threshold: float = Query(None, ge=0.0, le=1.0),
    iou_threshold: float = Query(None, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    """
    Upload an image and get object detection results.
    
    - **file**: Image file (JPEG, PNG)
    - **conf_threshold**: Confidence threshold (optional, default from config)
    - **iou_threshold**: IoU threshold for NMS (optional, default from config)
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.upload_dir, unique_filename)
    
    # Save uploaded file
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Run inference
    try:
        inference_engine = get_inference_engine()
        detections = inference_engine.predict(
            file_path,
            conf_threshold=conf_threshold,
            iou_threshold=iou_threshold
        )
    except Exception as e:
        # Clean up file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        import traceback
        error_detail = f"Inference failed: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)  # Log to console
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
    
    # Save to database
    db_detection = Detection(
        image_filename=unique_filename,
        image_path=file_path,
        detections_json=json.dumps(detections),
        total_objects=len(detections)
    )
    db.add(db_detection)
    db.commit()
    db.refresh(db_detection)
    
    # Format response
    detection_objects = [
        DetectionObject(
            class_name=d["class_name"],
            confidence=d["confidence"],
            bbox=d["bbox"]
        )
        for d in detections
    ]
    
    return PredictionResponse(
        id=db_detection.id,
        image_filename=unique_filename,
        image_url=f"/uploads/{unique_filename}",
        detections=detection_objects,
        total_objects=len(detections),
        created_at=db_detection.created_at
    )


@app.get("/history", response_model=List[HistoryItem])
def get_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get paginated history of past predictions.
    
    - **page**: Page number (starts at 1)
    - **page_size**: Number of items per page (max 100)
    """
    offset = (page - 1) * page_size
    
    detections = db.query(Detection)\
        .order_by(Detection.created_at.desc())\
        .offset(offset)\
        .limit(page_size)\
        .all()
    
    return [
        HistoryItem(
            id=d.id,
            image_filename=d.image_filename,
            image_url=f"/uploads/{d.image_filename}",
            total_objects=d.total_objects,
            created_at=d.created_at
        )
        for d in detections
    ]


@app.get("/detection/{detection_id}", response_model=PredictionResponse)
def get_detection(detection_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific detection.
    
    - **detection_id**: ID of the detection record
    """
    detection = db.query(Detection).filter(Detection.id == detection_id).first()
    
    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")
    
    # Parse detections JSON
    detections = json.loads(detection.detections_json)
    detection_objects = [
        DetectionObject(
            class_name=d["class_name"],
            confidence=d["confidence"],
            bbox=d["bbox"]
        )
        for d in detections
    ]
    
    return PredictionResponse(
        id=detection.id,
        image_filename=detection.image_filename,
        image_url=f"/uploads/{detection.image_filename}",
        detections=detection_objects,
        total_objects=detection.total_objects,
        created_at=detection.created_at
    )


@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get statistics about all detections."""
    total_predictions = db.query(Detection).count()
    total_objects = db.query(func.sum(Detection.total_objects)).scalar() or 0
    
    return {
        "total_predictions": total_predictions,
        "total_objects_detected": total_objects,
        "average_objects_per_image": total_objects / total_predictions if total_predictions > 0 else 0
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
