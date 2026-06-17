from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    message: str

class ContactResponse(ContactCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
