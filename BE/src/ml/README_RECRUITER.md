# Recruiter-to-Student Recommendation System

Machine Learning-powered recommendation system that suggests the best students for recruiter job postings.

## 📋 Overview

This system automatically recommends students for job postings based on:
- **CGPA**
- **10th Percentage**
- **12th Percentage**
- **Technical Skills Match**

## 🚀 Quick Start

### 1. Generate Training Data

```bash
python generate_recruiter_data.py
```

This creates:
- `recruiter_matches.csv` - 2.5M student-job matches
- `recruiter_students.json` - 5000 student profiles
- `recruiter_jobs.json` - 500 job postings

### 2. Train the Model

```bash
python train_recruiter_model.py
```

This generates:
- `recruiter_recommendation_model.pkl` - Trained model
- `recruiter_preprocessor.json` - Preprocessor config
- `recruiter_feature_importance.csv` - Feature analysis

Expected Accuracy: **≥93%**

### 3. Start ML API Server

```bash
python serve_recruiter_model.py
```

API runs on: `http://localhost:8001`

### 4. Run Complete Pipeline (Windows)

```bash
run_recruiter_pipeline.bat
```

## 🏗️ Architecture

### Backend Endpoints

- `GET /api/recommendations/job/:jobId` - Get recommended students
- `POST /api/recommendations/shortlist` - Shortlist a student
- `POST /api/recommendations/place` - Place a student

### Frontend Integration

The `RecommendedStudents` component appears in:
- Recruiter Dashboard → Manage Jobs → "👥" icon

Features:
- Ranked list by match score
- Skill overlap percentage
- Shortlist & Place functionality
- Detailed student view modal

## 📊 Model Details

### Features
1. **CGPA** - Student's GPA
2. **CGPA Difference** - (student_cgpa - min_cgpa)
3. **CGPA Ratio** - (student_cgpa / min_cgpa)
4. **10th Percentage**
5. **12th Percentage**
6. **Skill Overlap** - Jaccard similarity
7. **Cosine Similarity** - TF-IDF based

### Algorithm

1. Feature engineering
2. Random Forest classifier
3. 5-fold cross-validation
4. Final accuracy ≥93%

## 🎯 Usage Example

```python
# ML API Request
{
  "job": {
    "job_id": "J00001",
    "job_title": "Software Developer",
    "required_skills": ["React", "Node.js", "MongoDB"],
    "min_cgpa": 8.0,
    "min_tenth": 80,
    "min_twelfth": 75
  },
  "students": [...],
  "top_k": 20
}

# Response
[
  {
    "student_id": "S00001",
    "name": "John Doe",
    "match_score": 87.5,
    "skill_overlap": 75,
    "reason": "75% skill match, exceeds CGPA requirement"
  },
  ...
]
```

## 📈 Performance

- **Accuracy**: ≥93%
- **Precision**: >0.90
- **Recall**: >0.90
- **F1-Score**: >0.90

## 🔗 Integration

The system integrates with:
- **Backend**: Express.js API endpoints
- **Frontend**: React components
- **Database**: MongoDB
- **ML Service**: FastAPI

## 📝 Notes

- Uses synthetic data for training
- Falls back to rule-based matching if ML API unavailable
- Real-time predictions via FastAPI
- Handles up to 30 recommendations per job

