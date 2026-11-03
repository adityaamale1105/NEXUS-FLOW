# Custom Domain & Production SSL Setup Guide
**Nexus-Flow Autonomous Commerce Protocol** &bull; PayPal & AI Hackathon 2026

This guide details configuring your custom domain (`nexusflow.network`, `nexusflow.commerce`, or your enterprise organization domain) to route to the Nexus-Flow backend and frontend.

---

## 1. DNS Record Configuration

Configure your domain registrar (Cloudflare, Route53, Namecheap, Google Domains) with the following records:

| Record Type | Name / Host | Target / Value | TTL | Proxy Status | Purpose |
|---|---|---|---|---|---|
| **A** | `@` (apex) | `YOUR_SERVER_IPV4` | Auto / 300 | Proxied (Orange Cloud) | Primary platform gateway |
| **CNAME** | `www` | `nexusflow.network` | Auto / 300 | Proxied | Standard web alias |
| **CNAME** | `api` | `nexusflow.network` | Auto / 300 | Proxied | Dedicated API endpoint |
| **TXT** | `_paypal-verification` | `paypal-verification-token-2026` | 3600 | DNS Only | PayPal Commerce domain verification |

---

## 2. TLS/SSL Certificate Provisioning (Let's Encrypt / Certbot)

Run Certbot with the Nginx plugin on your production Linux host:

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Issue certificate for apex, www, and api subdomains
sudo certbot --nginx -d nexusflow.network -d www.nexusflow.network -d api.nexusflow.network
```

Certbot automatically configures automatic renewals via `cron` or systemd timers. Test renewal with:
```bash
sudo certbot renew --dry-run
```

---

## 3. Nginx Reverse Proxy Deployment

1. Copy the included `nginx.conf` file:
   ```bash
   sudo cp custom-domain-config/nginx.conf /etc/nginx/sites-available/nexusflow.conf
   sudo ln -s /etc/nginx/sites-available/nexusflow.conf /etc/nginx/sites-enabled/
   ```

2. Validate syntax:
   ```bash
   sudo nginx -t
   ```

3. Reload Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

---

## 4. Environment Variables Update

Update your production `.env` file to reflect your custom domain:

```env
APP_ENV=production
DEBUG=false
BASE_URL=https://api.nexusflow.network
FRONTEND_URL=https://nexusflow.network
ALLOWED_CORS_ORIGINS=https://nexusflow.network,https://www.nexusflow.network,https://api.nexusflow.network
```

Restart the FastAPI service:
```bash
sudo systemctl restart nexusflow
```

---

## 5. PayPal Developer Dashboard Domain Whitelisting

1. Log into [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
2. Select your registered App under **My Apps & Credentials**.
3. Under **App Settings** &rarr; **Return URL**, add:
   - `https://nexusflow.network/?order_status=success`
4. Under **Cancel URL**, add:
   - `https://nexusflow.network/?order_status=cancelled`
5. Save settings.
