"""
Synthetic Dataset Generator for Student-Job Matching
Generates realistic student profiles, job postings, and labeled matches
"""

import json
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Tuple

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

# Predefined domains and skills
DOMAINS = ["Frontend", "Backend", "Data Science", "DevOps", "Mobile", "Full Stack", "QA/Testing"]
SKILLS = {
    "Frontend": ["React", "Vue", "Angular", "JavaScript", "TypeScript", "HTML", "CSS", "TailwindCSS", "SASS"],
    "Backend": ["Node.js", "Python", "Java", "Spring Boot", "Express.js", "Django", "Flask", "Go", "Rust"],
    "Data Science": ["Python", "R", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "SQL", "Jupyter"],
    "DevOps": ["Docker", "Kubernetes", "AWS", "Azure", "CI/CD", "Jenkins", "Terraform", "Ansible", "Linux"],
    "Mobile": ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android", "Dart"],
    "Full Stack": ["React", "Node.js", "MongoDB", "Express.js", "PostgreSQL", "REST API", "GraphQL"],
    "QA/Testing": ["Selenium", "Jest", "Cypress", "JUnit", "TestNG", "API Testing", "Manual Testing"]
}

ALL_SKILLS = set()
for skills in SKILLS.values():
    ALL_SKILLS.update(skills)
ALL_SKILLS = sorted(list(ALL_SKILLS))

COMPANIES = [
    "TechCorp", "DataSystems", "CloudTech", "AI Solutions", "DevPros", "CodeCraft",
    "Innovate Labs", "Digital Ventures", "ByteSoft", "CloudLabs", "SmartSystems",
    "FutureTech", "AgileWorks", "CodeForge", "StackBuilders", "WebWizards"
]

def generate_student_profile(student_id: int) -> Dict:
    """Generate a realistic student profile"""
    domain = random.choice(DOMAINS)
    cgpa = np.random.normal(8.0, 0.8)  # Mean 8.0, std 0.8
    cgpa = np.clip(cgpa, 6.5, 10.0)  # Clamp between 6.5 and 10.0
    
    x10 = np.random.normal(85, 10)  # 10th percentage
    x10 = np.clip(x10, 60, 100)
    
    x12 = np.random.normal(82, 12)  # 12th percentage
    x12 = np.clip(x12, 60, 100)
    
    # Generate skills based on interest
    base_skills = SKILLS.get(domain, SKILLS["Frontend"])
    num_skills = random.randint(3, 8)
    skills = random.sample(base_skills, min(num_skills, len(base_skills)))
    
    # Add 1-2 random skills from other domains for diversity
    other_skills = [s for dom_skills in SKILLS.values() for s in dom_skills if s not in skills]
    extra_skills = random.sample(other_skills, min(2, len(other_skills)))
    skills = list(set(skills + extra_skills))
    
    return {
        "student_id": f"S{student_id:05d}",
        "cgpa": round(cgpa, 2),
        "x10": round(x10, 1),
        "x12": round(x12, 1),
        "skills": skills,
        "interest": domain
    }

def generate_job_posting(job_id: int) -> Dict:
    """Generate a realistic job posting"""
    domain = random.choice(DOMAINS)
    company = random.choice(COMPANIES)
    
    min_cgpa = random.choice([7.0, 7.5, 8.0, 8.5, 9.0])
    min_x10 = random.choice([70, 75, 80, 85])
    min_x12 = random.choice([70, 75, 80, 85])
    
    role_titles = {
        "Frontend": ["Frontend Developer", "UI/UX Developer", "React Developer", "Frontend Engineer"],
        "Backend": ["Backend Developer", "API Developer", "Server Engineer", "Backend Engineer"],
        "Data Science": ["Data Analyst", "Data Scientist", "ML Engineer", "Data Engineer"],
        "DevOps": ["DevOps Engineer", "Cloud Engineer", "Infrastructure Engineer", "SRE"],
        "Mobile": ["Mobile Developer", "iOS Developer", "Android Developer", "Mobile Engineer"],
        "Full Stack": ["Full Stack Developer", "MERN Developer", "Full Stack Engineer"],
        "QA/Testing": ["QA Engineer", "Test Engineer", "QA Automation Engineer"]
    }
    
    role_title = random.choice(role_titles.get(domain, role_titles["Frontend"]))
    
    required_skills = SKILLS.get(domain, SKILLS["Frontend"])
    num_required = random.randint(2, 5)
    skills = random.sample(required_skills, min(num_required, len(required_skills)))
    
    return {
        "job_id": f"J{job_id:05d}",
        "company": company,
        "role_title": role_title,
        "category": domain,
        "required_skills": skills,
        "min_cgpa": round(min_cgpa, 1),
        "min_x10": min_x10,
        "min_x12": min_x12
    }

