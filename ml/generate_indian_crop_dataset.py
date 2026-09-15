import os
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(__file__), "datasets")
BASE_CSV = os.path.join(DATA_DIR, "Crop_recommendation.csv")
EXPANDED_CSV = os.path.join(DATA_DIR, "Indian_Crop_recommendation_expanded.csv")

# ICAR Indian staple crop distribution parameters (100 samples each, consistent with Kaggle dataset)
INDIAN_STAPLES = {
    "wheat": {
        "N": (120.0, 12.0),
        "P": (55.0, 6.0),
        "K": (40.0, 5.0),
        "temperature": (15.5, 2.5),
        "humidity": (55.0, 6.0),
        "ph": (7.2, 0.3),
        "rainfall": (40.0, 10.0)
    },
    "mustard": {
        "N": (75.0, 10.0),
        "P": (40.0, 6.0),
        "K": (35.0, 5.0),
        "temperature": (17.5, 2.5),
        "humidity": (50.0, 6.0),
        "ph": (7.4, 0.3),
        "rainfall": (30.0, 8.0)
    },
    "soybean": {
        "N": (30.0, 6.0),
        "P": (70.0, 8.0),
        "K": (50.0, 6.0),
        "temperature": (26.5, 2.0),
        "humidity": (76.0, 5.0),
        "ph": (6.8, 0.4),
        "rainfall": (180.0, 25.0)
    },
    "sugarcane": {
        "N": (180.0, 18.0),
        "P": (75.0, 8.0),
        "K": (90.0, 10.0),
        "temperature": (28.0, 3.0),
        "humidity": (78.0, 6.0),
        "ph": (7.0, 0.4),
        "rainfall": (210.0, 30.0)
    },
    "bajra": {
        "N": (50.0, 8.0),
        "P": (30.0, 5.0),
        "K": (30.0, 5.0),
        "temperature": (31.0, 2.5),
        "humidity": (50.0, 6.0),
        "ph": (7.5, 0.4),
        "rainfall": (65.0, 15.0)
    }
}

def generate_expanded_dataset():
    if not os.path.exists(BASE_CSV):
        raise FileNotFoundError(f"Base dataset {BASE_CSV} not found!")

    df_base = pd.read_csv(BASE_CSV)
    print(f"Base dataset loaded: {len(df_base)} rows, {df_base['label'].nunique()} crops")

    np.random.seed(42)
    n_samples_per_crop = 100
    new_rows = []

    for crop_name, params in INDIAN_STAPLES.items():
        n_vals = np.clip(np.random.normal(params["N"][0], params["N"][1], n_samples_per_crop), 10, 250)
        p_vals = np.clip(np.random.normal(params["P"][0], params["P"][1], n_samples_per_crop), 10, 150)
        k_vals = np.clip(np.random.normal(params["K"][0], params["K"][1], n_samples_per_crop), 10, 150)
        t_vals = np.clip(np.random.normal(params["temperature"][0], params["temperature"][1], n_samples_per_crop), 5, 45)
        h_vals = np.clip(np.random.normal(params["humidity"][0], params["humidity"][1], n_samples_per_crop), 20, 95)
        ph_vals = np.clip(np.random.normal(params["ph"][0], params["ph"][1], n_samples_per_crop), 5.0, 8.5)
        r_vals = np.clip(np.random.normal(params["rainfall"][0], params["rainfall"][1], n_samples_per_crop), 10, 350)

        for i in range(n_samples_per_crop):
            new_rows.append({
                "N": round(float(n_vals[i]), 2),
                "P": round(float(p_vals[i]), 2),
                "K": round(float(k_vals[i]), 2),
                "temperature": round(float(t_vals[i]), 4),
                "humidity": round(float(h_vals[i]), 4),
                "ph": round(float(ph_vals[i]), 4),
                "rainfall": round(float(r_vals[i]), 4),
                "label": crop_name
            })

    df_new = pd.DataFrame(new_rows)
    df_combined = pd.concat([df_base, df_new], ignore_index=True)
    df_combined.to_csv(EXPANDED_CSV, index=False)
    print(f"Expanded dataset created successfully: {len(df_combined)} rows, {df_combined['label'].nunique()} crops!")
    print("New Indian Crops added:", list(INDIAN_STAPLES.keys()))

if __name__ == "__main__":
    generate_expanded_dataset()
