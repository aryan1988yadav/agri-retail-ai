from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    brand: str
    technical_name: Optional[str] = None
    category_id: int
    price: float
    cost_price: float
    stock_quantity: int
    unit: str = "kg"
    suitable_crops: Optional[str] = None
    dosage_instructions: Optional[str] = None
    safety_guidelines: Optional[str] = None
    low_stock_threshold: int = 10
    image_url: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    technical_name: Optional[str] = None
    price: Optional[float] = None
    cost_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    unit: Optional[str] = None
    suitable_crops: Optional[str] = None
    dosage_instructions: Optional[str] = None
    low_stock_threshold: Optional[int] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True
