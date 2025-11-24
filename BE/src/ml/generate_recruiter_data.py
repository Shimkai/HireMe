"""
Synthetic Dataset Generator for Recruiter-to-Student Matching
Generates realistic student profiles and job postings with labeled matches
"""

import json
import random
import pandas as pd
import numpy as np
from typing import List, Dict, Tuple

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

# Predefined branches
BRANCHES = [
    "Computer Science", "Information Technology", "Artificial Intelligence",
    "AIML", "Data Science", "Cyber Security", "ENTC", "Civil Engineering",
    "Mechanical Engineering", "Electronics Engineering", "Robotics",
    "Automation", "Electrical Engineering", "Biomedical Engineering"
]

# Skills from the constants file
SKILLS = [
    "React.js", "Vue.js", "Angular", "JavaScript", "TypeScript", "HTML", "CSS",
    "SASS/SCSS", "Tailwind CSS", "Bootstrap", "jQuery", "Next.js", "Nuxt.js",
    "Node.js", "Express.js", "Python", "Django", "Flask", "FastAPI",
    "Java", "Spring Boot", "C#", ".NET", "PHP", "Laravel", "Ruby",
    "Ruby on Rails", "Go", "Rust", "MongoDB", "MySQL", "PostgreSQL",
    "SQLite", "Redis", "Elasticsearch", "Firebase", "Supabase", "AWS",
    "Azure", "Google Cloud Platform", "Docker", "Kubernetes", "Jenkins",
    "Terraform", "Ansible", "CI/CD", "Git", "Linux", "React Native",
    "Flutter", "Swift", "Kotlin", "iOS", "Android", "Dart", "Machine Learning",
    "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas",
    "NumPy", "Data Analysis", "Power BI", "Tableau", "Selenium", "Jest",
    "Cypress", "Blockchain", "Solidity", "Web3", "GraphQL", "REST API",
    "Microservices", "System Design", "Agile", "Scrum", "DevOps"
]

def generate_student_profile(student_id: int) -> Dict:
    """Generate a realistic student profile"""
    branch = random.choice(BRANCHES)
    
    # CGPA ranges by branch
    if branch in ["Computer Science", "Information Technology", "AIML", "Data Science"]:
        cgpa = np.random.normal(8.5, 0.7)
    elif branch in ["Mechanical Engineering", "Civil Engineering", "Electrical Engineering"]:
        cgpa = np.random.normal(8.0, 0.8)
    else:
        cgpa = np.random.normal(7.8, 0.9)
    
    cgpa = np.clip(cgpa, 6.0, 10.0)
    
    # Academic percentages
    x10 = np.random.normal(85, 10)
    x10 = np.clip(x10, 60, 100)
    
    x12 = np.random.normal(82, 12)
    x12 = np.clip(x12, 60, 100)
    
    # Generate skills based on branch
    if branch in ["Computer Science", "Information Technology", "AIML"]:
        base_skills = ["Python", "Java", "C++", ".NET", "React", "Node.js", "JavaScript", "MongoDB", "MySQL"]
    elif branch == "Data Science":
        base_skills = ["Python", "Machine Learning", "Data Analysis", "Pandas", "NumPy", "SQL"]
    elif branch == "Cyber Security":
        base_skills = ["Linux", "Python", "Network Security", "Ethical Hacking", "Encryption"]
    else:
        base_skills = ["C++", "Java", ".NET", "Python", "SQL", "Docker"]
    
    num_skills = random.randint(4, 10)
    student_skills = random.sample(base_skills, min(num_skills, len(base_skills)))
    
    # Add some random skills
    other_skills = [s for s in SKILLS if s not in student_skills]
    extra_skills = random.sample(other_skills, min(3, len(other_skills)))
    student_skills.extend(extra_skills)
    
    names = [
        "Aarav Sharma", "Priya Patel", "Rahul Kumar", "Ananya Singh", "Arjun Mehta",
        "Sneha Reddy", "Karthik Iyer", "Divya Nair", "Rohan Joshi", "Neha Desai",
        "Siddharth Gupta", "Isha Agarwal", "Aditya Shah", "Tara Menon", "Vikram Rao",
        "Anjali Choudhury", "Nikhil Rajan", "Sara Khan", "Rajesh Subramanian", "Kavya Nair",
        "Harish Kumar", "Deepika Sharma", "Aniket Patel", "Meera Reddy", "Yash Shah"
    ]
    
    return {
        "student_id": f"S{student_id:05d}",
        "name": random.choice(names),
        "branch": branch,
        "cgpa": round(cgpa, 2),
        "tenth_percentage": round(x10, 1),
        "twelfth_percentage": round(x12, 1),
        "skills": student_skills[:10],  # Limit to 10 skills
    }

