import logging
import re
from typing import Optional
from app.db.database import get_supabase_client
from app.services.whatsapp_service import WhatsAppService
from app.services.ocr_service import OCRService
from app.core.config import settings

logger = logging.getLogger(__name__)


class MessageHandler:
    def __init__(
        self,
        whatsapp_service: WhatsAppService,
        ocr_service: OCRService
    ):
        self.whatsapp = whatsapp_service
        self.ocr = ocr_service
        self.supabase = get_supabase_client()
    
    async def handle(self, message: dict, value: dict):
        msg_type = message.get("type")
        from_number = message.get("from")
        message_id = message.get("id")
        
        await self.whatsapp.mark_as_read(message_id)
        
        await self._log_incoming_message(from_number, message)
        
        if msg_type == "image":
            await self._handle_image_message(from_number, message)
        elif msg_type == "text":
            await self._handle_text_message(from_number, message)
        else:
            logger.info(f"Unhandled message type: {msg_type}")
    
    async def _log_incoming_message(self, from_number: str, message: dict):
        client_id = self._get_client_id(from_number)
        self.supabase.table("messages_log").insert({
            "client_id": client_id,
            "direction": "inbound",
            "content": str(message),
            "status": "received"
        }).execute()
    
    async def _handle_image_message(self, from_number: str, message: dict):
        media_id = message.get("image", {}).get("id")
        
        if not media_id:
            logger.error("No image ID found")
            return
        
        try:
            image_data = await self.whatsapp.download_media(media_id)
            reference_code = await self.ocr.extract_reference_code(image_data)
            
            client_id = self._get_client_id(from_number)
            
            if client_id:
                if reference_code:
                    await self._update_transaction_with_proof(client_id, reference_code, media_id)
                    await self._notify_pending(client_id, reference_code)
                else:
                    await self._notify_admin_unclear(client_id, media_id)
            
            await self.whatsapp.send_message(
                from_number,
                f"📄 Recibimos tu comprobante. "
                f"Código: {reference_code or 'pendiente de revisión'}. "
                f"Te confirmaremos cuando esté verificado."
            )
            
        except Exception as e:
            logger.error(f"Image processing error: {e}")
            await self.whatsapp.send_message(
                from_number,
                "⚠️ No pudimos procesar tu imagen. Por favor, reenviá el comprobante."
            )
    
    async def _handle_text_message(self, from_number: str, message: dict):
        text = message.get("text", {}).get("body", "").strip()
        
        code_match = re.search(r'\b\d{6,12}\b', text)
        
        if code_match:
            reference_code = code_match.group()
            client_id = self._get_client_id(from_number)
            
            if client_id:
                await self._update_transaction_with_proof(client_id, reference_code)
                await self._notify_pending(client_id, reference_code)
                
                await self.whatsapp.send_message(
                    from_number,
                    f"✅ Recibimos tu comprobante. Ref: *{reference_code}*. "
                    f"Te confirmaremos cuando esté verificado."
                )
        else:
            await self._handle_generic_response(from_number, text)
    
    async def _handle_generic_response(self, from_number: str, text: str):
        text_lower = text.lower()
        
        if any(word in text_lower for word in ["hola", "buenos", "buenas", "saludos"]):
            response = "¡Hola! 👋 Gracias por comunicarte. ¿En qué podemos ayudarte?"
        elif any(word in text_lower for word in ["pago", "abono", "transferencia"]):
            response = "💳 Para registrar un pago, por favor enviá tu comprobante o el código de referencia."
        elif any(word in text_lower for word in ["estado", "deuda", "saldo", "cuánto"]):
            response = "📊 Para consultar tu estado de cuenta, por favor indicá tu número de cliente o dni."
        else:
            response = "📩 Recibimos tu mensaje. Un asesor te responderá a la brevedad."
        
        await self.whatsapp.send_message(from_number, response)
    
    async def _update_transaction_with_proof(
        self,
        client_id: str,
        reference_code: str,
        media_id: str = None
    ):
        update_data = {
            "reference_code": reference_code,
            "status": "awaiting_approval",
            "ocr_result": {"raw_code": reference_code, "provider": settings.OCR_PROVIDER}
        }
        
        if media_id:
            update_data["proof_image_url"] = f"whatsapp_media/{media_id}.jpg"
        
        result = self.supabase.table("transactions").select("id").eq(
            "client_id", client_id
        ).eq("status", "pending").order("due_date").limit(1).execute()
        
        if result.data:
            self.supabase.table("transactions").update(update_data).eq(
                "id", result.data[0]["id"]
            ).execute()
            logger.info(f"Transaction {result.data[0]['id']} updated with proof")
    
    async def _notify_pending(self, client_id: str, reference_code: str):
        logger.info(f"Payment proof pending approval: {reference_code} for client {client_id}")
    
    async def _notify_admin_unclear(self, client_id: str, media_id: str):
        logger.warning(f"Image {media_id} from client {client_id} needs manual review")
    
    def _get_client_id(self, phone: str) -> Optional[str]:
        result = self.supabase.table("clients").select("id").eq(
            "phone", phone
        ).execute()
        
        if result.data:
            return result.data[0]["id"]
        
        result = self.supabase.table("clients").select("id").eq(
            "phone", f"+{phone.lstrip('+')}"
        ).execute()
        
        if result.data:
            return result.data[0]["id"]
        
        return None
