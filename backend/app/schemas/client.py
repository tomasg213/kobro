from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal


class ClientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=8, max_length=20)
    email: Optional[str] = None
    debt_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    notes: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    is_active: bool = True


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, min_length=8, max_length=20)
    email: Optional[str] = None
    debt_amount: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None
    tags: Optional[list[str]] = None
    is_active: Optional[bool] = None


class ClientResponse(ClientBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    business_id: str
    created_at: datetime
    updated_at: datetime


class ClientListResponse(BaseModel):
    clients: list[ClientResponse]
    total: int
    page: int
    page_size: int
