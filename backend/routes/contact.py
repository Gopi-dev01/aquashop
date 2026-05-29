# ═══════════════════════════════════════
# routes/contact.py — Contact & Newsletter
# ═══════════════════════════════════════

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from bson import ObjectId

from config import contact_col, notifications_col
from utils.auth import get_current_user

router = APIRouter(prefix="/contact", tags=["Contact"])


# ══════════════════════════════
# SCHEMAS
# ══════════════════════════════
class ContactMessage(BaseModel):
    name:    str
    email:   EmailStr
    phone:   Optional[str] = ""
    subject: str
    message: str

class NewsletterSubscribe(BaseModel):
    email: EmailStr

def serialize_contact(c: dict) -> dict:
    return {
        "id":         str(c["_id"]),
        "name":       c.get("name", ""),
        "email":      c.get("email", ""),
        "phone":      c.get("phone", ""),
        "subject":    c.get("subject", ""),
        "message":    c.get("message", ""),
        "type":       c.get("type", "contact"),
        "is_read":    c.get("is_read", False),
        "created_at": str(c.get("created_at", "")),
    }


# ══════════════════════════════
# SEND CONTACT MESSAGE
# POST /contact
# ══════════════════════════════
@router.post("")
async def send_contact(payload: ContactMessage):
    if len(payload.message.strip()) < 10:
        raise HTTPException(status_code=400, detail="Message is too short")
    if len(payload.subject.strip()) < 2:
        raise HTTPException(status_code=400, detail="Subject is too short")

    doc = {
        "name":       payload.name.strip(),
        "email":      payload.email.lower().strip(),
        "phone":      payload.phone.strip() if payload.phone else "",
        "subject":    payload.subject.strip(),
        "message":    payload.message.strip(),
        "type":       "contact",
        "is_read":    False,
        "created_at": datetime.utcnow(),
    }
    await contact_col.insert_one(doc)
    
    # Create DB notification for admin
    import uuid
    notif_time = datetime.now().strftime("%b %d, %Y, %I:%M %p")
    admin_notif = {
        "notifId": f"notif-{uuid.uuid4().hex[:9]}-{int(datetime.utcnow().timestamp() * 1000)}",
        "id": "",
        "userEmail": "admin",
        "message": f"New message from {payload.name} ({payload.email}): \"{payload.message[:60] + ('...' if len(payload.message) > 60 else '')}\" (Subject: {payload.subject})",
        "date": notif_time,
        "read": False,
        "created_at": datetime.utcnow()
    }
    try:
        await notifications_col.insert_one(admin_notif)
    except Exception as e:
        print("Failed to save contact notification in DB:", e)
        
    return {"message": "Your message has been sent! We'll reply within 24 hours."}


# ══════════════════════════════
# NEWSLETTER SUBSCRIBE
# POST /contact/newsletter
# ══════════════════════════════
@router.post("/newsletter")
async def newsletter_subscribe(payload: NewsletterSubscribe):
    existing = await contact_col.find_one({
        "email": payload.email.lower(), "type": "newsletter"
    })
    if existing:
        return {"message": "You are already subscribed!"}

    await contact_col.insert_one({
        "email":      payload.email.lower().strip(),
        "type":       "newsletter",
        "is_active":  True,
        "created_at": datetime.utcnow(),
    })
    return {"message": "Successfully subscribed to our newsletter!"}


# ══════════════════════════════
# NEWSLETTER UNSUBSCRIBE
# DELETE /contact/newsletter
# ══════════════════════════════
@router.delete("/newsletter")
async def newsletter_unsubscribe(payload: NewsletterSubscribe):
    result = await contact_col.update_one(
        {"email": payload.email.lower(), "type": "newsletter"},
        {"$set": {"is_active": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Email not found")
    return {"message": "Successfully unsubscribed"}


# ══════════════════════════════
# GET ALL MESSAGES — Admin only
# GET /contact/messages
# ══════════════════════════════
@router.get("/messages")
async def get_messages(
    current_user=Depends(get_current_user),
    skip: int = 0,
    limit: int = 20,
):
    cursor   = contact_col.find({"type": "contact"}).sort("created_at", -1).skip(skip).limit(limit)
    messages = await cursor.to_list(length=limit)
    total    = await contact_col.count_documents({"type": "contact"})
    return {"messages": [serialize_contact(m) for m in messages], "total": total}


# ══════════════════════════════
# MARK MESSAGE AS READ — Admin
# PUT /contact/messages/{id}/read
# ══════════════════════════════
@router.put("/messages/{message_id}/read")
async def mark_as_read(message_id: str, current_user=Depends(get_current_user)):
    if not ObjectId.is_valid(message_id):
        raise HTTPException(status_code=400, detail="Invalid message ID")
    result = await contact_col.update_one(
        {"_id": ObjectId(message_id)}, {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Marked as read"}


# ══════════════════════════════
# GET SUBSCRIBERS — Admin
# GET /contact/subscribers
# ══════════════════════════════
@router.get("/subscribers")
async def get_subscribers(current_user=Depends(get_current_user)):
    cursor = contact_col.find({"type": "newsletter", "is_active": True})
    subs   = await cursor.to_list(length=1000)
    return {
        "subscribers": [{"email": s["email"], "joined": str(s.get("created_at", ""))} for s in subs],
        "total":       len(subs),
    }



