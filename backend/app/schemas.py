from pydantic import BaseModel
from datetime import datetime
from typing import List


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DetectionObject(BaseModel):
    class_name: str
    confidence: float
    bbox: BoundingBox


class PredictionResponse(BaseModel):
    id: int
    image_filename: str
    image_url: str
    detections: List[DetectionObject]
    total_objects: int
    created_at: datetime


class HistoryItem(BaseModel):
    id: int
    image_filename: str
    image_url: str
    total_objects: int
    created_at: datetime

    class Config:
        from_attributes = True
