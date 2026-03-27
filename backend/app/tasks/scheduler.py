from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import logging

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


def start_scheduler():
    from app.tasks.jobs import (
        process_due_reminders,
        check_overdue_transactions,
        cleanup_old_logs
    )
    
    scheduler.add_job(
        process_due_reminders,
        CronTrigger(hour=9, minute=0),
        id="daily_reminders",
        name="Enviar recordatorios de pago",
        replace_existing=True
    )
    
    scheduler.add_job(
        check_overdue_transactions,
        CronTrigger(hour=10, minute=0),
        id="check_overdue",
        name="Verificar transacciones vencidas",
        replace_existing=True
    )
    
    scheduler.add_job(
        cleanup_old_logs,
        CronTrigger(day_of_week="sun", hour=2, minute=0),
        id="cleanup_logs",
        name="Limpiar logs antiguos",
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Task scheduler started")


def stop_scheduler():
    scheduler.shutdown(wait=False)
    logger.info("Task scheduler stopped")
