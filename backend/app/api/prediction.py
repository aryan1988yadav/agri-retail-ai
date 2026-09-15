import os
import joblib
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.models.product import Product
from app.models.prediction import CropPredictionLog, FertilizerPredictionLog
from app.schemas.prediction import (
    CropPredictionRequest, CropPredictionResponse,
    FertilizerAdvisoryRequest, FertilizerAdvisoryResponse
)

# Import fertilizer deficit calculation logic and state matrix
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml")))
from fertilizer_calculator import analyze_soil_nutrients
from state_crop_matrix import get_candidate_crops_for_state_season, STATE_SEASON_CROP_MATRIX, STATE_CLIMATE_DEFAULTS

router = APIRouter()

# Path to trained ML model
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml/models/crop_recommender.joblib"))

_model_cache = None

def get_crop_model():
    global _model_cache
    if _model_cache is None:
        if not os.path.exists(MODEL_PATH):
            raise RuntimeError(f"Trained model not found at {MODEL_PATH}. Please run ml/train_model.py first.")
        _model_cache = joblib.load(MODEL_PATH)
    return _model_cache

@router.get("/state-matrix")
def get_state_matrix():
    """
    Returns Ministry of Agriculture / ICAR State & Season Crop Suitability Matrix
    and baseline climate defaults for real-time frontend auto-calibration.
    """
    return {
        "matrix": STATE_SEASON_CROP_MATRIX,
        "defaults": STATE_CLIMATE_DEFAULTS
    }

@router.post("/crop", response_model=CropPredictionResponse)
def predict_crop(request: CropPredictionRequest, db: Session = Depends(get_db)):
    """
    Two-Stage Authentic Indian Crop Recommendation:
    1. Stage 1 (Agro-Climatic Zone & Season Filter): Filters candidate crops by State and Season.
    2. Stage 2 (Soil & Weather ML Ranker): Evaluates Random Forest probabilities across candidate crops.
    3. Queries AgriRetail store inventory for matching seeds and fertilizers currently in stock.
    4. Logs the prediction in database.
    """
    try:
        model_payload = get_crop_model()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    clf = model_payload["model"]
    features = model_payload["features"]
    metadata_map = model_payload.get("metadata", {})

    # Build input array
    input_data = np.array([[
        request.nitrogen,
        request.phosphorus,
        request.potassium,
        request.temperature,
        request.humidity,
        request.ph,
        request.rainfall
    ]])

    probabilities = clf.predict_proba(input_data)[0]
    classes = clf.classes_

    # Stage 1: Filter candidate crops by State and Season if provided
    candidate_crops = None
    if request.state and request.season:
        candidate_crops = get_candidate_crops_for_state_season(request.state, request.season)

    if candidate_crops:
        valid_indices = [i for i, c in enumerate(classes) if c.lower() in candidate_crops]
        if valid_indices:
            sub_probs = [probabilities[i] for i in valid_indices]
            sorted_candidate_order = np.argsort(sub_probs)[::-1]
            top_indices = [valid_indices[idx] for idx in sorted_candidate_order[:3]]
        else:
            top_indices = np.argsort(probabilities)[::-1][:3]
    else:
        top_indices = np.argsort(probabilities)[::-1][:3]

    primary_idx = top_indices[0]
    prediction = classes[primary_idx]
    confidence = float(probabilities[primary_idx])

    # Rank top 3 crops with metadata
    top_crops = []
    for idx in top_indices:
        c_name = str(classes[idx])
        c_prob = float(probabilities[idx])
        c_key = c_name.lower().strip()
        c_meta = metadata_map.get(c_key, {
            "hindi": c_name.capitalize(),
            "season": "Seasonal",
            "yield_range": "15 - 25 Quintals/Acre",
            "tips": "Maintain proper drainage and balanced fertilization."
        })
        top_crops.append({
            "crop": c_name.capitalize(),
            "hindi_name": c_meta.get("hindi", c_name.capitalize()),
            "confidence": round(c_prob * 100, 1),
            "yield_range": c_meta.get("yield_range", "15 - 25 Quintals/Acre"),
            "season": c_meta.get("season", "Seasonal")
        })

    crop_key = prediction.lower().strip()
    meta = metadata_map.get(crop_key, {
        "hindi": crop_key.capitalize(),
        "season": "Seasonal",
        "yield_range": "15 - 25 Quintals/Acre",
        "tips": "Maintain proper drainage and balanced fertilization."
    })

    # Query Store Inventory for Matching Seeds
    matching_seeds = db.query(Product).filter(
        Product.category_id == 2,  # Seeds
        Product.is_active == True,
        or_(
            Product.suitable_crops.ilike(f"%{crop_key}%"),
            Product.name.ilike(f"%{crop_key}%")
        )
    ).limit(3).all()

    # Fallback: if no direct seed match for crop, show general high-germination seeds
    if not matching_seeds:
        matching_seeds = db.query(Product).filter(
            Product.category_id == 2,
            Product.is_active == True
        ).limit(3).all()

    # Query Store Inventory for Matching Fertilizers
    matching_fertilizers = db.query(Product).filter(
        Product.category_id == 1,  # Fertilizers
        Product.is_active == True,
        Product.suitable_crops.ilike(f"%{crop_key}%")
    ).limit(3).all()

    # Fallback to popular fertilizers if crop-specific not matched
    if not matching_fertilizers:
        matching_fertilizers = db.query(Product).filter(
            Product.category_id == 1,
            Product.is_active == True
        ).limit(3).all()

    # Log prediction
    log_entry = CropPredictionLog(
        nitrogen=request.nitrogen,
        phosphorus=request.phosphorus,
        potassium=request.potassium,
        temperature=request.temperature,
        humidity=request.humidity,
        ph=request.ph,
        rainfall=request.rainfall,
        recommended_crop=crop_key.capitalize(),
        confidence_score=round(confidence, 3)
    )
    db.add(log_entry)
    db.commit()

    return CropPredictionResponse(
        recommended_crop=crop_key.capitalize(),
        hindi_name=meta.get("hindi", crop_key.capitalize()),
        confidence=round(confidence, 3),
        state=request.state,
        season=request.season,
        expected_yield_range=meta.get("yield_range", "20 - 30 Quintals/Acre"),
        growing_season=meta.get("season", "Kharif"),
        soil_suitability_tips=meta.get("tips", "Favorable conditions detected."),
        alternative_crops=top_crops,
        recommended_seeds_in_store=matching_seeds,
        recommended_fertilizers_in_store=matching_fertilizers
    )

