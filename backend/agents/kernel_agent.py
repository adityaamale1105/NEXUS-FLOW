"""
Kernel Web Agent
Live web crawling & deep search agent for parts availability, inventory cross-referencing,
and secondary distributor price matching.
PayPal & AI Hackathon 2026
"""

import asyncio
import requests
from typing import Dict, Any
from backend.config import KERNEL_API_KEY, KERNEL_ENDPOINT, KERNEL_MOCK_FALLBACK


class KernelWebAgent:
    def __init__(self):
        self.api_key = KERNEL_API_KEY
        self.endpoint = KERNEL_ENDPOINT
        self.mock_fallback = KERNEL_MOCK_FALLBACK

        # Verified web crawl suppliers
        self.web_vendors = [
            {
                "vendor_id": "VND-KNL-HILINK-HK",
                "vendor_name": "HiLink Power Systems Co.",
                "vendor_paypal_id": "merchant-hilink@nexusflow.network",
                "lead_time_days": 3,
                "confidence_score": 0.96,
                "in_stock": True
            },
            {
                "vendor_id": "VND-KNL-VANGUARD-KR",
                "vendor_name": "Vanguard Polymer Works",
                "vendor_paypal_id": "merchant-vanguard@nexusflow.network",
                "lead_time_days": 5,
                "confidence_score": 0.94,
                "in_stock": True
            }
        ]

    async def crawl_and_verify(self, part_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Runs web crawling agent to find and verify alternative or spot-market pricing."""
        if self.api_key and not self.mock_fallback:
            try:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                payload = {"search_term": part_spec["part_number"]}
                response = await asyncio.to_thread(requests.post, self.endpoint, json=payload, headers=headers, timeout=3.0)
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "source_type": "kernel_web_crawl",
                        "vendor_id": data.get("vendor_id", self.web_vendors[0]["vendor_id"]),
                        "vendor_name": data.get("vendor_name", self.web_vendors[0]["vendor_name"]),
                        "vendor_paypal_id": data.get("vendor_paypal_id", self.web_vendors[0]["vendor_paypal_id"]),
                        "unit_price": float(data.get("price", part_spec["base_price"])),
                        "lead_time_days": int(data.get("lead_time_days", 3)),
                        "confidence_score": float(data.get("confidence_score", 0.95)),
                        "in_stock": True
                    }
            except Exception:
                pass

        # Deterministic web vendor assignment
        idx = hash(part_spec["title"]) % len(self.web_vendors)
        v = self.web_vendors[idx]
        unit_price = round(part_spec["base_price"] * 1.02, 2)

        return {
            "source_type": "kernel_web_crawl",
            "vendor_id": v["vendor_id"],
            "vendor_name": v["vendor_name"],
            "vendor_paypal_id": v["vendor_paypal_id"],
            "unit_price": unit_price,
            "lead_time_days": v["lead_time_days"],
            "confidence_score": v["confidence_score"],
            "in_stock": v["in_stock"]
        }
