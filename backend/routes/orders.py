from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId

from config import orders_col, users_col, notifications_col
from utils.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])

class OrderItem(BaseModel):
    id: str
    name: str
    price: float
    qty: int
    img: str

class OrderCreate(BaseModel):
    id: str
    items: List[OrderItem]
    paymentMethod: str
    address: dict
    deliveryDate: str
    total: str

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    hidden: Optional[bool] = None
    hiddenPayment: Optional[bool] = None
    hiddenAddress: Optional[bool] = None
    hiddenAdmin: Optional[bool] = None

@router.post("")
async def create_order(order: OrderCreate, current_user=Depends(get_current_user)):
    doc = order.dict()
    doc["user_id"] = current_user["id"]
    doc["userEmail"] = current_user.get("email", "")
    doc["date"] = datetime.now().strftime("%b %d, %Y")
    doc["status"] = "In Transit"
    doc["hidden"] = False
    doc["hiddenPayment"] = False
    doc["hiddenAddress"] = False
    doc["hiddenAdmin"] = False
    doc["created_at"] = datetime.utcnow()
    
    await orders_col.insert_one(doc)
    
    # Create database notifications for user and admin
    import uuid
    notif_time = datetime.now().strftime("%b %d, %Y, %I:%M %p")
    
    cust_notif = {
        "notifId": f"notif-{uuid.uuid4().hex[:9]}-{int(datetime.utcnow().timestamp() * 1000)}",
        "id": order.id,
        "userEmail": doc["userEmail"].lower().strip(),
        "message": f"Your order {order.id} was placed successfully! It will be delivered soon.",
        "date": notif_time,
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    admin_notif = {
        "notifId": f"notif-{uuid.uuid4().hex[:9]}-{int(datetime.utcnow().timestamp() * 1000)}",
        "id": order.id,
        "userEmail": "admin",
        "message": f"New Order placed: {order.id} by {order.address.get('firstName', '')} {order.address.get('lastName', '')} (Customer email: {doc['userEmail']}). Total: {order.total}",
        "date": notif_time,
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    try:
        await notifications_col.insert_many([cust_notif, admin_notif])
    except Exception as e:
        print("Failed to save order placement notifications in DB:", e)
        
    return {
        "status": "success",
        "order_id": order.id,
        "message": "Order placed successfully"
    }

@router.get("")
async def get_orders(admin_view: bool = False, current_user=Depends(get_current_user)):
    user_email = current_user.get("email", "").lower().strip()
    user_id = current_user["id"]
    
    is_admin = user_email in ["24ucs046@gmail.com", "24ucs046@gamil.com"]
    

    if is_admin and admin_view:
        # Admin sees all non-hidden admin orders
        cursor = orders_col.find({}).sort("created_at", -1)
    else:
        cursor = orders_col.find({"user_id": user_id}).sort("created_at", -1)
        
    orders = await cursor.to_list(length=100)
    for o in orders:
        o["_id"] = str(o["_id"])
        if "created_at" in o:
            o["created_at"] = str(o["created_at"])
            
    return {"orders": orders}

@router.get("/{order_id}")
async def get_order(order_id: str, current_user=Depends(get_current_user)):
    query_id = order_id
    if not query_id.startswith("#"):
        query_ids = [query_id, f"#{query_id}"]
    else:
        query_ids = [query_id, query_id[1:]]
        
    order = await orders_col.find_one({"id": {"$in": query_ids}})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    user_email = current_user.get("email", "").lower().strip()
    is_admin = user_email in ["24ucs046@gmail.com", "24ucs046@gamil.com"]
    if not is_admin and order.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
        
    order["_id"] = str(order["_id"])
    if "created_at" in order:
        order["created_at"] = str(order["created_at"])
    return order

@router.get("/{order_id}/track")
async def track_order(order_id: str, current_user=Depends(get_current_user)):
    return await get_order(order_id, current_user)

@router.put("/{order_id}/cancel")
async def cancel_order(order_id: str, current_user=Depends(get_current_user)):
    query_id = order_id
    if not query_id.startswith("#"):
        query_ids = [query_id, f"#{query_id}"]
    else:
        query_ids = [query_id, query_id[1:]]
        
    order = await orders_col.find_one({"id": {"$in": query_ids}})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    user_email = current_user.get("email", "").lower().strip()
    is_admin = user_email in ["24ucs046@gmail.com", "24ucs046@gamil.com"]
    if not is_admin and order.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")
        
    await orders_col.update_one({"id": {"$in": query_ids}}, {"$set": {"status": "Cancelled"}})
    
    # Create DB notifications
    import uuid
    notif_time = datetime.now().strftime("%b %d, %Y, %I:%M %p")
    cust_email = order.get("userEmail") or ""
    
    cust_notif = {
        "notifId": f"notif-{uuid.uuid4().hex[:9]}-{int(datetime.utcnow().timestamp() * 1000)}",
        "id": order["id"],
        "userEmail": cust_email.lower().strip(),
        "message": f"Your order {order['id']} has been cancelled.",
        "date": notif_time,
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    admin_notif = {
        "notifId": f"notif-{uuid.uuid4().hex[:9]}-{int(datetime.utcnow().timestamp() * 1000)}",
        "id": order["id"],
        "userEmail": "admin",
        "message": f"Order cancelled by customer: {order['id']} ({cust_email}).",
        "date": notif_time,
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    try:
        await notifications_col.insert_many([cust_notif, admin_notif])
    except Exception as e:
        print("Failed to save cancel notifications in DB:", e)
        
    return {"message": "Order cancelled successfully"}

@router.put("/{order_id}")
async def update_order(order_id: str, payload: OrderUpdate, current_user=Depends(get_current_user)):
    query_id = order_id
    if not query_id.startswith("#"):
        query_ids = [query_id, f"#{query_id}"]
    else:
        query_ids = [query_id, query_id[1:]]
        
    order = await orders_col.find_one({"id": {"$in": query_ids}})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    user_email = current_user.get("email", "").lower().strip()
    is_admin = user_email in ["24ucs046@gmail.com", "24ucs046@gamil.com"]
    if not is_admin and order.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this order")
        
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
        
    current_status = (order.get("status") or "").lower()
    if current_status == "cancelled" and "status" in updates:
        if updates["status"].lower() != "cancelled":
            raise HTTPException(status_code=400, detail="Cannot change status of a cancelled order")
        
    await orders_col.update_one({"id": {"$in": query_ids}}, {"$set": updates})
    
    # Check if status is being changed and create notifications
    if "status" in updates:
        new_status = updates["status"]
        old_status = order.get("status")
        if new_status != old_status:
            import uuid
            notif_time = datetime.now().strftime("%b %d, %Y, %I:%M %p")
            cust_email = order.get("userEmail") or ""
            
            if new_status.lower() == "delivered":
                cust_msg = f"Your order {order['id']} has been successfully delivered. Thank you for shopping with AquaShop!"
                admin_msg = f"Order {order['id']} marked as DELIVERED by Delivery Personnel/Admin."
            elif new_status.lower() == "cancelled":
                cust_msg = f"Your order {order['id']} has been cancelled by Admin."
                admin_msg = f"Order {order['id']} cancelled by Admin (Customer: {cust_email})."
            else:
                cust_msg = f"Your order {order['id']} status has been updated to {new_status}."
                admin_msg = f"Order {order['id']} status updated to {new_status}."
                
            cust_notif = {
                "notifId": f"notif-{uuid.uuid4().hex[:9]}-{int(datetime.utcnow().timestamp() * 1000)}",
                "id": order["id"],
                "userEmail": cust_email.lower().strip(),
                "message": cust_msg,
                "date": notif_time,
                "read": False,
                "created_at": datetime.utcnow()
            }
            
            admin_notif = {
                "notifId": f"notif-{uuid.uuid4().hex[:9]}-{int(datetime.utcnow().timestamp() * 1000)}",
                "id": order["id"],
                "userEmail": "admin",
                "message": admin_msg,
                "date": notif_time,
                "read": False,
                "created_at": datetime.utcnow()
            }
            try:
                await notifications_col.insert_many([cust_notif, admin_notif])
            except Exception as e:
                print("Failed to save update notifications in DB:", e)
                
    return {"message": "Order updated successfully"}
