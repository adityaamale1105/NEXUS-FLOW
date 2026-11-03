"""
Unit Tests for PayPal Service and APIMatic Validation
PayPal & AI Hackathon 2026
"""

import asyncio
from backend.agents.paypal_service import PayPalService
from backend.agents.split_calculator import SplitCalculatorAgent
from backend.agents.apimatic_validator import APIMaticContractValidator
from backend.models.bom import BOMItem


def test_paypal_order_construction_and_apimatic():
    service = PayPalService()
    split_calc = SplitCalculatorAgent(platform_fee_pct=2.50)
    validator = APIMaticContractValidator()

    items = [
        BOMItem(
            item_id="ITEM-1",
            title="ESP32-WROOM-32E Dev Board",
            category="Compute",
            specifications={"cores": "Dual-Core 240MHz"},
            quantity=2,
            unit_price=5.80,
            total_price=11.60,
            vendor_id="VND-SILICON",
            vendor_name="ExpressSilicon Direct",
            vendor_paypal_id="silicon@nexusflow.network",
            source_type="channel3_catalog",
            lead_time_days=2,
            confidence_score=0.99,
            part_number="ESP32-32E",
            in_stock=True
        ),
        BOMItem(
            item_id="ITEM-2",
            title="4-Channel 5V Relay Board",
            category="Actuation",
            specifications={"channels": 4},
            quantity=1,
            unit_price=6.40,
            total_price=6.40,
            vendor_id="VND-EUROTECH",
            vendor_name="EuroTech Automation",
            vendor_paypal_id="eurotech@nexusflow.network",
            source_type="kernel_web_crawl",
            lead_time_days=3,
            confidence_score=0.98,
            part_number="RLY-5V-4CH",
            in_stock=True
        )
    ]

    splits, subtotal, p_fee, tax, shipping, grand_total = split_calc.compute_splits(items)
    assert len(splits) == 2
    assert subtotal == 18.00
    assert p_fee == 0.45

    payload = service.construct_order_payload(
        bom_id="BOM-TEST-001",
        items=items,
        vendor_splits=splits,
        subtotal=subtotal,
        tax_and_duty=tax,
        shipping_total=shipping,
        grand_total=grand_total
    )

    is_valid, errors = validator.validate_paypal_order_payload(payload)
    assert is_valid, f"APIMatic validation failed: {errors}"
    assert payload["intent"] == "CAPTURE"
    assert len(payload["purchase_units"]) == 2

    # Test order creation in sandbox fallback
    order_result = service.create_order_sync(
        bom_id="BOM-TEST-001",
        items=items,
        vendor_splits=splits,
        subtotal=subtotal,
        tax_and_duty=tax,
        shipping_total=shipping,
        grand_total=grand_total
    )
    assert "order_id" in order_result
    assert "checkout_url" in order_result
    assert order_result["status"] == "CREATED"


if __name__ == "__main__":
    test_paypal_order_construction_and_apimatic()
    print("All PayPal & APIMatic tests passed!")
