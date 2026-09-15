import json
import urllib.request

BASE_URL = "http://localhost:8000"

def test_crop_prediction_top3():
    print("Testing ML Crop Prediction Top 3 Crops...")
    payload = {
        "nitrogen": 78,
        "phosphorus": 48,
        "potassium": 20,
        "temperature": 24.0,
        "humidity": 65.0,
        "ph": 6.5,
        "rainfall": 110.0
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/prediction/crop",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode("utf-8"))
    assert "recommended_crop" in data, "Missing recommended_crop"
    assert "alternative_crops" in data, "Missing alternative_crops"
    assert len(data["alternative_crops"]) == 3, f"Expected 3 alternative crops, got {len(data['alternative_crops'])}"
    print(f"  [PASS] Primary: {data['recommended_crop']} ({data['confidence']*100:.1f}%)")
    for i, alt in enumerate(data["alternative_crops"]):
        print(f"    #{i+1}: {alt['crop']} - {alt['confidence']}%")

def test_pos_khata_checkout():
    print("\nTesting POS Checkout with Khata Credit Ledger...")
    # First get product
    res = urllib.request.urlopen(f"{BASE_URL}/api/products")
    products = json.loads(res.read().decode("utf-8"))
    first_prod = products[0]

    payload = {
        "customer_name": "Sardar Gurnam Singh",
        "customer_phone": "9876543210",
        "payment_method": "Khata",
        "discount_amount": 50,
        "tax_amount": 25,
        "notes": "[KHATA CREDIT - Village: Rampur | Due: 2026-11-15 | ID: 9812-4412-1102]",
        "items": [
            {
                "product_id": first_prod["id"],
                "quantity": 1,
                "unit_price": first_prod["price"]
            }
        ]
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/pos/sales",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode("utf-8"))
    assert "invoice_number" in data, "Missing invoice_number"
    assert data["payment_method"] == "Khata"
    assert "KHATA CREDIT" in data["notes"]
    print(f"  [PASS] Invoice {data['invoice_number']} generated with Khata notes: {data['notes'][:45]}...")

def test_chatbot_new_intents():
    print("\nTesting Kisan AI Chatbot New Agronomic Intents...")
    test_queries = [
        "How to prepare Jeevamrut for organic farming?",
        "Pink bollworm attack in cotton and maize armyworm remedy",
        "Weed herbicide spray for wheat and rice"
    ]
    for q in test_queries:
        payload = {"message": q, "history": []}
        req = urllib.request.Request(
            f"{BASE_URL}/api/chat",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode("utf-8"))
        assert "reply" in data and len(data["reply"]) > 50, f"Reply too short for query: {q}"
        clean_reply = data['reply'][:55].encode('ascii', 'ignore').decode('ascii')
        print(f"  [PASS] Query: \"{q[:35]}...\" -> Response: {clean_reply}...")

if __name__ == "__main__":
    test_crop_prediction_top3()
    test_pos_khata_checkout()
    test_chatbot_new_intents()
    print("\n==========================================")
    print("ALL PERFECTION MODULE TESTS PASSED (100%)!")
    print("==========================================")
