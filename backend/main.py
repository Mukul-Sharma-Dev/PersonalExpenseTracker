import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import all models so SQLAlchemy knows about them before creating tables
import app.models.user  # noqa: F401
import app.models.category  # noqa: F401
import app.models.expense  # noqa: F401
import app.models.budget  # noqa: F401

from app.database.db import Base, engine
from app.routers import auth, budget, categories, dashboard, expenses, reports, notifications

# Create all database tables
Base.metadata.create_all(bind=engine)

# Ensure uploads directory exists
UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="Personal Expense Tracker API",
    description="A RESTful API for tracking personal expenses with categories, budgets, and reports.",
    version="1.0.0",
)

# Serve uploaded files statically at /uploads/<filename>
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# CORS middleware — allow all localhost origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include all routers
app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(categories.router)
app.include_router(budget.router)
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(notifications.router)


@app.get("/", tags=["Root"])
def root():
    """Health check / root endpoint."""
    return {"message": "Expense Tracker API"}
