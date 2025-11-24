"""
FastAPI Service for Student-Job Matching Predictions
Serves the trained LightGBM model for real-time recommendations
"""

import joblib
import json
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
import pickle
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(
    title="HireMe ML Recommendation API",
    description="Student-Job Matching Prediction Service",
    version="1.0.0"
)

# Load model and preprocessor
MODEL_PATH = "lgb_student_job_model.pkl"
PREPROCESSOR_PATH = "model_preprocessor.json"

model = None
preprocessor = None
student_tfidf_vectorizer = None
job_tfidf_vectorizer = None

def load_model():
    """Load the trained model and preprocessor"""
    global model, preprocessor
    
    try:
        model = joblib.load(MODEL_PATH)
        print(f"✓ Model loaded from {MODEL_PATH}")
        
        with open(PREPROCESSOR_PATH, 'r') as f:
            preprocessor = json.load(f)
        print(f"✓ Preprocessor loaded from {PREPROCESSOR_PATH}")
        
    except FileNotFoundError:
        print(f"⚠ Error: {MODEL_PATH} or {PREPROCESSOR_PATH} not found!")
        print("Please run train_model.py first to train and save the model.")
        raise

# Pydantic models for request/response
class Job(BaseModel):
    job_id: str
    company: str
    role_title: str
    category: str
    required_skills: List[str]
    min_cgpa: float
    min_x10: int
    min_x12: int

class StudentRequest(BaseModel):
    cgpa: float = Field(..., ge=0.0, le=10.0, description="Student's CGPA (0-10)")
    x10: float = Field(..., ge=0, le=100, description="10th percentage")
    x12: float = Field(..., ge=0, le=100, description="12th percentage")
    skills: List[str] = Field(..., description="List of student skills")
    interest: str = Field(..., description="Area of interest (Frontend, Backend, etc.)")
    top_k: int = Field(default=10, ge=1, le=50, description="Number of top recommendations")

class JobRecommendation(BaseModel):
    job_id: str
    role: str
    company: str
    category: str
    probability: float
    match_score: float
    required_skills: List[str]
    min_cgpa: float
    min_x10: int
    min_x12: int
    reason: str
    skill_overlap: float
    cgpa_above_threshold: bool
    interest_match: bool

class PredictRequest(BaseModel):
    student: StudentRequest
    jobs: List[Job]

def preprocess_features(student_data: Dict, job_data: Dict) -> pd.DataFrame:
    """Preprocess student and job data into feature vector"""
    
    # Parse skills
    student_skills_str = ",".join(student_data['skills'])
    job_skills_str = ",".join(job_data['required_skills'])
    
    # Numerical features
    features = {
        'cgpa': float(student_data['cgpa']),
        'x10': float(student_data['x10']),
        'x12': float(student_data['x12']),
        'min_cgpa': float(job_data['min_cgpa']),
        'min_x10': float(job_data['min_x10']),
        'min_x12': float(job_data['min_x12']),
        'cgpa_diff': float(student_data['cgpa']) - float(job_data['min_cgpa']),
        'x10_diff': float(student_data['x10']) - float(job_data['min_x10']),
        'x12_diff': float(student_data['x12']) - float(job_data['min_x12']),
        'skill_overlap': len(set(student_data['skills']) & set(job_data['required_skills'])) 
                         / max(len(job_data['required_skills']), 1),
        'interest_match': int(student_data['interest'] == job_data['category']),
        'num_student_skills': len(student_data['skills']),
        'num_required_skills': len(job_data['required_skills']),
        'skill_similarity': len(set(s.lower() for s in student_data['skills']) & 
                                  set(s.lower() for s in job_data['required_skills'])) / 
                           max(len(set(s.lower() for s in job_data['required_skills'])), 1),
        'cgpa_adequacy': 1.0 + (float(student_data['cgpa']) - float(job_data['min_cgpa'])) * 0.5 
                        if float(student_data['cgpa']) >= float(job_data['min_cgpa']) 
                        else max(0, 1.0 + (float(student_data['cgpa']) - float(job_data['min_cgpa'])) * 2)
    }
    
    # Create feature vector with expected dimensions
    # Since we don't have TF-IDF vectors in production, we'll use only the numerical features
    feature_df = pd.DataFrame([features])
    
    # Pad with zeros for any additional features the model expects
    expected_features = preprocessor['feature_names']
    for feat in expected_features:
        if feat not in feature_df.columns:
            feature_df[feat] = 0.0
    
    # Reorder columns to match training data
    feature_df = feature_df[expected_features]
    
    return feature_df

def generate_reason(student_data: Dict, job_data: Dict, skill_overlap: float) -> str:
    """Generate human-readable explanation for the recommendation"""
    reasons = []
    
    if skill_overlap > 0.5:
        reasons.append(f"high skill overlap ({skill_overlap*100:.0f}%)")
    
    if student_data['interest'] == job_data['category']:
        reasons.append("matches your interest area")
    
    if student_data['cgpa'] >= job_data['min_cgpa']:
        reasons.append(f"CGPA ({student_data['cgpa']}) meets requirement ({job_data['min_cgpa']})")
    else:
        reasons.append(f"CGPA slightly below requirement ({job_data['min_cgpa']})")
    
    return " + ".join(reasons)

@app.on_event("startup")
async def startup_event():
    """Initialize model on startup"""
    load_model()

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "service": "HireMe ML Recommendation API"
    }

@app.post("/predict", response_model=List[JobRecommendation])
async def predict_recommendations(request: PredictRequest):
    """
    Predict job recommendations for a student
    
    Returns ranked list of top-K job recommendations
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Please train the model first.")
    
    student = request.student.dict()
    jobs = request.jobs
    
    if not jobs:
        raise HTTPException(status_code=400, detail="No jobs provided")
    
    recommendations = []
    
    # Predict for each job
    for job in jobs:
        try:
            # Preprocess features
            features = preprocess_features(student, job.dict())
            
            # Get prediction
            probability = model.predict_proba(features)[0][1]
            
            # Calculate additional metrics
            skill_overlap = len(set(student['skills']) & set(job.required_skills)) / max(len(job.required_skills), 1)
            cgpa_above = student['cgpa'] >= job.min_cgpa
            interest_match = student['interest'] == job.category
            
            # Generate reason
            reason = generate_reason(student, job.dict(), skill_overlap)
            
            recommendations.append({
                "job_id": job.job_id,
                "role": job.role_title,
                "company": job.company,
                "category": job.category,
                "probability": float(probability),
                "match_score": float(probability * 100),  # Percentage
                "required_skills": job.required_skills,
                "min_cgpa": job.min_cgpa,
                "min_x10": job.min_x10,
                "min_x12": job.min_x12,
                "reason": reason,
                "skill_overlap": float(skill_overlap),
                "cgpa_above_threshold": cgpa_above,
                "interest_match": interest_match
            })
            
        except Exception as e:
            print(f"Error processing job {job.job_id}: {e}")
            continue
    
    # Sort by probability (highest first)
    recommendations.sort(key=lambda x: x['probability'], reverse=True)
    
    # Return top-K
    top_k = student['top_k']
    return recommendations[:top_k]

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "HireMe ML Recommendation API",
        "version": "1.0.0",
        "endpoints": {
            "/health": "Check API health",
            "/predict": "Get job recommendations",
            "/docs": "API documentation"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

