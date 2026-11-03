# NEXUS-FLOW &bull; Autonomous Procurement & Financial Orchestration Platform
### Built for the Global PayPal AI Hackathon 2026

**NEXUS-FLOW** is an AI-powered autonomous procurement and financial orchestration platform that converts complex natural-language purchasing requirements into validated, optimized, multi-vendor, payment-ready procurement plans.

It bridges the gap between buyers and global suppliers with zero generic chatbot gimmicks, zero static mockups, and end-to-end multi-agent orchestration.

---

## 1. Six Core Capabilities

1. **Autonomous Multi-Vendor Product Sourcing:**
   - Decomposes plain-English requirements into technical component graphs.
   - Dual-sourcing mesh: Queries Channel3 structured B2B distributor catalogs with Kernel deep-web crawling fallback.

2. **AI-Powered BOM Generation & Technical Compatibility Validation:**
   - Deterministic verification of electronic logic levels (3.3V vs 5.0V).
   - Bus interconnect validation (I2C collision avoidance, SPI 4-wire bus, GPIO pin loading).
   - Peak current envelope analysis and power supply capacity checking.

3. **Landed-Cost Calculation & Procurement Optimization:**
   - Computes complete purchase breakdown: line totals, consolidated freight shipping, customs duties, and 2.50% platform take-rate.
   - Multi-strategy optimization: **Recommended** (balanced), **Lowest Landed Cost** (bulk consolidation rebates), and **Fast Express Delivery**.
   - Budget ceiling utilization tracking.

4. **Autonomous Product Substitution & Sourcing Recovery:**
   - Automated identification of functional hardware replacements when parts face inventory or lead-time constraints.
   - Comprehensive audit delta reporting specifications and cost difference.

5. **Secure Human-Authorized PayPal Checkout:**
   - APIMatic-certified PayPal Orders v2 integration.
   - Single unified checkout partitioned into multi-vendor purchase units with delayed disbursement (`DELAYED`) for carrier-locked escrow protection.
   - Explicit human buyer authorization required before payment dispatch.
   - Idempotent order capture protection with `PayPal-Request-Id`.

6. **Merchant Control Tower for Procurement Intelligence:**
   - AG Grid-powered operational dashboard.
   - Real-time carrier telematics (FedEx, DHL, UPS, Maersk), supplier intelligence ratings, agent fleet health telemetry, and live payment routing audit trails.

---

## 2. Technology Architecture

```
nexus-flow/
├── backend/
│   ├── agents/
│   │   ├── apimatic_validator.py       # APIMatic OpenAPI schema enforcement
│   │   ├── bom_decomposer.py           # NLP to electrical hardware graph
│   │   ├── channel3_agent.py           # Channel3 B2B distributor catalog agent
│   │   ├── compatibility_validator.py  # Deterministic logic, bus & power audit
│   │   ├── cost_optimizer.py           # Landed-cost & multi-strategy optimization
│   │   ├── kernel_agent.py             # Kernel live web crawling & price discovery
│   │   ├── orchestrator.py             # 8-stage multi-agent SSE orchestrator
│   │   ├── paypal_service.py           # PayPal Orders v2 & OAuth2 service
│   │   ├── split_calculator.py         # Multi-vendor fee & escrow splitter
│   │   └── substitution_engine.py      # Autonomous hardware replacement engine
│   ├── database/
│   │   └── db.py                       # In-memory persistence, users, history, telemetry
│   ├── models/
│   │   ├── auth.py                     # Auth & RBAC schemas
│   │   ├── bom.py                      # BOM, compatibility, substitution & history schemas
│   │   └── telemetry.py                # Telemetry, agent health, and payment models
│   ├── routes/
│   │   ├── auth.py                     # Authentication endpoints
│   │   ├── paypal.py                   # PayPal create-order, capture & webhooks
│   │   ├── procure.py                  # SSE streaming, BOM CRUD, substitute & approve
│   │   └── telemetry.py                # AG Grid feeds & overview KPIs
│   ├── security/
│   │   ├── auth_middleware.py          # Salted PBKDF2-SHA256 & stateless JWT
│   │   ├── headers.py                  # CSP, HSTS, X-Frame-Options security headers
│   │   ├── rate_limiter.py             # Sliding-window IP rate limiter
│   │   └── sanitizer.py                # Input sanitization against XSS
│   ├── config.py                       # Production configuration & environment loader
│   ├── main.py                         # FastAPI async gateway
│   └── requirements.txt                # Python dependencies
├── static/
│   ├── css/
│   │   └── styles.css                  # Premium Obsidian/Walnut/Sage design system
│   ├── js/
│   │   ├── app.js                      # Client controller, SSE receiver, BOM CRUD, PayPal
│   │   └── background.js               # Atmospheric blooms canvas background
│   ├── favicon.svg                     # Protocol branding
│   └── index.html                      # Complete responsive Single Page Application
├── frontend/                           # Next.js 15 React application workspace
│   ├── app/
│   ├── components/
│   └── package.json
├── tests/
│   ├── test_bom_decomposer.py          # BOM decomposition tests
│   ├── test_paypal_service.py          # PayPal & APIMatic tests
│   ├── test_security.py                # PBKDF2, JWT & rate limiter tests
│   ├── test_telemetry.py               # Control Tower & KPI tests
│   └── test_compatibility_and_optimization.py # Electrical validation & substitution tests
├── .env.example                        # Template environment variables
├── run.py                              # Server launcher
├── run_tests.py                        # Complete test runner
└── README.md
```

