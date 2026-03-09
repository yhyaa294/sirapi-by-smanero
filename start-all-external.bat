@echo off
TITLE SmartAPD - System Launcher (PRODUCTION)

echo ===================================================
echo   🚀 SIRAPI SYSTEM LAUNCHER
echo   Backend ^| AI Engine ^| Frontend
echo ===================================================
echo.

:: 0. Matikan proses yang mungkin nyangkut (Force Kill)
echo [0/3] Membersihkan Port ^& Process Lama...
taskkill /F /IM "main.exe" /T >nul 2>&1
taskkill /F /IM "server.exe" /T >nul 2>&1
taskkill /F /IM "python.exe" /T >nul 2>&1
taskkill /F /IM "node.exe" /T >nul 2>&1
taskkill /F /IM "go.exe" /T >nul 2>&1
echo ✅ Port bersih!

echo.

:: 1. Jalankan Backend (Go)
echo [1/3] Menyalakan Backend (Port 8080)...
start "SiRapi - BACKEND" cmd /k "cd backend && echo 📦 Cek Modul... && go mod tidy && echo 🚀 Menjalankan Server... && go run cmd/server/main.go"

:: 2. Jalankan AI Engine (Python)
echo [2/3] Menyalakan AI Engine (Port 5000)...
:: Menggunakan Python VENV agar tidak error library
start "SiRapi - AI ENGINE" cmd /k "cd ai-engine && echo 🐍 Menggunakan VENV Python... && "..\.venv\Scripts\python.exe" main.py"

:: 3. Jalankan Frontend (Next.js)
echo [3/3] Menyalakan Frontend (Port 3000)...
start "SiRapi - FRONTEND" cmd /k "cd frontend && echo 🎨 Menjalankan Dashboard... && set PORT=3000 && npm run dev"

echo.
echo ===================================================
echo ✅ SEMUA SISTEM TELAH DILUNCURKAN!
echo ===================================================
echo 🌐 Dashboard: http://localhost:3000
echo 📹 AI Stream: http://localhost:5000/video_feed/cam01
echo ⚙️ Backend:   http://localhost:8080/api/health
echo ===================================================
echo.
echo Biarkan ke-3 window terminal tetap terbuka.
echo Jika ada yang error/tertutup, kirim screenshotnya.
pause
