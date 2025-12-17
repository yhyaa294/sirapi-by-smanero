# SmartAPD - Start All Services
# Run this script to start all services together

Write-Host "╔═════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       SMARTAPD - Starting All Services          ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════╝" -ForegroundColor Cyan

$ROOT_DIR = $PSScriptRoot

# Start Go Backend
Write-Host "`n🚀 Starting Go Backend..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    Set-Location "$using:ROOT_DIR\backend\cmd\server"
    go run main.go
}

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Python AI Engine
Write-Host "🤖 Starting AI Engine..." -ForegroundColor Yellow
$aiJob = Start-Job -ScriptBlock {
    Set-Location "$using:ROOT_DIR\ai-engine"
    python detector_realtime.py
}

# Start Next.js Frontend (in current terminal)
Write-Host "🌐 Starting Frontend..." -ForegroundColor Blue
Write-Host "`n📺 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "📡 Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "🤖 AI Engine: http://localhost:5000" -ForegroundColor White
Write-Host "`nPress Ctrl+C to stop all services`n" -ForegroundColor Gray

Set-Location "$ROOT_DIR\frontend"
npm run dev

# Cleanup on exit
Write-Host "`n🛑 Stopping services..." -ForegroundColor Red
Stop-Job $backendJob -ErrorAction SilentlyContinue
Stop-Job $aiJob -ErrorAction SilentlyContinue
Remove-Job $backendJob -ErrorAction SilentlyContinue
Remove-Job $aiJob -ErrorAction SilentlyContinue
