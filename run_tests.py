"""
Test Suite Runner for Nexus-Flow
PayPal & AI Hackathon 2026
"""

import sys
import unittest
from pathlib import Path

# Ensure root directory is in sys.path
ROOT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT_DIR))

from tests.test_bom_decomposer import test_bom_decomposer_smart_home, test_bom_decomposer_quantity_extraction
from tests.test_paypal_service import test_paypal_order_construction_and_apimatic
from tests.test_security import test_password_hashing, test_jwt_token_flow, test_input_sanitizer, test_rate_limiter
from tests.test_telemetry import test_telemetry_records, test_agent_health_metrics, test_payment_routes
from tests.test_compatibility_and_optimization import TestCompatibilityAndOptimization


def run_all_tests():
    print("[RUNNING] BOM Decomposer Tests...")
    test_bom_decomposer_smart_home()
    test_bom_decomposer_quantity_extraction()
    print("[PASSED] BOM Decomposer Tests.")

    print("[RUNNING] PayPal & APIMatic Contract Tests...")
    test_paypal_order_construction_and_apimatic()
    print("[PASSED] PayPal & APIMatic Contract Tests.")

    print("[RUNNING] Security, PBKDF2, JWT & Rate Limiter Tests...")
    test_password_hashing()
    test_jwt_token_flow()
    test_input_sanitizer()
    test_rate_limiter()
    print("[PASSED] Security Tests.")

    print("[RUNNING] Telemetry & KPI Engine Tests...")
    test_telemetry_records()
    test_agent_health_metrics()
    test_payment_routes()
    print("[PASSED] Telemetry Tests.")

    print("[RUNNING] Compatibility, Landed-Cost & Substitution Tests...")
    suite = unittest.TestLoader().loadTestsFromTestCase(TestCompatibilityAndOptimization)
    result = unittest.TextTestRunner(verbosity=0).run(suite)
    assert result.wasSuccessful(), "Compatibility and Optimization tests failed!"
    print("[PASSED] Compatibility, Landed-Cost & Substitution Tests.")

    print("\n-----------------------------------------------------")
    print("ALL NEXUS-FLOW BACKEND TESTS PASSED SUCCESSFULLY (14/14)")
    print("-----------------------------------------------------")


if __name__ == "__main__":
    run_all_tests()
