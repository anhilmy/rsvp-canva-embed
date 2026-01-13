# RSVP & Wishes - VPS Deployment Guide

Complete guide for deploying the RSVP & Wishes application to a VPS.

## Prerequisites

- A VPS with Ubuntu 20.04+ or Debian 11+
- A domain name pointing to your VPS IP
- SSH access to your VPS

## Quick Start

### 1. VPS Initial Setup

SSH into your VPS and run the setup script:

```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/your-repo/main/deploy/scripts/setup-vps.sh | sudo bash
```

Or manually:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo bash
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for Docker group to take effect
```

### 2. Clone Repository

```bash
cd /opt
sudo mkdir rsvp-wishes && sudo chown $USER:$USER rsvp-wishes
git clone https://github.com/your-repo/rsvp-wishes.git rsvp-wishes
cd rsvp-wishes/deploy
```

### 3. Configure Environment

```bash
cp .env.example .env
nano .env
```

Edit the following values:

```env
DOMAIN=rsvp.yourdomain.com
ADMIN_API_URL=https://rsvp.yourdomain.com/api
CORS_ORIGINS=https://rsvp.yourdomain.com,https://*.canva-apps.com,https://*.canva.site
ADMIN_PASSWORD=your-secure-password
SSL_EMAIL=your-email@example.com
```

### 4. Initialize SSL

```bash
chmod +x scripts/*.sh
./scripts/deploy.sh init-ssl
```

### 5. Deploy Application

```bash
./scripts/deploy.sh deploy
```

## Domain Setup

### DNS Configuration

Add these DNS records:

| Type | Name | Value |
|------|------|-------|
| A | rsvp | Your VPS IP |
| A | www.rsvp | Your VPS IP |

### Canva App Configuration

Update your Canva app's backend URL to:
```
https://rsvp.yourdomain.com
```

## Deployment Commands

```bash
# Deploy/Update application
./scripts/deploy.sh deploy

# View logs
./scripts/deploy.sh logs

# Check status
./scripts/deploy.sh status

# Create database backup
./scripts/deploy.sh backup

# Restore from backup
./scripts/deploy.sh restore backups/backup_file.gz

# Stop services
./scripts/deploy.sh stop

# Clean up Docker resources
./scripts/deploy.sh cleanup
```

## Architecture

```
                    ┌─────────────────────┐
                    │     Internet        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Nginx (443/80)   │
                    │   SSL Termination   │
                    │   Rate Limiting     │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Backend API    │  │ Admin Dashboard │  │    Certbot      │
│   (Node.js)     │  │    (React)      │  │  (SSL Renewal)  │
│   Port 3001     │  │    Port 80      │  │                 │
└────────┬────────┘  └─────────────────┘  └─────────────────┘
         │
         ▼
┌─────────────────┐
│    MongoDB      │
│   Port 27017    │
└─────────────────┘
```

## URL Paths

| Path | Service | Description |
|------|---------|-------------|
| `/api/*` | Backend | REST API endpoints |
| `/admin/*` | Admin App | Admin dashboard |
| `/health` | Backend | Health check endpoint |

## Security Considerations

### Firewall Rules

The setup script configures UFW with:
- SSH (22) - Open
- HTTP (80) - Open (redirects to HTTPS)
- HTTPS (443) - Open

### Rate Limiting

- API endpoints: 10 requests/second per IP
- General endpoints: 30 requests/second per IP

### Fail2ban

Automatically bans IPs with too many failed SSH attempts.

## Maintenance

### SSL Certificate Renewal

Certbot automatically renews certificates. Check status:

```bash
docker-compose exec certbot certbot certificates
```

### Database Backups

Automated backups (recommended):

```bash
# Add to crontab
0 2 * * * /opt/rsvp-wishes/deploy/scripts/deploy.sh backup
```

### Monitoring

View container health:

```bash
docker-compose ps
docker stats
```

### Updating the Application

```bash
cd /opt/rsvp-wishes
git pull
cd deploy
./scripts/deploy.sh deploy
```

## Troubleshooting

### Check Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f nginx
```

### Restart Services

```bash
docker-compose restart backend
docker-compose restart nginx
```

### SSL Issues

```bash
# Force SSL renewal
docker-compose run --rm certbot renew --force-renewal

# Check certificate
docker-compose exec certbot certbot certificates
```

### Database Issues

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh rsvp_wishes

# Check database size
docker-compose exec mongodb mongosh --eval "db.stats()"
```

### Container Issues

```bash
# Rebuild containers
docker-compose build --no-cache

# Remove all containers and start fresh
docker-compose down -v
docker-compose up -d
```

## Scaling (Future)

For high traffic, consider:

1. **MongoDB Replica Set** - For database redundancy
2. **Redis** - For session/cache storage
3. **Load Balancer** - Multiple backend instances
4. **CDN** - For static assets

## Support

For issues, check:
1. Docker logs: `./scripts/deploy.sh logs`
2. System resources: `htop`, `df -h`
3. Network: `curl -I https://yourdomain.com/health`
