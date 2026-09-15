"""
Indian State & Season Crop Suitability Matrix
Derived from Ministry of Agriculture & Farmers Welfare (DES - APY Statistics)
and ICAR (Indian Council of Agricultural Research) Agro-Climatic Zone Packages.
"""

STATE_SEASON_CROP_MATRIX = {
    "Haryana": {
        "Rabi": ["wheat", "mustard", "chickpea", "lentil"],
        "Kharif": ["rice", "cotton", "bajra", "maize", "sugarcane"],
        "Zaid": ["watermelon", "muskmelon", "mungbean"]
    },
    "Punjab": {
        "Rabi": ["wheat", "mustard", "chickpea"],
        "Kharif": ["rice", "cotton", "maize", "sugarcane"],
        "Zaid": ["mungbean", "muskmelon"]
    },
    "Uttar Pradesh": {
        "Rabi": ["wheat", "mustard", "chickpea", "lentil"],
        "Kharif": ["rice", "sugarcane", "maize", "pigeonpeas", "bajra"],
        "Zaid": ["watermelon", "muskmelon", "mungbean"]
    },
    "Madhya Pradesh": {
        "Rabi": ["wheat", "chickpea", "mustard", "lentil"],
        "Kharif": ["soybean", "cotton", "maize", "pigeonpeas", "rice"],
        "Zaid": ["mungbean", "watermelon"]
    },
    "Rajasthan": {
        "Rabi": ["mustard", "wheat", "chickpea"],
        "Kharif": ["bajra", "mothbeans", "cotton", "mungbean"],
        "Zaid": ["watermelon", "muskmelon"]
    },
    "Maharashtra": {
        "Rabi": ["wheat", "chickpea"],
        "Kharif": ["cotton", "soybean", "pigeonpeas", "rice", "sugarcane"],
        "Zaid": ["mungbean", "watermelon", "grapes", "pomegranate"]
    },
    "Gujarat": {
        "Rabi": ["wheat", "mustard", "chickpea"],
        "Kharif": ["cotton", "bajra", "maize"],
        "Zaid": ["watermelon", "mungbean"]
    },
    "Bihar": {
        "Rabi": ["wheat", "maize", "chickpea", "lentil", "mustard"],
        "Kharif": ["rice", "maize", "jute", "pigeonpeas"],
        "Zaid": ["mungbean", "watermelon"]
    },
    "West Bengal": {
        "Rabi": ["mustard", "wheat", "lentil"],
        "Kharif": ["rice", "jute", "maize"],
        "Zaid": ["rice", "watermelon"]
    },
    "Andhra Pradesh": {
        "Rabi": ["chickpea", "maize", "blackgram"],
        "Kharif": ["rice", "cotton", "maize"],
        "Zaid": ["mungbean", "watermelon"]
    },
    "Tamil Nadu": {
        "Rabi": ["rice", "blackgram", "cotton"],
        "Kharif": ["rice", "maize", "banana"],
        "Zaid": ["blackgram", "mungbean"]
    },
    "Karnataka": {
        "Rabi": ["chickpea", "wheat"],
        "Kharif": ["maize", "cotton", "pigeonpeas", "rice", "coffee"],
        "Zaid": ["mungbean", "watermelon"]
    }
}

