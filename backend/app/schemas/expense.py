from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    amount: float
    description: str
    date: date
    payment_method: str
    category_id: int


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[date] = None
    payment_method: Optional[str] = None
    category_id: Optional[int] = None


class ExpenseResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    amount: float
    description: str
    date: date
    payment_method: str
    category_id: int
    user_id: int
    created_at: datetime
    category_name: Optional[str] = None
    category_icon: Optional[str] = None
    category_color: Optional[str] = None
