"""
Vendor Fee and Escrow Split Engine
Calculates multi-party marketplace payouts, platform take rates, and escrow timelines.
PayPal & AI Hackathon 2026
"""

from typing import List, Dict, Tuple
from collections import defaultdict
from backend.models.bom import BOMItem, VendorSplit
from backend.config import PLATFORM_FEE_PERCENTAGE, ESCROW_HOLD_HOURS


class SplitCalculatorAgent:
    def __init__(self, platform_fee_pct: float = PLATFORM_FEE_PERCENTAGE):
        self.platform_fee_pct = platform_fee_pct

    def compute_splits(self, items: List[BOMItem]) -> Tuple[List[VendorSplit], float, float, float, float, float]:
        """
        Calculates vendor breakdowns and platform totals.
        Returns:
            (vendor_splits, subtotal, platform_fee, tax_and_duty, shipping_total, grand_total)
        """
        vendor_groups = defaultdict(lambda: {
            "name": "",
            "paypal_id": "",
            "items_count": 0,
            "gross": 0.0
        })

        subtotal = 0.0
        for item in items:
            item_total = round(item.unit_price * item.quantity, 2)
            subtotal += item_total
            vg = vendor_groups[item.vendor_id]
            vg["name"] = item.vendor_name
            vg["paypal_id"] = item.vendor_paypal_id
            vg["items_count"] += item.quantity
            vg["gross"] += item_total

        subtotal = round(subtotal, 2)
        total_platform_fee = round(subtotal * (self.platform_fee_pct / 100.0), 2)

        # Standard estimated duties (4.5%) and bundled express freight ($8.50 base + $1.50 per vendor)
        tax_and_duty = round(subtotal * 0.045, 2)
        shipping_total = round(8.50 + (1.50 * len(vendor_groups)), 2)
        grand_total = round(subtotal + tax_and_duty + shipping_total, 2)

        splits: List[VendorSplit] = []
        for vid, data in vendor_groups.items():
            gross = round(data["gross"], 2)
            v_fee = round(gross * (self.platform_fee_pct / 100.0), 2)
            net = round(gross - v_fee, 2)

            splits.append(VendorSplit(
                vendor_id=vid,
                vendor_name=data["name"],
                vendor_paypal_id=data["paypal_id"],
                items_count=data["items_count"],
                gross_amount=gross,
                platform_fee=v_fee,
                net_payout=net,
                escrow_release_estimate=f"{ESCROW_HOLD_HOURS} hours post-carrier delivery telemetry confirmation"
            ))

        return splits, subtotal, total_platform_fee, tax_and_duty, shipping_total, grand_total