@router.post("/fertilizer", response_model=FertilizerAdvisoryResponse)
def advise_fertilizer(request: FertilizerAdvisoryRequest, db: Session = Depends(get_db)):
    """
    Intelligent Fertilizer Gap Recommendation:
    Calculates soil nutrient deficits based on ICAR standards and retrieves
    matching fertilizers from the store catalog.
    """
    calc_result = analyze_soil_nutrients(
        crop_name=request.target_crop,
        n_soil=request.nitrogen,
        p_soil=request.phosphorus,
        k_soil=request.potassium
    )

    keywords = calc_result["recommended_fertilizer_keywords"]
    conditions = [Product.name.ilike(f"%{kw}%") for kw in keywords]
    matching_prods = db.query(Product).filter(
        Product.category_id == 1,
        Product.is_active == True,
        or_(*conditions)
    ).all()

    # Log fertilizer advisory
    log_entry = FertilizerPredictionLog(
        target_crop=request.target_crop,
        soil_type=request.soil_type,
        nitrogen=request.nitrogen,
        phosphorus=request.phosphorus,
        potassium=request.potassium,
        recommended_fertilizer=calc_result["primary_recommendation"],
        dosage_info=calc_result["dosage_per_acre"]
    )
    db.add(log_entry)
    db.commit()

    return FertilizerAdvisoryResponse(
        target_crop=request.target_crop.capitalize(),
        analysis=calc_result["analysis"],
        primary_recommendation=calc_result["primary_recommendation"],
        dosage_per_acre=calc_result["dosage_per_acre"],
        matching_fertilizers_in_store=matching_prods
    )
