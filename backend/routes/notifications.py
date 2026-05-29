from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from config import notifications_col, users_col
from utils.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class NotificationCreate(BaseModel):
    userEmail: str
    message: str
    id: Optional[str] = ""

@router.post("")
async def create_notification(payload: NotificationCreate, current_user=Depends(get_current_user)):
    doc = {
        "notifId": f"notif-{uuid.uuid4().hex[:9]}-{int(datetime.utcnow().timestamp() * 1000)}",
        "id": payload.id or "",
        "userEmail": payload.userEmail.lower().strip() if payload.userEmail != "admin" else "admin",
        "message": payload.message,
        "date": datetime.now().strftime("%b %d, %Y, %I:%M %p"),
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    await notifications_col.insert_one(doc)
    return {"status": "success", "message": "Notification created successfully"}

@router.get("")
async def get_notifications(admin_view: bool = False, current_user=Depends(get_current_user)):
    user_email = current_user.get("email", "").lower().strip()
    is_admin = user_email in ["24ucs046@gmail.com", "24ucs046@gamil.com"]
    
    if is_admin and admin_view:
        cursor = notifications_col.find({"userEmail": "admin"}).sort("created_at", -1)
    else:
        cursor = notifications_col.find({"userEmail": user_email}).sort("created_at", -1)
        
    notifications = await cursor.to_list(length=100)
    for n in notifications:
        n["_id"] = str(n["_id"])
        if "created_at" in n:
            n["created_at"] = str(n["created_at"])
            
    return {"notifications": notifications}

@router.delete("/{notif_id}")
async def delete_notification(notif_id: str, current_user=Depends(get_current_user)):
    notif = await notifications_col.find_one({"notifId": notif_id})
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    user_email = current_user.get("email", "").lower().strip()
    is_admin = user_email in ["24ucs046@gmail.com", "24ucs046@gamil.com"]
    
    if not is_admin and notif.get("userEmail") != user_email:
        raise HTTPException(status_code=403, detail="Not authorized to delete this notification")
        
    await notifications_col.delete_one({"notifId": notif_id})
    return {"status": "success", "message": "Notification deleted successfully"}

@router.put("/read-all")
async def read_all_notifications(current_user=Depends(get_current_user)):
    user_email = current_user.get("email", "").lower().strip()
    await notifications_col.update_many({"userEmail": user_email, "read": False}, {"$set": {"read": True}})
    return {"status": "success", "message": "All notifications marked as read"}

@router.put("/admin-read-all")
async def admin_read_all_notifications(current_user=Depends(get_current_user)):
    user_email = current_user.get("email", "").lower().strip()
    is_admin = user_email in ["24ucs046@gmail.com", "24ucs046@gamil.com"]
    if not is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    await notifications_col.update_many({"userEmail": "admin", "read": False}, {"$set": {"read": True}})
    return {"status": "success", "message": "All admin notifications marked as read"}
