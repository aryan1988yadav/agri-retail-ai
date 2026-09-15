from pydantic import BaseModel, Field
from typing import List, Optional
from app.schemas.product import ProductResponse

class CropPredictionRequest(BaseModel):
    state: Optional[str] = "Haryana"
    season: Optional[str] = "Rabi"
    nitrogen: float = Field(..., ge=0, le=300, description="Nitrogen content in soil (kg/ha)")
    phosphorus: float = Field(..., ge=0, le=300, description="Phosphorus content in soil (kg/ha)")
    potassium: float = Field(..., ge=0, le=300, description="Potassium content in soil (kg/ha)")
    temperature: float = Field(..., ge=0, le=60, description="Average temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity (%)")
    ph: float = Field(..., ge=0, le=14, description="Soil pH value")
    rainfall: float = Field(..., ge=0, le=500, description="Annual / seasonal rainfall (mm)")

class AlternativeCrop(BaseModel):
    crop: str
    hindi_name: str
    confidence: float
    yield_range: str
    season: str

class CropPredictionResponse(BaseModel):
    recommended_crop: str
    hindi_name: str
    confidence: float
    state: Optional[str] = None
    season: Optional[str] = None
    expected_yield_range: str  # e.g., "18 - 24 Quintals/Acre"
    growing_season: str        # e.g., "Kharif (June - October)"
    soil_suitability_tips: str
    alternative_crops: List[AlternativeCrop] = []
    recommended_seeds_in_store: List[ProductResponse] = []
    recommended_fertilizers_in_store: List[ProductResponse] = []

class FertilizerAdvisoryRequest(BaseModel):
    target_crop: str
    soil_type: Optional[str] = "Loamy"
    nitrogen: float
    phosphorus: float
    potassium: float

class FertilizerDeficitItem(BaseModel):
    nutrient: str
    status: str  # "Deficient", "Adequate", "Excess"
    recommendation: str

class FertilizerAdvisoryResponse(BaseModel):
    target_crop: str
    analysis: List[FertilizerDeficitItem]
    primary_recommendation: str
    dosage_per_acre: str
    matching_fertilizers_in_store: List[ProductResponse] = []
