@echo off
echo 🔍 Checking for processes on port 5000...
netstat -ano | findstr :5000

echo.
echo 🛑 Killing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing process %%a
    taskkill /PID %%a /F 2>nul
)

echo.
echo ✅ Port 5000 should now be free!
echo 🚀 You can now start the server with: npm run dev
pause
