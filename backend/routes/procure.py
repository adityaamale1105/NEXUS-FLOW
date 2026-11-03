"""
Procurement API Routes, SSE Streaming & Interactive BOM Management Endpoints
PayPal & AI Hackathon 2026
"""

import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from backend.models.bom import ProcurementRequest, BillOfMaterials, BOMItem
from backend.agents.orchestrator import orchestrator
from backend.agents.substitution_engine import AutonomousSubstitutionEngine
from backend.agents.compatibility_validator import TechnicalCompatibilityValidator
from backend.agents.cost_optimizer import LandedCostOptimizer
from backend.security.rate_limiter import check_rate_limit
from backend.security.sanitizer import sanitize_text
from backend.security.auth_middleware import get_current_user
from backend.database.db import db

router = APIRouter(prefix="/api/procure", tags=["Procurement"])
search_router = APIRouter(prefix="/api/search", tags=["Search"])

sub_engine = AutonomousSubstitutionEngine()
compat_validator = TechnicalCompatibilityValidator()
cost_optimizer = LandedCostOptimizer()


class UpdateQuantityRequest(BaseModel):
    quantity: int = Field(..., ge=1, le=50)


class SubstituteRequest(BaseModel):
    part_number: str
    reason: Optional[str] = "User Selected Alternative"


class RecalculateRequest(BaseModel):
    strategy: Optional[str] = "recommended"
    max_budget: Optional[float] = None


@router.post("", dependencies=[Depends(check_rate_limit)])
@search_router.post("", dependencies=[Depends(check_rate_limit)])
async def create_procurement(
    request: ProcurementRequest,
    current_user: dict = Depends(get_current_user)
):
    """Executes multi-agent procurement synchronously and returns complete BOM."""
    clean_prompt = sanitize_text(request.prompt)
    if len(clean_prompt) < 3:
        raise HTTPException(status_code=400, detail="Invalid procurement prompt")

    final_bom = None
    async for event in orchestrator.execute_procurement_stream(
        prompt=clean_prompt,
        user_id=current_user.get("user_id"),
        max_budget=request.max_budget,
        strategy=request.strategy or "recommended"
    ):
        if event["type"] == "bom_complete":
            final_bom = event["data"]

    if not final_bom:
        raise HTTPException(status_code=500, detail="Procurement orchestration failed to compile BOM")

    return final_bom


@router.get("/stream", dependencies=[Depends(check_rate_limit)])
@search_router.get("/stream", dependencies=[Depends(check_rate_limit)])
async def stream_procurement_thoughts(
    prompt: str = Query(..., min_length=3, max_length=1500),
    max_budget: Optional[float] = Query(None, ge=1.0),
    strategy: Optional[str] = Query("recommended"),
    request: Request = None
):
    """
    Server-Sent Events (SSE) streaming endpoint.
    Emits real-time thought terminal telemetry followed by the finalized BOM payload.
    """
    clean_prompt = sanitize_text(prompt)

    async def event_generator():
        try:
            async for event in orchestrator.execute_procurement_stream(
                prompt=clean_prompt,
                max_budget=max_budget,
                strategy=strategy or "recommended"
            ):
                event_type = event["type"]
                event_data = json.dumps(event["data"])
                yield f"event: {event_type}\ndata: {event_data}\n\n"
        except Exception as e:
            err_data = json.dumps({"error": str(e), "message": "Stream interrupted"})
            yield f"event: stream_error\ndata: {err_data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.get("/history")
async def get_procurement_history():
    """Returns chronological log of past sourcing requests and compiled plans."""
    return db.procurement_history


