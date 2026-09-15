from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.core.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.schemas.product import (
    ProductResponse, ProductCreate, ProductUpdate, CategoryResponse
)

router = APIRouter()

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Fetch all product categories."""
    return db.query(Category).all()

@router.get("", response_model=List[ProductResponse])
def get_products(
    category_id: Optional[int] = None,
    crop: Optional[str] = None,
    search: Optional[str] = None,
    low_stock_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    List products with flexible filtering:
    - category_id: Filter by category (Fertilizers, Seeds, Pesticides, etc.)
    - crop: Filter by suitable crop (e.g., 'Wheat', 'Maize', 'Rice')
    - search: Keyword search in product name, brand, or technical name
    - low_stock_only: Filter items below their threshold
    """
    query = db.query(Product).filter(Product.is_active == True)

    if category_id:
        query = query.filter(Product.category_id == category_id)

    if crop:
        query = query.filter(Product.suitable_crops.ilike(f"%{crop}%"))

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_pattern),
                Product.brand.ilike(search_pattern),
                Product.technical_name.ilike(search_pattern),
                Product.suitable_crops.ilike(search_pattern)
            )
        )

    if low_stock_only:
        query = query.filter(Product.stock_quantity <= Product.low_stock_threshold)

    return query.order_by(Product.name).all()

@router.get("/{product_id}", response_model=ProductResponse)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    """Fetch detailed information for a single product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=ProductResponse, status_code=201)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """Add a new product to inventory."""
    category = db.query(Category).filter(Category.id == product_in.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category_id")

    product = Product(**product_in.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    """Update product details or pricing."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product

@router.patch("/{product_id}/stock", response_model=ProductResponse)
def adjust_stock(product_id: int, adjustment: int = Query(..., description="Quantity to add (positive) or deduct (negative)"), db: Session = Depends(get_db)):
    """Quick inventory adjustment endpoint."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_stock = product.stock_quantity + adjustment
    if new_stock < 0:
        raise HTTPException(status_code=400, detail=f"Insufficient stock. Available: {product.stock_quantity}")

    product.stock_quantity = new_stock
    db.commit()
    db.refresh(product)
    return product