def calculate_match_probability(student: Dict, job: Dict) -> Tuple[float, int]:
    """
    Calculate match probability based on multiple factors
    Returns: (probability, label)
    """
    # 1. Skill overlap (0-1)
    student_skills = set(student["skills"])
    job_skills = set(job["required_skills"])
    skill_overlap = len(student_skills & job_skills) / max(len(job_skills), 1)
    
    # 2. Interest match (1.0 if match, 0.5 otherwise)
    interest_match = 1.0 if student["interest"] == job["category"] else 0.5
    
    # 3. CGPA fit (exponential decay for large gaps)
    cgpa_diff = student["cgpa"] - job["min_cgpa"]
    if cgpa_diff >= 0.5:
        cgpa_score = 1.0
    elif cgpa_diff >= 0:
        cgpa_score = 0.7
    else:
        cgpa_score = max(0, 1.0 + cgpa_diff * 2)  # Decay faster below threshold
    
    # 4. 10th percentage fit
    x10_diff = student["x10"] - job["min_x10"]
    x10_score = 1.0 if x10_diff >= 0 else max(0, 1.0 + x10_diff / 10)
    
    # 5. 12th percentage fit
    x12_diff = student["x12"] - job["min_x12"]
    x12_score = 1.0 if x12_diff >= 0 else max(0, 1.0 + x12_diff / 10)
    
    # Weighted score
    base_score = (
        0.40 * skill_overlap +
        0.25 * interest_match +
        0.15 * cgpa_score +
        0.10 * x10_score +
        0.10 * x12_score
    )
    
    # Add Gaussian noise for realism
    noise = np.random.normal(0, 0.05)
    final_score = np.clip(base_score + noise, 0, 1)
    
    # Binary label
    label = 1 if final_score > 0.65 else 0  # Threshold for positive match
    
    return final_score, label

def generate_dataset(num_students: int = 1000, num_jobs: int = 300, 
                    interactions_per_student: int = 30) -> pd.DataFrame:
    """Generate the complete synthetic dataset"""
    print("Generating student profiles...")
    students = [generate_student_profile(i) for i in range(num_students)]
    
    print("Generating job postings...")
    jobs = [generate_job_posting(i) for i in range(num_jobs)]
    
    print(f"Generating {num_students * interactions_per_student} student-job interactions...")
    data = []
    
    for student in students:
        # Each student views a random subset of jobs
        viewed_jobs = random.sample(jobs, min(interactions_per_student, len(jobs)))
        
        for job in viewed_jobs:
            prob, label = calculate_match_probability(student, job)
            
            data.append({
                "student_id": student["student_id"],
                "job_id": job["job_id"],
                "cgpa": student["cgpa"],
                "x10": student["x10"],
                "x12": student["x12"],
                "student_skills": ",".join(student["skills"]),
                "interest": student["interest"],
                "company": job["company"],
                "role_title": job["role_title"],
                "required_skills": ",".join(job["required_skills"]),
                "min_cgpa": job["min_cgpa"],
                "min_x10": job["min_x10"],
                "min_x12": job["min_x12"],
                "category": job["category"],
                "match_probability": round(prob, 4),
                "label": label
            })
    
    df = pd.DataFrame(data)
    print(f"\nDataset generated: {len(df)} records")
    print(f"Positive matches (label=1): {df['label'].sum()} ({df['label'].mean()*100:.1f}%)")
    print(f"Negative matches (label=0): {(df['label']==0).sum()} ({(df['label']==0).mean()*100:.1f}%)")
    
    return df, students, jobs

def main():
    """Main execution function"""
    print("=" * 50)
    print("HireMe - Synthetic Dataset Generator")
    print("=" * 50)
    
    # Generate dataset
    df, students, jobs = generate_dataset(
        num_students=1000,
        num_jobs=300,
        interactions_per_student=30
    )
    
    # Save CSV
    output_file = "synthetic_matches.csv"
    df.to_csv(output_file, index=False)
    print(f"\n✓ Saved: {output_file}")
    
    # Save students as JSON
    with open("students.json", "w") as f:
        json.dump(students, f, indent=2)
    print("✓ Saved: students.json")
    
    # Save jobs as JSON
    with open("jobs.json", "w") as f:
        json.dump(jobs, f, indent=2)
    print("✓ Saved: jobs.json")
    
    # Print statistics
    print("\n" + "=" * 50)
    print("DATASET STATISTICS")
    print("=" * 50)
    print(f"Total records: {len(df)}")
    print(f"Unique students: {df['student_id'].nunique()}")
    print(f"Unique jobs: {df['job_id'].nunique()}")
    print(f"Average matches per student: {len(df) / df['student_id'].nunique():.1f}")
    print(f"Positive match rate: {df['label'].mean()*100:.1f}%")
    
    print("\n✓ Dataset generation complete!")
    print("\nFiles created:")
    print("  - synthetic_matches.csv")
    print("  - students.json")
    print("  - jobs.json")

if __name__ == "__main__":
    main()

