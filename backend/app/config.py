from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@db:5432/drone_detection"
    upload_dir: str = "./uploads"
    model_path: str = "./models/best.onnx"
    conf_threshold: float = 0.25
    iou_threshold: float = 0.45
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
