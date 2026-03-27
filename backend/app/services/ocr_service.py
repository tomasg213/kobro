import re
import io
import logging
from typing import Optional
from PIL import Image
import numpy as np

logger = logging.getLogger(__name__)


class OCRService:
    _reader = None
    
    def __init__(self):
        self._init_reader()
    
    def _init_reader(self):
        if OCRService._reader is None:
            try:
                import easyocr
                OCRService._reader = easyocr.Reader(['es', 'en'], gpu=False, verbose=False)
                logger.info("EasyOCR reader initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize EasyOCR: {e}")
                OCRService._reader = None
    
    async def extract_reference_code(self, image_data: bytes) -> Optional[str]:
        if OCRService._reader is None:
            logger.warning("EasyOCR reader not available")
            return None
        
        try:
            image = self._bytes_to_image(image_data)
            
            results = OCRService._reader.readtext(np.array(image))
            
            all_text = " ".join([text for _, text, _ in results])
            
            reference_patterns = [
                r'(?:ref|referencia|cod| código|operación|comprobante|nro|número|id)[\s:]*(\d{6,15})',
                r'(\d{8,15})',
            ]
            
            for pattern in reference_patterns:
                matches = re.findall(pattern, all_text, re.IGNORECASE)
                if matches:
                    code = max(matches, key=len)
                    if len(code) >= 6:
                        logger.info(f"Reference code extracted: {code}")
                        return code
            
            numbers = re.findall(r'\d{6,15}', all_text)
            if numbers:
                code = max(numbers, key=len)
                logger.info(f"Code found (fallback): {code}")
                return code
            
            logger.warning("No reference code found in image")
            return None
            
        except Exception as e:
            logger.error(f"OCR extraction error: {e}")
            return None
    
    def _bytes_to_image(self, image_data: bytes) -> Image.Image:
        return Image.open(io.BytesIO(image_data))
