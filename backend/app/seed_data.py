from sqlalchemy.orm import Session
from app.core.database import Base, engine, SessionLocal
from app.models.category import Category
from app.models.product import Product
from app.models.user import User

CATEGORIES_DATA = [
    {
        "id": 1,
        "name": "Fertilizers & Nutrients",
        "description": "Essential NPK macro and micronutrient fertilizers for balanced soil fertility.",
        "icon": "Wheat"
    },
    {
        "id": 2,
        "name": "High Yield Seeds",
        "description": "Certified hybrid and improved seed varieties for cereals, pulses, and vegetables.",
        "icon": "Sprout"
    },
    {
        "id": 3,
        "name": "Crop Protection (Pesticides)",
        "description": "Targeted chemical and biological solutions for insect pests, fungal diseases, and weeds.",
        "icon": "ShieldAlert"
    },
    {
        "id": 4,
        "name": "Bio-Stimulants & Organic",
        "description": "Eco-friendly bio-fertilizers, neem products, and growth stimulants.",
        "icon": "Leaf"
    },
    {
        "id": 5,
        "name": "Farm Tools & Sprayers",
        "description": "Knapsack sprayers, testing kits, drip fittings, and precision farming tools.",
        "icon": "Wrench"
    }
]

PRODUCTS_DATA = [
    # --- FERTILIZERS ---
    {
        "name": "IFFCO Urea (46% Nitrogen)",
        "brand": "IFFCO",
        "technical_name": "Urea (46:0:0) Prilled",
        "category_id": 1,
        "price": 266.50,
        "cost_price": 242.00,
        "stock_quantity": 85,
        "unit": "50kg Bag",
        "suitable_crops": "Rice, Wheat, Maize, Sugarcane, Cotton",
        "dosage_instructions": "45-50 kg/acre as top dressing in 2-3 split applications during vegetative stage.",
        "safety_guidelines": "Store in dry place away from moisture. Avoid direct leaf contact when wet.",
        "low_stock_threshold": 20,
        "image_url": "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&q=80"
    },
    {
        "name": "IFFCO DAP (18-46-0)",
        "brand": "IFFCO",
        "technical_name": "Di-Ammonium Phosphate (18:46:0)",
        "category_id": 1,
        "price": 1350.00,
        "cost_price": 1280.00,
        "stock_quantity": 42,
        "unit": "50kg Bag",
        "suitable_crops": "Wheat, Rice, Maize, Chickpea, Cotton, Mustard",
        "dosage_instructions": "50 kg/acre as basal dose during sowing or transplanting for root establishment.",
        "safety_guidelines": "Apply below the seed depth to avoid seed burn.",
        "low_stock_threshold": 15,
        "image_url": "https://images.unsplash.com/photo-1592417817098-8f3d691023c9?w=600&q=80"
    },
    {
        "name": "MOP Muriate of Potash (0-0-60)",
        "brand": "IPL",
        "technical_name": "Potassium Chloride (60% K2O)",
        "category_id": 1,
        "price": 1700.00,
        "cost_price": 1580.00,
        "stock_quantity": 28,
        "unit": "50kg Bag",
        "suitable_crops": "Paddy, Sugarcane, Potato, Cotton, Banana, Maize",
        "dosage_instructions": "25-30 kg/acre basal application. Enhances grain filling and drought resistance.",
        "safety_guidelines": "Keep away from chlorine-sensitive crops like tobacco.",
        "low_stock_threshold": 10,
        "image_url": "https://images.unsplash.com/photo-1592417817098-8f3d691023c9?w=600&q=80"
    },
    {
        "name": "Mahadhan NPK 10:26:26 Complex",
        "brand": "Mahadhan",
        "technical_name": "Complex NPK (10:26:26)",
        "category_id": 1,
        "price": 1450.00,
        "cost_price": 1360.00,
        "stock_quantity": 35,
        "unit": "50kg Bag",
        "suitable_crops": "Sugarcane, Groundnut, Cotton, Soybean, Grapes",
        "dosage_instructions": "50 kg/acre at sowing. High phosphorus and potash support flowering and pod filling.",
        "safety_guidelines": "Store on wooden pallets off damp floors.",
        "low_stock_threshold": 10,
        "image_url": "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&q=80"
    },
    {
        "name": "IFFCO Nano Urea Liquid",
        "brand": "IFFCO",
        "technical_name": "Nano Nitrogen (4% w/v)",
        "category_id": 1,
        "price": 225.00,
        "cost_price": 195.00,
        "stock_quantity": 60,
        "unit": "500ml Bottle",
        "suitable_crops": "Wheat, Rice, Maize, Vegetables, Pulses",
        "dosage_instructions": "2-4 ml per liter of water. Foliar spray at active tillering/branching stage.",
        "safety_guidelines": "Shake well before use. Spray during cool morning or evening hours.",
        "low_stock_threshold": 15,
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80"
    },
    {
        "name": "Multiplex Zinc Sulfate (21%)",
        "brand": "Multiplex",
        "technical_name": "Zinc Sulfate Heptahydrate (Zn 21%, S 10%)",
        "category_id": 1,
        "price": 420.00,
        "cost_price": 360.00,
        "stock_quantity": 40,
        "unit": "5kg Pack",
        "suitable_crops": "Rice (Khaira Disease control), Maize, Wheat, Citrus",
        "dosage_instructions": "10 kg/acre soil application or 5g/liter foliar spray with lime.",
        "safety_guidelines": "Do not mix directly with phosphatic fertilizers like DAP.",
        "low_stock_threshold": 10,
        "image_url": "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&q=80"
    },

    # --- HIGH YIELD SEEDS ---
    {
        "name": "Pioneer P3302 Hybrid Maize Seeds",
        "brand": "Pioneer",
        "technical_name": "Zea mays L. Hybrid Seed (Yellow Grain)",
        "category_id": 2,
        "price": 850.00,
        "cost_price": 740.00,
        "stock_quantity": 45,
        "unit": "4kg Pack",
        "suitable_crops": "Maize",
        "dosage_instructions": "7-8 kg seed per acre. Maintain 60 cm row-to-row and 20 cm plant-to-plant spacing.",
        "safety_guidelines": "Treated with Thiram/Bavistin. Poisonous: Do not consume or feed to animals.",
        "low_stock_threshold": 12,
        "image_url": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80"
    },
    {
        "name": "Shriram Super 303 Wheat Seeds",
        "brand": "Shriram Farm Solutions",
        "technical_name": "Triticum aestivum (High Tillering Variety)",
        "category_id": 2,
        "price": 1650.00,
        "cost_price": 1480.00,
        "stock_quantity": 50,
        "unit": "40kg Bag",
        "suitable_crops": "Wheat",
        "dosage_instructions": "40 kg per acre for timely sowing (Nov 1-25). Maturity in 125-130 days.",
        "safety_guidelines": "Keep dry and ventilated. Protect from rodents.",
        "low_stock_threshold": 15,
        "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80"
    },
    {
        "name": "Bayer Arize 6444 Gold Hybrid Paddy Seeds",
        "brand": "Bayer CropScience",
        "technical_name": "Oryza sativa Hybrid (BLB Resistant)",
        "category_id": 2,
        "price": 920.00,
        "cost_price": 810.00,
        "stock_quantity": 38,
        "unit": "3kg Pack",
        "suitable_crops": "Rice",
        "dosage_instructions": "6 kg per acre nursery. 21-25 day seedlings transplanted with 2-3 seedlings/hill.",
        "safety_guidelines": "Soak in water for 24 hours followed by 24 hours incubation before nursery sowing.",
        "low_stock_threshold": 10,
        "image_url": "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=600&q=80"
    },
    {
        "name": "Mahyco Bollgard-II Cotton Seeds",
        "brand": "Mahyco",
        "technical_name": "Gossypium hirsutum (BG-II Hybrid)",
        "category_id": 2,
        "price": 864.00,
        "cost_price": 790.00,
        "stock_quantity": 30,
        "unit": "450g Pack",
        "suitable_crops": "Cotton",
        "dosage_instructions": "2 packets (900g) per acre with 90x60 cm spacing in irrigated black soil.",
        "safety_guidelines": "Contains refuge non-Bt seeds. Plant non-Bt border rows as recommended.",
        "low_stock_threshold": 8,
        "image_url": "https://images.unsplash.com/photo-1594488500642-127dbca0a430?w=600&q=80"
    },
    {
        "name": "Syngenta Saaho 3251 Hybrid Tomato Seeds",
        "brand": "Syngenta",
        "technical_name": "Solanum lycopersicum (TLCV Resistant)",
        "category_id": 2,
        "price": 780.00,
        "cost_price": 680.00,
        "stock_quantity": 25,
        "unit": "10g Pack",
        "suitable_crops": "Tomato",
        "dosage_instructions": "40-50g seed per acre. Heavy yielder with firm, round red fruits.",
        "safety_guidelines": "Maintain strict nursery hygiene against damping-off fungi.",
        "low_stock_threshold": 5,
        "image_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80"
    },
    {
        "name": "Desi Chana (Chickpea) Seeds - JG 11",
        "brand": "National Seeds Corp",
        "technical_name": "Cicer arietinum (Wilt Resistant Variety)",
        "category_id": 2,
        "price": 950.00,
        "cost_price": 820.00,
        "stock_quantity": 30,
        "unit": "10kg Bag",
        "suitable_crops": "Chickpea",
        "dosage_instructions": "25-30 kg seed per acre with 30x10 cm row spacing in Rabi season.",
        "safety_guidelines": "Inoculate with Rhizobium and PSB cultures prior to sowing.",
        "low_stock_threshold": 8,
        "image_url": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&q=80"
    },

    # --- CROP PROTECTION ---
    {
        "name": "FMC Coragen Insecticide",
        "brand": "FMC",
        "technical_name": "Chlorantraniliprole 18.5% w/w SC",
        "category_id": 3,
        "price": 950.00,
        "cost_price": 830.00,
        "stock_quantity": 24,
        "unit": "60ml Bottle",
        "suitable_crops": "Paddy (Stem Borer), Sugarcane (Early Shoot Borer), Tomato (Fruit Borer), Maize",
        "dosage_instructions": "60 ml in 200 liters of water per acre. Excellent translaminar protection.",
        "safety_guidelines": "Wear protective mask and gloves. 14 days waiting period before harvest.",
        "low_stock_threshold": 6,
        "image_url": "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600&q=80"
    },
    {
        "name": "Bayer Confidor Insecticide",
        "brand": "Bayer CropScience",
        "technical_name": "Imidacloprid 17.8% SL",
        "category_id": 3,
        "price": 340.00,
        "cost_price": 285.00,
        "stock_quantity": 35,
        "unit": "100ml Bottle",
        "suitable_crops": "Cotton, Chilli, Tomato, Mango, Rice (Aphids, Jassids, Thrips, BPH)",
        "dosage_instructions": "50-75 ml in 150-200 liters of water per acre for sucking pests.",
        "safety_guidelines": "Do not spray during full bee bloom. Toxic to aquatic organisms.",
        "low_stock_threshold": 10,
        "image_url": "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600&q=80"
    },
    {
        "name": "Tata Rallis Blitox 50 Fungicide",
        "brand": "Rallis India",
        "technical_name": "Copper Oxychloride 50% WP",
        "category_id": 3,
        "price": 380.00,
        "cost_price": 315.00,
        "stock_quantity": 30,
        "unit": "500g Pack",
        "suitable_crops": "Potato (Late Blight), Tomato, Grapes (Downy Mildew), Citrus (Canker)",
        "dosage_instructions": "500g - 1kg per acre dissolved in 200 liters of water.",
        "safety_guidelines": "Broad spectrum protective fungicide. Do not mix with acidic chemicals.",
        "low_stock_threshold": 8,
        "image_url": "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&q=80"
    },
    {
        "name": "Syngenta Amistar Top Fungicide",
        "brand": "Syngenta",
        "technical_name": "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
        "category_id": 3,
        "price": 1150.00,
        "cost_price": 990.00,
        "stock_quantity": 18,
        "unit": "200ml Bottle",
        "suitable_crops": "Rice (Sheath Blight), Maize (Blight), Cotton (Leaf Spot), Chilli",
        "dosage_instructions": "200 ml per acre with 200 liters of water. Curative and systemic action.",
        "safety_guidelines": "Avoid repeated sprays alone to prevent fungicide resistance.",
        "low_stock_threshold": 5,
        "image_url": "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600&q=80"
    },

    # --- BIO & ORGANIC ---
    {
        "name": "Neem Oil 10,000 PPM Bio-Pesticide",
        "brand": "Kisan Kraft",
        "technical_name": "Cold Pressed Azadirachtin (1% EC)",
        "category_id": 4,
        "price": 480.00,
        "cost_price": 380.00,
        "stock_quantity": 25,
        "unit": "1 Liter Bottle",
        "suitable_crops": "All Vegetables, Fruits, Flowers, Cotton, Pulses",
        "dosage_instructions": "3-5 ml per liter of water. Acts as anti-feedant and repellent.",
        "safety_guidelines": "100% organic and residue-free. Safe for beneficial predatory insects.",
        "low_stock_threshold": 8,
        "image_url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80"
    },
    {
        "name": "Multiplex Seaweed Extract Bio-Stimulant",
        "brand": "Multiplex",
        "technical_name": "Ascophyllum Nodosum Marine Algae Extract",
        "category_id": 4,
        "price": 550.00,
        "cost_price": 450.00,
        "stock_quantity": 20,
        "unit": "500ml Bottle",
        "suitable_crops": "Wheat, Rice, Tomato, Onion, Apple, Grapes",
        "dosage_instructions": "2 ml per liter of water at flower initiation and fruit setting.",
        "safety_guidelines": "Organic certified. Enhances nutrient uptake and abiotic stress tolerance.",
        "low_stock_threshold": 5,
        "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80"
    },

    # --- FARM TOOLS & EQUIPMENT ---
    {
        "name": "Neptune 16L Battery Operated Knapsack Sprayer",
        "brand": "Neptune Fairdeal",
        "technical_name": "12V 8Ah Lead Acid Battery Sprayer with Speed Regulator",
        "category_id": 5,
        "price": 2450.00,
        "cost_price": 2050.00,
        "stock_quantity": 12,
        "unit": "1 Unit",
        "suitable_crops": "All Crops & Orchards",
        "dosage_instructions": "Single charge covers 25-30 tanks (approx 4-5 acres of spray).",
        "safety_guidelines": "Charge battery every 30 days even when not in use. Rinse tank thoroughly.",
        "low_stock_threshold": 3,
        "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80"
    },
    {
        "name": "Digital Soil pH and Moisture 4-in-1 Meter",
        "brand": "AgroTech Tools",
        "technical_name": "LCD Backlight Soil pH, Moisture, Sunlight & Temp Probe",
        "category_id": 5,
        "price": 850.00,
        "cost_price": 620.00,
        "stock_quantity": 15,
        "unit": "1 Unit",
        "suitable_crops": "All Crops",
        "dosage_instructions": "Insert probe 4-5 inches into moist root zone soil for instant pH reading.",
        "safety_guidelines": "Wipe metal probe clean with dry cloth after each measurement.",
        "low_stock_threshold": 4,
        "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80"
    },
    {
        "name": "16mm Drip Irrigation Lateral Pipe (100m Roll)",
        "brand": "Jain Irrigation",
        "technical_name": "Virgin LLDPE UV Stabilized Class 2 Pipe",
        "category_id": 5,
        "price": 1250.00,
        "cost_price": 1050.00,
        "stock_quantity": 14,
        "unit": "100m Roll",
        "suitable_crops": "Vegetables, Cotton, Sugarcane, Banana, Orchards",
        "dosage_instructions": "Save up to 60% irrigation water while boosting fertilizer use efficiency.",
        "safety_guidelines": "Flush lateral lines periodically to avoid sand/algal clogging.",
        "low_stock_threshold": 4,
        "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80"
    }
]

