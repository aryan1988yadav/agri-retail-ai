import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.api_router import api_router
from app.seed_data import seed_database

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AgriRetail - AI-Powered Agriculture Marketplace, POS Billing & Crop Advisory System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app.include_router(api_router, prefix=settings.API_V1_STR)

# Auto-seed database on first cloud boot if tables are empty
@app.on_event("startup")
def startup_seed_check():
    from app.core.database import SessionLocal
    from app.models.product import Product
    db = SessionLocal()
    try:
        if db.query(Product).count() == 0:
            print("🌱 Initializing fresh cloud database: Seeding authentic Indian agri catalog...")
            seed_database()
            print("✓ Database seeded successfully!")
    except Exception as e:
        print(f"Startup seeding check: {e}")
    finally:
        db.close()

# Optional: Serve built frontend if dist exists (enables 1-click single service cloud deployment)
dist_candidates = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "dist")),
]
frontend_dist = next((d for d in dist_candidates if os.path.exists(d)), None)

if frontend_dist:
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
            return {"error": "Not Found"}
        target = os.path.join(frontend_dist, full_path)
        if os.path.exists(target) and os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "status": "online",
            "app": "AgriRetail AI Cloud API",
            "docs": "/docs",
            "endpoints": {
                "products": "/api/products",
                "pos": "/api/pos",
                "orders": "/api/orders",
                "inventory": "/api/inventory",
                "prediction": "/api/prediction"
            }
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main.py:app", host="0.0.0.0", port=port, reload=False)
