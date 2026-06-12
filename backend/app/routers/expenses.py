from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.category import Category
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from app.utils.auth import get_current_user

router = APIRouter(prefix="/expenses", tags=["Expenses"])


def _build_expense_response(expense: Expense) -> ExpenseResponse:
    """Convert an ORM Expense into an ExpenseResponse with category details populated."""
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
        category_icon=expense.category.icon if expense.category else None,
        category_color=expense.category.color if expense.category else None,
    )


@router.get("", response_model=List[ExpenseResponse])
def list_expenses(
    search: Optional[str] = Query(None, description="Search in description"),
    category_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    sort_by: Optional[str] = Query("date", pattern="^(amount|date)$"),
    sort_order: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all expenses for the current user with optional filtering and sorting."""
    query = db.query(Expense).filter(Expense.user_id == current_user.id)

    if search:
        query = query.filter(Expense.description.ilike(f"%{search}%"))
    if category_id is not None:
        query = query.filter(Expense.category_id == category_id)
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)

    sort_column = Expense.date if sort_by == "date" else Expense.amount
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    expenses = query.all()
    return [_build_expense_response(e) for e in expenses]


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new expense for the current user."""
    # Verify the category belongs to the current user
    category = (
        db.query(Category)
        .filter(Category.id == expense_data.category_id, Category.user_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found or does not belong to the current user",
        )

    new_expense = Expense(
        amount=expense_data.amount,
        description=expense_data.description,
        date=expense_data.date,
        payment_method=expense_data.payment_method,
        category_id=expense_data.category_id,
        user_id=current_user.id,
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return _build_expense_response(new_expense)


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing expense. Only the owner can update it."""
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == current_user.id)
        .first()
    )
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )

    if expense_data.category_id is not None:
        category = (
            db.query(Category)
            .filter(
                Category.id == expense_data.category_id,
                Category.user_id == current_user.id,
            )
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found or does not belong to the current user",
            )

    update_fields = expense_data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)
    return _build_expense_response(expense)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an expense. Only the owner can delete it."""
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == current_user.id)
        .first()
    )
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )
    db.delete(expense)
    db.commit()
