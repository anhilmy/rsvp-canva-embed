#!/bin/bash
# ===========================================
# RSVP & Wishes - VPS Deployment Script
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  RSVP & Wishes - Deployment Script${NC}"
echo -e "${GREEN}=========================================${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo -e "${YELLOW}Copy .env.example to .env and configure it first.${NC}"
    exit 1
fi

# Load environment variables
source .env

# Validate required variables
if [ -z "$DOMAIN" ] || [ -z "$ADMIN_PASSWORD" ]; then
    echo -e "${RED}Error: Required environment variables not set!${NC}"
    echo -e "${YELLOW}Please set DOMAIN and ADMIN_PASSWORD in .env${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Domain: $DOMAIN${NC}"
echo -e "${YELLOW}API URL: $ADMIN_API_URL${NC}\n"

# Function to initialize SSL
init_ssl() {
    echo -e "${YELLOW}Initializing SSL certificates...${NC}"
    
    # Create required directories
    mkdir -p certbot/conf certbot/www
    
    # Start nginx with initial config (HTTP only)
    cp nginx/conf.d/initial.conf nginx/conf.d/active.conf
    docker-compose up -d nginx
    
    sleep 5
    
    # Request certificate
    docker-compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $SSL_EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN
    
    # Switch to SSL config
    echo -e "${YELLOW}Switching to SSL configuration...${NC}"
    
    # Create SSL config from template
    sed "s/\${DOMAIN}/$DOMAIN/g" nginx/conf.d/default.conf > nginx/conf.d/active.conf
    
    # Reload nginx
    docker-compose exec nginx nginx -s reload
    
    echo -e "${GREEN}SSL certificates installed successfully!${NC}"
}

# Function to deploy/update the application
deploy() {
    echo -e "${YELLOW}Building and deploying application...${NC}"
    
    # Pull latest images
    docker-compose pull mongodb
    
    # Build application images
    docker-compose build --no-cache backend admin
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be healthy
    echo -e "${YELLOW}Waiting for services to start...${NC}"
    sleep 10
    
    # Check health
    if curl -s http://localhost/health > /dev/null; then
        echo -e "${GREEN}Deployment successful!${NC}"
        echo -e "${GREEN}Application is running at: https://$DOMAIN${NC}"
    else
        echo -e "${RED}Warning: Health check failed. Check logs with: docker-compose logs${NC}"
    fi
}

# Function to show logs
logs() {
    docker-compose logs -f --tail=100
}

# Function to backup database
backup() {
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).gz"
    echo -e "${YELLOW}Creating database backup: $BACKUP_FILE${NC}"
    docker-compose exec -T mongodb mongodump --archive --gzip --db=rsvp_wishes > "backups/$BACKUP_FILE"
    echo -e "${GREEN}Backup created: backups/$BACKUP_FILE${NC}"
}

# Function to restore database
restore() {
    if [ -z "$1" ]; then
        echo -e "${RED}Usage: ./deploy.sh restore <backup_file>${NC}"
        exit 1
    fi
    echo -e "${YELLOW}Restoring database from: $1${NC}"
    docker-compose exec -T mongodb mongorestore --archive --gzip < "$1"
    echo -e "${GREEN}Database restored successfully!${NC}"
}

# Function to show status
status() {
    echo -e "${YELLOW}Service Status:${NC}"
    docker-compose ps
    echo -e "\n${YELLOW}Resource Usage:${NC}"
    docker stats --no-stream
}

# Function to stop services
stop() {
    echo -e "${YELLOW}Stopping services...${NC}"
    docker-compose down
    echo -e "${GREEN}Services stopped.${NC}"
}

# Function to clean up
cleanup() {
    echo -e "${YELLOW}Cleaning up unused Docker resources...${NC}"
    docker system prune -af
    echo -e "${GREEN}Cleanup complete.${NC}"
}

# Main command handler
case "$1" in
    init-ssl)
        init_ssl
        ;;
    deploy)
        deploy
        ;;
    logs)
        logs
        ;;
    backup)
        mkdir -p backups
        backup
        ;;
    restore)
        restore "$2"
        ;;
    status)
        status
        ;;
    stop)
        stop
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo -e "${YELLOW}Usage: $0 {init-ssl|deploy|logs|backup|restore|status|stop|cleanup}${NC}"
        echo ""
        echo "Commands:"
        echo "  init-ssl  - Initialize SSL certificates with Let's Encrypt"
        echo "  deploy    - Build and deploy the application"
        echo "  logs      - Show application logs"
        echo "  backup    - Create database backup"
        echo "  restore   - Restore database from backup file"
        echo "  status    - Show service status"
        echo "  stop      - Stop all services"
        echo "  cleanup   - Clean up unused Docker resources"
        exit 1
        ;;
esac
