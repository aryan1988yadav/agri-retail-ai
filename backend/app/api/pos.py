import uuid
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.core.database import get_db
from app.models.pos import POSSale, POSItem
from app.models.product import Product
from app.schemas.pos import (
    POSSaleCreate, POSSaleResponse, POSDailySummary
)

router = APIRouter()

def generate_invoice_number():
    timestamp = datetime.now().strftime("%y%m%d")
    unique_suffix = uuid.uuid4().hex[:4].upper()
    return f"INV-{timestamp}-{unique_suffix}"

@router.post("/sales", response_model=POSSaleResponse, status_code=201)
def create_pos_sale(sale_in: POSSaleCreate, db: Session = Depends(get_db)):
    """
    Process an in-store counter sale:
    1. Validates product stock
    2. Decrements stock in real-time
    3. Calculates subtotal and totals
    4. Generates a formal invoice receipt
    """
    if not sale_in.items:
        raise HTTPException(status_code=400, detail="Sale must contain at least one item")

    subtotal = 0.0
    db_items = []

    # Verify and deduct inventory
    for item in sale_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")

        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock_quantity}, requested: {item.quantity}"
            )

        # Deduct stock
        product.stock_quantity -= item.quantity
        line_total = item.unit_price * item.quantity
        subtotal += line_total

        pos_item = POSItem(
            product_id=product.id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=line_total
        )
        db_items.append(pos_item)

    total_amount = max(0.0, subtotal + sale_in.tax_amount - sale_in.discount_amount)
    invoice_no = generate_invoice_number()

    sale = POSSale(
        invoice_number=invoice_no,
        customer_name=sale_in.customer_name,
        customer_phone=sale_in.customer_phone,
        payment_method=sale_in.payment_method,
        subtotal=subtotal,
        tax_amount=sale_in.tax_amount,
        discount_amount=sale_in.discount_amount,
        total_amount=total_amount,
        notes=sale_in.notes,
        items=db_items
    )

    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale

@router.get("/sales", response_model=List[POSSaleResponse])
def get_pos_sales(limit: int = 50, db: Session = Depends(get_db)):
    """Get list of recent POS sales transactions."""
    return db.query(POSSale).order_by(POSSale.created_at.desc()).limit(limit).all()

@router.get("/sales/{invoice_number}", response_model=POSSaleResponse)
def get_sale_by_invoice(invoice_number: str, db: Session = Depends(get_db)):
    """Look up an invoice by invoice number."""
    sale = db.query(POSSale).filter(POSSale.invoice_number == invoice_number).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return sale

@router.get("/daily-summary", response_model=POSDailySummary)
def get_daily_summary(db: Session = Depends(get_db)):
    """
    Provides today's real-time counter sales summary:
    Total transactions, revenue breakdown by Cash, UPI, and Farmer Khata (Credit).
    """
    today_start = datetime.combine(date.today(), datetime.min.time())
    sales = db.query(POSSale).filter(POSSale.created_at >= today_start).all()

    total_count = len(sales)
    total_rev = sum(s.total_amount for s in sales)
    cash_rev = sum(s.total_amount for s in sales if s.payment_method.lower() == "cash")
    upi_rev = sum(s.total_amount for s in sales if s.payment_method.lower() == "upi")
    khata_rev = sum(s.total_amount for s in sales if s.payment_method.lower() == "khata")

    return POSDailySummary(
        total_sales_count=total_count,
        total_revenue=round(total_rev, 2),
        cash_sales=round(cash_rev, 2),
        upi_sales=round(upi_rev, 2),
        khata_sales=round(khata_rev, 2)
    )
