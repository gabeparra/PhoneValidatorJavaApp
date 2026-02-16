#!/bin/bash
# Setup script for Redis server (required for queue system)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Redis Setup for Phone Validator Queue                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Redis is already installed
if command -v redis-server &> /dev/null; then
    echo -e "${GREEN}✓ Redis is already installed${NC}"
    redis-server --version
else
    echo -e "${YELLOW}📦 Installing Redis...${NC}"
    sudo apt update
    sudo apt install -y redis-server
    echo -e "${GREEN}✓ Redis installed${NC}"
fi

echo ""

# Check if Redis is running
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${YELLOW}⚠️  Redis is not running. Starting Redis...${NC}"
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    echo -e "${GREEN}✓ Redis started and enabled on boot${NC}"
fi

echo ""
echo -e "${BLUE}Testing Redis connection...${NC}"
if redis-cli ping | grep -q "PONG"; then
    echo -e "${GREEN}✓ Redis connection successful${NC}"
else
    echo -e "${RED}❌ Redis connection failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                   ✅ Redis Setup Complete!                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Install Python dependencies: ${YELLOW}pip install -r api/requirements.txt${NC}"
echo -e "2. Restart PM2 services: ${YELLOW}pm2 restart all${NC}"
echo ""

