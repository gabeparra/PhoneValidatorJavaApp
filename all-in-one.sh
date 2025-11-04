#!/bin/bash
# Master script for Phone Validator - Setup, Build, and Start Services
# This script automates setup, build, and starts the full-stack application

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Phone Validator - Complete Setup & Start Pipeline         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs"

# ============================================================
# STEP 1: SETUP (Install dependencies)
# ============================================================
echo -e "${BLUE}📋 STEP 1: Setting up environment...${NC}"
echo "=========================================="
echo ""

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo -e "${YELLOW}📦 Java not found. Installing OpenJDK 11...${NC}"
    sudo apt update
    sudo apt install -y openjdk-11-jdk
else
    echo -e "${GREEN}✅ Java is already installed${NC}"
    java -version
fi

echo ""

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo -e "${YELLOW}📦 Maven not found. Installing Maven...${NC}"
    sudo apt install -y maven
else
    echo -e "${GREEN}✅ Maven is already installed${NC}"
    mvn -version
fi

echo ""

# Check other dependencies
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}📦 Python 3 not found. Installing Python 3...${NC}"
    sudo apt update
    PYTHON_VERSION=$(python3 --version | grep -oP '\d+\.\d+')
    sudo apt install -y python3 python3-pip python3-venv python${PYTHON_VERSION}-venv
else
    echo -e "${GREEN}✅ Python 3 is already installed${NC}"
    python3 --version
fi

echo ""

if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}📦 Node.js/npm not found. Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo -e "${GREEN}✅ Node.js is already installed${NC}"
    node --version
    npm --version
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Setup complete!${NC}"
echo "=========================================="
echo ""

# ============================================================
# STEP 2: BUILD (Compile and package)
# ============================================================
echo -e "${BLUE}📋 STEP 2: Building the project...${NC}"
echo "=========================================="
echo ""

cd "$PROJECT_ROOT"

# Clean and build
mvn clean package -q

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    echo ""
    echo "Executable JAR created at:"
    echo "  target/phone-validator-1.0.0.jar"
    echo ""
else
    echo -e "${RED}❌ Build failed. Check the error messages above.${NC}"
    exit 1
fi

echo ""

# ============================================================
# STEP 3: SETUP SERVICES (Python venv & Frontend deps)
# ============================================================
echo -e "${BLUE}📋 STEP 3: Setting up services...${NC}"
echo "=========================================="
echo ""

# Check if venv exists, if not create it
if [ ! -d "$PROJECT_ROOT/venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating...${NC}"
    cd "$PROJECT_ROOT"
    python3 -m venv venv
    source venv/bin/activate
    pip install -q -r api/requirements.txt
    echo -e "${GREEN}✓ Virtual environment created${NC}"
    echo ""
fi

# Check if frontend dependencies are installed
if [ ! -d "$PROJECT_ROOT/my-frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not found. Installing...${NC}"
    cd "$PROJECT_ROOT/my-frontend"
    npm install --silent
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    echo ""
fi

echo -e "${GREEN}✅ Services setup complete!${NC}"
echo ""

# ============================================================
# STEP 4: CHECK PORTS
# ============================================================
echo -e "${BLUE}📋 STEP 4: Checking ports...${NC}"
echo "=========================================="
echo ""

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use${NC}"
    echo -e "${YELLOW}   Kill existing process with: lsof -ti:8000 | xargs kill${NC}"
    exit 1
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use${NC}"
    echo -e "${YELLOW}   Kill existing process with: lsof -ti:3000 | xargs kill${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Ports 8000 and 3000 are available${NC}"
echo ""

# ============================================================
# STEP 5: START SERVICES
# ============================================================
echo -e "${BLUE}📋 STEP 5: Starting services...${NC}"
echo "=========================================="
echo ""

# Activate virtual environment
cd "$PROJECT_ROOT"
source venv/bin/activate

# Start API in background
echo -e "${BLUE}🚀 Starting API on port 8000...${NC}"
uvicorn api.main:app --host 0.0.0.0 --port 8000 > logs/api.log 2>&1 &
API_PID=$!
echo -e "${GREEN}✓ API started (PID: $API_PID)${NC}"

# Give API time to start
sleep 2

# Test API health
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API is responding${NC}"
else
    echo -e "${YELLOW}⚠️  API might still be starting...${NC}"
fi

echo ""

# Start Frontend in background
echo -e "${BLUE}🚀 Starting Frontend on port 3000...${NC}"
cd "$PROJECT_ROOT/my-frontend"
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""

# ============================================================
# COMPLETION
# ============================================================
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ ALL SERVICES RUNNING!                          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📍 Access Points:${NC}"
echo -e "   ${YELLOW}API Backend${NC}      → ${BLUE}http://localhost:8000${NC}"
echo -e "   ${YELLOW}API Docs${NC}         → ${BLUE}http://localhost:8000/docs${NC}"
echo -e "   ${YELLOW}Frontend${NC}         → ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo -e "   API logs     → ${YELLOW}$PROJECT_ROOT/logs/api.log${NC}"
echo -e "   Frontend logs → ${YELLOW}$PROJECT_ROOT/logs/frontend.log${NC}"
echo ""
echo -e "${BLUE}🛑 To stop services:${NC}"
echo -e "   ${YELLOW}kill $API_PID${NC}       (stop API)"
echo -e "   ${YELLOW}kill $FRONTEND_PID${NC}   (stop Frontend)"
echo -e "   ${YELLOW}pkill -f 'uvicorn|npm'${NC}  (stop both)"
echo ""
echo -e "${BLUE}Press Ctrl+C to view logs (services keep running in background)${NC}"
echo ""

# Keep script running and show logs
tail -f logs/api.log logs/frontend.log 2>/dev/null &
TAIL_PID=$!

# Handle Ctrl+C gracefully
trap "echo ''; echo -e '${YELLOW}Services still running in background. Use pkill to stop them.${NC}'; kill $TAIL_PID 2>/dev/null" INT

# Wait for services
wait