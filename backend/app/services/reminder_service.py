import logging
from datetime import datetime
from typing import Optional
from app.db.database import get_supabase_client
from app.services.whatsapp_service import WhatsAppService
from app.schemas.message import MessageTemplateResponse

logger = logging.getLogger(__name__)


class ReminderService:
    def __init__(self):
        self.supabase = get_supabase_client()
        self.whatsapp = WhatsAppService()
    
    async def send_reminder(
        self,
        client_id: str,
        template_id: str,
        **template_vars
    ) -> bool:
        try:
            client = self._get_client(client_id)
            if not client or not client.get("is_active"):
                return False
            
            template = self._get_template(template_id)
            if not template:
                logger.error(f"Template {template_id} not found")
                return False
            
            content = self._interpolate_template(template["content"], {
                "client_name": client["name"],
                "phone": client["phone"],
                **template_vars
            })
            
            response = await self.whatsapp.send_message(client["phone"], content)
            message_id = response.get("messages", [{}])[0].get("id")
            
            self._log_message(
                client_id=client_id,
                template_id=template_id,
                content=content,
                message_id=message_id
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending reminder: {e}")
            return False
    
    async def process_due_reminders(self):
        today = datetime.now().date().isoformat()
        
        result = self.supabase.table("payment_reminders").select(
            "*, templates:template_id(id, name, content)"
        ).eq("is_active", True).execute()
        
        for reminder in result.data:
            if not reminder.get("templates"):
                continue
            
            days = reminder["days_before_due"]
            target_date = self._calculate_target_date(days)
            
            transactions = self._get_transactions_due_on(target_date)
            
            for transaction in transactions:
                await self.send_reminder(
                    client_id=transaction["client_id"],
                    template_id=reminder["template_id"],
                    amount=str(transaction["amount"]),
                    due_date=str(transaction["due_date"]),
                    reference=transaction.get("reference_code", "N/A")
                )
    
    def _calculate_target_date(self, days_before: int) -> str:
        from datetime import timedelta
        target = datetime.now().date() + timedelta(days=days_before)
        return target.isoformat()
    
    def _get_transactions_due_on(self, date: str) -> list:
        result = self.supabase.table("transactions").select(
            "id, client_id, amount, due_date, reference_code"
        ).eq("due_date", date).eq("status", "pending").execute()
        return result.data or []
    
    def _get_client(self, client_id: str) -> Optional[dict]:
        result = self.supabase.table("clients").select("*").eq(
            "id", client_id
        ).execute()
        return result.data[0] if result.data else None
    
    def _get_template(self, template_id: str) -> Optional[dict]:
        result = self.supabase.table("message_templates").select("*").eq(
            "id", template_id
        ).execute()
        return result.data[0] if result.data else None
    
    def _interpolate_template(self, content: str, variables: dict) -> str:
        result = content
        for key, value in variables.items():
            result = result.replace(f"{{{{{key}}}}}", str(value))
        return result
    
    def _log_message(
        self,
        client_id: str,
        template_id: str,
        content: str,
        message_id: str = None
    ):
        self.supabase.table("messages_log").insert({
            "client_id": client_id,
            "template_id": template_id,
            "direction": "outbound",
            "content": content,
            "whatsapp_message_id": message_id,
            "status": "sent" if message_id else "queued",
            "sent_at": datetime.now().isoformat()
        }).execute()
