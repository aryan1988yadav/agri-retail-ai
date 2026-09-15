from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class POSItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class POSItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    unit_price: float
    total_price: float

    class Config:
        from_attributes = True

class POSSaleCreate(BaseModel):
    customer_name: str
    customer_phone: Optional[str] = None
    payment_method: str = "Cash"  # Cash, UPI, Khata
    discount_amount: float = 0.0
    tax_amount: float = 0.0
    notes: Optional[str] = None
    items: List[POSItemCreate]

class POSSaleResponse(BaseModel):
    id: int
    invoice_number: str
    customer_name: str
    customer_phone: Optional[str] = None
    payment_method: str
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    notes: Optional[str] = None
    created_at: datetime
    items: List[POSItemResponse] = []

    class Config:
        from_attributes = True

class POSDailySummary(BaseModel):
    total_sales_count: int
    total_revenue: float
    cash_sales: float
    upi_sales: float
    khata_sales: float
