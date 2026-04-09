@echo off
chcp 65001 >nul
echo ========================================
echo Anxuan Selected - Windows Build
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [Error] Python not found! Please install Python first.
    pause
    exit /b 1
)
echo [OK] Python installed

echo.
echo [2/5] Install/Update dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo [Warning] Dependency installation may have issues, but continuing...
)

echo.
echo [3/5] Starting Windows build...
python build_windows.py

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Output location: Anxuan_Select_Windows\
echo.
pause
