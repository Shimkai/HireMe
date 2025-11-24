"""
FastAPI Service for Recruiter-to-Student Recommendations
Serves the trained recommendation model for real-time predictions
"""

import joblib
import json
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle

# Initialize FastAPI app
app = FastAPI(
    title="HireMe Recruiter Recommendation API",
    description="Recruiter-to-Student Matching Service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and preprocessor
MODEL_PATH = "recruiter_recommendation_model.pkl"
PREPROCESSOR_PATH = "recruiter_preprocessor.json"

model = None
preprocessor = None

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
        print("Please run train_recruiter_model.py first.")

# Pydantic models
class Student(BaseModel):
    student_id: str
    name: str
    branch: str
    cgpa: float
    tenth_percentage: float
    twelfth_percentage: float
    skills: List[str]

class Job(BaseModel):
    job_id: str
    job_title: str
    required_skills: List[str]
    min_cgpa: float
    min_tenth: int
    min_twelfth: int

class RecommendRequest(BaseModel):
    job: Job
    students: List[Student]
    top_k: int = Field(default=20, ge=1, le=100)

class RecommendationResponse(BaseModel):
    student_id: str
    name: str
    branch: str
    cgpa: float
    tenth_percentage: float
    twelfth_percentage: float
    match_score: float
    skill_overlap: float
    skills: List[str]
    reason: str

def calculate_features(student: Student, job: Job) -> np.ndarray:
    """Calculate feature vector for recommendation"""
    # Skill overlap
    student_skills_set = set(student.skills)
    job_skills_set = set(job.required_skills)
    skill_overlap = len(student_skills_set & job_skills_set) / max(len(job_skills_set), 1)
    
    # Simple cosine similarity approximation
    all_skills = list(student_skills_set | job_skills_set)
    student_vector = np.array([1 if skill in student_skills_set else 0 for skill in all_skills])
    job_vector = np.array([1 if skill in job_skills_set else 0 for skill in all_skills])
    
    cosine_sim = np.dot(student_vector, job_vector) / (np.linalg.norm(student_vector) * np.linalg.norm(job_vector) + 1e-8)
    
    # Numerical features
    features = np.array([
        student.cgpa,
        student.tenth_percentage,
        student.twelfth_percentage,
        student.cgpa - job.min_cgpa,  # cgpa_diff
        student.cgpa / job.min_cgpa if job.min_cgpa > 0 else 0,  # cgpa_ratio
        skill_overlap,
        cosine_sim
    ])
    
    return features

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
        "service": "HireMe Recruiter Recommendation API"
    }

@app.post("/recommend", response_model=List[RecommendationResponse])
async def get_recommendations(request: RecommendRequest):
    """
    Get recommended students for a job
    Returns ranked list of top students
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Please train the model first.")
    
    job = request.job
    students = request.students
    
    if not students:
        raise HTTPException(status_code=400, detail="No students provided")
    
    recommendations = []
    
    # Calculate match for each student
    for student in students:
        try:
            # Check basic eligibility
            if (student.cgpa < job.min_cgpa or 
                student.tenth_percentage < job.min_tenth or
                student.twelfth_percentage < job.min_twelfth):
                continue
            
            # Calculate features
            features = calculate_features(student, job)
            
            # Reshape for prediction
            features_2d = features.reshape(1, -1)
            
            # Predict match probability
            probability = model.predict_proba(features_2d)[0][1]
            
            # Calculate skill overlap
            student_skills_set = set(student.skills)
            job_skills_set = set(job.required_skills)
            skill_overlap = len(student_skills_set & job_skills_set) / max(len(job_skills_set), 1)
            
            # Generate reason
            reasons = []
            if skill_overlap > 0.5:
                reasons.append(f"{int(skill_overlap*100)}% skill match")
            if student.cgpa >= job.min_cgpa + 0.5:
                reasons.append("exceeds CGPA requirement")
            if len(student_skills_set & job_skills_set) > 0:
                reasons.append(f"has {len(student_skills_set & job_skills_set)} required skills")
            
            reason = ", ".join(reasons) if reasons else "matches basic requirements"
            
            recommendations.append({
                "student_id": student.student_id,
                "name": student.name,
                "branch": student.branch,
                "cgpa": student.cgpa,
                "tenth_percentage": student.tenth_percentage,
                "twelfth_percentage": student.twelfth_percentage,
                "match_score": round(probability * 100, 2),
                "skill_overlap": round(skill_overlap * 100, 2),
                "skills": student.skills,
                "reason": reason
            })
        except Exception as e:
            print(f"Error processing student {student.student_id}: {e}")
            continue
    
    # Sort by match score (highest first)
    recommendations.sort(key=lambda x: x['match_score'], reverse=True)
    
    # Return top-K
    return recommendations[:request.top_k]

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "HireMe Recruiter Recommendation API",
        "version": "1.0.0",
        "endpoints": {
            "/health": "Check API health",
            "/recommend": "Get student recommendations for a job",
            "/docs": "API documentation"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)

