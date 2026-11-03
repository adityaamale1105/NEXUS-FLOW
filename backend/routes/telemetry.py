"""
Telemetry and AG Grid Data Feeds for Merchant Control Tower
PayPal & AI Hackathon 2026
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from backend.models.telemetry import SupplyChainTelemetry, AgentHealthMetric, PaymentRouteRecord
from backend.security.rate_limiter import check_rate_limit
from backend.database.db import db

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry"])


@router.get("/supply-chain", response_model=List[SupplyChainTelemetry], dependencies=[Depends(check_rate_limit)])
@router.get("/shipments", response_model=List[SupplyChainTelemetry], dependencies=[Depends(check_rate_limit)])
async def get_supply_chain_telemetry():
    """Returns real-time shipment and component telemetry for AG Grid."""
    return db.telemetry_records


@router.get("/agents", response_model=List[AgentHealthMetric], dependencies=[Depends(check_rate_limit)])
async def get_agent_health():
    """Returns autonomous agent health scores, latencies, and operational states."""
    return db.agent_health


@router.get("/payment-routes", response_model=List[PaymentRouteRecord], dependencies=[Depends(check_rate_limit)])
@router.get("/payments", response_model=List[PaymentRouteRecord], dependencies=[Depends(check_rate_limit)])
@router.get("/financial", response_model=List[PaymentRouteRecord], dependencies=[Depends(check_rate_limit)])
async def get_payment_routes():
    """Returns live payment routing telemetry and APIMatic compliance logs."""
    return db.payment_routes


@router.get("/suppliers", dependencies=[Depends(check_rate_limit)])
async def get_supplier_intelligence():
    """Returns supplier performance, sourcing volume, and verification ratings."""
    return [
        {
            "supplier_id": "VND-CH3-SILICON-US",
            "name": "ExpressSilicon Direct",
            "country": "United States",
            "verification_status": "Channel3 Certified",
            "total_orders": 842,
            "total_procured_usd": 68450.00,
            "on_time_delivery_rate": 99.4,
            "average_lead_time_days": 2,
            "risk_score": "Low"
        },
        {
            "supplier_id": "VND-CH3-EUROTECH-DE",
            "name": "EuroTech Automation GmbH",
            "country": "Germany",
            "verification_status": "Channel3 Certified",
            "total_orders": 512,
            "total_procured_usd": 42180.00,
            "on_time_delivery_rate": 98.9,
            "average_lead_time_days": 3,
            "risk_score": "Low"
        },
        {
            "supplier_id": "VND-CH3-APEX-JP",
            "name": "Apex Micro Sensortech",
            "country": "Japan",
            "verification_status": "Channel3 Certified",
            "total_orders": 390,
            "total_procured_usd": 31920.00,
            "on_time_delivery_rate": 97.8,
            "average_lead_time_days": 4,
            "risk_score": "Low"
        },
        {
            "supplier_id": "VND-KRN-SHENZHEN-CN",
            "name": "Shenzhen HiLink Power Corp",
            "country": "China",
            "verification_status": "Kernel Live Crawl Verified",
            "total_orders": 284,
            "total_procured_usd": 19400.00,
            "on_time_delivery_rate": 96.5,
            "average_lead_time_days": 3,
            "risk_score": "Low"
        }
    ]


@router.get("/summary")
@router.get("/overview")
async def get_telemetry_summary():
    """Returns high-level system KPIs for control tower headers."""
    total_shipments = len(db.telemetry_records)
    delayed_shipments = sum(1 for s in db.telemetry_records if s.status == "Delayed")
    avg_health = sum(a.health_score for a in db.agent_health) / max(len(db.agent_health), 1)
    total_volume = sum(r.gross_amount for r in db.payment_routes)

    return {
        "active_shipments": total_shipments,
        "delayed_shipments": delayed_shipments,
        "fleet_health_score": round(avg_health, 1),
        "total_settled_volume_usd": round(total_volume, 2),
        "active_agents": len(db.agent_health),
        "escrow_integrity_rate": 100.0,
        "total_procurements": len(db.procurement_history),
        "average_savings_pct": 4.2
    }
