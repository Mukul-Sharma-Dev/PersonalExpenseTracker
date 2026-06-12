import os
import uuid
from datetime import timedelta
from typing import Optional
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.auth import Token, UserCreate, UserLogin, UserResponse
from app.utils.auth import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token, get_current_user
from app.utils.hashing import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

DEFAULT_CATEGORIES = [
    {"name": "Food",          "icon": "🍔", "color": "#f97316", "description": "Meals, groceries & dining"},
    {"name": "Travel",        "icon": "✈️", "color": "#06b6d4", "description": "Flights, hotels & trips"},
    {"name": "Shopping",      "icon": "🛒", "color": "#ec4899", "description": "Clothes, electronics & more"},
    {"name": "Bills",         "icon": "💡", "color": "#f59e0b", "description": "Utilities, rent & subscriptions"},
    {"name": "Entertainment", "icon": "🎬", "color": "#8b5cf6", "description": "Movies, games & events"},
    {"name": "Other",         "icon": "💰", "color": "#64748b", "description": "Miscellaneous expenses"},
]



class UserUpdate(BaseModel):
    name: Optional[str] = None


class AvatarUpdate(BaseModel):
    avatar_url: str  # Full Cloudinary https:// URL


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user, seed default categories, and return a JWT token."""
    email_lower = user_data.email.lower().strip()
    existing_user = db.query(User).filter(func.lower(User.email) == email_lower).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    new_user = User(
        name=user_data.name,
        email=email_lower,
        password_hash=hash_password(user_data.password),
    )
    db.add(new_user)
    db.flush()  # get new_user.id without committing

    # Seed default categories for the new user
    for cat in DEFAULT_CATEGORIES:
        category = Category(
            name=cat["name"],
            icon=cat["icon"],
            color=cat["color"],
            description=cat["description"],
            user_id=new_user.id,
        )
        db.add(category)

    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(
        data={"sub": new_user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email and password, return JWT token."""
    email_lower = credentials.email.lower().strip()
    user = db.query(User).filter(func.lower(User.email) == email_lower).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    updates: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the currently authenticated user's profile (name only)."""
    if updates.name is not None:
        current_user.name = updates.name
    db.commit()
    db.refresh(current_user)
    return current_user


# ── Cloudinary: receive URL from frontend and store in DB ──────────────────
@router.patch("/avatar", response_model=UserResponse)
def update_avatar_url(
    payload: AvatarUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save a Cloudinary image URL to the user's avatar_url field in the DB."""
    if not payload.avatar_url.startswith("https://"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="avatar_url must be a valid https:// URL",
        )
    current_user.avatar_url = payload.avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Alias for /auth/me — returns current user profile including avatar_url."""
    return current_user
