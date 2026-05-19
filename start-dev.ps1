# Farm Gear Connect - Development Environment Startup Script
# This script starts all required services for development

param(
    [switch]$Docker,
    [switch]$Manual,
    [switch]$Help
)

$ErrorActionPreference = "Continue"

function Show-Help {
    Write-Host @"
Farm Gear Connect - Development Startup Script

Usage:
  .\start-dev.ps1 [-Docker] [-Manual] [-Help]

Options:
  -Docker    Start all services using Docker Compose (recommended)
  -Manual    Start services manually (requires MySQL, Redis, MinIO installed)
  -Help      Show this help message

Examples:
  .\start-dev.ps1 -Docker    # Start with Docker
  .\start-dev.ps1 -Manual    # Start manually

"@
}

function Start-WithDocker {
    Write-Host "🐳 Starting Farm Gear Connect with Docker..." -ForegroundColor Cyan
    Write-Host ""
    
    # Check if Docker is installed
    $dockerPath = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $dockerPath) {
        Write-Host "❌ Docker not found. Please install Docker Desktop." -ForegroundColor Red
        Write-Host "   Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }
    
    # Check if Docker is running
    Write-Host "Checking Docker status..." -NoNewline
    try {
        $dockerInfo = & docker info 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host " ❌" -ForegroundColor Red
            Write-Host "Docker is not running. Please start Docker Desktop." -ForegroundColor Red
            exit 1
        }
        Write-Host " ✓" -ForegroundColor Green
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "Error checking Docker: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    
    # Check if docker-compose.yml exists
    if (-not (Test-Path "docker-compose.yml")) {
        Write-Host "❌ docker-compose.yml not found in current directory" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "Starting services with Docker Compose..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes on first run..." -ForegroundColor Gray
    Write-Host ""
    
    # Start services
    & docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Services started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Services:" -ForegroundColor Cyan
        Write-Host "  • MySQL:    localhost:3306" -ForegroundColor White
        Write-Host "  • Redis:    localhost:6379" -ForegroundColor White
        Write-Host "  • MinIO:    http://localhost:9000 (Console: http://localhost:9001)" -ForegroundColor White
        Write-Host "  • Backend:  http://localhost:8080/api" -ForegroundColor White
        Write-Host "  • Frontend: http://localhost:3000" -ForegroundColor White
        Write-Host ""
        Write-Host "Useful commands:" -ForegroundColor Cyan
        Write-Host "  • View logs:        docker-compose logs -f" -ForegroundColor Gray
        Write-Host "  • Stop services:    docker-compose down" -ForegroundColor Gray
        Write-Host "  • Restart services: docker-compose restart" -ForegroundColor Gray
        Write-Host "  • View status:      docker-compose ps" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host ""
        Write-Host "Opening application..." -ForegroundColor Yellow
        Start-Process "http://localhost:3000"
        Start-Process "http://localhost:8080/api/swagger-ui.html"
    } else {
        Write-Host ""
        Write-Host "❌ Failed to start services" -ForegroundColor Red
        Write-Host "Check logs with: docker-compose logs" -ForegroundColor Yellow
        exit 1
    }
}

