#!/bin/bash

# HireMe ML Pipeline - Complete Setup and Training
# This script runs the entire ML pipeline: data generation, training, and serving

set -e

echo "=================================================="
echo "HireMe - ML Pipeline Runner"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Generate Synthetic Data
echo -e "${BLUE}Step 1: Generating synthetic dataset...${NC}"
python generate_synthetic_data.py
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Data generation complete${NC}"
else
    echo -e "${RED}✗ Data generation failed${NC}"
    exit 1
fi

# Step 2: Train Model
echo -e "${BLUE}Step 2: Training LightGBM model...${NC}"
python train_model.py
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Model training complete${NC}"
else
    echo -e "${RED}✗ Model training failed${NC}"
    exit 1
fi

# Step 3: Start API Service
echo -e "${BLUE}Step 3: Starting FastAPI service...${NC}"
echo "The API will be available at http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python serve_model.py

