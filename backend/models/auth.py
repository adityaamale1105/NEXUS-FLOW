"""
Authentication and Role-Based Access Control Models
PayPal & AI Hackathon 2026
"""

from typing import Optional
from pydantic import BaseModel, Field

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

class UserLogin(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN, description="User email address")
    password: str = Field(..., min_length=8)


class UserRegister(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN, description="User email address")
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(default="buyer", pattern="^(buyer|merchant|admin)$")
    company_name: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in_seconds: int
    user_id: str
    email: str
    role: str
    full_name: str


class UserProfile(BaseModel):
    user_id: str
    email: str
    full_name: str
    role: str
    company_name: Optional[str] = None
    created_at: str