---

## 3. Design System & Visual Identity

The UI adheres strictly to an enterprise hardware engineering visual discipline:
- **Primary Atmosphere:** 65% Obsidian (`#0B0B0D`), Deep Charcoal (`#121214`), and Graphite (`#191A1B`).
- **Surfaces:** 20% Walnut Brown (`#30251F`) and Warm Brown (`#49372D`).
- **Accents:** 10% Sage Green (`#A3B18A`) for verified states and primary actions, Muted Emerald (`#6F987D`).
- **Highlights:** 5% Electric Cyan (`#63D6D0`) for live telemetry and Soft Amber (`#D6A45D`) for warnings.
- **Dynamic Background:** Slowly moving walnut-brown atmospheric blooms with subtle sage diffusion and cyber-grid.

---

## 4. Setup & Startup Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Modern web browser

### Local Setup
```bash
# 1. Clone or navigate to the workspace
cd nexus-flow

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables (defaults work immediately in offline mock/sandbox mode)
cp .env.example .env
```

### Running the Application
```bash
# Launch the complete unified server
python run.py
```

The gateway will start on **`http://localhost:8000`**:
- **Universal Procurement Workspace:** `http://localhost:8000/`
- **Procurement History:** `http://localhost:8000/history`
- **Merchant Control Tower:** `http://localhost:8000/control-tower`
- **API Documentation (Swagger UI):** `http://localhost:8000/api/docs`
- **System Health Probe:** `http://localhost:8000/health`

---

## 5. Automated Verification & Test Results

Run the full automated test suite covering all 14 unit and integration tests:

```bash
python run_tests.py
```

### Output:
```
[RUNNING] BOM Decomposer Tests...
[PASSED] BOM Decomposer Tests.
[RUNNING] PayPal & APIMatic Contract Tests...
[PASSED] PayPal & APIMatic Contract Tests.
[RUNNING] Security, PBKDF2, JWT & Rate Limiter Tests...
[PASSED] Security Tests.
[RUNNING] Telemetry & KPI Engine Tests...
[PASSED] Telemetry Tests.
[RUNNING] Compatibility, Landed-Cost & Substitution Tests...
[PASSED] Compatibility, Landed-Cost & Substitution Tests.

-----------------------------------------------------
ALL NEXUS-FLOW BACKEND TESTS PASSED SUCCESSFULLY (14/14)
-----------------------------------------------------
```

---

## 6. Integration Operating Modes

| Service | Mode | Behavior |
| :--- | :--- | :--- |
| **PayPal Commerce Platform** | `sandbox` / `mock` | Implements Orders v2 `create_order` and `capture_order` with multi-vendor purchase units. Employs deterministic sandbox token simulation when credentials start with `sandbox_` or are omitted, allowing evaluation without credentials. |
| **APIMatic Contract Validator** | `live` | Validates every generated PayPal Orders v2 payload against schema invariants. |
| **Channel3 Catalog Engine** | `mock_fallback` | Queries live endpoint if key configured; falls back to deterministic multi-distributor hardware catalog. |
| **Kernel Web Crawler** | `mock_fallback` | Crawls spot-market prices if configured; falls back to verified crawler supplier profiles. |
| **Database Persistence** | `in-memory` | Production-ready in-memory database with pre-seeded users, historical BOMs, active orders, and real-time telemetry. |

---

## 7. Security Hardening Summary

- **Authentication:** Salted PBKDF2-HMAC-SHA256 with 100,000 rounds for password storage.
- **Session Tokens:** Cryptographic stateless HMAC-SHA256 JWT tokens.
- **Rate Limiting:** Sliding-window rate limiter per client IP.
- **Security Headers:** Strict Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN.
- **Input Sanitization:** HTML tag stripping and sanitization on all procurement prompts.
- **Idempotency:** Enforced via `PayPal-Request-Id` headers to prevent double-capture attacks.

---

&copy; 2026 Nexus-Flow Autonomous Commerce Protocol. Built for the Global PayPal &amp; AI Hackathon.
