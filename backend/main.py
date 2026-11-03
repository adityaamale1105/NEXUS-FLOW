"""
Nexus-Flow Backend Main Application
PayPal & AI Hackathon 2026
FastAPI High-Performance Async Gateway
"""

import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from backend.config import APP_ENV, DEBUG, ALLOWED_CORS_ORIGINS
from backend.security.headers import SecurityHeadersMiddleware
from backend.routes.procure import router as procure_router, search_router
from backend.routes.paypal import router as paypal_router, payments_router
from backend.routes.telemetry import router as telemetry_router
from backend.routes.auth import router as auth_router

app = FastAPI(
    title="Nexus-Flow Autonomous Commerce Protocol",
    description="Multi-Agent Bill of Materials decomposition, Channel3 & Kernel sourcing, APIMatic validation, and PayPal multi-vendor checkout engine.",
    version="1.0.0",
    docs_url="/api/docs" if DEBUG or APP_ENV != "production" else None,
    redoc_url="/api/redoc" if DEBUG or APP_ENV != "production" else None,
)

# 1. Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 2. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]
)

# 3. API Routers
app.include_router(procure_router)
app.include_router(search_router)
app.include_router(paypal_router)
app.include_router(payments_router)
app.include_router(telemetry_router)
app.include_router(auth_router)

# 4. Static Directory Setup
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/health", tags=["System"])
async def health_check():
    """System health check and readiness probe."""
    return {
        "status": "healthy",
        "service": "Nexus-Flow Autonomous Commerce Gateway",
        "version": "1.0.0",
        "environment": APP_ENV,
        "paypal_engine": "operational",
        "multi_agent_mesh": "operational",
        "compatibility_engine": "operational",
        "substitution_engine": "operational",
        "landed_cost_optimizer": "operational"
    }


# 5. Frontend Single-Page Application Routes
@app.get("/", tags=["Frontend"])
async def serve_index():
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return JSONResponse({"message": "Nexus-Flow API running. Static UI not yet initialized."})


@app.get("/control-tower", tags=["Frontend"])
async def serve_control_tower():
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return JSONResponse({"message": "Nexus-Flow Control Tower."})


@app.get("/history", tags=["Frontend"])
async def serve_history():
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return JSONResponse({"message": "Nexus-Flow Procurement History."})


@app.get("/privacy", tags=["Frontend"])
async def serve_privacy():
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return JSONResponse({"message": "Nexus-Flow Privacy."})


@app.get("/terms", tags=["Frontend"])
async def serve_terms():
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return JSONResponse({"message": "Nexus-Flow Terms."})


@app.get("/favicon.svg", tags=["Frontend"])
async def serve_favicon():
    fav_path = STATIC_DIR / "favicon.svg"
    if fav_path.exists():
        return FileResponse(str(fav_path), media_type="image/svg+xml")
    return JSONResponse({"status": "no favicon"}, status_code=404)
