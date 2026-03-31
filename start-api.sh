#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Phone Validator - Starting API & Frontend              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs"

# Check dependencies
echo -e "${BLUE}🔍 Checking dependencies...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.8+${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install Node.js 16+${NC}"
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java not found. Please install Java 8+${NC}"
    exit 1
fi

if ! command -v mvn &> /dev/null; then
    echo -e "${RED}❌ Maven not found. Please install Maven 3.5+${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All dependencies found${NC}"
echo ""

# Check if ports are in use
echo -e "${BLUE}🔍 Checking ports...${NC}"

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

# Check if JAR file exists
if [ ! -f "$PROJECT_ROOT/target/phone-validator-1.0.0.jar" ]; then
    echo -e "${YELLOW}⚠️  JAR file not found. Building...${NC}"
    cd "$PROJECT_ROOT"
    mvn clean package -q
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to build JAR file${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ JAR built successfully${NC}"
    echo ""
fi

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

# Activate virtual environment
echo -e "${BLUE}📦 Activating Python virtual environment...${NC}"
source "$PROJECT_ROOT/venv/bin/activate"

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

echo ""
echo -e "${GREEN}✓ All checks passed${NC}"
echo ""
echo -e "${YELLOW}Starting services...${NC}"
echo ""

# Start API in background
echo -e "${BLUE}🚀 Starting API on port 8000...${NC}"
cd "$PROJECT_ROOT"
source venv/bin/activate
uvicorn api.main:app --host 127.0.0.1 --port 8000 > logs/api.log 2>&1 &
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
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                   ✅ All Services Running!                    ║${NC}"
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