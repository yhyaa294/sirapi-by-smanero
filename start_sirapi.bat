@echo off
echo =========================================
echo       MEMULAI SIRAPI COMMAND CENTER
echo =========================================

echo [1/3] Menjalankan Golang Core Backend...
start cmd /k "cd backend && go run cmd/server/main.go"

echo [2/3] Menjalankan Python AI Microservice...
start cmd /k "cd ai-engine && python ai_service.py"

echo [3/3] Menjalankan Next.js Web Dashboard...
start cmd /k "cd frontend && npm run dev"

echo =========================================
echo Semua sistem berhasil dijalankan dalam window terpisah!
echo.
echo Akses Web Dashboard : http://localhost:3000
echo Akses API Backend   : http://localhost:8080
echo Akses AI Stream     : http://localhost:5000/video_feed/cam01
echo.
echo Biarkan terminal-terminal tersebut tetap terbuka.
echo =========================================
pause
