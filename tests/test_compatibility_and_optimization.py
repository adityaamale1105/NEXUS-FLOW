"""
Unit tests for Compatibility Validator, Landed-Cost Optimizer, and Substitution Engine
PayPal & AI Hackathon 2026
"""

import unittest
from backend.models.bom import BOMItem
from backend.agents.compatibility_validator import TechnicalCompatibilityValidator
from backend.agents.cost_optimizer import LandedCostOptimizer
from backend.agents.substitution_engine import AutonomousSubstitutionEngine


class TestCompatibilityAndOptimization(unittest.TestCase):
    def setUp(self):
        self.validator = TechnicalCompatibilityValidator()
        self.optimizer = LandedCostOptimizer()
        self.sub_engine = AutonomousSubstitutionEngine()

        self.mock_items = [
            BOMItem(
                item_id="ITEM-ESP32-TEST",
                title="ESP32-WROOM-32E Microcontroller Development Board",
                category="Compute & Microcontrollers",
                specifications={"voltage": "3.3V Logic"},
                quantity=2,
                unit_price=5.80,
                total_price=11.60,
                vendor_id="VND-CH3-SILICON-US",
                vendor_name="ExpressSilicon Direct",
                vendor_paypal_id="merchant-silicon@nexusflow.network",
                source_type="channel3_catalog",
                lead_time_days=2,
                confidence_score=0.99,
                part_number="ESP32-WROOM-32E-4MB",
                in_stock=True
            ),
            BOMItem(
                item_id="ITEM-RLY-TEST",
                title="4-Channel 5V Relay Board with Optocoupler Isolation",
                category="Power & Actuation",
                specifications={"contact_rating": "250VAC/10A"},
                quantity=1,
                unit_price=6.40,
                total_price=6.40,
                vendor_id="VND-CH3-EUROTECH-DE",
                vendor_name="EuroTech Automation GmbH",
                vendor_paypal_id="merchant-eurotech@nexusflow.network",
                source_type="channel3_catalog",
                lead_time_days=3,
                confidence_score=0.98,
                part_number="RLY-OPT-5V-04CH",
                in_stock=True
            ),
            BOMItem(
                item_id="ITEM-PWR-TEST",
                title="HLK-5M05 Isolated AC-DC Step-Down Power Supply Module (5V 1A)",
                category="Power Supply",
                specifications={"output": "5V 1000mA"},
                quantity=1,
                unit_price=3.75,
                total_price=3.75,
                vendor_id="VND-CH3-SILICON-US",
                vendor_name="ExpressSilicon Direct",
                vendor_paypal_id="merchant-silicon@nexusflow.network",
                source_type="channel3_catalog",
                lead_time_days=2,
                confidence_score=0.98,
                part_number="HLK-5M05-ACDC",
                in_stock=True
            )
        ]

    def test_compatibility_validation_passes(self):
        # 1 ESP32 (500mA) + 1 Relay (320mA) = 820mA <= 1000mA (Compatible)
        self.mock_items[0].quantity = 1
        self.mock_items[0].total_price = self.mock_items[0].unit_price
        report = self.validator.validate_bom(self.mock_items)
        self.assertEqual(report.overall_status, "compatible")
        self.assertEqual(len(report.results), len(self.mock_items))
        self.assertTrue(any("headroom optimal" in w for w in report.warnings))

    def test_compatibility_flags_overloaded_power_budget(self):
        # 3 ESP32s (1500mA) + 1 Relay (320mA) = 1820mA > 1000mA (Incompatible)
        self.mock_items[0].quantity = 3
        report = self.validator.validate_bom(self.mock_items)
        self.assertEqual(report.overall_status, "incompatible")
        self.assertTrue(any("Power budget exceeded" in w for w in report.warnings))

    def test_landed_cost_optimization(self):
        splits, opt, subtotal, fee, tax, shipping, total = self.optimizer.compute_optimization(
            self.mock_items, strategy="recommended", max_budget=50.0
        )
        self.assertGreater(total, 0.0)
        self.assertEqual(round(subtotal + tax + shipping, 2), total)
        self.assertEqual(len(splits), 2)  # Silicon Direct and EuroTech
        self.assertIsNotNone(opt.budget_utilization)
        self.assertLess(opt.budget_utilization, 100.0)

    def test_substitution_engine(self):
        esp_item = self.mock_items[0]
        alternatives = self.sub_engine.get_available_alternatives(esp_item.part_number)
        self.assertGreater(len(alternatives), 0)

        alt_choice = alternatives[0]
        new_item, record = self.sub_engine.substitute_item(esp_item, alt_choice)
        self.assertEqual(new_item.part_number, alt_choice["part_number"])
        self.assertEqual(new_item.quantity, esp_item.quantity)
        self.assertIn("Dual-Core", record.replacement_name)


if __name__ == "__main__":
    unittest.main()
