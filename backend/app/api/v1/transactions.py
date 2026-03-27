from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
from app.db.database import get_supabase_client
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionListResponse,
    PendingTransactionResponse,
    TransactionApprove
)

router = APIRouter()


@router.get("", response_model=TransactionListResponse)
async def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    client_id: Optional[str] = None,
    business_id: str = Query(...)
):
    supabase = get_supabase_client()
    
    query = supabase.table("transactions").select("count", count="exact")
    
    if status:
        query = query.eq("status", status)
    
    if client_id:
        query = query.eq("client_id", client_id)
    else:
        query = query.in_("client_id", 
            supabase.table("clients").select("id").eq("business_id", business_id)
        )
    
    count_result = query.execute()
    total = count_result.count
    
    offset = (page - 1) * page_size
    result = supabase.table("transactions").select("*").eq(
        "client_id", 
        supabase.table("clients").select("id").eq("business_id", business_id)
    ).order("created_at", desc=True).range(offset, offset + page_size - 1).execute()
    
    return TransactionListResponse(
        transactions=[TransactionResponse(**t) for t in result.data],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/pending", response_model=list[PendingTransactionResponse])
async def list_pending_approvals(
    business_id: str = Query(...),
    limit: int = Query(50, ge=1, le=200)
):
    supabase = get_supabase_client()
    
    clients = supabase.table("clients").select("id, name, phone").eq(
        "business_id", business_id
    ).execute()
    client_map = {c["id"]: c for c in clients.data}
    
    result = supabase.table("transactions").select("*").eq(
        "status", "awaiting_approval"
    ).order("created_at", desc=True).limit(limit).execute()
    
    pending = []
    for t in result.data:
        if t["client_id"] in client_map:
            client = client_map[t["client_id"]]
            pending.append(PendingTransactionResponse(
                id=t["id"],
                client_id=t["client_id"],
                client_name=client["name"],
                client_phone=client["phone"],
                amount=t["amount"],
                due_date=t["due_date"],
                reference_code=t.get("reference_code"),
                proof_image_url=t.get("proof_image_url"),
                ocr_result=t.get("ocr_result"),
                created_at=t["created_at"]
            ))
    
    return pending


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: str):
    supabase = get_supabase_client()
    result = supabase.table("transactions").select("*").eq("id", transaction_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    return TransactionResponse(**result.data[0])


@router.post("", response_model=TransactionResponse, status_code=201)
async def create_transaction(
    transaction: TransactionCreate,
    business_id: str = Query(...)
):
    supabase = get_supabase_client()
    
    client = supabase.table("clients").select("id, business_id").eq(
        "id", transaction.client_id
    ).execute()
    
    if not client.data:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    if client.data[0]["business_id"] != business_id:
        raise HTTPException(status_code=403, detail="Cliente no pertenece a tu negocio")
    
    data = transaction.model_dump()
    data["status"] = "pending"
    
    result = supabase.table("transactions").insert(data).execute()
    return TransactionResponse(**result.data[0])


@router.patch("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(transaction_id: str, transaction: TransactionUpdate):
    supabase = get_supabase_client()
    
    existing = supabase.table("transactions").select("*").eq("id", transaction_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    update_data = {k: v for k, v in transaction.model_dump().items() if v is not None}
    
    if update_data:
        update_data["updated_at"] = "now()"
        result = supabase.table("transactions").update(update_data).eq(
            "id", transaction_id
        ).execute()
        return TransactionResponse(**result.data[0])
    
    return TransactionResponse(**existing.data[0])


@router.post("/{transaction_id}/approve")
async def approve_transaction(
    transaction_id: str,
    approval: TransactionApprove,
    approved_by: str = Query(...)
):
    supabase = get_supabase_client()
    
    transaction = supabase.table("transactions").select("*").eq(
        "id", transaction_id
    ).execute()
    
    if not transaction.data:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    if transaction.data[0]["status"] != "awaiting_approval":
        raise HTTPException(
            status_code=400,
            detail="La transacción no está en espera de aprobación"
        )
    
    new_status = "approved" if approval.approved else "rejected"
    
    update_data = {
        "status": new_status,
        "approved_by": approved_by,
        "approved_at": datetime.now().isoformat(),
        "updated_at": "now()"
    }
    
    result = supabase.table("transactions").update(update_data).eq(
        "id", transaction_id
    ).execute()
    
    if approval.approved:
        client = supabase.table("clients").select("phone, name").eq(
            "id", transaction.data[0]["client_id"]
        ).execute()
        
        if client.data:
            from app.services.whatsapp_service import WhatsAppService
            whatsapp = WhatsAppService()
            
            try:
                await whatsapp.send_message(
                    client.data[0]["phone"],
                    f"✅ ¡Hola {client.data[0]['name']}! "
                    f"Tu pago de ${transaction.data[0]['amount']} ha sido verificado y confirmado. "
                    f"¡Gracias por tu pago!"
                )
            except Exception as e:
                from app.services.reminder_service import ReminderService
                logger = __import__("logging").getLogger(__name__)
                logger.error(f"Failed to send confirmation: {e}")
    
    return TransactionResponse(**result.data[0])
