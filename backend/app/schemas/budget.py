from pydantic import BaseModel


class BudgetCreate(BaseModel):
    amount: float
    month: int
    year: int


class BudgetResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    amount: float
    month: int
    year: int
    user_id: int
    spent: float
    remaining: float
    percentage: float
