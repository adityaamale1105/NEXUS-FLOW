"""
Security Headers Middleware
Implements HSTS, CSP, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy.
PayPal & AI Hackathon 2026
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from backend.config import APP_ENV


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)

        # Content-Security-Policy with PayPal, fonts, and CDN allowances
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com https://www.paypal.com https://www.sandbox.paypal.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com",
            "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
            "img-src 'self' data: https://* https://www.paypalobjects.com",
            "connect-src 'self' https://api-m.sandbox.paypal.com https://api.channel3.io https://api.kernel.sh wss: ws:",
            "frame-src 'self' https://www.sandbox.paypal.com https://www.paypal.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]
        response.headers["Content-Security-Policy"] = "; ".join(csp_directives)

        # Strict Transport Security (HSTS)
        if APP_ENV == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Clickjacking defense
        response.headers["X-Frame-Options"] = "SAMEORIGIN"

        # Cross-Site Scripting protection
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions Policy
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=(self 'https://www.paypal.com' 'https://www.sandbox.paypal.com')"

        # Rate limit headers if present in request state
        if hasattr(request.state, "rate_limit_limit"):
            response.headers["X-RateLimit-Limit"] = str(request.state.rate_limit_limit)
            response.headers["X-RateLimit-Remaining"] = str(request.state.rate_limit_remaining)
            response.headers["X-RateLimit-Reset"] = str(request.state.rate_limit_reset)

        return response
