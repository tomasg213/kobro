import logging
from datetime import datetime, timedelta
from app.db.database import get_supabase_client
from app.services.reminder_service import ReminderService
from app.services.whatsapp_service import WhatsAppService

logger = logging.getLogger(__name__)


async def process_due_reminders():
    logger.info("Processing due payment reminders...")
    
    try:
        reminder_service = ReminderService()
        await reminder_service.process_due_reminders()
        logger.info("Reminders processed successfully")
    except Exception as e:
        logger.error(f"Error processing reminders: {e}")


async def check_overdue_transactions():
    logger.info("Checking for overdue transactions...")
    
    supabase = get_supabase_client()
    whatsapp = WhatsAppService()
    today = datetime.now().date()
    
    try:
        result = supabase.table("transactions").select(
            "*, clients:client_id(id, name, phone)"
        ).eq("status", "pending").lt("due_date", today.isoformat()).execute()
        
        for transaction in result.data:
            if not transaction.get("clients"):
                continue
            
            client = transaction["clients"]
            message = (
                f"⚠️ Recordatorio: Tienes un pago vencido.\n\n"
                f"Monto: ${transaction['amount']}\n"
                f"Fecha de vencimiento: {transaction['due_date']}\n\n"
                f"Por favor, regularizá tu situación a la brevedad."
            )
            
            try:
                await whatsapp.send_message(client["phone"], message)
                logger.info(f"Sent overdue notice to {client['phone']}")
            except Exception as e:
                logger.error(f"Failed to send overdue notice: {e}")
                
    except Exception as e:
        logger.error(f"Error checking overdue transactions: {e}")


async def cleanup_old_logs():
    logger.info("Cleaning up old message logs...")
    
    supabase = get_supabase_client()
    cutoff_date = datetime.now() - timedelta(days=90)
    
    try:
        supabase.table("messages_log").delete().lt(
            "created_at", cutoff_date.isoformat()
        ).eq("direction", "outbound").neq("status", "failed").execute()
        
        logger.info("Old logs cleaned up successfully")
    except Exception as e:
        logger.error(f"Error cleaning up logs: {e}")
