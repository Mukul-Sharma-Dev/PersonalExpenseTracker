from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.budget import Budget
from app.models.expense import Expense
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/budget", tags=["Budget"])


def _compute_budget_response(budget: Budget, db: Session) -> BudgetResponse:
    """Attach computed fields (spent, remaining, percentage) to a Budget ORM object."""
    spent_result = (
        db.query(func.coalesce(func.sum(Expense.amount), 0.0))
        .filter(
            Expense.user_id == budget.user_id,
            Expense.date >= __import__('datetime').date(budget.year, budget.month, 1),
            Expense.date <= __import__('datetime').date(budget.year, budget.month, __import__('calendar').monthrange(budget.year, budget.month)[1]),
        )
        .scalar()
    )
    spent = float(spent_result)
    remaining = budget.amount - spent
    percentage = round((spent / budget.amount * 100) if budget.amount > 0 else 0.0, 2)

    return BudgetResponse(
        id=budget.id,
        amount=budget.amount,
        month=budget.month,
        year=budget.year,
        user_id=budget.user_id,
        spent=spent,
        remaining=remaining,
        percentage=percentage,
    )


from typing import List
from pydantic import BaseModel

class BudgetsResponse(BaseModel):
    budgets: List[BudgetResponse]

@router.get("", response_model=BudgetsResponse)
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all budgets for the current user."""
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == current_user.id)
        .order_by(Budget.year.desc(), Budget.month.desc())
        .all()
    )
    return BudgetsResponse(budgets=[_compute_budget_response(b, db) for b in budgets])


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_200_OK)
def upsert_budget(
    budget_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create or update the budget for a given month/year."""
    budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.month == budget_data.month,
            Budget.year == budget_data.year,
        )
        .first()
    )
    if budget:
        budget.amount = budget_data.amount
    else:
        budget = Budget(
            amount=budget_data.amount,
            month=budget_data.month,
            year=budget_data.year,
            user_id=current_user.id,
        )
        db.add(budget)

    db.commit()
    db.refresh(budget)
    return _compute_budget_response(budget, db)