# State-specific default soil & weather profiles
STATE_CLIMATE_DEFAULTS = {
    "Haryana": {
        "Rabi": {"temp": 15.5, "humidity": 55.0, "rainfall": 35.0, "ph": 7.4, "n": 120, "p": 50, "k": 40},
        "Kharif": {"temp": 29.5, "humidity": 72.0, "rainfall": 140.0, "ph": 7.4, "n": 90, "p": 45, "k": 30},
        "Zaid": {"temp": 33.0, "humidity": 45.0, "rainfall": 20.0, "ph": 7.3, "n": 60, "p": 35, "k": 30}
    },
    "Punjab": {
        "Rabi": {"temp": 14.8, "humidity": 58.0, "rainfall": 40.0, "ph": 7.2, "n": 125, "p": 55, "k": 40},
        "Kharif": {"temp": 29.0, "humidity": 75.0, "rainfall": 160.0, "ph": 7.2, "n": 100, "p": 45, "k": 35},
        "Zaid": {"temp": 32.5, "humidity": 48.0, "rainfall": 25.0, "ph": 7.2, "n": 60, "p": 35, "k": 30}
    },
    "Uttar Pradesh": {
        "Rabi": {"temp": 16.5, "humidity": 60.0, "rainfall": 30.0, "ph": 7.0, "n": 115, "p": 50, "k": 40},
        "Kharif": {"temp": 28.5, "humidity": 78.0, "rainfall": 180.0, "ph": 6.9, "n": 85, "p": 45, "k": 35},
        "Zaid": {"temp": 34.0, "humidity": 50.0, "rainfall": 25.0, "ph": 7.0, "n": 55, "p": 35, "k": 25}
    },
    "Madhya Pradesh": {
        "Rabi": {"temp": 18.0, "humidity": 45.0, "rainfall": 20.0, "ph": 7.3, "n": 110, "p": 50, "k": 35},
        "Kharif": {"temp": 26.5, "humidity": 75.0, "rainfall": 185.0, "ph": 7.1, "n": 35, "p": 65, "k": 45}, # Soybean friendly
        "Zaid": {"temp": 35.0, "humidity": 35.0, "rainfall": 15.0, "ph": 7.2, "n": 50, "p": 30, "k": 25}
    },
    "Rajasthan": {
        "Rabi": {"temp": 17.0, "humidity": 40.0, "rainfall": 15.0, "ph": 7.8, "n": 80, "p": 40, "k": 30},
        "Kharif": {"temp": 32.0, "humidity": 52.0, "rainfall": 75.0, "ph": 7.7, "n": 50, "p": 30, "k": 25}, # Bajra friendly
        "Zaid": {"temp": 37.0, "humidity": 28.0, "rainfall": 10.0, "ph": 7.8, "n": 45, "p": 25, "k": 20}
    },
    "Maharashtra": {
        "Rabi": {"temp": 21.0, "humidity": 50.0, "rainfall": 15.0, "ph": 7.2, "n": 100, "p": 45, "k": 35},
        "Kharif": {"temp": 27.0, "humidity": 80.0, "rainfall": 190.0, "ph": 7.0, "n": 115, "p": 48, "k": 25}, # Cotton/Soybean friendly
        "Zaid": {"temp": 33.0, "humidity": 55.0, "rainfall": 20.0, "ph": 7.1, "n": 60, "p": 30, "k": 30}
    },
    "Gujarat": {
        "Rabi": {"temp": 20.5, "humidity": 48.0, "rainfall": 10.0, "ph": 7.5, "n": 100, "p": 45, "k": 35},
        "Kharif": {"temp": 28.5, "humidity": 74.0, "rainfall": 130.0, "ph": 7.4, "n": 110, "p": 45, "k": 25},
        "Zaid": {"temp": 34.5, "humidity": 45.0, "rainfall": 15.0, "ph": 7.5, "n": 55, "p": 30, "k": 25}
    }
}

def get_candidate_crops_for_state_season(state: str, season: str):
    """
    Returns the list of viable crops for the given state and season.
    Falls back to all seasonal crops if state is not listed.
    """
    st_data = STATE_SEASON_CROP_MATRIX.get(state)
    if st_data and season in st_data:
        return st_data[season]
    
    # Generic seasonal fallback
    if season == "Rabi":
        return ["wheat", "mustard", "chickpea", "lentil"]
    elif season == "Kharif":
        return ["rice", "cotton", "maize", "soybean", "bajra", "pigeonpeas"]
    elif season == "Zaid":
        return ["watermelon", "muskmelon", "mungbean"]
    
    return None
