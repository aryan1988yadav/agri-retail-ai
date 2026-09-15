from fastapi import APIRouter
from app.api import products, pos, orders, inventory, prediction, chat, mandi

api_router = APIRouter()

api_router.include_router(products.router, prefix="/products", tags=["Products & Catalog"])
api_router.include_router(pos.router, prefix="/pos", tags=["In-Store POS Counter"])
api_router.include_router(orders.router, prefix="/orders", tags=["Marketplace Orders"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory & Analytics"])
api_router.include_router(prediction.router, prefix="/prediction", tags=["ML Crop & Fertilizer Prediction"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Agronomist & E-Commerce Chatbot"])
api_router.include_router(mandi.router, prefix="/mandi", tags=["Kisan Mandi (Crop Selling)"])
