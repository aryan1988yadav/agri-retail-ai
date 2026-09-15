import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AgriRetail AI"
    API_V1_STR: str = "/api"
    # Defaults to SQLite in backend directory for zero-RAM friction-free dev
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agri_retail.db")
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]

    GROQ_API_KEY: str = ""

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
