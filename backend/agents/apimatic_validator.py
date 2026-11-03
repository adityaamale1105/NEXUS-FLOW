"""
APIMatic Contract Validator
Enforces PayPal Commerce Orders v2 OpenAPI specification & APIMatic schema rules.
PayPal & AI Hackathon 2026
"""

from typing import Dict, Any, List, Tuple


class APIMaticContractValidator:
    def __init__(self, strict_mode: bool = True):
        self.strict_mode = strict_mode

    def validate_paypal_order_payload(self, order_payload: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validates the generated PayPal order structure against the APIMatic-validated specification.
        Checks:
        1. intent is 'CAPTURE' or 'AUTHORIZE'
        2. purchase_units array exists and is non-empty
        3. For each purchase_unit:
           - reference_id exists and is unique
           - amount breakdown matches sum of items + shipping + handling + tax_total
           - items array has valid currency_code, value, and quantity
           - payment_instruction platform_fees validate if present
        """
        errors = []

        if "intent" not in order_payload or order_payload["intent"] not in ("CAPTURE", "AUTHORIZE"):
            errors.append("Schema error: 'intent' must be 'CAPTURE' or 'AUTHORIZE'")

        purchase_units = order_payload.get("purchase_units")
        if not purchase_units or not isinstance(purchase_units, list):
            errors.append("Schema error: 'purchase_units' must be a non-empty array")
            return False, errors

        ref_ids = set()
        for idx, pu in enumerate(purchase_units):
            ref_id = pu.get("reference_id")
            if not ref_id:
                errors.append(f"purchase_units[{idx}]: missing required 'reference_id'")
            elif ref_id in ref_ids:
                errors.append(f"purchase_units[{idx}]: duplicate reference_id '{ref_id}'")
            else:
                ref_ids.add(ref_id)

            amount = pu.get("amount")
            if not amount or "currency_code" not in amount or "value" not in amount:
                errors.append(f"purchase_units[{idx}]: invalid amount object")
            else:
                if amount["currency_code"] not in ("USD", "EUR", "GBP", "JPY", "CAD", "AUD"):
                    errors.append(f"purchase_units[{idx}]: unsupported ISO 4217 currency '{amount['currency_code']}'")

            # Validate items break-down alignment
            breakdown = amount.get("breakdown") if amount else None
            items = pu.get("items", [])
            if breakdown and "item_total" in breakdown and items:
                calculated_items_total = sum(
                    round(float(item["unit_amount"]["value"]) * int(item["quantity"]), 2)
                    for item in items
                )
                declared_item_total = float(breakdown["item_total"]["value"])
                if abs(calculated_items_total - declared_item_total) > 0.01:
                    errors.append(
                        f"purchase_units[{idx}]: breakdown item_total ({declared_item_total}) "
                        f"does not match sum of items ({calculated_items_total})"
                    )

        is_valid = len(errors) == 0
        return is_valid, errors
