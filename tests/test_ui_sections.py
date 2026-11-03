import unittest
import os

class TestUISections(unittest.TestCase):
    def test_single_continuous_scroll_sections(self):
        index_path = os.path.join(os.path.dirname(__file__), "..", "static", "index.html")
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()

        sections = [
            "hero",
            "how-it-works",
            "terminal",
            "bom",
            "intelligence",
            "suppliers",
            "checkout",
            "control-tower",
            "history",
            "footer",
        ]

        indices = []
        for s in sections:
            idx = content.find(f'id="{s}"')
            self.assertGreater(idx, -1, f"Missing section #{s} in index.html")
            indices.append(idx)

        self.assertEqual(indices, sorted(indices), "Sections are not in correct continuous scroll order!")

if __name__ == "__main__":
    unittest.main()
