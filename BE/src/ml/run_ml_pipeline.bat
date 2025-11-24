@echo off
REM HireMe ML Pipeline - Complete Setup and Training
REM Windows Batch Script

echo ==================================================
echo HireMe - ML Pipeline Runner
echo ==================================================
echo.

REM Step 1: Generate Synthetic Data
echo Step 1: Generating synthetic dataset...
python generate_synthetic_data.py
if %errorlevel% neq 0 (
    echo Data generation failed
    exit /b 1
)
echo Data generation complete
echo.

REM Step 2: Train Model
echo Step 2: Training LightGBM model...
python train_model.py
if %errorlevel% neq 0 (
    echo Model training failed
    exit /b 1
)
echo Model training complete
echo.

REM Step 3: Start API Service
echo Step 3: Starting FastAPI service...
echo The API will be available at http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python serve_model.py

