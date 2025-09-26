# RAG Pipeline Backend Startup Script for PowerShell

# Change to backend directory
Set-Location -Path $PSScriptRoot

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found. Creating from template..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Copied .env.example to .env. Please update the values as needed." -ForegroundColor Green
    } else {
        Write-Host "Error: .env.example file not found!" -ForegroundColor Red
        exit 1
    }
}

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Using Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Python not found. Please install Python first." -ForegroundColor Red
    exit 1
}

# Check if virtual environment should be used
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    .\venv\Scripts\Activate.ps1
}

# Install dependencies if requirements.txt is newer than the last install
Write-Host "Checking dependencies..." -ForegroundColor Cyan
try {
    python -c "import fastapi, uvicorn, sqlalchemy, redis, pymilvus" 2>$null
    Write-Host "All dependencies are available." -ForegroundColor Green
} catch {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

Write-Host ""
Write-Host "🚀 Starting RAG Pipeline Backend..." -ForegroundColor Blue
Write-Host "   • API Server: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   • API Docs: http://localhost:8000/api/v1/docs" -ForegroundColor Cyan
Write-Host "   • Health Check: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
python run.py