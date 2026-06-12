from typing import List

from pydantic import BaseModel

from app.schemas.expense import ExpenseResponse


class DashboardStats(BaseModel):
    total_expenses: float
    monthly_expenses: float
    today_expenses: float
    highest_category: str
    recent_transactions: List[ExpenseResponse]
