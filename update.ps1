<#
.SYNOPSIS
    Automated update and republish script for QTech Status on Windows Server.

.DESCRIPTION
    This script automates the process of pulling or applying new source changes,
    temporarily stopping the Windows background service to release file locks on dist/server.cjs,
    installing any dependency updates, compiling production bundles (Vue 3 client + Express server),
    and restarting the QTechStatusService with health verification.

.EXAMPLE
    PowerShell (As Administrator):
    .\update.ps1
#>

$ErrorActionPreference = "Stop"

$AppDir = $PSScriptRoot
if (-not $AppDir) {
    $AppDir = "C:\inetpub\apps\qtech-status"
}

$ServiceName = "QTechStatusService"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " QTech Status - Automated Publish & Update Script" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "App Directory : $AppDir" -ForegroundColor Gray
Write-Host "Service Name  : $ServiceName" -ForegroundColor Gray
Write-Host ""

# 1. Navigate to App Directory
Write-Host "[1/5] Navigating to application directory..." -ForegroundColor Cyan
Set-Location -Path $AppDir

# Optional Git Pull:
# If you deploy using Git, uncomment the following lines:
<#
if (Test-Path ".git") {
    Write-Host "Pulling latest changes from git repository..." -ForegroundColor Cyan
    git pull
}
#>

# 2. Stop the Windows Service (Prevents dist/server.cjs file locking)
Write-Host "[2/5] Temporarily stopping $ServiceName..." -ForegroundColor Cyan
$svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($svc -and $svc.Status -eq 'Running') {
    Stop-Service -Name $ServiceName -Force
    Start-Sleep -Seconds 1
    Write-Host "Service stopped successfully." -ForegroundColor Gray
} else {
    Write-Host "Service is not currently running. Continuing..." -ForegroundColor Gray
}

# 3. Install any updated dependencies
Write-Host "[3/5] Checking and installing dependencies..." -ForegroundColor Cyan
npm install --no-audit
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error during npm install. Aborting update." -ForegroundColor Red
    if ($svc) { Start-Service -Name $ServiceName }
    exit 1
}

# 4. Rebuild production bundle (Vite client + esbuild server)
Write-Host "[4/5] Compiling production bundles (npm run build)..." -ForegroundColor Cyan
$env:NODE_ENV = "production"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error during npm run build. Aborting update." -ForegroundColor Red
    if ($svc) { Start-Service -Name $ServiceName }
    exit 1
}

# 5. Restart the Windows Service
Write-Host "[5/5] Starting $ServiceName..." -ForegroundColor Cyan
Start-Service -Name $ServiceName
Start-Sleep -Seconds 2

# Verify Health
try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/health" -TimeoutSec 5
    if ($health.status -eq "ok") {
        Write-Host ""
        Write-Host "==========================================================" -ForegroundColor Green
        Write-Host " ✔ New version successfully published and service is healthy!" -ForegroundColor Green
        Write-Host "==========================================================" -ForegroundColor Green
        Write-Host "Tip: In client browsers, press Ctrl + F5 (hard refresh) to bust cache." -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "Service started, but health response was unexpected: $health" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Service started, but health check endpoint timed out or failed: $_" -ForegroundColor Yellow
}
