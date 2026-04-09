@echo off
chcp 65001 >nul
echo ========================================
echo Anxuan Selected - Local Server
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [Error] Python not found! Please install Python first.
    pause
    exit /b 1
)
echo [OK] Python installed

echo.
echo [2/3] Starting Flask server...
echo.
echo Server will start on: http://localhost:8888
echo.
echo - Homepage: http://localhost:8888/index.html
echo - Admin page: http://localhost:8888/manage.html
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python app.py

echo.
echo Server stopped.
pause
