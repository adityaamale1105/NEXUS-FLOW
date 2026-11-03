"""
Direct Async Integration Tests for Nexus-Flow Route Handlers
PayPal & AI Hackathon 2026
"""

import unittest
import asyncio
from backend.models.bom import ProcurementRequest
from backend.routes.procure import (
    get_procurement_history, update_item_quantity,
    recalculate_bom, approve_procurement_plan, UpdateQuantityRequest, RecalculateRequest
)
from backend.routes.paypal import (
    create_order, capture_order, CreateOrderRequest, CaptureOrderRequest
)
from backend.routes.telemetry import (
    get_supply_chain_telemetry, get_agent_health, get_payment_routes,
    get_supplier_intelligence, get_telemetry_summary
)
from backend.database.db import db


class TestApiDirect(unittest.TestCase):
    def test_history_endpoint(self):
        history = asyncio.run(get_procurement_history())
        self.assertIsInstance(history, list)
        self.assertGreater(len(history), 0)

    def test_telemetry_endpoints(self):
        shipments = asyncio.run(get_supply_chain_telemetry())
        self.assertGreater(len(shipments), 0)

        agents = asyncio.run(get_agent_health())
        self.assertGreater(len(agents), 0)

        payments = asyncio.run(get_payment_routes())
        self.assertGreater(len(payments), 0)

        suppliers = asyncio.run(get_supplier_intelligence())
        self.assertEqual(len(suppliers), 4)

        summary = asyncio.run(get_telemetry_summary())
        self.assertIn("active_shipments", summary)
        self.assertEqual(summary["escrow_integrity_rate"], 100.0)

    def test_bom_management_and_paypal(self):
        # Use one of the seeded BOMs or history items
        self.assertGreater(len(db.procurement_history), 0)
        bom_id = db.procurement_history[0].bom_id
        
        # Test Approve
        approval = asyncio.run(approve_procurement_plan(bom_id))
        self.assertTrue(approval["is_approved"])
        self.assertEqual(approval["status"], "approved")

        # Test Recalculate
        recalc_req = RecalculateRequest(strategy="lowest_cost")
        recalc_bom = asyncio.run(recalculate_bom(bom_id, recalc_req))
        self.assertEqual(recalc_bom.optimization.strategy, "lowest_cost")

        # Test PayPal Order Creation
        create_res = asyncio.run(create_order(CreateOrderRequest(bom_id=bom_id)))
        self.assertIn("order_id", create_res)
        order_id = create_res["order_id"]

        # Test PayPal Order Capture
        capture_res = asyncio.run(capture_order(CaptureOrderRequest(order_id=order_id, bom_id=bom_id)))
        self.assertTrue(capture_res["success"])
        self.assertEqual(capture_res["status"], "COMPLETED")
        self.assertEqual(capture_res["escrow_mode"], "DELAYED_CARRIER_CONFIRMATION")


if __name__ == "__main__":
    unittest.main()
