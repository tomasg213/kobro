import httpx
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class WhatsAppService:
    BASE_URL = "https://graph.facebook.com/v18.0"
    
    def __init__(self):
        self.phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
        self.access_token = settings.WHATSAPP_ACCESS_TOKEN
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
    
    async def send_message(self, to: str, content: str) -> dict:
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"body": content}
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/{self.phone_number_id}/messages",
                headers=self.headers,
                json=payload,
                timeout=30.0
            )
            
            if response.status_code not in (200, 201):
                logger.error(f"WhatsApp send error: {response.text}")
                raise Exception(f"WhatsApp API error: {response.text}")
            
            return response.json()
    
    async def send_template_message(
        self,
        to: str,
        template_name: str,
        components: list[dict]
    ) -> dict:
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": "es_AR"},
                "components": components
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/{self.phone_number_id}/messages",
                headers=self.headers,
                json=payload,
                timeout=30.0
            )
            
            if response.status_code not in (200, 201):
                logger.error(f"WhatsApp template error: {response.text}")
                raise Exception(f"WhatsApp API error: {response.text}")
            
            return response.json()
    
    async def download_media(self, media_id: str) -> bytes:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/{media_id}",
                headers=self.headers,
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise Exception(f"Error getting media URL: {response.text}")
            
            media_url = response.json().get("url")
            
            download_response = await client.get(
                media_url,
                headers=self.headers,
                timeout=60.0
            )
            
            return download_response.content
    
    async def mark_as_read(self, message_id: str) -> bool:
        payload = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": message_id
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/{self.phone_number_id}/messages",
                headers=self.headers,
                json=payload,
                timeout=10.0
            )
            
            return response.status_code in (200, 201)
