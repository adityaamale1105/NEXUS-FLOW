"""
Unit Tests for BOM Decomposer Agent
PayPal & AI Hackathon 2026
"""

import asyncio
from backend.agents.bom_decomposer import BOMDecomposerAgent


def test_bom_decomposer_smart_home():
    agent = BOMDecomposerAgent()
    prompt = "Build me a custom DIY smart-home kit with an ESP32, relay modules, and sensors"
    results = agent.decompose(prompt)

    assert len(results) >= 3
    keywords = [r["keyword"] for r in results]
    assert "esp32" in keywords
    assert "relay" in keywords
    assert "sensor" in keywords

    # Check specification completeness
    for item in results:
        assert "title" in item
        assert "category" in item
        assert "specifications" in item
        assert item["base_price"] > 0
        assert item["quantity"] >= 1


def test_bom_decomposer_quantity_extraction():
    agent = BOMDecomposerAgent()
    prompt = "I need 3 esp32 boards and 2 relays for an automated greenhouse"
    results = agent.decompose(prompt)

    esp_item = next((r for r in results if r["keyword"] == "esp32"), None)
    relay_item = next((r for r in results if r["keyword"] == "relay"), None)

    assert esp_item is not None
    assert esp_item["quantity"] == 3
    assert relay_item is not None
    assert relay_item["quantity"] == 2


if __name__ == "__main__":
    test_bom_decomposer_smart_home()
    test_bom_decomposer_quantity_extraction()
    print("All BOM Decomposer tests passed!")
