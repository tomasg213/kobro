from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.db.database import get_supabase_client
from app.schemas.client import (
    ClientCreate,
    ClientUpdate,
    ClientResponse,
    ClientListResponse
)

router = APIRouter()


@router.get("", response_model=ClientListResponse)
async def list_clients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    business_id: str = Query(...)
):
    supabase = get_supabase_client()
    
    query = supabase.table("clients").select("count", count="exact")
    
    if search:
        query = query.or_(f"name.ilike.%{search}%,phone.ilike.%{search}%")
    if is_active is not None:
        query = query.eq("is_active", is_active)
    query = query.eq("business_id", business_id)
    
    count_result = query.execute()
    total = count_result.count
    
    offset = (page - 1) * page_size
    result = supabase.table("clients").select("*").eq(
        "business_id", business_id
    ).range(offset, offset + page_size - 1).order("created_at", desc=True).execute()
    
    return ClientListResponse(
        clients=[ClientResponse(**c) for c in result.data],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: str):
    supabase = get_supabase_client()
    result = supabase.table("clients").select("*").eq("id", client_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    return ClientResponse(**result.data[0])


@router.post("", response_model=ClientResponse, status_code=201)
async def create_client(client: ClientCreate, business_id: str = Query(...)):
    supabase = get_supabase_client()
    
    existing = supabase.table("clients").select("id").eq("phone", client.phone).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Ya existe un cliente con este teléfono")
    
    data = {
        **client.model_dump(),
        "business_id": business_id
    }
    
    result = supabase.table("clients").insert(data).execute()
    return ClientResponse(**result.data[0])


@router.patch("/{client_id}", response_model=ClientResponse)
async def update_client(client_id: str, client: ClientUpdate):
    supabase = get_supabase_client()
    
    existing = supabase.table("clients").select("*").eq("id", client_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    update_data = {k: v for k, v in client.model_dump().items() if v is not None}
    
    if update_data:
        update_data["updated_at"] = "now()"
        result = supabase.table("clients").update(update_data).eq(
            "id", client_id
        ).execute()
        return ClientResponse(**result.data[0])
    
    return ClientResponse(**existing.data[0])


@router.delete("/{client_id}", status_code=204)
async def delete_client(client_id: str):
    supabase = get_supabase_client()
    
    result = supabase.table("clients").delete().eq("id", client_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")


@router.get("/{client_id}/transactions")
async def get_client_transactions(client_id: str):
    supabase = get_supabase_client()
    
    client = supabase.table("clients").select("id").eq("id", client_id).execute()
    if not client.data:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    result = supabase.table("transactions").select("*").eq(
        "client_id", client_id
    ).order("created_at", desc=True).execute()
    
    return result.data


@router.get("/{client_id}/messages")
async def get_client_messages(
    client_id: str,
    limit: int = Query(50, ge=1, le=200)
):
    supabase = get_supabase_client()
    
    result = supabase.table("messages_log").select("*").eq(
        "client_id", client_id
    ).order("created_at", desc=True).limit(limit).execute()
    
    return result.data
