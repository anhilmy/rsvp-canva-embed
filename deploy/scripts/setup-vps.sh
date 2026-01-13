#!/bin/bash
# ===========================================
# VPS Initial Setup Script
# Run this on a fresh Ubuntu/Debian VPS
# ===========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  VPS Initial Setup Script${NC}"
echo -e "${GREEN}=========================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo)${NC}"
    exit 1
fi

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Install required packages
echo -e "${YELLOW}Installing required packages...${NC}"
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    fail2ban

# Install Docker
echo -e "${YELLOW}Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # Add current user to docker group
    usermod -aG docker $SUDO_USER
else
    echo -e "${GREEN}Docker already installed.${NC}"
fi

# Install Docker Compose
echo -e "${YELLOW}Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo -e "${GREEN}Docker Compose already installed.${NC}"
fi

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Configure fail2ban
echo -e "${YELLOW}Configuring fail2ban...${NC}"
systemctl enable fail2ban
systemctl start fail2ban

# Create application directory
APP_DIR="/opt/rsvp-wishes"
echo -e "${YELLOW}Creating application directory: $APP_DIR${NC}"
mkdir -p $APP_DIR
chown $SUDO_USER:$SUDO_USER $APP_DIR

# Enable Docker to start on boot
systemctl enable docker

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  VPS Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Clone your repository to $APP_DIR"
echo "2. cd $APP_DIR/deploy"
echo "3. cp .env.example .env"
echo "4. Edit .env with your domain and settings"
echo "5. ./scripts/deploy.sh init-ssl"
echo "6. ./scripts/deploy.sh deploy"
echo ""
echo -e "${YELLOW}Note: You may need to log out and back in for Docker permissions to take effect.${NC}"
