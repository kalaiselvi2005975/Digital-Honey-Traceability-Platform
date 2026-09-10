@echo off
title HoneyTrace
echo.
echo  HoneyTrace — starting backend and frontend
echo  Website:  http://localhost:5173
echo  API:      http://localhost:8000/api/docs/
echo.

set "BACKEND_DIR=%~dp0backend"
set "BACKEND_PY=python"
if exist "%BACKEND_DIR%\.venv\Scripts\python.exe" set "BACKEND_PY=%BACKEND_DIR%\.venv\Scripts\python.exe"

"%BACKEND_PY%" -c "import django" >nul 2>&1
if errorlevel 1 (
  echo Backend dependencies are missing.
  echo.
  echo Run these commands first:
  echo   cd /d "%BACKEND_DIR%"
  echo   python -m venv .venv
  echo   .venv\Scripts\python -m pip install -r requirements.txt
  echo.
  echo Then run this file again.
  echo.
  pause
  exit /b 1
)

start "HoneyTrace Backend" cmd /k "cd /d ""%BACKEND_DIR%"" && ""%BACKEND_PY%"" manage.py migrate && ""%BACKEND_PY%"" manage.py seed_demo && ""%BACKEND_PY%"" manage.py runserver 8000"
timeout /t 4 /nobreak >nul
start "HoneyTrace Frontend" cmd /k "cd /d ""%~dp0"" && npm run dev"

echo Open http://localhost:5173 in your browser.
echo Login: beekeeper@demo.com / beekeeper123
echo.
pause
