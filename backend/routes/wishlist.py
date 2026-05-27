# ═══════════════════════════════════════
# routes/wishlist.py — Wishlist Routes
# ═══════════════════════════════════════

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime

from config import wishlist_col, products_col
from utils.auth import get_current_user

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


# ══════════════════════════════
# SCHEMA
# ══════════════════════════════
class WishlistItem(BaseModel):
    product_id: str


# ══════════════════════════════
# HELPERS
# ══════════════════════════════
async def serialize_wishlist_item(item: dict) -> dict:
    """Attach full product details to wishlist item."""
    product = None
    if ObjectId.is_valid(item.get("product_id", "")):
        product = await products_col.find_one({"_id": ObjectId(item["product_id"])})

    return {
        "id":         str(item["_id"]),
        "product_id": item.get("product_id"),
        "added_at":   str(item.get("added_at", "")),
        "product": {
            "id":             str(product["_id"])        if product else None,
            "name":           product.get("name","")     if product else "",
            "price":          product.get("price", 0)    if product else 0,
            "original_price": product.get("original_price") if product else None,
            "discount":       product.get("discount", 0) if product else 0,
            "images":         product.get("images", [])  if product else [],
            "rating":         product.get("rating", 0)   if product else 0,
            "reviews_count":  product.get("reviews_count", 0) if product else 0,
            "stock":          product.get("stock", 0)    if product else 0,
            "category":       product.get("category","") if product else "",
        } if product else None
    }


# ══════════════════════════════
# GET USER'S WISHLIST
# GET /wishlist
# ══════════════════════════════
@router.get("")
async def get_wishlist(current_user=Depends(get_current_user)):
    user_id = current_user["id"]
    cursor  = wishlist_col.find({"user_id": user_id}).sort("added_at", -1)
    items   = await cursor.to_list(length=100)

    serialized = []
    for item in items:
        serialized.append(await serialize_wishlist_item(item))

    return {
        "wishlist": serialized,
        "total":    len(serialized),
    }


# ══════════════════════════════
# ADD TO WISHLIST
# POST /wishlist/add
# ══════════════════════════════
@router.post("/add", status_code=201)
async def add_to_wishlist(payload: WishlistItem, current_user=Depends(get_current_user)):
    user_id    = current_user["id"]
    product_id = payload.product_id

    # Validate product exists
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    product = await products_col.find_one({"_id": ObjectId(product_id), "is_active": True})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if already in wishlist
    existing = await wishlist_col.find_one({"user_id": user_id, "product_id": product_id})
    if existing:
        return {"message": "Product already in wishlist"}

    doc = {
        "user_id":    user_id,
        "product_id": product_id,
        "added_at":   datetime.utcnow(),
    }
    await wishlist_col.insert_one(doc)
    return {"message": "Added to wishlist successfully"}


# ══════════════════════════════
# REMOVE FROM WISHLIST
# DELETE /wishlist/remove
# ══════════════════════════════
@router.delete("/remove")
async def remove_from_wishlist(payload: WishlistItem, current_user=Depends(get_current_user)):
    user_id    = current_user["id"]
    product_id = payload.product_id

    result = await wishlist_col.delete_one({"user_id": user_id, "product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")

    return {"message": "Removed from wishlist"}


# ══════════════════════════════
# CLEAR ENTIRE WISHLIST
# DELETE /wishlist/clear
# ══════════════════════════════
@router.delete("/clear")
async def clear_wishlist(current_user=Depends(get_current_user)):
    user_id = current_user["id"]
    result  = await wishlist_col.delete_many({"user_id": user_id})
    return {"message": f"Wishlist cleared. {result.deleted_count} items removed."}


# ══════════════════════════════
# CHECK IF PRODUCT IS IN WISHLIST
# GET /wishlist/check/{product_id}
# ══════════════════════════════
@router.get("/check/{product_id}")
async def check_wishlist(product_id: str, current_user=Depends(get_current_user)):
    user_id  = current_user["id"]
    existing = await wishlist_col.find_one({"user_id": user_id, "product_id": product_id})
    return {"in_wishlist": existing is not None}