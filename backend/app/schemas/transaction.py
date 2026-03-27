from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class TransactionBase(BaseModel):
    client_id: str
    amount: Decimal = Field(..., gt=0)
    due_date: date


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0)
    due_date: Optional[date] = None
    reference_code: Optional[str] = None
    proof_image_url: Optional[str] = None
    status: Optional[str] = None


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    client_id: str
    amount: Decimal
    due_date: date
    reference_code: Optional[str] = None
    proof_image_url: Optional[str] = None
    ocr_result: Optional[dict] = None
    status: str
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class TransactionApprove(BaseModel):
    approved: bool
    notes: Optional[str] = None


class PendingTransactionResponse(BaseModel):
    id: str
    client_id: str
    client_name: str
    client_phone: str
    amount: Decimal
    due_date: date
    reference_code: Optional[str] = None
    proof_image_url: Optional[str] = None
    ocr_result: Optional[dict] = None
    created_at: datetime


class TransactionListResponse(BaseModel):
    transactions: list[TransactionResponse]
    total: int
    page: int
    page_size: int
