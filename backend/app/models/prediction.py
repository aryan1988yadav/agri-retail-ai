from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from datetime import datetime
from app.core.database import Base

class CropPredictionLog(Base):
    __tablename__ = "crop_prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    nitrogen = Column(Float, nullable=False)
    phosphorus = Column(Float, nullable=False)
    potassium = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    ph = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    
    recommended_crop = Column(String(100), nullable=False, index=True)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class FertilizerPredictionLog(Base):
    __tablename__ = "fertilizer_prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    target_crop = Column(String(100), nullable=False)
    soil_type = Column(String(100), nullable=True)
    nitrogen = Column(Float, nullable=False)
    phosphorus = Column(Float, nullable=False)
    potassium = Column(Float, nullable=False)
    
    recommended_fertilizer = Column(String(150), nullable=False)
    dosage_info = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
