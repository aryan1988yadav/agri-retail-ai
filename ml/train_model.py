import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

DATA_DIR = os.path.join(os.path.dirname(__file__), "datasets")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

DATASET_PATH = os.path.join(DATA_DIR, "Indian_Crop_recommendation_expanded.csv")
MODEL_PATH = os.path.join(MODELS_DIR, "crop_recommender.joblib")

# Crop Metadata for Indian Agriculture
CROP_METADATA = {
    "wheat": {
        "hindi": "गेहूं (Wheat - Sharbati / HD-2967 / PBW-343)",
        "season": "Rabi (November - April)",
        "yield_range": "18 - 25 Quintals/Acre",
        "tips": "Requires well-drained loamy alluvial soils. Critical irrigation at Crown Root Initiation (CRI at 21 days) and grain filling."
    },
    "mustard": {
        "hindi": "सरसों / राई (Mustard / Rapeseed)",
        "season": "Rabi (October - March)",
        "yield_range": "8 - 14 Quintals/Acre",
        "tips": "Thrives in light to heavy loam soils. Highly remunerative with low water requirement (1-2 irrigations)."
    },
    "soybean": {
        "hindi": "सोयाबीन (Yellow Gold)",
        "season": "Kharif (June - October)",
        "yield_range": "10 - 15 Quintals/Acre",
        "tips": "Deep well-drained black cotton or fertile loam soils. Inoculate with Rhizobium japonicum for natural nitrogen fixation."
    },
    "sugarcane": {
        "hindi": "गन्ना (Sugarcane)",
        "season": "Annual / Multi-Year Crop",
        "yield_range": "350 - 500 Quintals/Acre",
        "tips": "Deep rich loamy or alluvial soils. Heavy feeder requiring balanced NPK and abundant moisture during tillering."
    },
    "bajra": {
        "hindi": "बाजरा (Pearl Millet)",
        "season": "Kharif (July - October)",
        "yield_range": "12 - 18 Quintals/Acre",
        "tips": "Outstanding drought and heat tolerance. Thrives in sandy and shallow soils of Western India."
    },
    "rice": {
        "hindi": "चावल / धान (Paddy / Basmati)",
        "season": "Kharif (June - November)",
        "yield_range": "20 - 28 Quintals/Acre",
        "tips": "Requires standing water (5-7 cm) during vegetative phase. Clayey or loamy soils rich in organic matter are ideal."
    },
    "maize": {
        "hindi": "मक्का (Corn)",
        "season": "Kharif & Rabi",
        "yield_range": "25 - 35 Quintals/Acre",
        "tips": "Well-drained fertile loamy soils with neutral pH. Avoid water stagnation especially at knee-high stage."
    },
    "chickpea": {
        "hindi": "चना (Bengal Gram)",
        "season": "Rabi (October - March)",
        "yield_range": "8 - 12 Quintals/Acre",
        "tips": "Deep, well-drained black cotton or sandy loam soils. Requires minimal irrigation; highly susceptible to water-logging."
    },
    "cotton": {
        "hindi": "कपास (White Gold - BG-II)",
        "season": "Kharif (May - December)",
        "yield_range": "8 - 14 Quintals/Acre",
        "tips": "Deep black cotton soils (Vertisols) with high water retention. Requires warm days and sunshine during boll burst."
    },
    "kidneybeans": {
        "hindi": "राजमा (Rajma)",
        "season": "Rabi in plains / Kharif in hills",
        "yield_range": "6 - 10 Quintals/Acre",
        "tips": "Light, loamy soil with rich humus content. High phosphorus requirement for root nodules."
    },
    "pigeonpeas": {
        "hindi": "अरहर / तूर (Toor Dal)",
        "season": "Kharif (June - January)",
        "yield_range": "7 - 11 Quintals/Acre",
        "tips": "Deep well-drained loam or clay-loam. Deep taproot system withstands mild drought."
    },
    "mothbeans": {
        "hindi": "मोठ (Moth Bean)",
        "season": "Kharif (July - October)",
        "yield_range": "3 - 5 Quintals/Acre",
        "tips": "Extremely drought-tolerant. Performs well in arid sandy soils of Rajasthan and Gujarat."
    },
    "mungbean": {
        "hindi": "मूंग (Moong Dal)",
        "season": "Zaid (Summer) & Kharif",
        "yield_range": "4 - 7 Quintals/Acre",
        "tips": "Short duration crop (60-65 days). Well-drained loamy soil. Fits perfectly in crop rotation between wheat and paddy."
    },
    "blackgram": {
        "hindi": "उड़द (Urad Dal)",
        "season": "Kharif & Summer",
        "yield_range": "4 - 8 Quintals/Acre",
        "tips": "Loamy to heavy clay soils with good moisture retention. Fixes atmospheric nitrogen to enrich soil."
    },
    "lentil": {
        "hindi": "मसूर (Masoor Dal)",
        "season": "Rabi (October - March)",
        "yield_range": "6 - 9 Quintals/Acre",
        "tips": "Cold climate crop. Thrives on alluvial and black cotton soils with moderate moisture."
    },
    "pomegranate": {
        "hindi": "अनार (Pomegranate)",
        "season": "Perennial (Ambe / Mrig Bahar)",
        "yield_range": "40 - 60 Quintals/Acre",
        "tips": "Well-drained light loamy soils up to 1m depth. Highly remunerative commercial crop under drip irrigation."
    },
    "banana": {
        "hindi": "केला (Banana)",
        "season": "Year-round planting",
        "yield_range": "30 - 45 Tonnes/Acre",
        "tips": "Rich, well-drained loamy soil with high organic matter. Heavy potassium feeder with continuous moisture needs."
    },
    "mango": {
        "hindi": "आम (Mango)",
        "season": "Perennial / Summer harvest",
        "yield_range": "4 - 8 Tonnes/Acre",
        "tips": "Deep alluvial or red loamy soils with good drainage. Avoid frost-prone lowlands."
    },
    "grapes": {
        "hindi": "अंगूर (Grapes)",
        "season": "Perennial / Spring harvest",
        "yield_range": "10 - 15 Tonnes/Acre",
        "tips": "Well-drained sandy loam with pH 6.5-7.5. Requires trained trellis pruning and precise drip fertigation."
    },
    "watermelon": {
        "hindi": "तरबूज (Watermelon)",
        "season": "Zaid / Summer (Feb - May)",
        "yield_range": "15 - 25 Tonnes/Acre",
        "tips": "Sandy to sandy-loam soils with good drainage. Warm sunny weather accelerates sugar accumulation."
    },
    "muskmelon": {
        "hindi": "खरबूजा (Muskmelon)",
        "season": "Zaid / Summer (Feb - May)",
        "yield_range": "8 - 14 Tonnes/Acre",
        "tips": "Light sandy loam soils. Avoid excessive watering during fruit maturation to avoid splitting."
    },
    "apple": {
        "hindi": "सेब (Apple)",
        "season": "Temperate Hill Regions (HP/J&K)",
        "yield_range": "10 - 18 Tonnes/Acre",
        "tips": "Requires chilling hours (below 7°C) for flower bud dormancy break."
    },
    "orange": {
        "hindi": "संतरा / संतरा (Nagpur Mandarin)",
        "season": "Perennial (Ambe/Mrig Bahar)",
        "yield_range": "6 - 12 Tonnes/Acre",
        "tips": "Deep well-drained loamy soil, slightly acidic to neutral. Sensitive to water stagnation."
    },
    "papaya": {
        "hindi": "पपीता (Papaya)",
        "season": "Year-round planting",
        "yield_range": "25 - 40 Tonnes/Acre",
        "tips": "Fast-growing, frost-sensitive. Requires rich, porous soil with flawless drainage."
    },
    "coconut": {
        "hindi": "नारियल (Coconut)",
        "season": "Perennial Coastal",
        "yield_range": "80 - 120 nuts / palm / year",
        "tips": "Coastal sandy, alluvial or red sandy loam soils. Thrives in humid coastal belts."
    },
    "jute": {
        "hindi": "पटसन / जूट (Golden Fibre)",
        "season": "Kharif (March - August)",
        "yield_range": "12 - 16 Quintals/Acre",
        "tips": "Alluvial loamy soils in eastern India. Requires warm, humid climate."
    },
    "coffee": {
        "hindi": "कॉफ़ी (Coffee - Arabica / Robusta)",
        "season": "Hills / Western Ghats",
        "yield_range": "400 - 800 kg/Acre (Clean bean)",
        "tips": "Grown under shade canopy in Western Ghats. Volcanic or red loamy soil."
    }
}

def train_and_save_model():
    print("--- Starting Authentic Indian Crop Model Training ---")
    if not os.path.exists(DATASET_PATH):
        import generate_indian_crop_dataset
        generate_indian_crop_dataset.generate_expanded_dataset()

    df = pd.read_csv(DATASET_PATH)
    print(f"Dataset Loaded: {df.shape[0]} rows, {df['label'].nunique()} crops")
    print(f"Crops: {sorted(df['label'].unique())}")

    features = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    X = df[features]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("Training Random Forest Classifier on Indian Expanded Dataset (150 estimators)...")
    clf = RandomForestClassifier(n_estimators=150, random_state=42, max_depth=16, n_jobs=-1)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model Test Accuracy: {acc * 100:.2f}%")

    # Package model with metadata
    payload = {
        "model": clf,
        "features": features,
        "classes": list(clf.classes_),
        "metadata": CROP_METADATA,
        "accuracy": acc
    }

    joblib.dump(payload, MODEL_PATH)
    print(f"Trained model exported successfully to: {MODEL_PATH}")

if __name__ == "__main__":
    train_and_save_model()
