"""
Input Sanitization and Injection Defense
PayPal & AI Hackathon 2026
"""

import re
import html

# Disallow control characters and known injection patterns
DANGEROUS_PATTERNS = [
    re.compile(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", re.IGNORECASE | re.DOTALL),
    re.compile(r"<\s*script[^>]*>", re.IGNORECASE),
    re.compile(r"javascript:", re.IGNORECASE),
    re.compile(r"on\w+\s*=", re.IGNORECASE),
    re.compile(r"alert\s*\(.*?\)", re.IGNORECASE),
    re.compile(r"(--|;|union\s+select|insert\s+into|drop\s+table)", re.IGNORECASE),
]


def sanitize_text(value: str) -> str:
    """Sanitizes text inputs, stripping harmful characters while preserving meaningful technical specs."""
    if not value:
        return ""
    
    # Strip null bytes and control chars (except newline and tab)
    cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", value)
    
    # Strip dangerous script triggers
    for pattern in DANGEROUS_PATTERNS:
        cleaned = pattern.sub("", cleaned)
    
    # Escape HTML to prevent XSS
    return html.escape(cleaned.strip())
