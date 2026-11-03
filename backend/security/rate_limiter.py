"""
In-Memory Sliding-Window Rate Limiter
Prevents DoS, prompt stuffing, and endpoint scraping attacks.
PayPal & AI Hackathon 2026
"""

import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Request, HTTPException, status
from backend.config import RATE_LIMIT_PER_MINUTE


class SlidingWindowRateLimiter:
    def __init__(self, limit_per_minute: int = RATE_LIMIT_PER_MINUTE):
        self.limit = limit_per_minute
        self.window_seconds = 60
        # mapping: ip_address -> list of timestamps
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, client_ip: str) -> tuple[bool, int, int]:
        """
        Returns (is_allowed, remaining_quota, reset_seconds)
        """
        now = time.time()
        window_start = now - self.window_seconds

        # Evict timestamps older than 60 seconds
        self.requests[client_ip] = [ts for ts in self.requests[client_ip] if ts > window_start]

        count = len(self.requests[client_ip])
        if count >= self.limit:
            oldest = self.requests[client_ip][0] if self.requests[client_ip] else window_start
            reset_seconds = max(1, int(oldest + self.window_seconds - now))
            return False, 0, reset_seconds

        self.requests[client_ip].append(now)
        remaining = self.limit - (count + 1)
        return True, remaining, self.window_seconds


rate_limiter = SlidingWindowRateLimiter()


async def check_rate_limit(request: Request):
    """FastAPI dependency to enforce IP rate limits."""
    # Check headers for reverse proxy (X-Forwarded-For, CF-Connecting-IP)
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "127.0.0.1"

    allowed, remaining, reset_time = rate_limiter.is_allowed(client_ip)

    # Attach quota info to request state
    request.state.rate_limit_limit = rate_limiter.limit
    request.state.rate_limit_remaining = remaining
    request.state.rate_limit_reset = reset_time

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {rate_limiter.limit} requests per minute. Retry after {reset_time} seconds.",
            headers={
                "Retry-After": str(reset_time),
                "X-RateLimit-Limit": str(rate_limiter.limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time),
            }
        )
