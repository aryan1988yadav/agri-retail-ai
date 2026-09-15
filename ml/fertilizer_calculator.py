"""
Fertilizer Recommendation & Soil Nutrient Deficit Engine
Based on Indian Council of Agricultural Research (ICAR) benchmarks
and Soil Health Card (SHC) nutrient norms.
"""

# Standard NPK recommendation (kg/acre) for major Indian crops
CROP_NUTRIENT_REQUIREMENTS = {
    "wheat": {"N": 50, "P": 25, "K": 16, "name": "Wheat"},
    "rice": {"N": 48, "P": 24, "K": 20, "name": "Rice (Paddy)"},
    "maize": {"N": 48, "P": 24, "K": 16, "name": "Maize"},
    "cotton": {"N": 48, "P": 24, "K": 24, "name": "Cotton"},
    "sugarcane": {"N": 100, "P": 40, "K": 40, "name": "Sugarcane"},
    "chickpea": {"N": 10, "P": 25, "K": 10, "name": "Chickpea (Chana)"},
    "tomato": {"N": 60, "P": 40, "K": 40, "name": "Tomato"},
    "potato": {"N": 60, "P": 40, "K": 40, "name": "Potato"},
    "default": {"N": 40, "P": 20, "K": 20, "name": "Standard Field Crop"}
}

def analyze_soil_nutrients(crop_name: str, n_soil: float, p_soil: float, k_soil: float):
    """
    Analyzes current soil N-P-K (kg/ha) against crop requirements (kg/acre).
    Standard conversion: kg/ha / 2.47 = kg/acre available in topsoil.
    """
    crop_key = crop_name.lower().strip()
    req = CROP_NUTRIENT_REQUIREMENTS.get(crop_key, CROP_NUTRIENT_REQUIREMENTS["default"])

    # Available in acre terms (approx 40% of Soil Health Card reading is immediately plant available)
    avail_n = (n_soil / 2.47) * 0.4
    avail_p = (p_soil / 2.47) * 0.4
    avail_k = (k_soil / 2.47) * 0.4

    analysis = []
    recs = []

    # 1. Nitrogen analysis
    diff_n = req["N"] - avail_n
    if diff_n > 5:
        # Urea contains 46% N
        urea_bags = round((diff_n / 0.46) / 50, 1)
        urea_kg = round(diff_n / 0.46)
        analysis.append({
            "nutrient": "Nitrogen (N)",
            "status": "Deficient",
            "recommendation": f"Requires ~{urea_kg} kg Urea ({urea_bags} bags of 50kg) per acre."
        })
        recs.append("Urea")
    elif diff_n < -15:
        analysis.append({
            "nutrient": "Nitrogen (N)",
            "status": "Excess",
            "recommendation": "Soil has excess Nitrogen. Avoid top-dressing to prevent vegetative lodge and insect surge."
        })
    else:
        analysis.append({
            "nutrient": "Nitrogen (N)",
            "status": "Adequate",
            "recommendation": "Soil Nitrogen is in optimal range for normal growth."
        })

    # 2. Phosphorus analysis
    diff_p = req["P"] - avail_p
    if diff_p > 4:
        # DAP contains 46% P2O5 and 18% N
        dap_bags = round((diff_p / 0.46) / 50, 1)
        dap_kg = round(diff_p / 0.46)
        analysis.append({
            "nutrient": "Phosphorus (P)",
            "status": "Deficient",
            "recommendation": f"Requires ~{dap_kg} kg DAP ({dap_bags} bags of 50kg) per acre as basal dose."
        })
        recs.append("DAP")
    else:
        analysis.append({
            "nutrient": "Phosphorus (P)",
            "status": "Adequate",
            "recommendation": "Available Phosphorus is adequate for root elongation."
        })

    # 3. Potassium analysis
    diff_k = req["K"] - avail_k
    if diff_k > 4:
        # MOP contains 60% K2O
        mop_kg = round(diff_k / 0.60)
        analysis.append({
            "nutrient": "Potassium (K)",
            "status": "Deficient",
            "recommendation": f"Requires ~{mop_kg} kg MOP (Muriate of Potash) per acre for stalk strength and grain fill."
        })
        recs.append("MOP")
    else:
        analysis.append({
            "nutrient": "Potassium (K)",
            "status": "Adequate",
            "recommendation": "Potassium levels are sufficient for disease tolerance."
        })

    primary_rec = "Apply balanced NPK as recommended below."
    if "DAP" in recs and "Urea" in recs:
        primary_rec = "Apply DAP as basal fertilizer during sowing, followed by split application of Urea at tillering."
    elif "DAP" in recs:
        primary_rec = "Focus on basal phosphatic application (DAP) to support initial root anchorage."
    elif "Urea" in recs:
        primary_rec = "Soil is primarily starved of Nitrogen; top-dress with Urea or spray Nano Urea."

    dosage_schedule = "Basal application (50% N + 100% P & K at sowing) + Top dressing (remaining 50% N at 30-45 days)."

    return {
        "analysis": analysis,
        "primary_recommendation": primary_rec,
        "dosage_per_acre": dosage_schedule,
        "recommended_fertilizer_keywords": recs or ["NPK", "Urea"]
    }
