#!/bin/bash
# ===========================================
# RSVP & Wishes - Cloudflare Tunnel Deployment
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  RSVP & Wishes - Cloudflare Deployment${NC}"
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
if [ -z "$CLOUDFLARE_TUNNEL_TOKEN" ] || [ "$CLOUDFLARE_TUNNEL_TOKEN" = "your-tunnel-token-here" ]; then
    echo -e "${RED}Error: CLOUDFLARE_TUNNEL_TOKEN not set!${NC}"
    echo -e "${YELLOW}Get your tunnel token from Cloudflare Dashboard.${NC}"
    exit 1
fi

if [ -z "$ADMIN_PASSWORD" ] || [ "$ADMIN_PASSWORD" = "your-secure-password-here" ]; then
    echo -e "${RED}Error: ADMIN_PASSWORD not set!${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Domain: $DOMAIN${NC}"
echo -e "${YELLOW}API URL: $ADMIN_API_URL${NC}\n"

# Function to deploy
deploy() {
    echo -e "${YELLOW}Building and deploying application...${NC}"
    
    # Build application images
    docker-compose build --no-cache backend admin
    
    # Start services
    docker-compose up -d
    
    # Wait for services to start
    echo -e "${YELLOW}Waiting for services to start...${NC}"
    sleep 10
    
    # Check if cloudflared is running
    if docker-compose ps | grep -q "rsvp-cloudflared.*Up"; then
        echo -e "${GREEN}Deployment successful!${NC}"
        echo -e "${GREEN}Application is running at: https://$DOMAIN${NC}"
        echo -e "${GREEN}Admin dashboard: https://$DOMAIN/admin${NC}"
    else
        echo -e "${RED}Warning: Cloudflared container may not be running properly.${NC}"
        echo -e "${YELLOW}Check logs with: docker-compose logs cloudflared${NC}"
    fi
}

# Function to show logs
logs() {
    docker-compose logs -f --tail=100 "$@"
}

# Function to backup database
backup() {
    mkdir -p backups
    BACKUP_FILE="backups/backup_$(date +%Y%m%d_%H%M%S).gz"
    echo -e "${YELLOW}Creating database backup: $BACKUP_FILE${NC}"
    docker-compose exec -T mongodb mongodump --archive --gzip --db=rsvp_wishes > "$BACKUP_FILE"
    echo -e "${GREEN}Backup created: $BACKUP_FILE${NC}"
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
    echo -e "\n${YELLOW}Cloudflared Status:${NC}"
    docker-compose logs --tail=10 cloudflared
}

# Function to stop services
stop() {
    echo -e "${YELLOW}Stopping services...${NC}"
    docker-compose down
    echo -e "${GREEN}Services stopped.${NC}"
}

# Function to restart services
restart() {
    echo -e "${YELLOW}Restarting services...${NC}"
    docker-compose restart
    echo -e "${GREEN}Services restarted.${NC}"
}

# Function to update
update() {
    echo -e "${YELLOW}Pulling latest changes...${NC}"
    git pull
    deploy
}

# Function to clean up
cleanup() {
    echo -e "${YELLOW}Cleaning up unused Docker resources...${NC}"
    docker system prune -af
    echo -e "${GREEN}Cleanup complete.${NC}"
}

# Main command handler
case "$1" in
    deploy)
        deploy
        ;;
    logs)
        shift
        logs "$@"
        ;;
    backup)
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
    restart)
        restart
        ;;
    update)
        update
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo -e "${YELLOW}Usage: $0 {deploy|logs|backup|restore|status|stop|restart|update|cleanup}${NC}"
        echo ""
        echo "Commands:"
        echo "  deploy    - Build and deploy the application"
        echo "  logs      - Show application logs (optional: service name)"
        echo "  backup    - Create database backup"
        echo "  restore   - Restore database from backup file"
        echo "  status    - Show service status"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  update    - Pull latest code and redeploy"
        echo "  cleanup   - Clean up unused Docker resources"
        exit 1
        ;;
esac
