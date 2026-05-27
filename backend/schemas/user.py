from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# ── REGISTER ──
class RegisterSchema(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name:  str = Field(..., min_length=1, max_length=50)
    email:      EmailStr
    phone:      str = Field(..., min_length=7, max_length=20)
    password:   str = Field(..., min_length=8)

# ── LOGIN ──
class LoginSchema(BaseModel):
    email:    EmailStr
    password: str

# ── UPDATE PROFILE ──
class UpdateProfileSchema(BaseModel):
    first_name: Optional[str] = None
    last_name:  Optional[str] = None
    phone:      Optional[str] = None
    avatar:     Optional[str] = None

# ── RESPONSE (safe — no password) ──
class UserResponse(BaseModel):
    id:         str
    first_name: str
    last_name:  str
    email:      str
    phone:      Optional[str] = None
    avatar:     Optional[str] = None
    is_google:  bool = False