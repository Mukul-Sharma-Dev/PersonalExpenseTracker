from typing import Optional

from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = "🏷️"
    color: Optional[str] = "#6366f1"
    description: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None


class CategoryResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    icon: Optional[str] = "🏷️"
    color: Optional[str] = "#6366f1"
    description: Optional[str] = None
    user_id: int
    expense_count: Optional[int] = 0
    total_amount: Optional[float] = 0.0

