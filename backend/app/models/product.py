from sqlalchemy import Column, Integer, String, Float, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    brand = Column(String(100), nullable=False, index=True)
    technical_name = Column(String(200), nullable=True)  # e.g., Chlorantraniliprole 18.5% SC
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    price = Column(Float, nullable=False)  # Selling price in INR
    cost_price = Column(Float, nullable=False)  # Retailer purchase price for margin analytics
    stock_quantity = Column(Integer, default=0, nullable=False)
    unit = Column(String(50), default="kg")  # kg, liter, bag, packet, piece
    
    suitable_crops = Column(String(300), nullable=True)  # e.g., "Wheat, Rice, Maize"
    dosage_instructions = Column(Text, nullable=True)  # e.g., "50 kg/acre during sowing"
    safety_guidelines = Column(Text, nullable=True)
    low_stock_threshold = Column(Integer, default=10)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="products")
    pos_items = relationship("POSItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
