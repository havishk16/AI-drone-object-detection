from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from .database import Base


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    image_filename = Column(String, nullable=False)
    image_path = Column(String, nullable=False)
    detections_json = Column(Text, nullable=False)  # JSON string of all detections
    total_objects = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Detection(id={self.id}, filename={self.image_filename}, objects={self.total_objects})>"
