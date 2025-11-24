@echo off
echo ========================================
echo HireMe - Recruiter Recommendation ML Pipeline
echo ========================================
echo.

echo Step 1: Generating synthetic data...
python generate_recruiter_data.py
if %errorlevel% neq 0 (
    echo Error generating data!
    exit /b %errorlevel%
)
echo.

echo Step 2: Training model...
python train_recruiter_model.py
if %errorlevel% neq 0 (
    echo Error training model!
    exit /b %errorlevel%
)
echo.

echo Step 3: Starting API server...
echo ML API will run on http://localhost:8001
python serve_recruiter_model.py

pause