def generate_job_posting(job_id: int) -> Dict:
    """Generate a realistic job posting"""
    companies = [
        "TechCorp", "DataSystems", "CloudTech", "AI Solutions", "DevPros",
        "CodeCraft", "Innovate Labs", "Digital Ventures", "ByteSoft", "CloudLabs"
    ]
    
    job_titles = [
        "Software Developer", "Backend Engineer", "Frontend Developer",
        "Full Stack Developer", "Data Scientist", "DevOps Engineer",
        "Cloud Engineer", "Mobile App Developer", "UI/UX Designer", "QA Engineer",
        "Machine Learning Engineer", "Security Engineer", "Database Administrator",
        "System Architect", "Product Manager"
    ]
    
    roles_branch_map = {
        "Computer Science": ["Software Developer", "Backend Engineer", "Full Stack Developer"],
        "Information Technology": ["Software Developer", "Full Stack Developer", "Cloud Engineer"],
        "AIML": ["Machine Learning Engineer", "Data Scientist", "AI Solutions Engineer"],
        "Data Science": ["Data Scientist", "Data Analyst", "Machine Learning Engineer"],
        "Cyber Security": ["Security Engineer", "Penetration Tester", "Security Analyst"],
    }
    
    # Determine job requirements
    job_title = random.choice(job_titles)
    
    # CGPA requirements
    if "Senior" in job_title or "Lead" in job_title or "Architect" in job_title:
        min_cgpa = random.choice([8.5, 9.0, 9.5])
    elif "Junior" in job_title or "Intern" in job_title:
        min_cgpa = random.choice([7.0, 7.5, 8.0])
    else:
        min_cgpa = random.choice([8.0, 8.5, 9.0])
    
    # Required skills for the job
    if "Backend" in job_title:
        required_skills = ["Java", "Spring Boot", "MySQL", "REST API", "Docker"]
    elif "Frontend" in job_title:
        required_skills = ["React", "JavaScript", "CSS", "TypeScript", "Angular"]
    elif "Full Stack" in job_title:
        required_skills = ["React", "Node.js", "MongoDB", "Express.js", "JavaScript"]
    elif "Data Scientist" in job_title:
        required_skills = ["Python", "Machine Learning", "Pandas", "SQL", "Data Analysis"]
    elif "DevOps" in job_title:
        required_skills = ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"]
    else:
        # Generic skills
        required_skills = random.sample(SKILLS, 5)
    
    return {
        "job_id": f"J{job_id:05d}",
        "job_title": job_title,
        "company": random.choice(companies),
        "required_skills": required_skills,
        "min_cgpa": round(min_cgpa, 1),
        "min_tenth": random.choice([70, 75, 80, 85]),
        "min_twelfth": random.choice([70, 75, 80, 85]),
    }

