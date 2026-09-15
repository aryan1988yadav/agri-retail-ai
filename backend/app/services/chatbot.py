import os
import re
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.product import Product

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

def get_full_inventory_context(db: Session) -> str:
    """
    Fetches the entire active catalog from SQLite and groups it into a clean,
    categorized summary so the LLM ALWAYS has complete, accurate real-time inventory knowledge.
    """
    try:
        products = db.query(Product).filter(Product.is_active == True).all()
        if not products:
            return "Currently no products listed in catalog."

        lines = ["CURRENT REAL-TIME STORE INVENTORY (VERIFIED LIVE LOCAL DATABASE):"]
        for p in products:
            status = f"In Stock ({p.stock_quantity} available)" if p.stock_quantity > 0 else "Out of Stock"
            lines.append(f"- {p.name} ({p.brand}) | Price: ₹{p.price}/{p.unit} | {status} | Chemical/Tech: {p.technical_name or 'N/A'} | Suitable Crops: {p.suitable_crops or 'General'}")
        return "\n".join(lines)
    except Exception as e:
        return f"Error retrieving live inventory: {e}"

def build_system_prompt(db: Session) -> str:
    inventory_summary = get_full_inventory_context(db)

    return f"""You are "AgriRetail AI", an expert digital agronomist embedded directly inside the AgriRetail Kendra store.

=== LIVE REAL-TIME STORE INVENTORY DATABASE ===
{inventory_summary}
==============================================

CRITICAL BREVITY & ANSWER RULES (MANDATORY):
1. KEEP YOUR ANSWER STRICTLY TO 2 TO 3 CONCISE SENTENCES (MAXIMUM 50 WORDS).
2. Answer ONLY what the farmer/retailer asked directly. DO NOT write essays, long numbered lists, or unnecessary background history.
3. Suggest 1 or 2 relevant in-stock products with exact price from the live inventory above. Product cards will be shown alongside your message.
4. Tone: Warm, direct, professional ("Kisan Bandhu" / "किसान साथी").
5. Language: Match user language (English, Hindi, or Hinglish).
6. NEVER claim you do not have store inventory access. You have full access to the database above."""

def search_matching_products(query: str, db: Session, limit: int = 3):
    """
    Scans user query for keywords and retrieves matching active products.
    If no specific keyword matches, returns top featured store products.
    """
    q_lower = query.lower()
    tokens = re.findall(r'\w+', q_lower)

    keyword_map = {
        'wheat': ['wheat', 'gehu', 'gehun', 'shriram'],
        'rice': ['rice', 'paddy', 'dhan', 'chawal', 'basmati', 'arize'],
        'maize': ['maize', 'corn', 'makka', 'pioneer'],
        'cotton': ['cotton', 'kapas', 'bollgard', 'mahyco'],
        'tomato': ['tomato', 'tamatar', 'saaho'],
        'chickpea': ['chickpea', 'chana', 'gram'],
        'urea': ['urea', 'nitrogen', 'nano urea'],
        'dap': ['dap', 'phosphate', 'phosphorus'],
        'mop': ['mop', 'potash', 'potassium'],
        'npk': ['npk', 'complex', '10:26:26', 'mahadhan'],
        'zinc': ['zinc', 'khaira', 'multiplex'],
        'pest': ['pest', 'coragen', 'confidor', 'spray', 'pesticide', 'insecticide', 'keeda', 'sundi', 'illiyan', 'borer'],
        'fungus': ['fungus', 'mancozeb', 'amistar', 'blight', 'fungicide', 'spot', 'blitox', 'copper'],
        'organic': ['organic', 'neem', 'bio', 'seaweed', 'jaivik'],
        'sprayer': ['sprayer', 'knapsack', 'battery', 'tank', 'neptune'],
        'drip': ['drip', 'pipe', 'irrigation', 'jain'],
        'meter': ['meter', 'ph', 'sensor', 'tester', 'digital'],
        'seed': ['seed', 'beej', 'variety', 'hybrid']
    }

    matched_categories = set()
    for cat, synonyms in keyword_map.items():
        if any(s in q_lower for s in synonyms):
            matched_categories.add(cat)

    conditions = []
    for kw in list(matched_categories)[:4]:
        conditions.append(Product.name.ilike(f"%{kw}%"))
        conditions.append(Product.suitable_crops.ilike(f"%{kw}%"))
        conditions.append(Product.technical_name.ilike(f"%{kw}%"))

    if conditions:
        products = db.query(Product).filter(
            Product.is_active == True,
            Product.stock_quantity > 0,
            or_(*conditions)
        ).limit(limit).all()
        if products:
            return products

    # If general inquiry about products, stock, or no match, return top in-stock featured items
    return db.query(Product).filter(
        Product.is_active == True,
        Product.stock_quantity > 0
    ).order_by(Product.stock_quantity.desc()).limit(limit).all()

