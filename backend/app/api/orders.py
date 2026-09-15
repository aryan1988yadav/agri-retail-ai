import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import (
    OrderCreate, OrderResponse
)

router = APIRouter()

def generate_order_number():
    timestamp = datetime.now().strftime("%y%m%d")
    unique_suffix = uuid.uuid4().hex[:4].upper()
    return f"ORD-{timestamp}-{unique_suffix}"

@router.post("", response_model=OrderResponse, status_code=201)
def place_online_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    """
    Farmer places an online order from the marketplace:
    Validates items, deducts stock, and creates order.
    """
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    total_amount = 0.0
    db_items = []

    for item in order_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")

        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Sorry, only {product.stock_quantity} units of '{product.name}' are left in stock."
            )

        product.stock_quantity -= item.quantity
        line_total = product.price * item.quantity
        total_amount += line_total

        order_item = OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price,
            total_price=line_total
        )
        db_items.append(order_item)

    order_no = generate_order_number()
    order = Order(
        order_number=order_no,
        customer_name=order_in.customer_name,
        customer_phone=order_in.customer_phone,
        delivery_address=order_in.delivery_address,
        payment_method=order_in.payment_method,
        payment_status="Pending" if order_in.payment_method == "COD" else "Paid",
        order_status="Confirmed",
        total_amount=total_amount,
        items=db_items
    )

    db.add(order)
    db.commit()
    db.refresh(order)
    return order

@router.get("", response_model=List[OrderResponse])
def get_orders(limit: int = 50, db: Session = Depends(get_db)):
    """Fetch online orders list."""
    return db.query(Order).order_by(Order.created_at.desc()).limit(limit).all()

@router.get("/{order_number}", response_model=OrderResponse)
def get_order_by_number(order_number: str, db: Session = Depends(get_db)):
    """Track an online order by order number."""
    order = db.query(Order).filter(Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
