# Production Deployment Guide

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Tunnel                        │
│                  (SSL termination)                          │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼ :80
┌─────────────────────────────────────────────────────────────┐
│                        nginx                                │
│                   (reverse proxy)                           │
│  /api/* → backend:3001                                      │
│  /admin/* → admin:80                                        │
│  /* → canva-app:80                                          │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│   backend   │     │    admin    │     │     canva-app       │
│   :3001     │     │    :80      │     │       :80           │
│  (Express)  │     │  (React)    │     │    (Canva UI)       │
└──────┬──────┘     └─────────────┘     └─────────────────────┘
       │
       ▼
┌─────────────┐
│   mongodb   │
│   :27017    │
└─────────────┘
```

## Prerequisites

1. Docker & Docker Compose installed
2. Cloudflare Tunnel configured (for SSL)

## Deployment Steps

### 1. Configure Environment

```bash
# Copy and edit the production env file
cp .env.production .env.prod

# Edit the values
nano .env.prod
```

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DOMAIN` | Your domain | `rsvp.example.com` |
| `CANVA_BACKEND_HOST` | Full backend URL | `https://rsvp.example.com` |
| `ADMIN_API_URL` | Admin API path | `/api` |
| `CORS_ORIGINS` | Allowed origins | `https://rsvp.example.com,https://*.canva-apps.com` |
| `ADMIN_PASSWORD` | Admin login password | `your-secure-password` |

### 2. Build and Start

```bash
# Build and start all services
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### 3. Configure Cloudflare Tunnel

Point your Cloudflare Tunnel to `http://localhost:80`

## URLs

| Service | URL |
|---------|-----|
| Canva App | `https://your-domain.com/` |
| Admin Dashboard | `https://your-domain.com/admin` |
| API | `https://your-domain.com/api` |
| Health Check | `https://your-domain.com/health` |

## Common Commands

```bash
# Restart all services
docker compose -f docker-compose.prod.yml restart

# Rebuild and restart specific service
docker compose -f docker-compose.prod.yml up -d --build backend

# View logs for specific service
docker compose -f docker-compose.prod.yml logs -f backend

# Stop all services
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: deletes data)
docker compose -f docker-compose.prod.yml down -v
```

## Backup MongoDB

```bash
# Create backup
docker exec rsvp-mongodb mongodump --out /data/backup

# Copy backup to host
docker cp rsvp-mongodb:/data/backup ./backup-$(date +%Y%m%d)
```
