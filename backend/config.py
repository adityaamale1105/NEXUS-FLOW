"""
Nexus-Flow Backend Configuration Module
PayPal & AI Hackathon 2026
Production-grade configuration management.
"""

import os
from typing import List
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent

# Application Settings
APP_ENV: str = os.getenv("APP_ENV", "production")
DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
APP_PORT: int = int(os.getenv("APP_PORT", "8000"))
APP_HOST: str = os.getenv("APP_HOST", "0.0.0.0")
BASE_URL: str = os.getenv("BASE_URL", "https://api.nexusflow.network")
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://nexusflow.network")

# Security and JWT
JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "nexus-flow-production-hmac-sha256-secret-entropy-key-2026")
JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Rate Limiting
RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))

# Allowed CORS Origins
cors_raw = os.getenv(
    "ALLOWED_CORS_ORIGINS",
    "http://localhost:3000,http://localhost:8000,http://127.0.0.1:8000,https://nexusflow.network"
)
ALLOWED_CORS_ORIGINS: List[str] = [origin.strip() for origin in cors_raw.split(",") if origin.strip()]

# PayPal Sandbox & Orders v2 Integration
PAYPAL_ENV: str = os.getenv("PAYPAL_ENV", "sandbox")
PAYPAL_CLIENT_ID: str = os.getenv("PAYPAL_CLIENT_ID", "sandbox_nexus_client_id_2026_demo")
PAYPAL_CLIENT_SECRET: str = os.getenv("PAYPAL_CLIENT_SECRET", "sandbox_nexus_secret_key_2026_demo")
PAYPAL_BN_CODE: str = os.getenv("PAYPAL_BN_CODE", "NexusFlow_SPB_2026")
PAYPAL_PARTNER_ATTRIBUTION_ID: str = os.getenv("PAYPAL_PARTNER_ATTRIBUTION_ID", "NexusFlow_Marketplace_BOM")
PAYPAL_WEBHOOK_ID: str = os.getenv("PAYPAL_WEBHOOK_ID", "WH-9928374615284758")
PAYPAL_SANDBOX_BASE_URL: str = os.getenv("PAYPAL_SANDBOX_BASE_URL", "https://api-m.sandbox.paypal.com")

# Channel3 Catalog Provider
CHANNEL3_API_KEY: str = os.getenv("CHANNEL3_API_KEY", "")
CHANNEL3_ENDPOINT: str = os.getenv("CHANNEL3_ENDPOINT", "https://api.channel3.io/v1/catalogs")
CHANNEL3_MOCK_FALLBACK: bool = os.getenv("CHANNEL3_MOCK_FALLBACK", "true").lower() in ("true", "1", "yes")

# Kernel Web Agent
KERNEL_API_KEY: str = os.getenv("KERNEL_API_KEY", "")
KERNEL_ENDPOINT: str = os.getenv("KERNEL_ENDPOINT", "https://api.kernel.sh/v1/agent/crawl")
KERNEL_MOCK_FALLBACK: bool = os.getenv("KERNEL_MOCK_FALLBACK", "true").lower() in ("true", "1", "yes")

# APIMatic Schema Validation
APIMATIC_VALIDATION_ENABLED: bool = os.getenv("APIMATIC_VALIDATION_ENABLED", "true").lower() in ("true", "1", "yes")
APIMATIC_STRICT_MODE: bool = os.getenv("APIMATIC_STRICT_MODE", "true").lower() in ("true", "1", "yes")

# Platform Economics & Splits
PLATFORM_FEE_PERCENTAGE: float = float(os.getenv("PLATFORM_FEE_PERCENTAGE", "2.50"))
ESCROW_HOLD_HOURS: int = int(os.getenv("ESCROW_HOLD_HOURS", "72"))
SETTLEMENT_CURRENCY: str = os.getenv("SETTLEMENT_CURRENCY", "USD")
