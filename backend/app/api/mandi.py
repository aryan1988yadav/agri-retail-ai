from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional

from app.core.database import get_db, Base, engine
from app.models.crop_listing import CropListing
from app.schemas.crop_listing import CropListingCreate, CropListingResponse, MSPBenchmark

# Ensure table is created
Base.metadata.create_all(bind=engine)

router = APIRouter()

OFFICIAL_MSP = {
    "wheat": 2275.0,
    "paddy": 2300.0,
    "rice": 2300.0,
    "cotton": 7121.0,
    "soybean": 4892.0,
    "mustard": 5650.0,
    "chickpea": 5440.0,
    "chana": 5440.0,
    "maize": 2225.0,
    "moong": 8682.0,
    "urad": 7400.0,
    "groundnut": 6783.0,
    "barley": 1850.0,
    "jowar": 3371.0,
    "bajra": 2625.0,
    "sugarcane": 340.0
}

DEFAULT_CROP_IMAGES = {
    "wheat": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
    "paddy": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&q=80",
    "rice": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&q=80",
    "cotton": "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&q=80",
    "soybean": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=600&q=80",
    "mustard": "https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&q=80",
    "chickpea": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&q=80",
    "maize": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80"
}

def get_msp_for_crop(crop_name: str) -> Optional[float]:
    crop_lower = crop_name.lower()
    for key, val in OFFICIAL_MSP.items():
        if key in crop_lower:
            return val
    return None

def get_image_for_crop(crop_name: str) -> str:
    crop_lower = crop_name.lower()
    for key, val in DEFAULT_CROP_IMAGES.items():
        if key in crop_lower:
            return val
    return "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80"

@router.get("/listings", response_model=List[CropListingResponse])
def get_crop_listings(
    crop: Optional[str] = Query(None, description="Filter by crop name"),
    state: Optional[str] = Query(None, description="Filter by state"),
    search: Optional[str] = Query(None, description="Search term in crop, variety, village"),
    db: Session = Depends(get_db)
):
    query = db.query(CropListing).filter(CropListing.status == "active")

    if crop and crop.lower() != "all crops":
        query = query.filter(CropListing.crop_name.ilike(f"%{crop}%"))

    if state and state.lower() != "all states":
        query = query.filter(CropListing.state.ilike(f"%{state}%"))

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                CropListing.crop_name.ilike(s),
                CropListing.variety.ilike(s),
                CropListing.village.ilike(s),
                CropListing.district.ilike(s),
                CropListing.farmer_name.ilike(s)
            )
        )

    listings = query.order_by(desc(CropListing.created_at)).all()

    # If database has zero listings, seed initial demo lots automatically
    if not listings and not crop and not state and not search:
        seed_mandi_data(db)
        listings = db.query(CropListing).filter(CropListing.status == "active").order_by(desc(CropListing.created_at)).all()

    return listings

@router.post("/listings", response_model=CropListingResponse)
def create_crop_listing(payload: CropListingCreate, db: Session = Depends(get_db)):
    data = payload.dict()
    if not data.get("msp_benchmark"):
        data["msp_benchmark"] = get_msp_for_crop(data["crop_name"])
    if not data.get("image_url"):
        data["image_url"] = get_image_for_crop(data["crop_name"])

    listing = CropListing(**data)
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@router.get("/msp", response_model=List[MSPBenchmark])
def get_msp_benchmarks():
    return [
        {"crop": "Wheat (Rabi)", "season": "Rabi", "msp": 2275.0, "unit": "quintal"},
        {"crop": "Paddy Common (Kharif)", "season": "Kharif", "msp": 2300.0, "unit": "quintal"},
        {"crop": "Cotton Medium Staple", "season": "Kharif", "msp": 7121.0, "unit": "quintal"},
        {"crop": "Mustard / Rapeseed", "season": "Rabi", "msp": 5650.0, "unit": "quintal"},
        {"crop": "Gram / Chickpea (Chana)", "season": "Rabi", "msp": 5440.0, "unit": "quintal"},
        {"crop": "Soybean Yellow", "season": "Kharif", "msp": 4892.0, "unit": "quintal"},
        {"crop": "Maize (Kharif)", "season": "Kharif", "msp": 2225.0, "unit": "quintal"},
        {"crop": "Moong (Green Gram)", "season": "Kharif", "msp": 8682.0, "unit": "quintal"},
        {"crop": "Groundnut", "season": "Kharif", "msp": 6783.0, "unit": "quintal"}
    ]

