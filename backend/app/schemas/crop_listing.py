from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CropListingBase(BaseModel):
    farmer_name: str
    farmer_phone: str
    crop_name: str
    variety: Optional[str] = "Standard"
    quantity_quintals: float
    expected_price_per_quintal: float
    msp_benchmark: Optional[float] = None
    moisture_pct: Optional[float] = 12.0
    grade: Optional[str] = "Grade A / FAQ"
    village: str
    district: str
    state: str
    harvest_date: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = "active"

class CropListingCreate(CropListingBase):
    pass

class CropListingResponse(CropListingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class MSPBenchmark(BaseModel):
    crop: str
    season: str
    msp: float
    unit: str = "quintal"
