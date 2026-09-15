from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.schemas.product import ProductResponse

router = APIRouter()

@router.get("/low-stock", response_model=List[ProductResponse])
def get_low_stock_alerts(db: Session = Depends(get_db)):
    """Fetch all products where stock has fallen below their reorder threshold."""
    return db.query(Product).filter(
        Product.is_active == True,
        Product.stock_quantity <= Product.low_stock_threshold
    ).order_by(Product.stock_quantity.asc()).all()

@router.get("/stats")
def get_inventory_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Calculate overall inventory valuation, product counts, and category breakdown."""
    total_products = db.query(Product).filter(Product.is_active == True).count()
    
    # Calculate valuation: sum of (stock_quantity * price)
    all_products = db.query(Product).filter(Product.is_active == True).all()
    retail_valuation = sum(p.stock_quantity * p.price for p in all_products)
    cost_valuation = sum(p.stock_quantity * p.cost_price for p in all_products)
    out_of_stock = sum(1 for p in all_products if p.stock_quantity == 0)
    low_stock = sum(1 for p in all_products if 0 < p.stock_quantity <= p.low_stock_threshold)

    # Category breakdown
    categories = db.query(Category).all()
    category_summary = []
    for cat in categories:
        cat_items = [p for p in all_products if p.category_id == cat.id]
        category_summary.append({
            "category_id": cat.id,
            "category_name": cat.name,
            "product_count": len(cat_items),
            "total_units": sum(p.stock_quantity for p in cat_items)
        })

    return {
        "total_products": total_products,
        "retail_valuation": round(retail_valuation, 2),
        "cost_valuation": round(cost_valuation, 2),
        "expected_gross_profit": round(retail_valuation - cost_valuation, 2),
        "out_of_stock_count": out_of_stock,
        "low_stock_count": low_stock,
        "category_summary": category_summary
    }
