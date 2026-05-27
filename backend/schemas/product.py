# schemas/product.py
from pydantic import BaseModel, Field
from typing import List, Optional

class ProductCreate(BaseModel):
    name:           str
    description:    str
    price:          float   = Field(..., gt=0)
    original_price: Optional[float] = None
    discount:       Optional[int]   = 0
    category:       str
    brand:          Optional[str]   = None
    images:         List[str]       = []
    stock:          int             = Field(..., ge=0)
    is_featured:    bool            = False

class ProductUpdate(BaseModel):
    name:           Optional[str]       = None
    description:    Optional[str]       = None
    price:          Optional[float]     = None
    original_price: Optional[float]     = None
    discount:       Optional[int]       = None
    category:       Optional[str]       = None
    brand:          Optional[str]       = None
    images:         Optional[List[str]] = None
    stock:          Optional[int]       = None
    is_featured:    Optional[bool]      = None