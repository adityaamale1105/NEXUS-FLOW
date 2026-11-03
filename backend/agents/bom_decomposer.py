"""
BOM Decomposer Agent
Deconstructs complex natural language procurement prompts into technical component graphs.
PayPal & AI Hackathon 2026
"""

import re
from typing import List, Dict, Any


class BOMDecomposerAgent:
    def __init__(self):
        # Component heuristics knowledge base for hardware, robotics, IoT, and embedded systems
        self.catalog_keywords = {
            "esp32": {
                "title": "ESP32-WROOM-32E Microcontroller Development Board",
                "category": "Compute & Microcontrollers",
                "specs": {"cores": "Dual-Core 240MHz", "connectivity": "Wi-Fi 802.11 b/g/n + BLE 4.2", "flash": "4MB SPI", "voltage": "3.3V Logic"},
                "base_price": 5.80,
                "part_number": "ESP32-WROOM-32E-4MB"
            },
            "relay": {
                "title": "4-Channel 5V Relay Board with Optocoupler Isolation",
                "category": "Power & Actuation",
                "specs": {"channels": 4, "contact_rating": "AC 250V/10A, DC 30V/10A", "trigger_current": "5mA", "isolation": "Optocoupled PC817"},
                "base_price": 6.40,
                "part_number": "RLY-OPT-5V-04CH"
            },
            "sensor": {
                "title": "BME280 Digital Environmental Sensor (Temp, Humidity, Pressure)",
                "category": "Sensors & Transducers",
                "specs": {"interface": "I2C/SPI", "temp_accuracy": "+/-0.5C", "humidity_range": "0-100% RH", "pressure_range": "300-1100 hPa"},
                "base_price": 4.90,
                "part_number": "BME280-DIG-I2C"
            },
            "motion": {
                "title": "HC-SR501 Passive Infrared (PIR) Motion Sensor Module",
                "category": "Sensors & Transducers",
                "specs": {"detection_angle": "120 degrees", "range": "7 meters", "delay_time": "0.3s - 5min adjustable"},
                "base_price": 2.20,
                "part_number": "HC-SR501-PIR-MOD"
            },
            "power": {
                "title": "HLK-5M05 Isolated AC-DC Step-Down Power Supply Module (5V 1A)",
                "category": "Power Supply",
                "specs": {"input_voltage": "AC 90-264V 50/60Hz", "output_voltage": "DC 5V +/-0.1V", "output_current": "1000mA", "efficiency": "70%"},
                "base_price": 3.75,
                "part_number": "HLK-5M05-ACDC"
            },
            "display": {
                "title": "0.96 inch I2C OLED Display Module 128x64 SSD1306",
                "category": "User Interface & Displays",
                "specs": {"resolution": "128x64 pixels", "color": "Monochrome White/Blue", "driver": "SSD1306", "interface": "I2C 0x3C"},
                "base_price": 3.90,
                "part_number": "DISP-SSD1306-096"
            },
            "enclosure": {
                "title": "IP67 Waterproof Project Junction Box with Cable Glands (150x100x70mm)",
                "category": "Mechanical & Enclosures",
                "specs": {"rating": "IP67", "material": "Industrial ABS", "dimensions": "150x100x70mm", "glands": "2x PG7 included"},
                "base_price": 8.50,
                "part_number": "IP67-ABS-ENC-150X100"
            },
            "wire": {
                "title": "40-Pin Silicone Jumper Wires Dupont Cable Set (M-to-M, M-to-F)",
                "category": "Interconnect & Cabling",
                "specs": {"gauge": "28 AWG Copper", "length": "20cm", "pitch": "2.54mm Standard Breadboard Pitch"},
                "base_price": 2.50,
                "part_number": "DUPONT-40P-20CM"
            },
            "breadboard": {
                "title": "830-Tie Points Solderless Breadboard with Power Rails",
                "category": "Prototyping & Accessories",
                "specs": {"tie_points": 830, "pitch": "2.54mm", "backing": "Self-Adhesive Tape", "bus_lines": 4},
                "base_price": 3.20,
                "part_number": "BRD-830-SOLDERLESS"
            },
            "camera": {
                "title": "OV2640 2-Megapixel Camera Module with 66-Degree Lens",
                "category": "Imaging & Vision",
                "specs": {"sensor": "OV2640 CMOS", "resolution": "1600x1200 UXGA", "fps": "15fps at UXGA", "format": "JPEG/RGB565"},
                "base_price": 4.60,
                "part_number": "CAM-OV2640-2MP"
            }
        }

    def decompose(self, prompt: str) -> List[Dict[str, Any]]:
        """Analyzes prompt text and returns structured target item requirements."""
        text_lower = prompt.lower()
        items_to_source = []

        # Match known hardware keywords
        matched_keys = set()
        for key, data in self.catalog_keywords.items():
            if key in text_lower:
                matched_keys.add(key)

        # Smart defaults if prompt mentions generic kit or DIY
        if "kit" in text_lower and not matched_keys:
            matched_keys.update(["esp32", "relay", "sensor", "power"])
        elif "smart-home" in text_lower or "smart home" in text_lower:
            matched_keys.update(["esp32", "relay", "sensor", "power", "enclosure"])
        elif "weather" in text_lower or "climate" in text_lower:
            matched_keys.update(["esp32", "sensor", "display", "enclosure"])
        elif "robot" in text_lower or "autonomous" in text_lower:
            matched_keys.update(["esp32", "motion", "camera", "power", "wire"])

        # Fallback to standard core IoT stack if prompt is open-ended
        if not matched_keys:
            matched_keys.update(["esp32", "sensor", "relay", "power"])

        # Extract quantities if specified like "2 esp32" or "3 relays"
        for key in matched_keys:
            qty = 1
            pattern = rf"(\d+)\s*(?:x\s*)?(?:of\s+)?{key}"
            match = re.search(pattern, text_lower)
            if match:
                try:
                    qty = min(max(int(match.group(1)), 1), 50)
                except Exception:
                    qty = 1

            meta = self.catalog_keywords[key]
            items_to_source.append({
                "keyword": key,
                "title": meta["title"],
                "category": meta["category"],
                "specifications": meta["specs"],
                "part_number": meta["part_number"],
                "base_price": meta["base_price"],
                "quantity": qty
            })

        return items_to_source
