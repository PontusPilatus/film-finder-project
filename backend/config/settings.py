from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Film Finder API"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",  # React app
        "http://localhost:8000",  # FastAPI Swagger UI
    ]
    
    # Data Paths
    BASE_DIR: Path = Path("backend/data")
    MODEL_DIR: Path = BASE_DIR / "models"
    PROCESSED_DATA_DIR: Path = BASE_DIR / "processed"
    RAW_DATA_DIR: Path = BASE_DIR / "raw"
    
    # Model Settings
    MIN_RATINGS_FOR_RECOMMENDATION: int = 5
    DEFAULT_RECOMMENDATIONS_LIMIT: int = 10
    
    class Config:
        case_sensitive = True

settings = Settings() 