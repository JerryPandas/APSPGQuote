from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, quotes, dashboard, lookup, export_routes, create, admin
from database import SessionLocal
from models import APSPGQuoteUser
from auth import get_password_hash


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        if not db.query(APSPGQuoteUser).first():
            default_user = APSPGQuoteUser(
                UserName="admin",
                Email="admin@local",
                PassWordHash=get_password_hash("admin123"),
                Role="Admin",
                Job="1",
                IsActive=True,
                CreatedAt=__import__("datetime").datetime.utcnow()
            )
            db.add(default_user)
            db.commit()
            print("Created default user: admin / admin123")
    finally:
        db.close()
    yield


app = FastAPI(title="APSPG Quote API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(quotes.router)
app.include_router(dashboard.router)
app.include_router(lookup.router)
app.include_router(export_routes.router)
app.include_router(create.router)
app.include_router(admin.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "APSPG Quote API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
