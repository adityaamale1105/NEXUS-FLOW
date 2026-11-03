"""
Authentication Endpoints
User Registration, Login, and Profile Retrieval
PayPal & AI Hackathon 2026
"""

import uuid
import datetime
from fastapi import APIRouter, HTTPException, Depends, status

from backend.models.auth import UserLogin, UserRegister, TokenResponse, UserProfile
from backend.security.auth_middleware import hash_password, verify_password, create_jwt_token, get_current_user
from backend.security.rate_limiter import check_rate_limit
from backend.security.sanitizer import sanitize_text
from backend.database.db import db
from backend.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, dependencies=[Depends(check_rate_limit)])
async def register(payload: UserRegister):
    """Registers a new user (buyer or merchant) with salted PBKDF2-SHA256 password hashing."""
    email_clean = payload.email.lower().strip()
    if email_clean in db.users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    hashed_pwd = hash_password(payload.password)
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    user_data = {
        "user_id": user_id,
        "email": email_clean,
        "full_name": sanitize_text(payload.full_name),
        "password_hash": hashed_pwd,
        "role": payload.role,
        "company_name": sanitize_text(payload.company_name) if payload.company_name else None,
        "created_at": now_iso
    }
    db.users[email_clean] = user_data

    token_payload = {
        "sub": user_id,
        "email": email_clean,
        "role": payload.role,
        "full_name": user_data["full_name"]
    }
    access_token = create_jwt_token(token_payload)

    return TokenResponse(
        access_token=access_token,
        token_type="Bearer",
        expires_in_seconds=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user_id,
        email=email_clean,
        role=payload.role,
        full_name=user_data["full_name"]
    )


@router.post("/login", response_model=TokenResponse, dependencies=[Depends(check_rate_limit)])
async def login(credentials: UserLogin):
    """Authenticates credentials using constant-time hash comparison and issues JWT token."""
    email_clean = credentials.email.lower().strip()
    user = db.users.get(email_clean)

    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials supplied"
        )

    token_payload = {
        "sub": user["user_id"],
        "email": user["email"],
        "role": user["role"],
        "full_name": user["full_name"]
    }
    access_token = create_jwt_token(token_payload)

    return TokenResponse(
        access_token=access_token,
        token_type="Bearer",
        expires_in_seconds=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user["user_id"],
        email=user["email"],
        role=user["role"],
        full_name=user["full_name"]
    )


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(user: dict = Depends(get_current_user)):
    """Retrieves profile of the authenticated caller."""
    email = user.get("email")
    db_user = db.users.get(email)
    if not db_user:
        return UserProfile(
            user_id=user.get("user_id", "usr_anon"),
            email=email or "guest@nexusflow.network",
            full_name=user.get("full_name", "Verified Guest Buyer"),
            role=user.get("role", "buyer"),
            company_name=None,
            created_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
        )

    return UserProfile(
        user_id=db_user["user_id"],
        email=db_user["email"],
        full_name=db_user["full_name"],
        role=db_user["role"],
        company_name=db_user.get("company_name"),
        created_at=db_user["created_at"]
    )
