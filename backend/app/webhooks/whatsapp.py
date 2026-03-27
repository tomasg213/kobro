import logging
from fastapi import APIRouter, Request, HTTPException, Query
from app.core.config import settings
from app.services.whatsapp_service import WhatsAppService
from app.services.ocr_service import OCRService
from app.services.message_handler import MessageHandler

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)


@router.get("/whatsapp")
async def verify_webhook(
    hub_mode: str = Query(...),
    hub_verify_token: str = Query(...),
    hub_challenge: str = Query(...)
):
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_WEBHOOK_VERIFY_TOKEN:
        logger.info("WhatsApp webhook verified successfully")
        return int(hub_challenge)
    
    logger.warning(f"Webhook verification failed: mode={hub_mode}")
    raise HTTPException(status_code=403, detail="Invalid verification token")


@router.post("/whatsapp")
async def receive_webhook(request: Request):
    try:
        body = await request.json()
        logger.debug(f"Webhook received: {body}")
        
        if body.get("object") != "whatsapp_business_account":
            return {"status": "ignored"}
        
        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                
                if "messages" in value:
                    for message in value["messages"]:
                        await process_message(message, value)
                
                if "statuses" in value:
                    await update_message_statuses(value["statuses"])
        
        return {"status": "ok"}
        
    except Exception as e:
        logger.error(f"Webhook processing error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal processing error")


async def process_message(message: dict, value: dict):
    whatsapp = WhatsAppService()
    ocr = OCRService()
    handler = MessageHandler(whatsapp, ocr)
    await handler.handle(message, value)


async def update_message_statuses(statuses: list[dict]):
    from app.db.database import get_supabase_client
    supabase = get_supabase_client()
    
    for status in statuses:
        message_id = status.get("id")
        message_status = status.get("status")
        
        if message_id:
            supabase.table("messages_log").update({
                "status": message_status,
            }).eq("whatsapp_message_id", message_id).execute()