def seed_database():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 1. Categories
        print("Seeding Categories...")
        for cat_data in CATEGORIES_DATA:
            existing = db.query(Category).filter(Category.id == cat_data["id"]).first()
            if not existing:
                cat = Category(**cat_data)
                db.add(cat)
        db.commit()

        # 2. Products
        print("Seeding Indian Agriculture Products...")
        for prod_data in PRODUCTS_DATA:
            existing = db.query(Product).filter(Product.name == prod_data["name"]).first()
            if not existing:
                prod = Product(**prod_data)
                db.add(prod)
        db.commit()

        # 3. Default Demo User / Admin
        print("Seeding Demo Users...")
        admin_user = db.query(User).filter(User.phone == "9876543210").first()
        if not admin_user:
            admin = User(
                name="Suresh Patel (AgriRetail Store Owner)",
                phone="9876543210",
                email="suresh.store@agriretail.com",
                role="retailer_admin",
                state="Madhya Pradesh",
                district="Indore",
                village="Sanwer"
            )
            farmer = User(
                name="Ramesh Kumar (Kisan)",
                phone="9123456780",
                email="ramesh.farmer@gmail.com",
                role="farmer",
                state="Madhya Pradesh",
                district="Indore",
                village="Dharampuri"
            )
            db.add_all([admin, farmer])
            db.commit()

        print("Database seeded successfully with authentic Indian agricultural products!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
