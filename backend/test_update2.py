import sys
from app.database.db import SessionLocal
from app.models.user import User
from app.models.category import Category
from app.models.expense import Expense
from app.schemas.expense import ExpenseUpdate
from app.routers.expenses import update_expense

db = SessionLocal()
user = db.query(User).first()
if not user:
    print("No users")
    sys.exit()

exp = db.query(Expense).filter(Expense.user_id == user.id).first()
if not exp:
    print("No expenses")
    sys.exit()

print(f"Before: {exp.description} (amount: {exp.amount})")

expense_data = ExpenseUpdate(description="Updated description", amount=999.99)
updated_exp = update_expense(expense_id=exp.id, expense_data=expense_data, db=db, current_user=user)

print(f"After: {updated_exp.description} (amount: {updated_exp.amount})")
