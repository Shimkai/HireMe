@echo off
echo Starting HireMe Backend Server...
echo.

cd /d "%~dp0BE"

echo Checking if .env file exists...
if not exist ".env" (
    echo Creating .env file...
    echo NODE_ENV=development > .env
    echo PORT=5000 >> .env
    echo MONGODB_URI=mongodb://localhost:27017/hireme >> .env
    echo JWT_SECRET=your-super-secret-jwt-key-here-must-be-at-least-32-chars-long >> .env
    echo JWT_EXPIRE=7d >> .env
    echo CLIENT_URL=http://localhost:5173 >> .env
    echo .env file created successfully!
) else (
    echo .env file already exists.
)

echo.
echo Installing dependencies...
call npm install

echo.
echo Starting development server...
call npm run dev

pause