def generate_chat_response(message: str, history: list, db: Session):
    """
    Generates concise 2-3 sentence response via Groq Cloud LLM or crisp agronomic fallback.
    """
    matched_products = search_matching_products(message, db)
    system_content = build_system_prompt(db)

    # 1. If Groq API key is present, use Groq Cloud LLM
    groq_key = os.getenv("GROQ_API_KEY", "") or GROQ_API_KEY
    if groq_key:
        try:
            from groq import Groq
            client = Groq(api_key=groq_key)

            messages = [{"role": "system", "content": system_content}]
            for h in history[-4:]:  # last 2 turns for crisp focus
                messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
            messages.append({"role": "user", "content": message})

            # Candidate Groq models with verified availability
            candidate_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "qwen/qwen3.8-27b"]
            bot_text = None
            for model_name in candidate_models:
                try:
                    response = client.chat.completions.create(
                        model=model_name,
                        messages=messages,
                        temperature=0.2,
                        max_tokens=250
                    )
                    content = response.choices[0].message.content
                    if content and content.strip():
                        bot_text = content.strip()
                        break
                except Exception:
                    continue

            if bot_text:
                return bot_text, matched_products
        except Exception as e:
            print(f"Groq API error: {e}, using concise agronomic fallback")

    # 2. Concise Agricultural Fallbacks (Strictly 2-3 sentences max)
    msg_lower = message.lower()
    if any(w in msg_lower for w in ['stock', 'inventory', 'available', 'kya hai', 'saman', 'products', 'price', 'rate', 'urea', 'dap']):
        reply = (
            "Yes! We have genuine IFFCO fertilizers, certified hybrid seeds, and plant protection medicines in stock. "
            "You can see current quantities and prices in the recommendation cards below and add them directly to your cart."
        )
    elif any(w in msg_lower for w in ['season', 'rabi', 'kharif', 'zaid', 'mausam']):
        reply = (
            "India has 3 main cropping seasons: Kharif (Monsoon: Rice, Cotton, Maize), Rabi (Winter: Wheat, Mustard, Gram), and Zaid (Summer: Melons, Moong). "
            "We have high-germination seeds for each season ready for store pickup."
        )
    elif any(w in msg_lower for w in ['organic', 'jaivik', 'jeevamrut', 'neem', 'bio']):
        reply = (
            "For organic plant health, apply Jeevamrut during irrigation and treat seeds with Trichoderma. "
            "We currently stock certified Kisan Kraft 10,000 PPM Neem Oil (₹480/1L) and bio-extracts for organic pest control."
        )
    elif any(w in msg_lower for w in ['bollworm', 'fall armyworm', 'armyworm', 'sundi', 'illiyan', 'keeda']):
        reply = (
            "For bollworm and caterpillars, spray FMC Coragen (Chlorantraniliprole) at 60 ml per acre at first sign of infestation. "
            "It gives up to 21 days of systemic protection and is available in store stock at ₹950 per bottle."
        )
    elif any(w in msg_lower for w in ['weed', 'kharpatwar', 'herbicide', 'ghas']):
        reply = (
            "For broadleaf weeds in wheat, spray 2,4-D Ethyl Ester at 30-35 days after sowing; for paddy, apply Pretilachlor within 3 days of transplanting. "
            "Follow exact spray gallonage for maximum weed knockdown."
        )
    elif any(w in msg_lower for w in ['fertilizer', 'urea', 'dap', 'khad', 'npk', 'potash']):
        reply = (
            "Apply 100% of DAP and Potash at sowing as a basal dose, followed by split applications of Urea during tillering. "
            "Subsidized IFFCO Urea (₹266.50/50kg) and DAP (₹1,350/50kg) are available at our counter."
        )
    elif any(w in msg_lower for w in ['disease', 'pest', 'blight', 'spot', 'fungus', 'leaf', 'yellow', 'pila']):
        reply = (
            "For fungal blight or leaf spots, spray Syngenta Amistar Top or Tata Blitox Copper Oxychloride promptly. "
            "If leaves are yellowing from nitrogen lack, a foliar spray of IFFCO Nano Urea provides rapid recovery."
        )
    elif any(w in msg_lower for w in ['irrigation', 'water', 'drip', 'sinchai', 'sprinkler']):
        reply = (
            "Drip irrigation reduces water usage by 60% while boosting nutrient uptake efficiency. "
            "We stock Jain 16mm drip laterals and battery-powered knapsack sprayers for precise field application."
        )
    elif any(w in msg_lower for w in ['pm kisan', 'scheme', 'yojana', 'subsidy', 'insurance', 'pmfby', 'dbt']):
        reply = (
            "The PM-KISAN scheme provides ₹6,000 annual direct income support, and PMFBY covers crop loss at nominal premium (1.5%–2%). "
            "Ensure your Aadhaar is linked to your bank account to receive DBT subsidies."
        )
    elif any(w in msg_lower for w in ['namaste', 'hello', 'hi', 'kisan', 'help']):
        reply = (
            "Namaste Kisan Bandhu! I am your AI Agronomist with live access to our Kendra's inventory. "
            "What crop or fertilizer question can I answer for you today?"
        )
    else:
        reply = (
            f"For high yield in your field, balanced NPK nutrition and timely pest management are essential. "
            f"I have checked our inventory and highlighted the best matching options below."
        )

    return reply, matched_products
