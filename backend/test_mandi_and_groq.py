from fastapi.testclient import TestClient
from main import app
from app.core.database import SessionLocal
from app.models.crop_listing import CropListing

client = TestClient(app)

def test_groq_chatbot():
    print("\n--- 1. Testing Live Groq Cloud AI Chatbot ---")
    payload = {
        "message": "What is the best fertilizer dose for wheat at tillering stage?",
        "history": []
    }
    response = client.post("/api/chat/", json=payload)
    assert response.status_code == 200, f"Chat failed: {response.text}"
    data = response.json()
    print("Bot Reply Preview:", data["reply"][:250].encode('ascii', 'ignore').decode('ascii'))
    print("Recommended Products:", [p["name"] for p in data["recommended_products"]])
    assert len(data["reply"]) > 50, "Reply should be non-empty and substantive"
    print(">>> Groq Cloud LLM test PASSED!")

def test_mandi_api():
    print("\n--- 2. Testing Kisan Mandi (Farmer Crop Selling) ---")
    
    # 1. Get Listings
    res = client.get("/api/mandi/listings")
    assert res.status_code == 200
    listings = res.json()
    print(f"Active Mandi Lots Count: {len(listings)}")
    assert len(listings) >= 6, "Should have initial seeded lots"
    
    # Check lot data structure
    first = listings[0]
    print(f"Sample Lot: {first['crop_name']} ({first['variety']}) - {first['quantity_quintals']} qtl @ Rs.{first['expected_price_per_quintal']}/qtl (MSP: Rs.{first['msp_benchmark']})")
    assert "msp_benchmark" in first
    assert "farmer_phone" in first
    
    # 2. Post New Farmer Crop Listing
    new_lot = {
        "farmer_name": "Devendra Yadav",
        "farmer_phone": "9893011223",
        "crop_name": "Wheat",
        "variety": "Lokwan Premium",
        "quantity_quintals": 150.0,
        "expected_price_per_quintal": 2600.0,
        "moisture_pct": 10.8,
        "grade": "Grade A / Seed Quality",
        "village": "Ashta",
        "district": "Sehore",
        "state": "Madhya Pradesh",
        "harvest_date": "March 2024",
        "description": "Bold Lokwan wheat, uniform golden grain with 10.8% moisture.",
        "status": "active"
    }
    create_res = client.post("/api/mandi/listings", json=new_lot)
    assert create_res.status_code == 200
    created = create_res.json()
    print(f"Created Lot ID: {created['id']} with Auto MSP: Rs.{created['msp_benchmark']}")
    assert created["msp_benchmark"] == 2275.0, "Auto-filled MSP for wheat should be 2275"
    
    # 3. Verify Filter by State
    filter_res = client.get("/api/mandi/listings?state=Madhya Pradesh")
    assert filter_res.status_code == 200
    mp_lots = filter_res.json()
    print(f"Madhya Pradesh Lots: {len(mp_lots)}")
    assert len(mp_lots) >= 3
    
    # 4. Verify MSP Benchmarks
    msp_res = client.get("/api/mandi/msp")
    assert msp_res.status_code == 200
    benchmarks = msp_res.json()
    print(f"Official MSP Benchmarks available: {len(benchmarks)} crops")
    assert len(benchmarks) >= 8
    print(">>> Kisan Mandi API test PASSED!")

if __name__ == "__main__":
    test_groq_chatbot()
    test_mandi_api()
    print("\nALL BACKEND TESTS PASSED CLEANLY!")
