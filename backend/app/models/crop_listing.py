from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from app.core.database import Base

class CropListing(Base):
    __tablename__ = "crop_listings"

    id = Column(Integer, primary_key=True, index=True)
    farmer_name = Column(String, nullable=False)
    farmer_phone = Column(String, nullable=False)
    crop_name = Column(String, nullable=False, index=True)
    variety = Column(String, nullable=True, default="Standard")
    quantity_quintals = Column(Float, nullable=False)
    expected_price_per_quintal = Column(Float, nullable=False)
    msp_benchmark = Column(Float, nullable=True)
    moisture_pct = Column(Float, nullable=True, default=12.0)
    grade = Column(String, default="Grade A / FAQ")
    village = Column(String, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False)
    harvest_date = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
