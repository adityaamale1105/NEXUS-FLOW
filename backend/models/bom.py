"""
Pydantic Data Models for Bill of Materials (BOM), Compatibility & Multi-Agent Procurement
PayPal & AI Hackathon 2026
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ProcurementRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=1500, description="Plain English multi-item procurement request")
    max_budget: Optional[float] = Field(None, ge=1.0, description="Maximum budget in USD")
    urgency: Optional[str] = Field("standard", description="standard, express, or critical")
    strategy: Optional[str] = Field("recommended", description="lowest_cost, recommended, or delivery_priority")


class CompatibilityResult(BaseModel):
    item_id: str
    item_name: str
    status: str = "compatible"  # compatible, incompatible, needs_verification
    checks: List[Dict[str, Any]] = Field(default_factory=list)
    notes: str = ""


class CompatibilityReport(BaseModel):
    overall_status: str = "compatible"  # compatible, incompatible, needs_verification
    results: List[CompatibilityResult] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class SubstitutionRecord(BaseModel):
    original_item_id: str
    original_name: str
    replacement_name: str
    replacement_part_number: str
    reason: str
    cost_difference: float
    specs_comparison: Dict[str, Any] = Field(default_factory=dict)


class CostOptimization(BaseModel):
    strategy: str = "recommended"  # lowest_cost, recommended, delivery_priority
    total_cost: float
    savings: float = 0.0
    vendor_allocation: List[Dict[str, Any]] = Field(default_factory=list)
    budget_utilization: Optional[float] = None


class BOMItem(BaseModel):
    item_id: str
    title: str
    category: str
    specifications: Dict[str, Any] = Field(default_factory=dict)
    quantity: int = Field(default=1, ge=1)
    unit_price: float = Field(ge=0.0)
    total_price: float = Field(ge=0.0)
    vendor_id: str
    vendor_name: str
    vendor_paypal_id: str
    source_type: str = Field(..., description="channel3_catalog or kernel_web_crawl")
    lead_time_days: int
    confidence_score: float = Field(ge=0.0, le=1.0)
    part_number: str
    in_stock: bool = True
    compatibility_status: Optional[str] = "compatible"
    compatibility_notes: Optional[str] = None
    has_alternatives: bool = True


class VendorSplit(BaseModel):
    vendor_id: str
    vendor_name: str
    vendor_paypal_id: str
    items_count: int
    gross_amount: float
    platform_fee: float
    net_payout: float
    escrow_release_estimate: str


class BillOfMaterials(BaseModel):
    bom_id: str
    prompt: str
    status: str = "compiled"  # compiled, approved, payment_settled
    currency: str = "USD"
    items: List[BOMItem]
    vendor_splits: List[VendorSplit]
    subtotal: float
    platform_fee: float
    tax_and_duty: float
    shipping_total: float
    total_amount: float
    apimatic_validated: bool = True
    apimatic_schema_version: str = "PayPal_Commerce_v2_2026"
    paypal_order_id: Optional[str] = None
    paypal_checkout_url: Optional[str] = None
    created_at: str
    compatibility_report: Optional[CompatibilityReport] = None
    optimization: Optional[CostOptimization] = None
    substitutions: List[SubstitutionRecord] = Field(default_factory=list)
    budget_limit: Optional[float] = None
    is_approved: bool = False


class AgentThoughtStep(BaseModel):
    step_id: int
    timestamp: str
    agent_name: str
    action: str
    detail: str
    status: str = "in_progress"  # in_progress, completed, verified, warning, error
    metadata: Optional[Dict[str, Any]] = None


class ProcurementRecord(BaseModel):
    procurement_id: str
    bom_id: str
    prompt: str
    status: str
    total_amount: float
    items_count: int
    currency: str = "USD"
    compatibility_status: str
    created_at: str
    items_summary: List[Dict[str, Any]] = Field(default_factory=list)
