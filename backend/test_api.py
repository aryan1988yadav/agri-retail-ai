from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_system():
    print("--- 1. Testing Root & Docs ---")
    res = client.get("/")
    assert res.status_code == 200, f"Failed: {res.text}"
    print("Root OK:", res.json()["app"])

    print("\n--- 2. Testing Products & Categories ---")
    res = client.get("/api/products")
    assert res.status_code == 200
    products = res.json()
    print(f"Fetched {len(products)} products from database.")
    assert len(products) > 0, "No products found!"
    sample_prod = products[0]
    print(f"Sample Product: {sample_prod['name']} | Price: Rs.{sample_prod['price']} | Stock: {sample_prod['stock_quantity']}")

    print("\n--- 3. Testing ML Crop Prediction ---")
    # Test values for Maize: N=78, P=48, K=20, Temp=22, Hum=65, pH=6.2, Rain=85
    crop_input = {
        "nitrogen": 78,
        "phosphorus": 48,
        "potassium": 20,
        "temperature": 22.5,
        "humidity": 65.0,
        "ph": 6.2,
        "rainfall": 85.0
    }
    res = client.post("/api/prediction/crop", json=crop_input)
    assert res.status_code == 200, f"Crop prediction failed: {res.text}"
    pred = res.json()
    print(f"Recommended Crop: {pred['recommended_crop']}")
    print(f"Confidence: {pred['confidence'] * 100:.1f}%")
    print(f"Expected Yield: {pred['expected_yield_range']}")
    print(f"Matching In-Stock Seeds Found: {len(pred['recommended_seeds_in_store'])}")
    for s in pred["recommended_seeds_in_store"]:
        print(f"   -> Seed: {s['name']} (Rs.{s['price']}) - Stock: {s['stock_quantity']}")

    print("\n--- 4. Testing POS Counter Billing Transaction ---")
    initial_stock = sample_prod['stock_quantity']
    pos_sale_data = {
        "customer_name": "Ramesh Kisan (Test)",
        "customer_phone": "9876543210",
        "payment_method": "UPI",
        "discount_amount": 20.0,
        "tax_amount": 15.0,
        "notes": "Counter purchase during wheat sowing season",
        "items": [
            {
                "product_id": sample_prod['id'],
                "quantity": 2,
                "unit_price": sample_prod['price']
            }
        ]
    }
    res = client.post("/api/pos/sales", json=pos_sale_data)
    assert res.status_code == 201, f"POS sale failed: {res.text}"
    sale_resp = res.json()
    print(f"Invoice Generated: {sale_resp['invoice_number']}")
    print(f"Total Amount: Rs.{sale_resp['total_amount']} via {sale_resp['payment_method']}")

    # Verify inventory was decremented
    res = client.get(f"/api/products/{sample_prod['id']}")
    updated_prod = res.json()
    print(f"Inventory Check: Before={initial_stock}, After={updated_prod['stock_quantity']} (Deducted 2 units correctly!)")
    assert updated_prod['stock_quantity'] == initial_stock - 2

    print("\n--- 5. Testing Store Inventory Analytics ---")
    res = client.get("/api/inventory/stats")
    assert res.status_code == 200
    stats = res.json()
    print(f"Total Products: {stats['total_products']}")
    print(f"Retail Valuation: Rs.{stats['retail_valuation']}")
    print(f"Expected Gross Margin: Rs.{stats['expected_gross_profit']}")
    print(f"Low Stock Alerts: {stats['low_stock_count']} items")

    print("\n==========================================")
    print("ALL BACKEND & ML TESTS PASSED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    test_system()
