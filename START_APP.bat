@echo off
setlocal enabledelayedexpansion
title HoneyTrace SIH Project Startup

echo ===================================================
echo     HoneyTrace - SIH Hackathon Project Autostart
echo ===================================================
echo.
echo Checking dependencies...

cd /d "%~dp0"

:: 1. Check and install Frontend dependencies
if not exist "node_modules\" (
    echo [1/4] Installing Frontend dependencies (npm install)...
    call npm install
) else (
    echo [1/4] Frontend dependencies already installed.
)

:: 2. Check and install Backend dependencies
cd backend
if not exist ".venv\" (
    echo [2/4] Creating Python virtual environment...
    python -m venv .venv
    echo Installing Backend dependencies...
    call .venv\Scripts\python.exe -m pip install -r requirements.txt
) else (
    echo [2/4] Python environment already setup.
)

:: 3. Setup Database
echo [3/4] Setting up the database and seeding demo data...
call .venv\Scripts\python.exe manage.py migrate
call .venv\Scripts\python.exe manage.py seed_demo

:: 4. Start Servers
echo [4/4] Starting Servers...
echo.

:: Start Django Backend in a new window
start "HoneyTrace Backend" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

:: Start Vite Frontend in a new window
start "HoneyTrace Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

:: Wait 3 seconds for frontend to start
timeout /t 3 /nobreak >nul

echo ===================================================
echo   Servers are running in background windows!
echo   Opening browser to http://localhost:5173
echo ===================================================
start http://localhost:5173

pause