function Start-Manually {
    Write-Host "🔧 Starting Farm Gear Connect manually..." -ForegroundColor Cyan
    Write-Host ""
    
    # Check prerequisites
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    $prerequisites = @{
        "Java" = "java"
        "Maven" = "mvn"
        "Node.js" = "node"
        "npm" = "npm"
        "MySQL" = "mysql"
    }
    
    $allPresent = $true
    foreach ($tool in $prerequisites.GetEnumerator()) {
        Write-Host "  Checking $($tool.Key)... " -NoNewline
        $cmd = Get-Command $tool.Value -ErrorAction SilentlyContinue
        if ($cmd) {
            Write-Host "✓" -ForegroundColor Green
        } else {
            Write-Host "✗" -ForegroundColor Red
            $allPresent = $false
        }
    }
    
    if (-not $allPresent) {
        Write-Host ""
        Write-Host "❌ Some prerequisites are missing. Please install them first." -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "Prerequisites check passed!" -ForegroundColor Green
    Write-Host ""
    
    # Check if MySQL is running
    Write-Host "Checking MySQL connection..." -NoNewline
    try {
        $result = & mysql -u farmgear -pfarmgear1234 -e "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✓" -ForegroundColor Green
        } else {
            Write-Host " ✗" -ForegroundColor Red
            Write-Host "Cannot connect to MySQL. Please ensure:" -ForegroundColor Yellow
            Write-Host "  1. MySQL is running" -ForegroundColor Gray
            Write-Host "  2. Database 'farmgearconnect' exists" -ForegroundColor Gray
            Write-Host "  3. User 'farmgear' has proper permissions" -ForegroundColor Gray
            Write-Host ""
            Write-Host "Run these commands in MySQL:" -ForegroundColor Yellow
            Write-Host "  CREATE DATABASE farmgearconnect;" -ForegroundColor Gray
            Write-Host "  CREATE USER 'farmgear'@'localhost' IDENTIFIED BY 'farmgear1234';" -ForegroundColor Gray
            Write-Host "  GRANT ALL PRIVILEGES ON farmgearconnect.* TO 'farmgear'@'localhost';" -ForegroundColor Gray
            exit 1
        }
    } catch {
        Write-Host " ✗" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "Starting Backend..." -ForegroundColor Yellow
    Write-Host "This will take a minute..." -ForegroundColor Gray
    
    # Start backend in new window
    $backendScript = @"
cd backend
Write-Host 'Building and starting backend...' -ForegroundColor Cyan
mvn spring-boot:run
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
    
    Write-Host "Backend starting in new window..." -ForegroundColor Green
    Write-Host "Waiting for backend to be ready..." -ForegroundColor Yellow
    
    # Wait for backend to be ready
    $maxAttempts = 30
    $attempt = 0
    $backendReady = $false
    
    while ($attempt -lt $maxAttempts -and -not $backendReady) {
        Start-Sleep -Seconds 2
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080/api/actuator/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $backendReady = $true
            }
        } catch {
            # Still waiting
        }
        $attempt++
        Write-Host "." -NoNewline
    }
    
    Write-Host ""
    
    if ($backendReady) {
        Write-Host "✅ Backend is ready!" -ForegroundColor Green
    } else {
        Write-Host "⚠ Backend is taking longer than expected. Check the backend window for errors." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Starting Frontend..." -ForegroundColor Yellow
    
    # Check if node_modules exists
    if (-not (Test-Path "frontend/node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        Push-Location frontend
        & npm install
        Pop-Location
    }
    
    # Start frontend in new window
    $frontendScript = @"
cd frontend
Write-Host 'Starting frontend...' -ForegroundColor Cyan
npm run dev
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
    
    Write-Host "Frontend starting in new window..." -ForegroundColor Green
    Write-Host ""
    
    Start-Sleep -Seconds 5
    
    Write-Host "✅ All services started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Cyan
    Write-Host "  • Backend:  http://localhost:8080/api" -ForegroundColor White
    Write-Host "  • Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "  • API Docs: http://localhost:8080/api/swagger-ui.html" -ForegroundColor White
    Write-Host ""
    Write-Host "Opening application..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:3000"
    Start-Process "http://localhost:8080/api/swagger-ui.html"
}

# Main script
if ($Help) {
    Show-Help
    exit 0
}

Write-Host @"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║           Farm Gear Connect                           ║
║           Development Environment                     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host ""

if ($Docker) {
    Start-WithDocker
} elseif ($Manual) {
    Start-Manually
} else {
    Write-Host "Please specify startup mode:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  .\start-dev.ps1 -Docker    # Recommended: Start with Docker" -ForegroundColor White
    Write-Host "  .\start-dev.ps1 -Manual    # Start services manually" -ForegroundColor White
    Write-Host "  .\start-dev.ps1 -Help      # Show help" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Choose mode (D for Docker, M for Manual, H for Help)"
    
    switch ($choice.ToUpper()) {
        "D" { Start-WithDocker }
        "M" { Start-Manually }
        "H" { Show-Help }
        default {
            Write-Host "Invalid choice. Exiting." -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
