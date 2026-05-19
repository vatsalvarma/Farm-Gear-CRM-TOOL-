#!/bin/bash

# Farm Gear Connect - Setup Verification Script
# This script verifies that all components are properly connected

echo "🔍 Farm Gear Connect - Connection Verification"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    local service_name=$1
    local url=$2
    local expected=$3
    
    echo -n "Checking $service_name... "
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
        if [ "$response" = "$expected" ]; then
            echo -e "${GREEN}✓ Running${NC}"
            return 0
        else
            echo -e "${RED}✗ Not responding (HTTP $response)${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ curl not found, skipping${NC}"
        return 2
    fi
}

# Function to check if a port is listening
check_port() {
    local service_name=$1
    local port=$2
    
    echo -n "Checking $service_name on port $port... "
    
    if command -v netstat &> /dev/null; then
        if netstat -an | grep -q ":$port.*LISTEN"; then
            echo -e "${GREEN}✓ Listening${NC}"
            return 0
        else
            echo -e "${RED}✗ Not listening${NC}"
            return 1
        fi
    elif command -v lsof &> /dev/null; then
        if lsof -i ":$port" &> /dev/null; then
            echo -e "${GREEN}✓ Listening${NC}"
            return 0
        else
            echo -e "${RED}✗ Not listening${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ Cannot check (netstat/lsof not found)${NC}"
        return 2
    fi
}

# Check MySQL
echo "1. Database (MySQL)"
echo "-------------------"
check_port "MySQL" 3306

if command -v mysql &> /dev/null; then
    echo -n "Testing MySQL connection... "
    if mysql -u farmgear -pfarmgear1234 -e "USE farmgearconnect; SELECT 1;" &> /dev/null; then
        echo -e "${GREEN}✓ Connected${NC}"
        
        echo -n "Checking tables... "
        table_count=$(mysql -u farmgear -pfarmgear1234 farmgearconnect -sN -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'farmgearconnect';")
        if [ "$table_count" -gt 0 ]; then
            echo -e "${GREEN}✓ $table_count tables found${NC}"
        else
            echo -e "${RED}✗ No tables found${NC}"
        fi
    else
        echo -e "${RED}✗ Connection failed${NC}"
        echo "  Try: mysql -u farmgear -p farmgearconnect"
    fi
else
    echo -e "${YELLOW}⚠ MySQL client not found${NC}"
fi
echo ""

# Check Backend
echo "2. Backend API (Spring Boot)"
echo "----------------------------"
check_port "Backend" 8080
check_service "Health endpoint" "http://localhost:8080/api/actuator/health" "200"
check_service "API docs" "http://localhost:8080/api/swagger-ui.html" "200"
echo ""

# Check Frontend
echo "3. Frontend (Next.js)"
echo "---------------------"
check_port "Frontend" 3000
check_service "Frontend app" "http://localhost:3000" "200"
echo ""

# Check Redis (optional)
echo "4. Redis Cache (Optional)"
echo "-------------------------"
check_port "Redis" 6379

if command -v redis-cli &> /dev/null; then
    echo -n "Testing Redis connection... "
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓ Connected${NC}"
    else
        echo -e "${YELLOW}⚠ Not running (optional)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Redis client not found${NC}"
fi
echo ""

# Check MinIO (optional)
echo "5. MinIO Storage (Optional)"
echo "---------------------------"
check_port "MinIO API" 9000
check_port "MinIO Console" 9001
check_service "MinIO health" "http://localhost:9000/minio/health/live" "200"
echo ""

# Test API endpoint
echo "6. API Connection Test"
echo "----------------------"
echo -n "Testing auth endpoint... "
if command -v curl &> /dev/null; then
    response=$(curl -s -X POST http://localhost:8080/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"test"}' 2>/dev/null)
    
    if [ -n "$response" ]; then
        echo -e "${GREEN}✓ Responding${NC}"
        echo "  Response: ${response:0:100}..."
    else
        echo -e "${RED}✗ No response${NC}"
    fi
else
    echo -e "${YELLOW}⚠ curl not found${NC}"
fi
echo ""

# Check environment files
echo "7. Configuration Files"
echo "----------------------"
files=(".env" "frontend/.env.local" "backend/src/main/resources/application.yml")
for file in "${files[@]}"; do
    echo -n "Checking $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ Exists${NC}"
    else
        echo -e "${YELLOW}⚠ Not found${NC}"
    fi
done
echo ""

# Summary
echo "=============================================="
echo "📋 Summary"
echo "=============================================="
echo ""
echo "Required Services:"
echo "  • MySQL Database    - Check port 3306"
echo "  • Backend API       - Check http://localhost:8080/api"
echo "  • Frontend App      - Check http://localhost:3000"
echo ""
echo "Optional Services:"
echo "  • Redis Cache       - Check port 6379"
echo "  • MinIO Storage     - Check http://localhost:9000"
echo ""
echo "Next Steps:"
echo "  1. If any service is not running, start it"
echo "  2. Check logs for errors"
echo "  3. Visit http://localhost:3000 to test the app"
echo "  4. Visit http://localhost:8080/api/swagger-ui.html for API docs"
echo ""
echo "Quick Start Commands:"
echo "  • Start with Docker: docker-compose up -d"
echo "  • Start backend: cd backend && mvn spring-boot:run"
echo "  • Start frontend: cd frontend && npm run dev"
echo ""
