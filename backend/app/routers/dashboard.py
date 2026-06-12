from datetime import date, datetime
import calendar

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.category import Category
from app.models.expense import Expense
from app.models.user import User
from app.schemas.dashboard import DashboardStats
from app.schemas.expense import ExpenseResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _build_expense_response(expense: Expense) -> ExpenseResponse:
    return ExpenseResponse(
        id=expense.id,
        amount=expense.amount,
        description=expense.description,
        date=expense.date,
        payment_method=expense.payment_method,
        category_id=expense.category_id,
        user_id=expense.user_id,
        created_at=expense.created_at,
        category_name=expense.category.name if expense.category else None,
    )


@router.get("", response_model=DashboardStats)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return aggregated statistics and recent transactions for the current user."""
    now = datetime.now()
    today = date.today()

    # Total expenses (all time)
    total_result = (
        db.query(func.coalesce(func.sum(Expense.amount), 0.0))
        .filter(Expense.user_id == current_user.id)
        .scalar()
    )
    total_expenses = float(total_result)

    # Monthly expenses (current month/year)
    first_day_of_month = date(today.year, today.month, 1)
    last_day_of_month = date(today.year, today.month, calendar.monthrange(today.year, today.month)[1])
    
    monthly_result = (
        db.query(func.coalesce(func.sum(Expense.amount), 0.0))
        .filter(
            Expense.user_id == current_user.id,
            Expense.date >= first_day_of_month,
            Expense.date <= last_day_of_month,
        )
        .scalar()
    )
    monthly_expenses = float(monthly_result)

    # Today's expenses
    today_result = (
        db.query(func.coalesce(func.sum(Expense.amount), 0.0))
        .filter(
            Expense.user_id == current_user.id,
            Expense.date == today,
        )
        .scalar()
    )
    today_expenses = float(today_result)

    # Highest spending category (by total amount)
    highest_category_row = (
        db.query(Category.name, func.sum(Expense.amount).label("total"))
        .join(Expense, Expense.category_id == Category.id)
        .filter(Expense.user_id == current_user.id)
        .group_by(Category.id, Category.name)
        .order_by(func.sum(Expense.amount).desc())
        .first()
    )
    highest_category = highest_category_row[0] if highest_category_row else "N/A"

    # Recent 5 transactions
    recent_expenses = (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id)
        .order_by(Expense.created_at.desc())
        .limit(5)
        .all()
    )
    recent_transactions = [_build_expense_response(e) for e in recent_expenses]

    return DashboardStats(
        total_expenses=total_expenses,
        monthly_expenses=monthly_expenses,
        today_expenses=today_expenses,
        highest_category=highest_category,
        recent_transactions=recent_transactions,
    )
