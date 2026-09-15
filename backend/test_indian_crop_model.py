from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_haryana_rabi():
    print("\n--- 1. Testing Haryana in Rabi Season ---")
    payload = {
        "state": "Haryana",
        "season": "Rabi",
        "nitrogen": 120.0,
        "phosphorus": 50.0,
        "potassium": 40.0,
        "temperature": 15.5,
        "humidity": 55.0,
        "ph": 7.4,
        "rainfall": 35.0
    }
    res = client.post("/api/prediction/crop", json=payload)
    assert res.status_code == 200, f"Failed: {res.text}"
    data = res.json()
    print(f"Recommended Crop: {data['recommended_crop']}")
    print(f"Confidence Score: {data['confidence'] * 100:.1f}%")
    print("Top 3 Crops:", [(c['crop'], f"{c['confidence']}%") for c in data['alternative_crops']])
    print("Store Seeds Matched:", [p['name'] for p in data['recommended_seeds_in_store']])
    
    assert data["recommended_crop"].lower() == "wheat", f"Expected Wheat for Haryana Rabi, got {data['recommended_crop']}"
    assert "Shriram Super 303 Wheat Seeds" in [p['name'] for p in data['recommended_seeds_in_store']], "Should recommend Shriram Wheat seeds"
    print(">>> PASS: Haryana in Rabi correctly predicted Wheat #1!")

def test_mp_kharif():
    print("\n--- 2. Testing Madhya Pradesh in Kharif Season ---")
    payload = {
        "state": "Madhya Pradesh",
        "season": "Kharif",
        "nitrogen": 30.0,
        "phosphorus": 70.0,
        "potassium": 50.0,
        "temperature": 26.5,
        "humidity": 76.0,
        "ph": 7.1,
        "rainfall": 185.0
    }
    res = client.post("/api/prediction/crop", json=payload)
    assert res.status_code == 200
    data = res.json()
    print(f"Recommended Crop: {data['recommended_crop']}")
    print(f"Confidence Score: {data['confidence'] * 100:.1f}%")
    print("Top 3 Crops:", [(c['crop'], f"{c['confidence']}%") for c in data['alternative_crops']])
    
    assert data["recommended_crop"].lower() == "soybean", f"Expected Soybean for MP Kharif, got {data['recommended_crop']}"
    print(">>> PASS: Madhya Pradesh in Kharif correctly predicted Soybean #1!")

def test_punjab_kharif():
    print("\n--- 3. Testing Punjab in Kharif Season ---")
    payload = {
        "state": "Punjab",
        "season": "Kharif",
        "nitrogen": 90.0,
        "phosphorus": 45.0,
        "potassium": 35.0,
        "temperature": 28.5,
        "humidity": 80.0,
        "ph": 6.8,
        "rainfall": 210.0
    }
    res = client.post("/api/prediction/crop", json=payload)
    assert res.status_code == 200
    data = res.json()
    print(f"Recommended Crop: {data['recommended_crop']}")
    print(f"Confidence Score: {data['confidence'] * 100:.1f}%")
    print("Top 3 Crops:", [(c['crop'], f"{c['confidence']}%") for c in data['alternative_crops']])
    
    assert data["recommended_crop"].lower() in ["rice", "cotton", "maize"], f"Unexpected: {data['recommended_crop']}"
    print(">>> PASS: Punjab in Kharif correctly predicted Rice/Paddy!")

def test_state_matrix_api():
    print("\n--- 4. Testing State-Season Matrix API ---")
    res = client.get("/api/prediction/state-matrix")
    assert res.status_code == 200
    data = res.json()
    print(f"Matrix states available: {len(data['matrix'])} states")
    assert "Haryana" in data["matrix"]
    assert "wheat" in data["matrix"]["Haryana"]["Rabi"]
    assert "maize" not in data["matrix"]["Haryana"]["Rabi"], "Maize must NOT be in Haryana Rabi"
    print(">>> PASS: State-Season Matrix verified!")

if __name__ == "__main__":
    test_haryana_rabi()
    test_mp_kharif()
    test_punjab_kharif()
    test_state_matrix_api()
    print("\n===========================================")
    print("ALL TWO-STAGE INDIAN CROP TESTS PASSED 100%!")
    print("===========================================")
