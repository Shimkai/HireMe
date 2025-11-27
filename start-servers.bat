@echo off
echo Starting HireMe Application Servers...
echo.

echo Starting Backend Server (port 5000)...
start "Backend Server" cmd /k "cd /d %~dp0BE && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server (port 5173)...
start "Frontend Server" cmd /k "cd /d %~dp0FE && npm run dev"

echo.
echo Both servers are starting in separate windows
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause

