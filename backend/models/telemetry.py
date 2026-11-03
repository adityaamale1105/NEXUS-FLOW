"""
Supply Chain Telemetry, Agent Health, and Payment Routing Models
For AG Grid Merchant Control Tower
PayPal & AI Hackathon 2026
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class SupplyChainTelemetry(BaseModel):
    id: str
    tracking_number: str
    part_number: str
    item_name: str
    vendor_name: str
    origin_hub: str
    destination_hub: str
    carrier: str
    status: str  # In Transit, Cleared Customs, Dispatched, Delivered, Delayed
    eta_days: int
    risk_score: float = Field(ge=0.0, le=100.0)
    temperature_celsius: Optional[float] = None
    last_ping: str
    lat: float
    lng: float


class AgentHealthMetric(BaseModel):
    agent_id: str
    name: str
    role: str
    status: str  # Optimal, Operational, Degraded, Syncing
    health_score: float  # 0 to 100
    latency_ms: int
    requests_processed: int
    success_rate: float
    last_heartbeat: str
    current_task: str


class PaymentRouteRecord(BaseModel):
    routing_id: str
    order_id: str
    buyer_id: str
    gross_amount: float
    platform_take_rate: float
    vendor_payout: float
    vendor_paypal_account: str
    settlement_status: str  # Captured, Escrow Hold, Released, Disbursed
    apimatic_compliant: bool
    risk_level: str
    timestamp: str
