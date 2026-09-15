from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

queries = [
    "Which seasons are there in India for farming?",
    "What medicine do you have for brown spots on wheat leaves?",
    "What fertilizer is good for maize and what do you have in stock?"
]

for q in queries:
    print(f"\n>>> Question: {q}")
    res = client.post("/api/chat", json={"message": q, "history": []})
    assert res.status_code == 200, res.text
    data = res.json()
    print("Bot reply:\n", data["reply"][:180].encode('ascii', 'ignore').decode(), "...")
    print(f"Matching products recommended: {len(data['recommended_products'])}")
    for p in data["recommended_products"]:
        print(f"   -> {p['name']} (Price: Rs.{p['price']} | Stock: {p['stock_quantity']})")

print("\n--- CHATBOT TEST PASSED SUCCESSFULLY! ---")
