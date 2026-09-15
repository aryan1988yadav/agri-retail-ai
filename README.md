# 🌱 AgriRetail AI — Smart Agriculture Marketplace, POS & Crop Advisory System

An integrated agricultural commerce & machine learning platform designed for Indian farmers and retail agro-dealers (*Kisan Seva Kendras*).

---

## 🌟 Key System Modules

### 1. 🛒 Online Kisan Marketplace (`frontend` & `backend`)
- **Indian Agricultural Catalog:** Certified hybrid seeds (Maize, Paddy, Wheat, Cotton, Chana), NPK fertilizers (Urea, DAP, MOP, 10:26:26, Nano Urea), pesticides, bio-stimulants, and tools.
- **Crop-Specific Filtering:** Filter products by crop (Wheat, Rice, Maize, Cotton, Tomato, etc.).
- **Chemical & Dosage Transparency:** View technical formulations, dosage per acre, application methods, and safety waiting periods (PHI).
- **Kisan Cart & Checkout:** Slide-over cart with live stock validation, village delivery address, and Cash on Delivery (COD) / UPI order confirmation.

### 2. 🌾 ML Crop & Fertilizer Advisory Engine (`ml/` & `/api/prediction`)
- **ICAR 22-Crop Recommendation Model:**
  - Trained `RandomForestClassifier` on 2,200 Indian agricultural samples achieving **97.50% test accuracy**.
  - Inputs: Soil $N, P, K$, Temperature, Humidity, Soil pH, and Rainfall.
  - Output: Recommended crop, Hindi name, confidence score, expected yield range (Quintals/Acre), growing season, and cultivation tips.
  - **Live Inventory Bridge:** Automatically queries the database and displays matching **in-stock seeds & fertilizers** with 1-click *Add to Cart*.
- **NPK Fertilizer Gap Calculator:**
  - Analyzes soil nutrient test ratings against crop requirements to compute exact deficit in kg/acre and bag counts of Urea, DAP, and MOP.

### 3. 🖨️ In-Store POS Counter Billing Terminal (`/pos`)
- **Speed Counter Billing:** Rapid 1-click product addition by name or barcode.
- **Multiple Payment Modes:** Cash, UPI / QR, and **Farmer Khata (Credit/Udhar)** ledger.
- **Automated Inventory Sync:** Real-time stock decrement upon sale generation to prevent selling out-of-stock items online.
- **Printable Thermal Invoices:** Generates GST-compliant invoice receipts with item breakdowns, taxes, and customer details.

### 4. 📊 Retailer Analytics & Inventory Dashboard (`/dashboard`)
- **Real-Time KPIs:** Total inventory valuation, active product count, and expected profit margin.
- **Low Stock Safety Warnings:** Alerts when high-demand seasonal items fall below their safety reorder threshold, with 1-click "+ Restock" capability.
- **Recent Invoices Log:** Live transaction records for the store owner.

### 5. 🤖 AI Agronomist Chatbot (Phase 4 Ready)
- A floating chat launcher is integrated in the frontend.
- When you provide your pre-made chatbot source code, we will adapt it to use Cloud LLM (Gemini 2.5 Flash / Groq) with ChromaDB knowledge retrieval and live database tool-calling.

---

## 🚀 How to Run the Project

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ (tested on Node v24)

### Method 1: Using the Batch Scripts
Simply double-click:
1. `run_backend.bat` (Starts FastAPI on `http://localhost:8000`)
2. `run_frontend.bat` (Starts React UI on `http://localhost:5173`)

### Method 2: From Terminal

#### Start Backend:
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Start Frontend:
```bash
cd frontend
npm run dev
```
- Open Browser: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Testing the APIs

Run the automated backend test suite:
```bash
cd backend
python test_api.py
```
This tests:
1. Product catalog retrieval from SQLite database
2. Random Forest crop prediction and seed inventory matching
3. In-store POS sale transaction and stock deduction
4. Store inventory valuation and margin calculation
