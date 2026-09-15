from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.schemas.product import ProductResponse
from app.services.chatbot import generate_chat_response

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    recommended_products: List[ProductResponse] = []

@router.post("", response_model=ChatResponse)
def handle_chat_message(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Kisan AI Agronomist & E-Commerce Chatbot:
    Answers agricultural queries (crops, diseases, fertilizers, seasons, schemes)
    and retrieves matching in-stock products from the store database with live prices.
    """
    history_dicts = [{"role": h.role, "content": h.content} for h in request.history]
    reply_text, products = generate_chat_response(request.message, history_dicts, db)

    return ChatResponse(
        reply=reply_text,
        recommended_products=products
    )