def calculate_match_score(student: Dict, job: Dict) -> Tuple[float, int]:
    """
    Calculate match score for student-job pair
    Returns: (score, label)
    """
    # Skill overlap (Jaccard similarity)
    student_skills = set(student["skills"])
    job_skills = set(job["required_skills"])
    skill_overlap = len(student_skills & job_skills) / max(len(job_skills), 1) if job_skills else 0
    
    # CGPA match
    cgpa_score = 1.0 if student["cgpa"] >= job["min_cgpa"] else max(0, student["cgpa"] / job["min_cgpa"])
    
    # Tenth percentage match
    x10_score = 1.0 if student["tenth_percentage"] >= job["min_tenth"] else max(0, student["tenth_percentage"] / job["min_tenth"])
    
    # Twelfth percentage match
    x12_score = 1.0 if student["twelfth_percentage"] >= job["min_twelfth"] else max(0, student["twelfth_percentage"] / job["min_twelfth"])
    
    # Weighted score
    base_score = (
        0.50 * skill_overlap +
        0.30 * cgpa_score +
        0.10 * x10_score +
        0.10 * x12_score
    )
    
    # Add noise
    noise = np.random.normal(0, 0.03)
    final_score = np.clip(base_score + noise, 0, 1)
    
    # Binary label
    label = 1 if final_score > 0.65 else 0
    
    return round(final_score, 4), label

def generate_dataset(num_students: int = 5000, num_jobs: int = 500) -> pd.DataFrame:
    """Generate the complete synthetic dataset"""
    print("Generating student profiles...")
    students = [generate_student_profile(i) for i in range(num_students)]
    
    print("Generating job postings...")
    jobs = [generate_job_posting(i) for i in range(num_jobs)]
    
    print(f"Generating {num_students * num_jobs} student-job interactions...")
    data = []
    
    for job in jobs:
        # Each job views all students (for completeness)
        for student in students:
            score, label = calculate_match_score(student, job)
            
            data.append({
                "job_id": job["job_id"],
                "job_title": job["job_title"],
                "company": job["company"],
                "required_skills": ",".join(job["required_skills"]),
                "min_cgpa": job["min_cgpa"],
                "min_tenth": job["min_tenth"],
                "min_twelfth": job["min_twelfth"],
                "student_id": student["student_id"],
                "student_name": student["name"],
                "branch": student["branch"],
                "cgpa": student["cgpa"],
                "tenth_percentage": student["tenth_percentage"],
                "twelfth_percentage": student["twelfth_percentage"],
                "student_skills": ",".join(student["skills"]),
                "match_score": score,
                "match_label": label
            })
    
    df = pd.DataFrame(data)
    print(f"\nDataset generated: {len(df)} records")
    print(f"Positive matches (label=1): {df['match_label'].sum()} ({df['match_label'].mean()*100:.1f}%)")
    print(f"Negative matches (label=0): {(df['match_label']==0).sum()} ({(df['match_label']==0).mean()*100:.1f}%)")
    
    return df, students, jobs

def main():
    """Main execution function"""
    print("=" * 50)
    print("HireMe - Recruiter Recommendation Synthetic Dataset Generator")
    print("=" * 50)
    
    # Generate dataset
    df, students, jobs = generate_dataset(
        num_students=5000,
        num_jobs=500
    )
    
    # Save CSV
    output_file = "recruiter_matches.csv"
    df.to_csv(output_file, index=False)
    print(f"\n✓ Saved: {output_file}")
    
    # Save students as JSON
    with open("recruiter_students.json", "w") as f:
        json.dump(students, f, indent=2)
    print("✓ Saved: recruiter_students.json")
    
    # Save jobs as JSON
    with open("recruiter_jobs.json", "w") as f:
        json.dump(jobs, f, indent=2)
    print("✓ Saved: recruiter_jobs.json")
    
    # Print statistics
    print("\n" + "=" * 50)
    print("DATASET STATISTICS")
    print("=" * 50)
    print(f"Total records: {len(df)}")
    print(f"Unique students: {df['student_id'].nunique()}")
    print(f"Unique jobs: {df['job_id'].nunique()}")
    print(f"Average interactions per job: {len(df) / df['job_id'].nunique():.1f}")
    print(f"Positive match rate: {df['match_label'].mean()*100:.1f}%")
    print(f"Average match score: {df['match_score'].mean():.3f}")
    
    print("\n✓ Dataset generation complete!")
    print("\nFiles created:")
    print("  - recruiter_matches.csv")
    print("  - recruiter_students.json")
    print("  - recruiter_jobs.json")

if __name__ == "__main__":
    main()

