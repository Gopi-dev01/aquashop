# ═══════════════════════════════════════
# routes/products.py — Full Product Routes
# Supports Shop Page filtering, sorting, pagination
# ═══════════════════════════════════════

from fastapi import APIRouter, HTTPException, Query, Depends
from bson import ObjectId
from typing import Optional
from datetime import datetime

from config import products_col, reviews_col
from pydantic import BaseModel, Field
from models.product import product_document, serialize_product
from schemas.product import ProductCreate, ProductUpdate
from utils.auth import get_current_user

router = APIRouter(prefix="/products", tags=["Products"])


# ══════════════════════════════
# GET ALL PRODUCTS
# Shop filters:
# ?category=audio
# ?brand=Sony,Apple       (comma-separated)
# ?min_price=0&max_price=500
# ?min_rating=4
# ?discount=true          (sale items)
# ?featured=true
# ?q=headphones           (search)
# ?sort=featured|price_low|price_high|rating|newest
# ?page=1&limit=8
# ══════════════════════════════
@router.get("")
async def get_products(
    category:   Optional[str]   = None,
    brand:      Optional[str]   = None,
    min_price:  Optional[float] = None,
    max_price:  Optional[float] = None,
    min_rating: Optional[float] = None,
    discount:   Optional[bool]  = None,
    featured:   Optional[bool]  = None,
    q:          Optional[str]   = None,
    sort:       Optional[str]   = "featured",
    page:       int = Query(1, ge=1),
    limit:      int = Query(8, le=100),
):
    filters = {"is_active": True}

    if category:
        filters["category"] = category.lower().strip()

    if brand:
        brand_list = [b.strip() for b in brand.split(",")]
        filters["brand"] = {"$in": brand_list}

    price_filter = {}
    if min_price is not None:
        price_filter["$gte"] = min_price
    if max_price is not None:
        price_filter["$lte"] = max_price
    if price_filter:
        filters["price"] = price_filter

    if min_rating is not None:
        filters["rating"] = {"$gte": min_rating}

    if discount is True:
        filters["discount"] = {"$gt": 0}

    if featured is True:
        filters["is_featured"] = True

    if q:
        filters["$or"] = [
            {"name":        {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"category":    {"$regex": q, "$options": "i"}},
            {"brand":       {"$regex": q, "$options": "i"}},
        ]

    sort_map = {
        "featured":   [("is_featured", -1), ("created_at", -1)],
        "price_low":  [("price", 1)],
        "price_high": [("price", -1)],
        "rating":     [("rating", -1)],
        "newest":     [("created_at", -1)],
    }
    sort_order = sort_map.get(sort, sort_map["featured"])

    total  = await products_col.count_documents(filters)
    skip   = (page - 1) * limit
    cursor = products_col.find(filters).sort(sort_order).skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)

    return {
        "products":    [serialize_product(p) for p in products],
        "total":       total,
        "page":        page,
        "limit":       limit,
        "total_pages": (total + limit - 1) // limit,
    }


# ══════════════════════════════
# FEATURED PRODUCTS (Home page)
# ══════════════════════════════
@router.get("/featured")
async def get_featured(limit: int = Query(4, le=20)):
    cursor   = products_col.find({"is_featured": True, "is_active": True}).limit(limit)
    products = await cursor.to_list(length=limit)
    return {"products": [serialize_product(p) for p in products]}


# ══════════════════════════════
# ALL CATEGORIES
# ══════════════════════════════
@router.get("/categories")
async def get_categories():
    cats = await products_col.distinct("category", {"is_active": True})
    return {"categories": sorted(cats)}


# ══════════════════════════════
# ALL BRANDS (for filter sidebar)
# ══════════════════════════════
@router.get("/brands")
async def get_brands():
    brands = await products_col.distinct("brand", {"is_active": True})
    return {"brands": sorted(b for b in brands if b)}


# ══════════════════════════════
# SEARCH
# ══════════════════════════════
@router.get("/search")
async def search_products(q: str = Query(..., min_length=1)):
    filters = {
        "is_active": True,
        "$or": [
            {"name":        {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"category":    {"$regex": q, "$options": "i"}},
            {"brand":       {"$regex": q, "$options": "i"}},
        ]
    }
    cursor   = products_col.find(filters).limit(20)
    products = await cursor.to_list(length=20)
    return {"products": [serialize_product(p) for p in products]}


# ══════════════════════════════
# SINGLE PRODUCT
# ══════════════════════════════
@router.get("/{product_id}")
async def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    product = await products_col.find_one({"_id": ObjectId(product_id), "is_active": True})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_product(product)


# ══════════════════════════════
# CREATE (Admin)
# ══════════════════════════════
@router.post("", status_code=201)
async def create_product(payload: ProductCreate, current_user=Depends(get_current_user)):
    doc    = product_document(
        name=payload.name, description=payload.description,
        price=payload.price, original_price=payload.original_price,
        category=payload.category, images=payload.images,
        stock=payload.stock, discount=payload.discount or 0,
        is_featured=payload.is_featured,
    )
    result = await products_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"message": "Product created", "product": serialize_product(doc)}


# ══════════════════════════════
# UPDATE (Admin)
# ══════════════════════════════
@router.put("/{product_id}")
async def update_product(product_id: str, payload: ProductUpdate, current_user=Depends(get_current_user)):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    updates["updated_at"] = datetime.utcnow()
    result = await products_col.update_one({"_id": ObjectId(product_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    updated = await products_col.find_one({"_id": ObjectId(product_id)})
    return {"message": "Product updated", "product": serialize_product(updated)}


# ══════════════════════════════
# DELETE - soft (Admin)
# ══════════════════════════════
@router.delete("/{product_id}")
async def delete_product(product_id: str, current_user=Depends(get_current_user)):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    result = await products_col.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}


# ══════════════════════════════
# REVIEWS ENDPOINTS
# ══════════════════════════════

class ReviewCreate(BaseModel):
    name: Optional[str] = "Anonymous"
    rating: int = Field(5, ge=1, le=5)
    text: str
    avatarBg: Optional[str] = "var(--aqua-dark)"
    date: Optional[str] = None

@router.get("/{product_id}/reviews")
async def get_product_reviews(product_id: str):
    cursor = reviews_col.find({"product_id": product_id}).sort("created_at", -1)
    reviews = await cursor.to_list(length=100)
    
    serialized = []
    for r in reviews:
        serialized.append({
            "name": r.get("name", "Anonymous"),
            "rating": r.get("rating", 5),
            "text": r.get("text", ""),
            "avatarBg": r.get("avatarBg", "var(--aqua-dark)"),
            "date": r.get("date") or (r.get("created_at").strftime("%b %d, %Y") if r.get("created_at") else "Just now")
        })
    return {"reviews": serialized}

@router.post("/{product_id}/reviews", status_code=201)
async def create_product_review(product_id: str, payload: ReviewCreate):
    created_at = datetime.utcnow()
    date_str = payload.date or created_at.strftime("%b %d, %Y")
    
    doc = {
        "product_id": product_id,
        "name": payload.name or "Anonymous",
        "rating": payload.rating,
        "text": payload.text,
        "avatarBg": payload.avatarBg or "var(--aqua-dark)",
        "date": date_str,
        "created_at": created_at
    }
    
    await reviews_col.insert_one(doc)
    return {"message": "Review added successfully", "review": {
        "name": doc["name"],
        "rating": doc["rating"],
        "text": doc["text"],
        "avatarBg": doc["avatarBg"],
        "date": doc["date"]
    }}