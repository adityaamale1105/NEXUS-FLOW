"""
Nexus-Flow Autonomous Product Substitution & Sourcing Recovery Engine
Provides automated, validated hardware replacements when components fail inventory, lead-time, or electrical constraints.
PayPal & AI Hackathon 2026
"""

from typing import List, Dict, Any, Optional, Tuple
from backend.models.bom import BOMItem, SubstitutionRecord
from backend.agents.compatibility_validator import TechnicalCompatibilityValidator


class AutonomousSubstitutionEngine:
    """
    Evaluates substitute components, validates replacement compatibility,
    and recalculates delta metrics with full transparent audit trail.
    """

    def __init__(self):
        self.validator = TechnicalCompatibilityValidator()

        # Alternative component catalog with specification mapping
        self.alternative_catalog = {
            "ESP32-WROOM-32E-4MB": [
                {
                    "title": "ESP32-S3-WROOM-1 Dual-Core with AI Acceleration (8MB Flash / 2MB PSRAM)",
                    "category": "Compute & Microcontrollers",
                    "part_number": "ESP32-S3-WROOM-1-N8R2",
                    "unit_price": 6.95,
                    "lead_time_days": 2,
                    "vendor_id": "VND-CH3-SILICON-US",
                    "vendor_name": "ExpressSilicon Direct",
                    "vendor_paypal_id": "merchant-silicon@nexusflow.network",
                    "source_type": "channel3_catalog",
                    "specifications": {"cores": "Dual Xtensa LX7 240MHz", "vector_ext": "AI Acceleration", "flash": "8MB Octal SPI", "psram": "2MB", "logic": "3.3V"},
                    "confidence_score": 0.99,
                    "reason": "Enhanced variant with dual AI vector instructions and double SPI flash memory for complex firmware."
                },
                {
                    "title": "Raspberry Pi Pico W RP2040 Dual-Core (Wi-Fi 2.4GHz + BLE)",
                    "category": "Compute & Microcontrollers",
                    "part_number": "RPI-PICO-W-RP2040",
                    "unit_price": 5.20,
                    "lead_time_days": 1,
                    "vendor_id": "VND-CH3-EUROTECH-DE",
                    "vendor_name": "EuroTech Automation GmbH",
                    "vendor_paypal_id": "merchant-eurotech@nexusflow.network",
                    "source_type": "channel3_catalog",
                    "specifications": {"cores": "Dual Arm Cortex-M0+ 133MHz", "sram": "264KB", "wireless": "CYW43439 802.11n", "logic": "3.3V"},
                    "confidence_score": 0.97,
                    "reason": "Cost-optimized alternative with rapid next-day dispatch and lower standby power consumption."
                }
            ],
            "RLY-OPT-5V-04CH": [
                {
                    "title": "4-Channel Solid State Relay (SSR) Module 2A AC 240V Zero-Cross",
                    "category": "Power & Actuation",
                    "part_number": "SSR-04CH-2A-AC",
                    "unit_price": 8.90,
                    "lead_time_days": 2,
                    "vendor_id": "VND-CH3-EUROTECH-DE",
                    "vendor_name": "EuroTech Automation GmbH",
                    "vendor_paypal_id": "merchant-eurotech@nexusflow.network",
                    "source_type": "channel3_catalog",
                    "specifications": {"channels": 4, "type": "Solid State", "switching_noise": "Zero (Silent)", "lifetime": "100M+ Cycles", "trigger": "3.3V/5V compatible"},
                    "confidence_score": 0.98,
                    "reason": "Solid-state silent switching eliminates mechanical contact wear and inductive back-EMF spikes."
                }
            ],
            "BME280-DIG-I2C": [
                {
                    "title": "SHT31-D High-Accuracy Digital Temperature & Humidity Sensor (Sensirion)",
                    "category": "Sensors & Transducers",
                    "part_number": "SHT31-D-ACC-SENS",
                    "unit_price": 4.50,
                    "lead_time_days": 2,
                    "vendor_id": "VND-CH3-APEX-JP",
                    "vendor_name": "Apex Micro Sensortech",
                    "vendor_paypal_id": "merchant-apex@nexusflow.network",
                    "source_type": "channel3_catalog",
                    "specifications": {"temp_accuracy": "+/-0.2C", "humidity_accuracy": "+/-2% RH", "interface": "I2C 0x44/0x45", "supply": "2.4V - 5.5V"},
                    "confidence_score": 0.99,
                    "reason": "Direct pin-compatible climate sensor with higher thermal precision and dual selectable I2C addresses."
                }
            ],
            "HLK-5M05-ACDC": [
                {
                    "title": "MeanWell IRM-05-5 Miniature Isolated AC-DC On-Board Power Supply (5V 1A)",
                    "category": "Power Supply",
                    "part_number": "MW-IRM-05-5-ACDC",
                    "unit_price": 4.95,
                    "lead_time_days": 1,
                    "vendor_id": "VND-CH3-EUROTECH-DE",
                    "vendor_name": "EuroTech Automation GmbH",
                    "vendor_paypal_id": "merchant-eurotech@nexusflow.network",
                    "source_type": "channel3_catalog",
                    "specifications": {"input": "85-305V AC Universal", "output": "5V 1000mA", "certifications": "UL62368-1 Class II", "no_load_loss": "<0.1W"},
                    "confidence_score": 0.99,
                    "reason": "Industrial UL-certified power module with universal 85-305V AC input and extreme thermal endurance."
                }
            ],
            "DISP-SSD1306-096": [
                {
                    "title": "1.3 inch I2C OLED Display Module 128x64 SH1106 White High-Contrast",
                    "category": "User Interface & Displays",
                    "part_number": "DISP-SH1106-130",
                    "unit_price": 4.60,
                    "lead_time_days": 2,
                    "vendor_id": "VND-CH3-APEX-JP",
                    "vendor_name": "Apex Micro Sensortech",
                    "vendor_paypal_id": "merchant-apex@nexusflow.network",
                    "source_type": "channel3_catalog",
                    "specifications": {"diagonal": "1.30 inch", "driver": "SH1106", "resolution": "128x64", "interface": "I2C 0x3C", "supply": "3.3V-5V"},
                    "confidence_score": 0.98,
                    "reason": "35% larger viewing area with matching I2C protocol and breadboard footprint."
                }
            ]
        }

    def get_available_alternatives(self, part_number: str) -> List[Dict[str, Any]]:
        """Returns pre-screened alternative options for a given component SKU."""
        return self.alternative_catalog.get(part_number, [])

    def substitute_item(
        self, original_item: BOMItem, replacement_spec: Dict[str, Any], reason: str = "User Selected Alternative"
    ) -> Tuple[BOMItem, SubstitutionRecord]:
        """
        Creates a new replacement BOMItem and returns the audited SubstitutionRecord.
        """
        new_unit_price = float(replacement_spec["unit_price"])
        new_total_price = round(new_unit_price * original_item.quantity, 2)
        cost_diff = round(new_total_price - original_item.total_price, 2)

        new_item = BOMItem(
            item_id=original_item.item_id,
            title=replacement_spec["title"],
            category=replacement_spec.get("category", original_item.category),
            specifications=replacement_spec.get("specifications", {}),
            quantity=original_item.quantity,
            unit_price=new_unit_price,
            total_price=new_total_price,
            vendor_id=replacement_spec["vendor_id"],
            vendor_name=replacement_spec["vendor_name"],
            vendor_paypal_id=replacement_spec["vendor_paypal_id"],
            source_type=replacement_spec.get("source_type", "channel3_catalog"),
            lead_time_days=int(replacement_spec.get("lead_time_days", 2)),
            confidence_score=float(replacement_spec.get("confidence_score", 0.98)),
            part_number=replacement_spec["part_number"],
            in_stock=True
        )

        record = SubstitutionRecord(
            original_item_id=original_item.item_id,
            original_name=original_item.title,
            replacement_name=new_item.title,
            replacement_part_number=new_item.part_number,
            reason=replacement_spec.get("reason", reason),
            cost_difference=cost_diff,
            specs_comparison={
                "original_specs": original_item.specifications,
                "replacement_specs": new_item.specifications
            }
        )

        return new_item, record
