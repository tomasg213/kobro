from fastapi import APIRouter, Query
from typing import Optional
from app.db.database import get_supabase_client
from app.schemas.message import MessageLogResponse
from app.services.whatsapp_service import WhatsAppService

router = APIRouter()


@router.get("/log", response_model=list[MessageLogResponse])
async def get_messages_log(
    business_id: str = Query(...),
    client_id: Optional[str] = None,
    direction: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500)
):
    supabase = get_supabase_client()
    
    client_ids = supabase.table("clients").select("id").eq(
        "business_id", business_id
    ).execute()
    
    client_id_list = [c["id"] for c in client_ids.data]
    
    if not client_id_list:
        return []
    
    query = supabase.table("messages_log").select("*").in_("client_id", client_id_list)
    
    if client_id:
        query = query.eq("client_id", client_id)
    
    if direction:
        query = query.eq("direction", direction)
    
    result = query.order("created_at", desc=True).limit(limit).execute()
    
    return [MessageLogResponse(**m) for m in result.data]


@router.post("/send")
async def send_single_message(
    client_id: str,
    message: str,
    business_id: str = Query(...)
):
    supabase = get_supabase_client()
    
    client = supabase.table("clients").select("id, phone, name, business_id").eq(
        "id", client_id
    ).execute()
    
    if not client.data:
        return {"error": "Cliente no encontrado"}
    
    if client.data[0]["business_id"] != business_id:
        return {"error": "No tienes acceso a este cliente"}
    
    whatsapp = WhatsAppService()
    
    try:
        response = await whatsapp.send_message(client.data[0]["phone"], message)
        message_id = response.get("messages", [{}])[0].get("id")
        
        supabase.table("messages_log").insert({
            "client_id": client_id,
            "direction": "outbound",
            "content": message,
            "whatsapp_message_id": message_id,
            "status": "sent"
        }).execute()
        
        return {"success": True, "message_id": message_id}
        
    except Exception as e:
        supabase.table("messages_log").insert({
            "client_id": client_id,
            "direction": "outbound",
            "content": message,
            "status": "failed",
            "error_message": str(e)
        }).execute()
        
        return {"success": False, "error": str(e)}
