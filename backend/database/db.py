"""
Database Layer with Seeded Users, Telemetry, Active Orders, and Procurement History
PayPal & AI Hackathon 2026
"""

import time
import datetime
from typing import Dict, List, Optional, Any
from backend.models.telemetry import SupplyChainTelemetry, AgentHealthMetric, PaymentRouteRecord
from backend.models.bom import (
    BillOfMaterials, BOMItem, VendorSplit, CompatibilityReport,
    CompatibilityResult, CostOptimization, ProcurementRecord
)
from backend.security.auth_middleware import hash_password


class InMemoryDatabase:
    def __init__(self):
        self.users: Dict[str, Dict[str, Any]] = {}
        self.boms: Dict[str, BillOfMaterials] = {}
        self.procurement_history: List[ProcurementRecord] = []
        self.telemetry_records: List[SupplyChainTelemetry] = []
        self.agent_health: List[AgentHealthMetric] = []
        self.payment_routes: List[PaymentRouteRecord] = []
        self._seed_initial_data()

    def _seed_initial_data(self):
        # 1. Seed Users (Admin, Merchants, Buyers)
        admin_pass = hash_password("NexusAdmin2026!Secure")
        merchant_pass = hash_password("SiliconSupplier2026!Secure")
        buyer_pass = hash_password("BuyerDemo2026!Secure")

        self.users["admin@nexusflow.network"] = {
            "user_id": "usr_admin_01",
            "email": "admin@nexusflow.network",
            "full_name": "Nexus System Administrator",
            "password_hash": admin_pass,
            "role": "admin",
            "company_name": "Nexus-Flow Global Protocol",
            "created_at": "2026-01-15T00:00:00Z"
        }

        self.users["merchant@siliconcomponents.com"] = {
            "user_id": "usr_merch_01",
            "email": "merchant@siliconcomponents.com",
            "full_name": "Silicon Components Hub",
            "password_hash": merchant_pass,
            "role": "merchant",
            "company_name": "Silicon Components Global Ltd",
            "paypal_merchant_id": "PPL_MERCH_SILICON_773",
            "created_at": "2026-02-01T00:00:00Z"
        }

        self.users["buyer@innovations.io"] = {
            "user_id": "usr_buyer_01",
            "email": "buyer@innovations.io",
            "full_name": "Dr. Sarah Chen",
            "password_hash": buyer_pass,
            "role": "buyer",
            "company_name": "Applied Robotics Lab",
            "created_at": "2026-03-10T00:00:00Z"
        }

        # 2. Seed Live Supply Chain Telemetry for AG Grid
        self.telemetry_records = [
            SupplyChainTelemetry(
                id="TRK-9821-ESP",
                tracking_number="FDX-8829103847-US",
                part_number="ESP32-WROOM-32E-4MB",
                item_name="ESP32-WROOM-32E Dev Module (WiFi+BLE 4MB)",
                vendor_name="ExpressSilicon Direct",
                origin_hub="Shenzhen Bao'an Hub (SZX)",
                destination_hub="Austin Tech Fulfillment (AUS)",
                carrier="FedEx International Priority",
                status="In Transit",
                eta_days=2,
                risk_score=4.2,
                temperature_celsius=21.4,
                last_ping="2026-10-28T18:14:00Z",
                lat=22.5431,
                lng=114.0579
            ),
            SupplyChainTelemetry(
                id="TRK-7412-RLY",
                tracking_number="DHL-9918237461-EU",
                part_number="RLY-OPT-5V-04CH",
                item_name="4-Channel 5V Relay Board with Optocoupler Isolation",
                vendor_name="EuroTech Automation",
                origin_hub="Frankfurt Logistics Park (FRA)",
                destination_hub="Chicago O'Hare Depot (ORD)",
                carrier="DHL Global Forwarding",
                status="Cleared Customs",
                eta_days=1,
                risk_score=2.8,
                temperature_celsius=19.2,
                last_ping="2026-10-28T18:32:00Z",
                lat=50.1109,
                lng=8.6821
            ),
            SupplyChainTelemetry(
                id="TRK-5520-SNS",
                tracking_number="UPS-1102938475-AP",
                part_number="BME280-DIG-I2C",
                item_name="BME280 Precision Environmental Sensor (Temp/Hum/Press)",
                vendor_name="Apex Micro Sensortech",
                origin_hub="Tokyo Narita Air Cargo (NRT)",
                destination_hub="Seattle Regional Hub (SEA)",
                carrier="UPS Worldwide Express Saver",
                status="Dispatched",
                eta_days=3,
                risk_score=7.1,
                temperature_celsius=18.0,
                last_ping="2026-10-28T17:50:00Z",
                lat=35.7720,
                lng=140.3929
            ),
            SupplyChainTelemetry(
                id="TRK-3341-PWR",
                tracking_number="EXP-6628194028-US",
                part_number="PWR-HLK-5M05-ACDC",
                item_name="HLK-5M05 Isolated AC-DC Step-Down Power Module 5V 1A",
                vendor_name="HiLink Power Systems",
                origin_hub="Hong Kong Gateway (HKG)",
                destination_hub="San Jose Silicon Depot (SJC)",
                carrier="SF Express International",
                status="In Transit",
                eta_days=2,
                risk_score=3.5,
                temperature_celsius=22.8,
                last_ping="2026-10-28T18:41:00Z",
                lat=22.3193,
                lng=114.1694
            ),
            SupplyChainTelemetry(
                id="TRK-1109-ENC",
                tracking_number="MAERSK-4491028374",
                part_number="IP67-ABS-ENC-150X100",
                item_name="IP67 Waterproof Project Enclosure with PG7 Glands",
                vendor_name="Vanguard Polymer Works",
                origin_hub="Busan Maritime Logistics (PUS)",
                destination_hub="Long Beach Port Facility (LGB)",
                carrier="Maersk Line Freight",
                status="Delayed",
                eta_days=6,
                risk_score=18.9,
                temperature_celsius=16.5,
                last_ping="2026-10-28T16:15:00Z",
                lat=35.1796,
                lng=129.0756
            ),
            SupplyChainTelemetry(
                id="TRK-8890-OLED",
                tracking_number="FEDX-5519283746",
                part_number="DISP-SSD1306-096-I2C",
                item_name="0.96 inch I2C OLED 128x64 Blue Display Panel",
                vendor_name="ExpressSilicon Direct",
                origin_hub="Austin Tech Fulfillment (AUS)",
                destination_hub="Boston Delivery Terminal (BOS)",
                carrier="FedEx Ground Priority",
                status="Delivered",
                eta_days=0,
                risk_score=0.5,
                temperature_celsius=20.1,
                last_ping="2026-10-28T17:10:00Z",
                lat=30.2672,
                lng=-97.7431
            ),
        ]

        # 3. Seed Multi-Agent Health Metrics
        self.agent_health = [
            AgentHealthMetric(
                agent_id="agt_decomposer_01",
                name="BOM Decomposer Agent",
                role="Natural Language Query Parsing & Component Graphing",
                status="Optimal",
                health_score=99.8,
                latency_ms=184,
                requests_processed=14290,
                success_rate=99.94,
                last_heartbeat="Just now",
                current_task="Awaiting incoming procurement prompts"
            ),
            AgentHealthMetric(
                agent_id="agt_channel3_02",
                name="Channel3 Catalog Ingestion Agent",
                role="Structured Supplier Querying & Stock Validation",
                status="Optimal",
                health_score=99.5,
                latency_ms=246,
                requests_processed=38910,
                success_rate=99.82,
                last_heartbeat="Just now",
                current_task="Syncing supplier catalog delta cache"
            ),
            AgentHealthMetric(
                agent_id="agt_kernel_03",
                name="Kernel Web Crawl Agent",
                role="Live Web Deep Scraping & Real-Time Price Discovery",
                status="Operational",
                health_score=98.7,
                latency_ms=480,
                requests_processed=19430,
                success_rate=98.91,
                last_heartbeat="Just now",
                current_task="Verifying active distributor lead times"
            ),
            AgentHealthMetric(
                agent_id="agt_compat_04",
                name="Technical Compatibility Validator",
                role="Electrical Logic, Bus Interconnect & Power Envelope Checks",
                status="Optimal",
                health_score=100.0,
                latency_ms=35,
                requests_processed=12400,
                success_rate=100.0,
                last_heartbeat="Just now",
                current_task="Verifying 3.3V logic translation rules"
            ),
            AgentHealthMetric(
                agent_id="agt_optimizer_05",
                name="Landed-Cost Optimization Engine",
                role="Multi-Vendor Freight Consolidation & Tax Calculation",
                status="Optimal",
                health_score=100.0,
                latency_ms=42,
                requests_processed=12400,
                success_rate=100.0,
                last_heartbeat="Just now",
                current_task="Evaluating consolidated freight discount rules"
            ),
            AgentHealthMetric(
                agent_id="agt_apimatic_06",
                name="APIMatic Contract Validator",
                role="PayPal Commerce OpenAPI Schema Enforcement",
                status="Optimal",
                health_score=100.0,
                latency_ms=28,
                requests_processed=12400,
                success_rate=100.0,
                last_heartbeat="Just now",
                current_task="Pre-validating Order v2 purchase_units schemas"
            ),
            AgentHealthMetric(
                agent_id="agt_paypal_07",
                name="PayPal Commerce Router",
                role="Marketplace Orders v2 & Multi-Vendor Payout Dispatch",
                status="Optimal",
                health_score=99.9,
                latency_ms=310,
                requests_processed=12398,
                success_rate=99.92,
                last_heartbeat="Just now",
                current_task="Polling Sandbox gateway status"
            ),
        ]

        # 4. Seed Live Payment Routes
        self.payment_routes = [
            PaymentRouteRecord(
                routing_id="ROU-88219-PPL",
                order_id="ORD-2026-9921",
                buyer_id="usr_buyer_01",
                gross_amount=146.50,
                platform_take_rate=3.66,
                vendor_payout=142.84,
                vendor_paypal_account="merchant@siliconcomponents.com",
                settlement_status="Captured",
                apimatic_compliant=True,
                risk_level="Low",
                timestamp="2026-10-28T18:20:00Z"
            ),
            PaymentRouteRecord(
                routing_id="ROU-77102-PPL",
                order_id="ORD-2026-9918",
                buyer_id="usr_guest_491",
                gross_amount=88.20,
                platform_take_rate=2.21,
                vendor_payout=85.99,
                vendor_paypal_account="payouts@eurotech-automation.eu",
                settlement_status="Escrow Hold",
                apimatic_compliant=True,
                risk_level="Low",
                timestamp="2026-10-28T17:45:00Z"
            ),
            PaymentRouteRecord(
                routing_id="ROU-65041-PPL",
                order_id="ORD-2026-9890",
                buyer_id="usr_buyer_92",
                gross_amount=320.00,
                platform_take_rate=8.00,
                vendor_payout=312.00,
                vendor_paypal_account="sales@hilinkpower.com",
                settlement_status="Released",
                apimatic_compliant=True,
                risk_level="Low",
                timestamp="2026-10-28T16:12:00Z"
            )
        ]

        # 5. Seed Initial Bill of Materials for Instant Retrieval
        seeded_items = [
            BOMItem(
                item_id="ITEM-ESP32-SEED",
                title="ESP32-WROOM-32E Microcontroller Development Board",
                category="Compute & Microcontrollers",
                specifications={"cores": "Dual-Core 240MHz", "voltage": "3.3V Logic"},
                quantity=1,
                unit_price=5.80,
                total_price=5.80,
                vendor_id="VND-CH3-SILICON-US",
                vendor_name="ExpressSilicon Direct",
                vendor_paypal_id="merchant-silicon@nexusflow.network",
                source_type="channel3_catalog",
                lead_time_days=2,
                confidence_score=0.99,
                part_number="ESP32-WROOM-32E-4MB",
                in_stock=True,
                compatibility_status="compatible"
            ),
            BOMItem(
                item_id="ITEM-RLY-SEED",
                title="4-Channel 5V Relay Board with Optocoupler Isolation",
                category="Power & Actuation",
                specifications={"channels": 4, "contact_rating": "AC 250V/10A"},
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
                in_stock=True,
                compatibility_status="compatible"
            ),
            BOMItem(
                item_id="ITEM-BME-SEED",
                title="BME280 Digital Environmental Sensor (Temp, Humidity, Pressure)",
                category="Sensors & Transducers",
                specifications={"interface": "I2C 0x76"},
                quantity=1,
                unit_price=4.90,
                total_price=4.90,
                vendor_id="VND-CH3-APEX-JP",
                vendor_name="Apex Micro Sensortech",
                vendor_paypal_id="merchant-apex@nexusflow.network",
                source_type="channel3_catalog",
                lead_time_days=4,
                confidence_score=0.97,
                part_number="BME280-DIG-I2C",
                in_stock=True,
                compatibility_status="compatible"
            ),
            BOMItem(
                item_id="ITEM-PWR-SEED",
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
                in_stock=True,
                compatibility_status="compatible"
            )
        ]

        seeded_splits = [
            VendorSplit(
                vendor_id="VND-CH3-SILICON-US",
                vendor_name="ExpressSilicon Direct",
                vendor_paypal_id="merchant-silicon@nexusflow.network",
                items_count=2,
                gross_amount=9.55,
                platform_fee=0.24,
                net_payout=9.31,
                escrow_release_estimate="4 days"
            ),
            VendorSplit(
                vendor_id="VND-CH3-EUROTECH-DE",
                vendor_name="EuroTech Automation GmbH",
                vendor_paypal_id="merchant-eurotech@nexusflow.network",
                items_count=1,
                gross_amount=6.40,
                platform_fee=0.16,
                net_payout=6.24,
                escrow_release_estimate="5 days"
            ),
            VendorSplit(
                vendor_id="VND-CH3-APEX-JP",
                vendor_name="Apex Micro Sensortech",
                vendor_paypal_id="merchant-apex@nexusflow.network",
                items_count=1,
                gross_amount=4.90,
                platform_fee=0.12,
                net_payout=4.78,
                escrow_release_estimate="6 days"
            )
        ]

        self.boms["BOM-2026-8812"] = BillOfMaterials(
            bom_id="BOM-2026-8812",
            prompt="Build me a custom DIY smart-home kit with an ESP32, relay modules, and sensors",
            status="compiled",
            currency="USD",
            items=seeded_items,
            vendor_splits=seeded_splits,
            subtotal=20.85,
            platform_fee=0.52,
            tax_and_duty=0.79,
            shipping_total=13.50,
            total_amount=35.14,
            apimatic_validated=True,
            apimatic_schema_version="PayPal_Commerce_v2_2026",
            paypal_order_id="5PL88291039481726",
            paypal_checkout_url="https://www.sandbox.paypal.com/checkoutnow?token=5PL88291039481726",
            created_at="2026-10-28T14:32:00Z",
            compatibility_report=CompatibilityReport(
                overall_status="compatible",
                results=[],
                warnings=["Power budget headroom optimal: Total current load is 821mA (82.1% of 1000mA rated capacity)."]
            ),
            optimization=CostOptimization(
                strategy="recommended",
                total_cost=35.14,
                savings=1.20,
                vendor_allocation=[
                    {"vendor_name": "ExpressSilicon Direct", "items_count": 2, "gross_amount": 9.55, "lead_time": "2 days"},
                    {"vendor_name": "EuroTech Automation GmbH", "items_count": 1, "gross_amount": 6.40, "lead_time": "3 days"},
                    {"vendor_name": "Apex Micro Sensortech", "items_count": 1, "gross_amount": 4.90, "lead_time": "4 days"}
                ],
                budget_utilization=43.9
            ),
            is_approved=False
        )

        # 6. Seed Historical Procurement Plans
        self.procurement_history = [
            ProcurementRecord(
                procurement_id="PROC-2026-8812",
                bom_id="BOM-2026-8812",
                prompt="Build me a custom DIY smart-home kit with an ESP32, relay modules, and sensors",
                status="payment_settled",
                total_amount=38.45,
                items_count=5,
                currency="USD",
                compatibility_status="compatible",
                created_at="2026-10-28T14:32:00Z",
                items_summary=[
                    {"title": "ESP32-WROOM-32E Dev Module", "qty": 1, "vendor": "ExpressSilicon Direct"},
                    {"title": "4-Channel 5V Relay Board", "qty": 1, "vendor": "EuroTech Automation GmbH"},
                    {"title": "BME280 Environmental Sensor", "qty": 1, "vendor": "Apex Micro Sensortech"},
                    {"title": "HLK-5M05 AC-DC Power Module", "qty": 1, "vendor": "ExpressSilicon Direct"},
                    {"title": "IP67 Waterproof Enclosure", "qty": 1, "vendor": "EuroTech Automation GmbH"}
                ]
            ),
            ProcurementRecord(
                procurement_id="PROC-2026-7491",
                bom_id="BOM-2026-7491",
                prompt="Source components for an automated environmental climate monitor with BME280 and OLED display",
                status="ready_for_payment",
                total_amount=24.10,
                items_count=3,
                currency="USD",
                compatibility_status="compatible",
                created_at="2026-10-28T16:10:00Z",
                items_summary=[
                    {"title": "ESP32-WROOM-32E Dev Module", "qty": 1, "vendor": "ExpressSilicon Direct"},
                    {"title": "BME280 Environmental Sensor", "qty": 1, "vendor": "Apex Micro Sensortech"},
                    {"title": "0.96 inch I2C OLED Display", "qty": 1, "vendor": "Apex Micro Sensortech"}
                ]
            ),
            ProcurementRecord(
                procurement_id="PROC-2026-6204",
                bom_id="BOM-2026-6204",
                prompt="Build an autonomous robot vision rover with ESP32 camera, PIR sensor, and isolated power module",
                status="approved",
                total_amount=32.80,
                items_count=4,
                currency="USD",
                compatibility_status="compatible",
                created_at="2026-10-28T17:45:00Z",
                items_summary=[
                    {"title": "ESP32-WROOM-32E Dev Module", "qty": 1, "vendor": "ExpressSilicon Direct"},
                    {"title": "OV2640 2MP Camera Module", "qty": 1, "vendor": "ExpressSilicon Direct"},
                    {"title": "HC-SR501 PIR Motion Sensor", "qty": 1, "vendor": "EuroTech Automation GmbH"},
                    {"title": "HLK-5M05 AC-DC Power Module", "qty": 1, "vendor": "ExpressSilicon Direct"}
                ]
            )
        ]

    def record_procurement(self, bom: BillOfMaterials):
        """Saves a compiled or updated BOM into procurement history."""
        self.boms[bom.bom_id] = bom
        
        # Check if already in history
        existing = next((p for p in self.procurement_history if p.bom_id == bom.bom_id), None)
        compat_status = bom.compatibility_report.overall_status if bom.compatibility_report else "compatible"
        
        summary = [
            {"title": it.title, "qty": it.quantity, "vendor": it.vendor_name}
            for it in bom.items
        ]

        if existing:
            existing.status = bom.status
            existing.total_amount = bom.total_amount
            existing.items_count = len(bom.items)
            existing.compatibility_status = compat_status
            existing.items_summary = summary
        else:
            proc_record = ProcurementRecord(
                procurement_id=f"PROC-{bom.bom_id.split('-')[-1]}",
                bom_id=bom.bom_id,
                prompt=bom.prompt,
                status=bom.status,
                total_amount=bom.total_amount,
                items_count=len(bom.items),
                currency=bom.currency,
                compatibility_status=compat_status,
                created_at=bom.created_at,
                items_summary=summary
            )
            self.procurement_history.insert(0, proc_record)


db = InMemoryDatabase()
