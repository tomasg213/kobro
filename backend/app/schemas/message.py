from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum


class TemplateType(str, Enum):
    PROMOTIONAL = "promotional"
    REMINDER = "reminder"
    CONFIRMATION = "confirmation"


class MessageDirection(str, Enum):
    OUTBOUND = "outbound"
    INBOUND = "inbound"


class MessageStatus(str, Enum):
    QUEUED = "queued"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class MessageTemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    template_type: TemplateType
    is_active: bool = True


class MessageTemplateCreate(MessageTemplateBase):
    pass


class MessageTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    template_type: Optional[TemplateType] = None
    is_active: Optional[bool] = None


class MessageTemplateResponse(MessageTemplateBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    business_id: str
    created_at: datetime


class CampaignBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    template_id: str
    segment_tags: list[str] = Field(default_factory=list)
    schedule_at: Optional[datetime] = None


class CampaignCreate(CampaignBase):
    pass


class CampaignResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    business_id: str
    name: str
    template_id: str
    segment_tags: list[str]
    status: str
    scheduled_at: Optional[datetime] = None
    sent_count: int = 0
    created_at: datetime


class MessageLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    client_id: Optional[str] = None
    transaction_id: Optional[str] = None
    template_id: Optional[str] = None
    direction: MessageDirection
    content: str
    whatsapp_message_id: Optional[str] = None
    status: MessageStatus
    error_message: Optional[str] = None
    sent_at: Optional[datetime] = None
    created_at: datetime
