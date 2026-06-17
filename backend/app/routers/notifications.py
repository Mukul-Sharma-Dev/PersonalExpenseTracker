from datetime import datetime, timedelta, date
import calendar

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.budget import Budget
from app.models.expense import Expense
from app.models.user import User
from app.utils.auth import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class NotificationResponse(BaseModel):
    id: int
    title: str
    body: str
    time: str
    unread: bool
    type: str

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notifications = []
    now = datetime.now()
    today = date.today()
    notif_id = 1

    # 1. Budget Notifications
    budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.month == now.month,
            Budget.year == now.year,
        )
        .first()
    )

    if budget and budget.amount > 0:
        first_day_of_month = date(today.year, today.month, 1)
        last_day_of_month = date(today.year, today.month, calendar.monthrange(today.year, today.month)[1])
        
        spent_result = (
            db.query(func.coalesce(func.sum(Expense.amount), 0.0))
            .filter(
                Expense.user_id == current_user.id,
                Expense.date >= first_day_of_month,
                Expense.date <= last_day_of_month,
            )
            .scalar()
        )
        spent = float(spent_result)
        percentage = (spent / budget.amount) * 100

        if percentage >= 100:
            notifications.append({
                "id": notif_id,
                "title": "Budget Exceeded \u26a0\ufe0f",
                "body": f"You have exceeded your monthly budget of \u20b9{budget.amount:,.0f}.",
                "time": "Just now",
                "unread": True,
                "type": "danger"
            })
            notif_id += 1
        elif percentage >= 80:
            notifications.append({
                "id": notif_id,
                "title": "Budget Warning",
                "body": f"You have used {percentage:.1f}% of your monthly budget.",
                "time": "Just now",
                "unread": True,
                "type": "warning"
            })
            notif_id += 1
        elif percentage >= 50:
            notifications.append({
                "id": notif_id,
                "title": "Budget Alert",
                "body": f"You have reached 50% of your monthly budget.",
                "time": "Today",
                "unread": True,
                "type": "info"
            })
            notif_id += 1

    # 2. Inactivity Notification (No expenses in last 3 days)
    three_days_ago = today - timedelta(days=3)
    recent_expense_count = (
        db.query(func.count(Expense.id))
        .filter(
            Expense.user_id == current_user.id,
            Expense.date >= three_days_ago
        )
        .scalar()
    )

    if recent_expense_count == 0:
        notifications.append({
            "id": notif_id,
            "title": "Friendly Reminder 📝",
            "body": "You haven't logged any expenses in the last 3 days. Stay on track!",
            "time": "Today",
            "unread": True,
            "type": "info"
        })
        notif_id += 1

    # 3. Large Expense Notification
    large_expense = (
        db.query(Expense)
        .filter(
            Expense.user_id == current_user.id,
            Expense.amount >= 5000,
            Expense.date >= (today - timedelta(days=7))
        )
        .order_by(Expense.date.desc())
        .first()
    )

    if large_expense:
        notifications.append({
            "id": notif_id,
            "title": "Large Expense Detected",
            "body": f"A large expense of \u20b9{large_expense.amount:,.0f} for '{large_expense.description}' was recorded recently.",
            "time": str(large_expense.date),
            "unread": True,
            "type": "warning"
        })
        notif_id += 1

    return notifications
