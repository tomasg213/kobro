from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
from app.db.database import get_supabase_client
from app.schemas.message import (
    MessageTemplateCreate,
    MessageTemplateUpdate,
    MessageTemplateResponse,
    CampaignCreate,
    CampaignResponse
)
from app.services.whatsapp_service import WhatsAppService

router = APIRouter()


@router.get("/templates", response_model=list[MessageTemplateResponse])
async def list_templates(
    business_id: str = Query(...),
    template_type: Optional[str] = None
):
    supabase = get_supabase_client()
    
    query = supabase.table("message_templates").select("*").eq("business_id", business_id)
    
    if template_type:
        query = query.eq("template_type", template_type)
    
    result = query.order("created_at", desc=True).execute()
    return [MessageTemplateResponse(**t) for t in result.data]


@router.post("/templates", response_model=MessageTemplateResponse, status_code=201)
async def create_template(
    template: MessageTemplateCreate,
    business_id: str = Query(...)
):
    supabase = get_supabase_client()
    
    data = {
        **template.model_dump(),
        "business_id": business_id
    }
    
    result = supabase.table("message_templates").insert(data).execute()
    return MessageTemplateResponse(**result.data[0])


@router.patch("/templates/{template_id}", response_model=MessageTemplateResponse)
async def update_template(
    template_id: str,
    template: MessageTemplateUpdate
):
    supabase = get_supabase_client()
    
    existing = supabase.table("message_templates").select("*").eq("id", template_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    
    update_data = {k: v for k, v in template.model_dump().items() if v is not None}
    
    if update_data:
        result = supabase.table("message_templates").update(update_data).eq(
            "id", template_id
        ).execute()
        return MessageTemplateResponse(**result.data[0])
    
    return MessageTemplateResponse(**existing.data[0])


@router.delete("/templates/{template_id}", status_code=204)
async def delete_template(template_id: str):
    supabase = get_supabase_client()
    result = supabase.table("message_templates").delete().eq("id", template_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")


@router.get("/campaigns", response_model=list[CampaignResponse])
async def list_campaigns(
    business_id: str = Query(...),
    status: Optional[str] = None
):
    supabase = get_supabase_client()
    
    query = supabase.table("campaigns").select("*").eq("business_id", business_id)
    
    if status:
        query = query.eq("status", status)
    
    result = query.order("created_at", desc=True).execute()
    return [CampaignResponse(**c) for c in result.data]


@router.post("/campaigns", response_model=CampaignResponse, status_code=201)
async def create_campaign(
    campaign: CampaignCreate,
    business_id: str = Query(...)
):
    supabase = get_supabase_client()
    
    template = supabase.table("message_templates").select("id").eq(
        "id", campaign.template_id
    ).eq("business_id", business_id).execute()
    
    if not template.data:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    
    data = {
        **campaign.model_dump(),
        "business_id": business_id,
        "status": "draft"
    }
    
    result = supabase.table("campaigns").insert(data).execute()
    return CampaignResponse(**result.data[0])


@router.post("/campaigns/{campaign_id}/send")
async def send_campaign(
    campaign_id: str,
    business_id: str = Query(...)
):
    supabase = get_supabase_client()
    
    campaign = supabase.table("campaigns").select("*").eq(
        "id", campaign_id
    ).eq("business_id", business_id).execute()
    
    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")
    
    if campaign.data[0]["status"] not in ("draft", "scheduled"):
        raise HTTPException(status_code=400, detail="La campaña ya fue enviada")
    
    template = supabase.table("message_templates").select("*").eq(
        "id", campaign.data[0]["template_id"]
    ).execute()
    
    if not template.data:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    
    tags = campaign.data[0]["segment_tags"]
    
    clients_query = supabase.table("clients").select("*").eq(
        "business_id", business_id
    ).eq("is_active", True)
    
    if tags:
        clients_query = clients_query.overlaps("tags", tags)
    
    clients = clients_query.execute()
    
    whatsapp = WhatsAppService()
    sent_count = 0
    
    for client in clients.data:
        try:
            content = template.data[0]["content"].replace("{{client_name}}", client["name"])
            
            response = await whatsapp.send_message(client["phone"], content)
            message_id = response.get("messages", [{}])[0].get("id")
            
            supabase.table("messages_log").insert({
                "client_id": client["id"],
                "campaign_id": campaign_id,
                "template_id": campaign.data[0]["template_id"],
                "direction": "outbound",
                "content": content,
                "whatsapp_message_id": message_id,
                "status": "sent",
                "sent_at": datetime.now().isoformat()
            }).execute()
            
            sent_count += 1
            
        except Exception as e:
            supabase.table("messages_log").insert({
                "client_id": client["id"],
                "campaign_id": campaign_id,
                "template_id": campaign.data[0]["template_id"],
                "direction": "outbound",
                "content": template.data[0]["content"],
                "status": "failed",
                "error_message": str(e)
            }).execute()
    
    supabase.table("campaigns").update({
        "status": "sent",
        "sent_count": sent_count,
        "sent_at": datetime.now().isoformat()
    }).eq("id", campaign_id).execute()
    
    return {"sent_count": sent_count, "status": "sent"}
