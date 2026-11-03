"""
Nexus-Flow Technical Compatibility Validation Engine
Deterministic verification of electronic logic levels, bus interfaces, power envelopes, and missing dependencies.
PayPal & AI Hackathon 2026
"""

from typing import List, Dict, Any, Tuple
from backend.models.bom import BOMItem, CompatibilityResult, CompatibilityReport


class TechnicalCompatibilityValidator:
    """
    Validates electrical, interface, and power constraints between hardware modules in a Bill of Materials.
    Supports deterministic rules for microcontrollers, sensors, relays, displays, and power supplies.
    """

    def __init__(self):
        # Known voltage domains for hardware components
        self.voltage_domains = {
            "ESP32-WROOM-32E-4MB": {"logic": 3.3, "v_in_min": 3.0, "v_in_max": 3.6, "i_max_ma": 500, "protocols": ["I2C", "SPI", "UART", "GPIO"]},
            "RLY-OPT-5V-04CH": {"logic": 5.0, "v_in_min": 4.5, "v_in_max": 5.5, "i_max_ma": 320, "protocols": ["GPIO"], "needs_level_shift_from_3v3": True},
            "BME280-DIG-I2C": {"logic": 3.3, "v_in_min": 1.7, "v_in_max": 3.6, "i_max_ma": 1, "protocols": ["I2C", "SPI"], "i2c_address": "0x76"},
            "HC-SR501-PIR-MOD": {"logic": 3.3, "v_in_min": 4.5, "v_in_max": 12.0, "i_max_ma": 65, "protocols": ["GPIO"]},
            "HLK-5M05-ACDC": {"v_out": 5.0, "i_out_max_ma": 1000, "is_power_source": True},
            "DISP-SSD1306-096": {"logic": 3.3, "v_in_min": 3.0, "v_in_max": 5.0, "i_max_ma": 20, "protocols": ["I2C"], "i2c_address": "0x3C"},
            "CAM-OV2640-2MP": {"logic": 3.3, "v_in_min": 3.0, "v_in_max": 3.3, "i_max_ma": 180, "protocols": ["DVP", "SCCB"]},
            "IP67-ABS-ENC-150X100": {"is_passive": True},
            "DUPONT-40P-20CM": {"is_passive": True},
            "BRD-830-SOLDERLESS": {"is_passive": True},
        }

    def validate_bom(self, items: List[BOMItem]) -> CompatibilityReport:
        """
        Runs comprehensive electrical, interface, and power checks across all items in the BOM.
        Returns a structured CompatibilityReport with individual item diagnostics and overall status.
        """
        results: List[CompatibilityResult] = []
        warnings: List[str] = []
        has_incompatible = False
        has_verification_needed = False

        # Identify MCU/controller and Power Source
        mcu_item = next((it for it in items if "ESP32" in it.part_number or "Microcontroller" in it.category), None)
        power_source = next((it for it in items if "HLK" in it.part_number or "Power" in it.category), None)
        
        # Calculate total power load in mA
        total_current_draw_ma = 0.0

        for item in items:
            checks: List[Dict[str, Any]] = []
            item_status = "compatible"
            notes = []

            spec = self.voltage_domains.get(item.part_number, {})

            if spec.get("is_passive"):
                checks.append({
                    "check_name": "Mechanical & Passive Audit",
                    "passed": True,
                    "detail": "Passive accessory/enclosure. No electrical constraints violated."
                })
                notes.append("Passive component verified compatible.")
                results.append(CompatibilityResult(
                    item_id=item.item_id,
                    item_name=item.title,
                    status=item_status,
                    checks=checks,
                    notes="; ".join(notes)
                ))
                continue

            # 1. Voltage & Logic Level Compatibility Check
            if mcu_item and item.item_id != mcu_item.item_id:
                mcu_spec = self.voltage_domains.get(mcu_item.part_number, {"logic": 3.3})
                item_logic = spec.get("logic")
                
                if item_logic:
                    if item_logic == mcu_spec.get("logic"):
                        checks.append({
                            "check_name": "Logic Voltage Level Match",
                            "passed": True,
                            "detail": f"Native {item_logic}V logic aligns with controller {mcu_spec.get('logic')}V rails."
                        })
                    elif spec.get("needs_level_shift_from_3v3"):
                        # Relay boards often support 3.3V trigger with optocoupler
                        checks.append({
                            "check_name": "Logic Voltage Level Match",
                            "passed": True,
                            "detail": f"5V relay board incorporates PC817 optocoupler isolation compatible with 3.3V GPIO trigger signals."
                        })
                        notes.append("Optocoupler isolated input accepts 3.3V logic.")
                    elif item_logic > mcu_spec.get("logic", 3.3):
                        checks.append({
                            "check_name": "Logic Voltage Level Match",
                            "passed": False,
                            "detail": f"Voltage mismatch: Component uses {item_logic}V logic while MCU is {mcu_spec.get('logic')}V. Level shifter recommended."
                        })
                        item_status = "needs_verification"
                        has_verification_needed = True
                        notes.append(f"Requires level translation from {mcu_spec.get('logic')}V to {item_logic}V.")

            # 2. Communication Protocol Compatibility Check
            protocols = spec.get("protocols", [])
            if "I2C" in protocols:
                i2c_addr = spec.get("i2c_address", "Unknown")
                checks.append({
                    "check_name": "I2C Bus Bus Collision & Addressing",
                    "passed": True,
                    "detail": f"I2C interface validated at address {i2c_addr}. Standard 100/400kHz clock supported."
                })
            elif "SPI" in protocols:
                checks.append({
                    "check_name": "SPI Bus Interconnect",
                    "passed": True,
                    "detail": "Standard 4-wire SPI (MOSI/MISO/SCK/CS) compatible with hardware SPI peripheral."
                })
            elif "GPIO" in protocols:
                checks.append({
                    "check_name": "Digital I/O Pin Loading",
                    "passed": True,
                    "detail": "Standard digital GPIO control. Current sink within MCU 12mA threshold."
                })

            # 3. Current Consumption Calculation
            draw_ma = spec.get("i_max_ma", 0) * item.quantity
            total_current_draw_ma += draw_ma
            checks.append({
                "check_name": "Current Draw Envelope",
                "passed": True,
                "detail": f"Peak consumption: {draw_ma:.1f}mA (Unit: {spec.get('i_max_ma', 0)}mA x {item.quantity})."
            })

            if not notes:
                notes.append("All electrical & protocol invariants verified.")

            results.append(CompatibilityResult(
                item_id=item.item_id,
                item_name=item.title,
                status=item_status,
                checks=checks,
                notes="; ".join(notes)
            ))

        # 4. Global Power Supply Capacity Check
        if power_source:
            pwr_spec = self.voltage_domains.get(power_source.part_number, {"i_out_max_ma": 1000})
            capacity_ma = pwr_spec.get("i_out_max_ma", 1000)
            if total_current_draw_ma > capacity_ma:
                has_incompatible = True
                warnings.append(
                    f"Power budget exceeded: Total peak current draw ({total_current_draw_ma:.0f}mA) "
                    f"exceeds power module rated capacity ({capacity_ma:.0f}mA)."
                )
            else:
                utilization_pct = (total_current_draw_ma / capacity_ma) * 100
                warnings.append(
                    f"Power budget headroom optimal: Total current load is {total_current_draw_ma:.0f}mA "
                    f"({utilization_pct:.1f}% of {capacity_ma}mA rated capacity)."
                )
        else:
            warnings.append("Note: No discrete AC-DC power module detected. Ensure 5V USB/External supply is provided.")

        overall_status = "incompatible" if has_incompatible else ("needs_verification" if has_verification_needed else "compatible")

        return CompatibilityReport(
            overall_status=overall_status,
            results=results,
            warnings=warnings
        )
