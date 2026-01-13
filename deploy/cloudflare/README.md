# RSVP & Wishes - Cloudflare Tunnel Deployment

Simplified deployment using Cloudflare Tunnel (cloudflared). No need to manage SSL certificates or open firewall ports.

## Prerequisites

- Docker & Docker Compose installed
- Cloudflare account with a domain
- Cloudflare Tunnel already created

## Cloudflare Tunnel Setup

### 1. Create Tunnel in Cloudflare Dashboard

1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com/)
2. Navigate to **Access** → **Tunnels**
3. Click **Create a tunnel**
4. Name your tunnel (e.g., `rsvp-wishes`)
5. Copy the **Tunnel Token** (you'll need this for `.env`)

### 2. Configure Public Hostname

In the tunnel configuration, add a public hostname:

| Setting | Value |
|---------|-------|
| Subdomain | `rsvp` (or your choice) |
| Domain | `yourdomain.com` |
| Type | `HTTP` |
| URL | `nginx:80` |

This routes `rsvp.yourdomain.com` → your nginx container.

## Deployment

### 1. Clone & Configure

```bash
# Clone repository
git clone <your-repo> rsvp-wishes
cd rsvp-wishes/deploy/cloudflare

# Configure environment
cp .env.example .env
nano .env
```

### 2. Set Environment Variables

```env
DOMAIN=rsvp.yourdomain.com
ADMIN_API_URL=https://rsvp.yourdomain.com/api
CORS_ORIGINS=https://rsvp.yourdomain.com,https://*.canva-apps.com,https://*.canva.site
ADMIN_PASSWORD=your-secure-password
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoiNjk...  # From Cloudflare Dashboard
```

### 3. Deploy

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh deploy
```

## Commands

```bash
# Deploy/Update
./scripts/deploy.sh deploy

# View logs
./scripts/deploy.sh logs
./scripts/deploy.sh logs backend    # Specific service
./scripts/deploy.sh logs cloudflared

# Check status
./scripts/deploy.sh status

# Database backup
./scripts/deploy.sh backup

# Restore backup
./scripts/deploy.sh restore backups/backup_file.gz

# Stop services
./scripts/deploy.sh stop

# Restart services
./scripts/deploy.sh restart

# Update (git pull + redeploy)
./scripts/deploy.sh update

# Cleanup Docker
./scripts/deploy.sh cleanup
```

## Architecture

```
                    ┌─────────────────────┐
                    │     Cloudflare      │
                    │   (SSL + CDN + WAF) │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    cloudflared      │
                    │   (Tunnel Client)   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │       Nginx         │
                    │  (Reverse Proxy)    │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     │
┌─────────────────┐  ┌─────────────────┐            │
│  Backend API    │  │ Admin Dashboard │            │
│   (Node.js)     │  │    (React)      │            │
│   Port 3001     │  │    Port 80      │            │
└────────┬────────┘  └─────────────────┘            │
         │                                          │
         ▼                                          │
┌─────────────────┐                                 │
│    MongoDB      │                                 │
│   Port 27017    │                                 │
└─────────────────┘                                 │
```

## URL Paths

| Path | Service | Description |
|------|---------|-------------|
| `https://rsvp.yourdomain.com/api/*` | Backend | REST API |
| `https://rsvp.yourdomain.com/admin` | Admin App | Dashboard |
| `https://rsvp.yourdomain.com/health` | Backend | Health check |

## Benefits of Cloudflare Tunnel

✅ **No SSL Management** - Cloudflare handles certificates  
✅ **No Port Forwarding** - Works behind NAT/firewall  
✅ **DDoS Protection** - Cloudflare's built-in protection  
✅ **WAF** - Web Application Firewall included  
✅ **CDN** - Static assets cached at edge  
✅ **Analytics** - Traffic insights in Cloudflare dashboard  

## Cloudflare Settings (Recommended)

In Cloudflare Dashboard for your domain:

### SSL/TLS
- **Encryption mode**: Full (strict)
- **Always Use HTTPS**: On

### Security
- **Security Level**: Medium
- **Challenge Passage**: 30 minutes
- **Bot Fight Mode**: On

### Speed
- **Auto Minify**: JS, CSS, HTML
- **Brotli**: On

## Troubleshooting

### Tunnel Not Connecting

```bash
# Check cloudflared logs
./scripts/deploy.sh logs cloudflared

# Verify token is correct
echo $CLOUDFLARE_TUNNEL_TOKEN
```

### 502 Bad Gateway

```bash
# Check if backend is running
./scripts/deploy.sh status

# Check backend logs
./scripts/deploy.sh logs backend
```

### CORS Issues

Make sure `CORS_ORIGINS` in `.env` includes your domain:
```env
CORS_ORIGINS=https://rsvp.yourdomain.com,https://*.canva-apps.com,https://*.canva.site
```

### Database Connection Issues

```bash
# Check MongoDB status
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# View MongoDB logs
./scripts/deploy.sh logs mongodb
```

## Updating Canva App

After deployment, update your Canva app configuration:

1. In Canva Developer Portal, update backend URL to: `https://rsvp.yourdomain.com`
2. Update your `.env` file:
   ```env
   CANVA_BACKEND_HOST=https://rsvp.yourdomain.com
   ```

## Security Notes

1. **Change the admin password** - Don't use the default
2. **Keep tunnel token secret** - Never commit to git
3. **Enable Cloudflare Access** (optional) - Add authentication to `/admin`
4. **Regular backups** - Use `./scripts/deploy.sh backup`
