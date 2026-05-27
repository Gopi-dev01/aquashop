# ═══════════════════════════════════════
# routes/cart.py — Cart Routes
# ═══════════════════════════════════════

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from bson import ObjectId
from typing import Optional
from datetime import datetime

from config import cart_col, products_col
from utils.auth import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])

# ══════════════════════════════
# VALID COUPONS
# ══════════════════════════════
VALID_COUPONS = {
    "WELCOME25": {"type": "percent", "value": 25, "label": "25% off for new users",      "min_order": 0},
    "SAVE10":    {"type": "percent", "value": 10, "label": "10% off on orders above $200","min_order": 200},
    "FLAT20":    {"type": "fixed",   "value": 20, "label": "$20 flat discount",            "min_order": 0},
}

# ══════════════════════════════
# SCHEMAS
# ══════════════════════════════
class CartItemAdd(BaseModel):
    product_id: str
    quantity:   int = 1

class CartItemUpdate(BaseModel):
    product_id: str
    quantity:   int

class CartItemRemove(BaseModel):
    product_id: str

class CouponApply(BaseModel):
    code: str


# ══════════════════════════════
# HELPERS
# ══════════════════════════════
async def get_or_create_cart(user_id: str) -> dict:
    cart = await cart_col.find_one({"user_id": user_id})
    if not cart:
        doc = {"user_id": user_id, "items": [], "coupon": None, "created_at": datetime.utcnow()}
        await cart_col.insert_one(doc)
        cart = await cart_col.find_one({"user_id": user_id})
    return cart

async def serialize_cart(cart: dict) -> dict:
    items      = cart.get("items", [])
    serialized = []
    subtotal   = 0

    for item in items:
        product = None
        if ObjectId.is_valid(item.get("product_id", "")):
            product = await products_col.find_one({"_id": ObjectId(item["product_id"])})

        if product:
            price    = product.get("price", 0)
            qty      = item.get("quantity", 1)
            line_tot = price * qty
            subtotal += line_tot
            serialized.append({
                "product_id":  item["product_id"],
                "quantity":    qty,
                "price":       price,
                "line_total":  line_tot,
                "product": {
                    "id":       str(product["_id"]),
                    "name":     product.get("name", ""),
                    "images":   product.get("images", []),
                    "stock":    product.get("stock", 0),
                    "discount": product.get("discount", 0),
                }
            })

    shipping  = 0 if subtotal >= 50 else 9.99
    coupon    = cart.get("coupon")
    discount  = 0

    if coupon and coupon in VALID_COUPONS:
        c = VALID_COUPONS[coupon]
        if subtotal >= c["min_order"]:
            if c["type"] == "percent":
                discount = subtotal * c["value"] / 100
            else:
                discount = c["value"]
        discount = min(discount, subtotal)

    total = max(0, subtotal - discount + shipping)

    return {
        "items":    serialized,
        "subtotal": round(subtotal, 2),
        "shipping": round(shipping, 2),
        "discount": round(discount, 2),
        "total":    round(total, 2),
        "coupon":   coupon,
        "count":    len(serialized),
    }


# ══════════════════════════════
# GET CART
# GET /cart
# ══════════════════════════════
@router.get("")
async def get_cart(current_user=Depends(get_current_user)):
    cart = await get_or_create_cart(current_user["id"])
    return await serialize_cart(cart)


# ══════════════════════════════
# ADD TO CART
# POST /cart/add
# ══════════════════════════════
@router.post("/add", status_code=201)
async def add_to_cart(payload: CartItemAdd, current_user=Depends(get_current_user)):
    user_id    = current_user["id"]
    product_id = payload.product_id
    quantity   = max(1, payload.quantity)

    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    product = await products_col.find_one({"_id": ObjectId(product_id), "is_active": True})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.get("stock", 0) < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    cart = await get_or_create_cart(user_id)
    items = cart.get("items", [])

    # Check if already in cart
    existing = next((i for i in items if i["product_id"] == product_id), None)
    if existing:
        existing["quantity"] = min(existing["quantity"] + quantity, product.get("stock", 99))
    else:
        items.append({"product_id": product_id, "quantity": quantity})

    await cart_col.update_one({"user_id": user_id}, {"$set": {"items": items}})
    return {"message": "Added to cart"}


# ══════════════════════════════
# UPDATE QUANTITY
# PUT /cart/update
# ══════════════════════════════
@router.put("/update")
async def update_cart(payload: CartItemUpdate, current_user=Depends(get_current_user)):
    user_id    = current_user["id"]
    product_id = payload.product_id
    quantity   = payload.quantity

    if quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    cart  = await get_or_create_cart(user_id)
    items = cart.get("items", [])
    item  = next((i for i in items if i["product_id"] == product_id), None)

    if not item:
        raise HTTPException(status_code=404, detail="Item not in cart")

    item["quantity"] = quantity
    await cart_col.update_one({"user_id": user_id}, {"$set": {"items": items}})

    updated = await cart_col.find_one({"user_id": user_id})
    return await serialize_cart(updated)


# ══════════════════════════════
# REMOVE ITEM
# DELETE /cart/remove
# ══════════════════════════════
@router.delete("/remove")
async def remove_from_cart(payload: CartItemRemove, current_user=Depends(get_current_user)):
    user_id    = current_user["id"]
    product_id = payload.product_id

    cart  = await get_or_create_cart(user_id)
    items = [i for i in cart.get("items", []) if i["product_id"] != product_id]

    await cart_col.update_one({"user_id": user_id}, {"$set": {"items": items}})
    return {"message": "Item removed from cart"}


# ══════════════════════════════
# CLEAR CART
# DELETE /cart/clear
# ══════════════════════════════
@router.delete("/clear")
async def clear_cart(current_user=Depends(get_current_user)):
    user_id = current_user["id"]
    await cart_col.update_one(
        {"user_id": user_id},
        {"$set": {"items": [], "coupon": None}}
    )
    return {"message": "Cart cleared"}


# ══════════════════════════════
# APPLY COUPON
# POST /cart/apply-coupon
# ══════════════════════════════
@router.post("/apply-coupon")
async def apply_coupon(payload: CouponApply, current_user=Depends(get_current_user)):
    user_id = current_user["id"]
    code    = payload.code.strip().upper()

    if code not in VALID_COUPONS:
        raise HTTPException(status_code=400, detail="Invalid coupon code")

    coupon   = VALID_COUPONS[code]
    cart     = await get_or_create_cart(user_id)
    items    = cart.get("items", [])
    subtotal = 0

    for item in items:
        if ObjectId.is_valid(item.get("product_id", "")):
            product = await products_col.find_one({"_id": ObjectId(item["product_id"])})
            if product:
                subtotal += product.get("price", 0) * item.get("quantity", 1)

    if subtotal < coupon["min_order"]:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum order ${coupon['min_order']} required for this coupon"
        )

    await cart_col.update_one({"user_id": user_id}, {"$set": {"coupon": code}})

    updated = await cart_col.find_one({"user_id": user_id})
    result  = await serialize_cart(updated)
    return {"message": f"Coupon applied! {coupon['label']}", **result}


# ══════════════════════════════
# REMOVE COUPON
# DELETE /cart/remove-coupon
# ══════════════════════════════
@router.delete("/remove-coupon")
async def remove_coupon(current_user=Depends(get_current_user)):
    user_id = current_user["id"]
    await cart_col.update_one({"user_id": user_id}, {"$set": {"coupon": None}})
    return {"message": "Coupon removed"}