def seed_mandi_data(db: Session):
    demo_listings = [
        {
            "farmer_name": "Ramesh Chandra Patel",
            "farmer_phone": "9826012345",
            "crop_name": "Wheat",
            "variety": "Sharbati Gold Grade-A",
            "quantity_quintals": 120.0,
            "expected_price_per_quintal": 2550.0,
            "msp_benchmark": 2275.0,
            "moisture_pct": 11.2,
            "grade": "Export Quality / Sharbati Premium",
            "village": "Sanwer",
            "district": "Indore",
            "state": "Madhya Pradesh",
            "harvest_date": "March 2024",
            "description": "Premium golden luster Sharbati wheat, cleaned and machine graded. Zero weed seeds.",
            "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
            "status": "active"
        },
        {
            "farmer_name": "Sardar Harpreet Singh Dhillon",
            "farmer_phone": "9814056789",
            "crop_name": "Paddy (Rice)",
            "variety": "Pusa Basmati 1121",
            "quantity_quintals": 240.0,
            "expected_price_per_quintal": 3850.0,
            "msp_benchmark": 2300.0,
            "moisture_pct": 12.0,
            "grade": "Export Basmati / Extra Long Grain",
            "village": "Jagraon",
            "district": "Ludhiana",
            "state": "Punjab",
            "harvest_date": "November 2024",
            "description": "Authentic aroma Pusa 1121 paddy harvested at optimal maturity. Stored in dry ventilated godown.",
            "image_url": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&q=80",
            "status": "active"
        },
        {
            "farmer_name": "Suresh Rao Deshmukh",
            "farmer_phone": "9422178901",
            "crop_name": "Cotton",
            "variety": "Shankar-6 Long Staple",
            "quantity_quintals": 85.0,
            "expected_price_per_quintal": 7450.0,
            "msp_benchmark": 7121.0,
            "moisture_pct": 8.5,
            "grade": "Ginning Ready / High Micronaire",
            "village": "Achalpur",
            "district": "Amravati",
            "state": "Maharashtra",
            "harvest_date": "January 2025",
            "description": "Clean white cotton bolls, hand-picked 2nd picking. High strength fiber suitable for textile mills.",
            "image_url": "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&q=80",
            "status": "active"
        },
        {
            "farmer_name": "Om Prakash Yadav",
            "farmer_phone": "9785023456",
            "crop_name": "Chickpea (Chana)",
            "variety": "Desi Bold Chana",
            "quantity_quintals": 65.0,
            "expected_price_per_quintal": 5600.0,
            "msp_benchmark": 5440.0,
            "moisture_pct": 10.5,
            "grade": "FAQ Bold / High Protein",
            "village": "Sangod",
            "district": "Kota",
            "state": "Rajasthan",
            "harvest_date": "April 2024",
            "description": "Sun-dried bold brown desi chickpea. Ideal for dal mills and besan manufacturing.",
            "image_url": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&q=80",
            "status": "active"
        },
        {
            "farmer_name": "Vikram Singh Choudhary",
            "farmer_phone": "9977034567",
            "crop_name": "Soybean",
            "variety": "JS-335 Yellow",
            "quantity_quintals": 95.0,
            "expected_price_per_quintal": 4980.0,
            "msp_benchmark": 4892.0,
            "moisture_pct": 11.0,
            "grade": "Grade A Oil Grade",
            "village": "Tonk Khurd",
            "district": "Dewas",
            "state": "Madhya Pradesh",
            "harvest_date": "October 2024",
            "description": "Clean yellow bold seed soybean, test weight certified. 19.5% oil content benchmark.",
            "image_url": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=600&q=80",
            "status": "active"
        },
        {
            "farmer_name": "Baldev Singh Sandhu",
            "farmer_phone": "9812045678",
            "crop_name": "Mustard (Sarson)",
            "variety": "Pusa Bold 42% Oil",
            "quantity_quintals": 50.0,
            "expected_price_per_quintal": 5850.0,
            "msp_benchmark": 5650.0,
            "moisture_pct": 7.8,
            "grade": "High Oil Recovery Grade",
            "village": "Nilokheri",
            "district": "Karnal",
            "state": "Haryana",
            "harvest_date": "March 2024",
            "description": "Dry mustard seeds with 42% tested oil recovery, winnowed and ready for extraction.",
            "image_url": "https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&q=80",
            "status": "active"
        }
    ]

    for item in demo_listings:
        listing = CropListing(**item)
        db.add(listing)
    db.commit()
