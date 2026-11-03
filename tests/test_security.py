"""
Unit Tests for Security, Cryptography, Rate Limiting & Input Sanitization
PayPal & AI Hackathon 2026
"""

from backend.security.auth_middleware import hash_password, verify_password, create_jwt_token, decode_jwt_token
from backend.security.sanitizer import sanitize_text
from backend.security.rate_limiter import SlidingWindowRateLimiter


def test_password_hashing():
    pwd = "EnterprisePassword2026!Secret"
    hashed = hash_password(pwd)
    assert hashed.startswith("pbkdf2_sha256$100000$")
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_flow():
    payload = {"sub": "usr_9981", "role": "merchant", "email": "supplier@nexusflow.network"}
    token = create_jwt_token(payload, expires_delta_seconds=60)
    decoded = decode_jwt_token(token)
    assert decoded["sub"] == "usr_9981"
    assert decoded["role"] == "merchant"
    assert decoded["email"] == "supplier@nexusflow.network"


def test_input_sanitizer():
    dangerous_input = "<script>alert('xss')</script>Build ESP32 kit; DROP TABLE users; --"
    sanitized = sanitize_text(dangerous_input)
    assert "<script>" not in sanitized
    assert "alert" not in sanitized
    assert "DROP TABLE" not in sanitized
    assert "Build ESP32 kit" in sanitized


def test_rate_limiter():
    limiter = SlidingWindowRateLimiter(limit_per_minute=5)
    ip = "192.168.1.100"

    for _ in range(5):
        allowed, remaining, _ = limiter.is_allowed(ip)
        assert allowed is True

    # 6th request should be blocked
    allowed, remaining, reset_sec = limiter.is_allowed(ip)
    assert allowed is False
    assert remaining == 0
    assert reset_sec > 0


if __name__ == "__main__":
    test_password_hashing()
    test_jwt_token_flow()
    test_input_sanitizer()
    test_rate_limiter()
    print("All Security tests passed!")
