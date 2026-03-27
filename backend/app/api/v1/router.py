from fastapi import APIRouter
from app.api.v1 import clients, transactions, campaigns, messages
from app.webhooks import whatsapp as webhook

router = APIRouter()

router.include_router(clients.router, prefix="/clients", tags=["Clients"])
router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
router.include_router(campaigns.router, prefix="/campaigns", tags=["Campaigns"])
router.include_router(messages.router, prefix="/messages", tags=["Messages"])
router.include_router(webhook.router, tags=["Webhooks"])