@router.get("/history/{procurement_id}")
async def get_procurement_history_item(procurement_id: str):
    """Returns detailed history entry by ID."""
    entry = next((p for p in db.procurement_history if p.procurement_id == procurement_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Procurement history record not found")
    return entry


@router.get("/{bom_id}")
async def get_bom_by_id(bom_id: str):
    """Retrieves an existing Bill of Materials by its identifier."""
    if bom_id not in db.boms:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="BOM not found")
    return db.boms[bom_id]


@router.put("/{bom_id}/items/{item_id}")
async def update_item_quantity(
    bom_id: str,
    item_id: str,
    payload: UpdateQuantityRequest
):
    """
    Updates the quantity of a specific item in the BOM and recalculates financials and splits.
    """
    if bom_id not in db.boms:
        raise HTTPException(status_code=404, detail="BOM not found")

    bom = db.boms[bom_id]
    item = next((it for it in bom.items if it.item_id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in BOM")

    item.quantity = payload.quantity
    item.total_price = round(item.unit_price * item.quantity, 2)

    # Recalculate compatibility and financials
    bom.compatibility_report = compat_validator.validate_bom(bom.items)
    strategy = bom.optimization.strategy if bom.optimization else "recommended"
    (
        bom.vendor_splits,
        bom.optimization,
        bom.subtotal,
        bom.platform_fee,
        bom.tax_and_duty,
        bom.shipping_total,
        bom.total_amount
    ) = cost_optimizer.compute_optimization(bom.items, strategy=strategy, max_budget=bom.budget_limit)

    db.record_procurement(bom)
    return bom


@router.delete("/{bom_id}/items/{item_id}")
async def remove_item_from_bom(bom_id: str, item_id: str):
    """
    Removes an item from the BOM and recalculates electrical constraints and financials.
    """
    if bom_id not in db.boms:
        raise HTTPException(status_code=404, detail="BOM not found")

    bom = db.boms[bom_id]
    original_len = len(bom.items)
    bom.items = [it for it in bom.items if it.item_id != item_id]

    if len(bom.items) == original_len:
        raise HTTPException(status_code=404, detail="Item not found in BOM")

    if not bom.items:
        raise HTTPException(status_code=400, detail="Cannot remove all items from BOM")

    bom.compatibility_report = compat_validator.validate_bom(bom.items)
    strategy = bom.optimization.strategy if bom.optimization else "recommended"
    (
        bom.vendor_splits,
        bom.optimization,
        bom.subtotal,
        bom.platform_fee,
        bom.tax_and_duty,
        bom.shipping_total,
        bom.total_amount
    ) = cost_optimizer.compute_optimization(bom.items, strategy=strategy, max_budget=bom.budget_limit)

    db.record_procurement(bom)
    return bom


@router.get("/{bom_id}/items/{item_id}/alternatives")
async def get_item_alternatives(bom_id: str, item_id: str):
    """
    Returns verified alternative candidate parts for an item in the BOM.
    """
    if bom_id not in db.boms:
        raise HTTPException(status_code=404, detail="BOM not found")

    bom = db.boms[bom_id]
    item = next((it for it in bom.items if it.item_id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in BOM")

    alternatives = sub_engine.get_available_alternatives(item.part_number)
    return {"item_id": item_id, "part_number": item.part_number, "alternatives": alternatives}


@router.post("/{bom_id}/items/{item_id}/substitute")
async def substitute_item_in_bom(
    bom_id: str,
    item_id: str,
    payload: SubstituteRequest
):
    """
    Replaces an item in the BOM with a validated alternative part.
    """
    if bom_id not in db.boms:
        raise HTTPException(status_code=404, detail="BOM not found")

    bom = db.boms[bom_id]
    item_idx = next((i for i, it in enumerate(bom.items) if it.item_id == item_id), None)
    if item_idx is None:
        raise HTTPException(status_code=404, detail="Item not found in BOM")

    original_item = bom.items[item_idx]
    alternatives = sub_engine.get_available_alternatives(original_item.part_number)
    replacement_spec = next((alt for alt in alternatives if alt["part_number"] == payload.part_number), None)

    if not replacement_spec:
        raise HTTPException(status_code=400, detail="Alternative specification not found for requested part number")

    new_item, record = sub_engine.substitute_item(original_item, replacement_spec, payload.reason or "User Selected")
    bom.items[item_idx] = new_item
    bom.substitutions.append(record)

    # Recalculate compatibility and financials
    bom.compatibility_report = compat_validator.validate_bom(bom.items)
    strategy = bom.optimization.strategy if bom.optimization else "recommended"
    (
        bom.vendor_splits,
        bom.optimization,
        bom.subtotal,
        bom.platform_fee,
        bom.tax_and_duty,
        bom.shipping_total,
        bom.total_amount
    ) = cost_optimizer.compute_optimization(bom.items, strategy=strategy, max_budget=bom.budget_limit)

    db.record_procurement(bom)
    return bom


@router.post("/{bom_id}/recalculate")
async def recalculate_bom(bom_id: str, payload: RecalculateRequest):
    """
    Recalculates BOM under a different optimization strategy (lowest_cost, recommended, delivery_priority).
    """
    if bom_id not in db.boms:
        raise HTTPException(status_code=404, detail="BOM not found")

    bom = db.boms[bom_id]
    strategy = payload.strategy or "recommended"
    max_budget = payload.max_budget if payload.max_budget is not None else bom.budget_limit

    (
        bom.vendor_splits,
        bom.optimization,
        bom.subtotal,
        bom.platform_fee,
        bom.tax_and_duty,
        bom.shipping_total,
        bom.total_amount
    ) = cost_optimizer.compute_optimization(bom.items, strategy=strategy, max_budget=max_budget)

    db.record_procurement(bom)
    return bom


@router.post("/{bom_id}/approve")
async def approve_procurement_plan(bom_id: str):
    """
    Explicit buyer approval of the procurement plan.
    Locks the BOM snapshot and unlocks PayPal Orders v2 checkout.
    """
    if bom_id not in db.boms:
        raise HTTPException(status_code=404, detail="BOM not found")

    bom = db.boms[bom_id]
    bom.is_approved = True
    bom.status = "approved"

    db.record_procurement(bom)
    return {
        "success": True,
        "message": "Procurement plan approved by buyer. PayPal checkout unlocked.",
        "bom_id": bom_id,
        "status": bom.status,
        "is_approved": True,
        "paypal_order_id": bom.paypal_order_id,
        "paypal_checkout_url": bom.paypal_checkout_url
    }
