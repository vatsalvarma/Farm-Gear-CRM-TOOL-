# Farm Gear Connect - Setup Verification Script (PowerShell)
# This script verifies that all components are properly connected

Write-Host "🔍 Farm Gear Connect - Connection Verification" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a service is running
function Test-Service {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Checking $ServiceName... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✓ Running" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ Unexpected status: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "✗ Not responding" -ForegroundColor Red
        return $false
    }
}

# Function to check if a port is listening
function Test-Port {
    param(
        [string]$ServiceName,
        [int]$Port
    )
    
    Write-Host "Checking $ServiceName on port $Port... " -NoNewline
    
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "✓ Listening" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ Not listening" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "✗ Error checking port" -ForegroundColor Red
        return $false
    }
}

# Check MySQL
Write-Host "1. Database (MySQL)" -ForegroundColor Yellow
Write-Host "-------------------"
Test-Port -ServiceName "MySQL" -Port 3306

# Try to test MySQL connection
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
if ($mysqlPath) {
    Write-Host "Testing MySQL connection... " -NoNewline
    try {
        $result = & mysql -u farmgear -pfarmgear1234 -e "USE farmgearconnect; SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Connected" -ForegroundColor Green
            
            Write-Host "Checking tables... " -NoNewline
            $tableCount = & mysql -u farmgear -pfarmgear1234 farmgearconnect -sN -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'farmgearconnect';" 2>&1
            if ($tableCount -gt 0) {
                Write-Host "✓ $tableCount tables found" -ForegroundColor Green
            } else {
                Write-Host "✗ No tables found" -ForegroundColor Red
            }
        } else {
            Write-Host "✗ Connection failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ MySQL client not found in PATH" -ForegroundColor Yellow
}
Write-Host ""

# Check Backend
Write-Host "2. Backend API (Spring Boot)" -ForegroundColor Yellow
Write-Host "----------------------------"
Test-Port -ServiceName "Backend" -Port 8080
Test-Service -ServiceName "Health endpoint" -Url "http://localhost:8080/api/actuator/health"
Test-Service -ServiceName "API docs" -Url "http://localhost:8080/api/swagger-ui.html"
Write-Host ""

# Check Frontend
Write-Host "3. Frontend (Next.js)" -ForegroundColor Yellow
Write-Host "---------------------"
Test-Port -ServiceName "Frontend" -Port 3000
Test-Service -ServiceName "Frontend app" -Url "http://localhost:3000"
Write-Host ""

# Check Redis (optional)
Write-Host "4. Redis Cache (Optional)" -ForegroundColor Yellow
Write-Host "-------------------------"
$redisRunning = Test-Port -ServiceName "Redis" -Port 6379

$redisCliPath = Get-Command redis-cli -ErrorAction SilentlyContinue
if ($redisCliPath -and $redisRunning) {
    Write-Host "Testing Redis connection... " -NoNewline
    try {
        $result = & redis-cli ping 2>&1
        if ($result -eq "PONG") {
            Write-Host "✓ Connected" -ForegroundColor Green
        } else {
            Write-Host "⚠ Not responding" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ Error testing Redis" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ Redis not running (optional)" -ForegroundColor Yellow
}
Write-Host ""

# Check MinIO (optional)
Write-Host "5. MinIO Storage (Optional)" -ForegroundColor Yellow
Write-Host "---------------------------"
Test-Port -ServiceName "MinIO API" -Port 9000
Test-Port -ServiceName "MinIO Console" -Port 9001
Test-Service -ServiceName "MinIO health" -Url "http://localhost:9000/minio/health/live"
Write-Host ""

# Test API endpoint
Write-Host "6. API Connection Test" -ForegroundColor Yellow
Write-Host "----------------------"
Write-Host "Testing auth endpoint... " -NoNewline
try {
    $body = @{
        email = "test@test.com"
        password = "test"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `
        -Method Post `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 5 `
        -UseBasicParsing `
        -ErrorAction Stop

    Write-Host "✓ Responding" -ForegroundColor Green
    $responseText = $response.Content.Substring(0, [Math]::Min(100, $response.Content.Length))
    Write-Host "  Response: $responseText..." -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✓ Responding (expected auth error)" -ForegroundColor Green
    } else {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Check environment files
Write-Host "7. Configuration Files" -ForegroundColor Yellow
Write-Host "----------------------"
$files = @(
    ".env",
    "frontend\.env.local",
    "backend\src\main\resources\application.yml"
)

foreach ($file in $files) {
    Write-Host "Checking $file... " -NoNewline
    if (Test-Path $file) {
        Write-Host "✓ Exists" -ForegroundColor Green
    } else {
        Write-Host "⚠ Not found" -ForegroundColor Yellow
    }
}
Write-Host ""

# Check if Docker is running
Write-Host "8. Docker Status" -ForegroundColor Yellow
Write-Host "----------------"
$dockerPath = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerPath) {
    Write-Host "Checking Docker... " -NoNewline
    try {
        $dockerInfo = & docker info 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Running" -ForegroundColor Green
            
            Write-Host "Checking Docker Compose services... " -NoNewline
            $composePs = & docker-compose ps 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Available" -ForegroundColor Green
                Write-Host $composePs
            } else {
                Write-Host "⚠ No services running" -ForegroundColor Yellow
            }
        } else {
            Write-Host "✗ Not running" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Error checking Docker" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ Docker not found in PATH" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "📋 Summary" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Required Services:" -ForegroundColor White
Write-Host "  • MySQL Database    - Check port 3306"
Write-Host "  • Backend API       - Check http://localhost:8080/api"
Write-Host "  • Frontend App      - Check http://localhost:3000"
Write-Host ""
Write-Host "Optional Services:" -ForegroundColor White
Write-Host "  • Redis Cache       - Check port 6379"
Write-Host "  • MinIO Storage     - Check http://localhost:9000"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. If any service is not running, start it"
Write-Host "  2. Check logs for errors"
Write-Host "  3. Visit http://localhost:3000 to test the app"
Write-Host "  4. Visit http://localhost:8080/api/swagger-ui.html for API docs"
Write-Host ""
Write-Host "Quick Start Commands:" -ForegroundColor White
Write-Host "  • Start with Docker: docker-compose up -d"
Write-Host "  • Start backend: cd backend; mvn spring-boot:run"
Write-Host "  • Start frontend: cd frontend; npm run dev"
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
