import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseUpdate

SQLALCHEMY_DATABASE_URL = "sqlite:///./expenses.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

user = db.query(User).first()
if not user:
    print("No users found")
    sys.exit()

exp = db.query(Expense).filter(Expense.user_id == user.id).first()
if not exp:
    print("No expenses found")
    sys.exit()

print(f"Before: {exp.description} (amount: {exp.amount})")

# Simulate update_expense logic
expense_data = ExpenseUpdate(description="Updated description", amount=999.99)
update_fields = expense_data.model_dump(exclude_unset=True)
for field, value in update_fields.items():
    setattr(exp, field, value)

db.commit()
db.refresh(exp)

print(f"After: {exp.description} (amount: {exp.amount})")

# Verify in DB
db2 = SessionLocal()
exp_verify = db2.query(Expense).filter(Expense.id == exp.id).first()
print(f"In DB: {exp_verify.description} (amount: {exp_verify.amount})")
