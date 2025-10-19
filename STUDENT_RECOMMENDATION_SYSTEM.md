# Student Recommendation System for Recruiters

## Overview
A comprehensive recommendation system that suggests suitable students for job postings based on skills, education, and eligibility criteria using content-based filtering and similarity algorithms.

## Features

### 🎯 Smart Matching Algorithm
- **Skill Matching (60%)**: Uses Jaccard similarity to compare job requirements with student skills
- **CGPA Scoring (25%)**: Evaluates academic performance against minimum requirements
- **Branch Matching (15%)**: Checks course/branch eligibility
- **Overall Score**: Combined weighted score out of 100

### 📊 Key Capabilities
1. **Ranked Student List**: Top 10 students sorted by match score
2. **Visual Match Indicators**: Progress bars showing skill match percentage
3. **Filtering**: Automatic filtering by CGPA and branch eligibility
4. **Statistics Dashboard**: Overview of recommendations quality
5. **Skill Highlighting**: Shows matching skills between job and student

## Backend Implementation

### Files Created

#### 1. `BE/src/services/studentRecommendation.service.ts`
Core recommendation engine with:
- `calculateSkillSimilarity()`: Jaccard similarity for skill matching
- `calculateMatchScore()`: Weighted scoring algorithm
- `meetsBasicRequirements()`: Eligibility validation
- `getRecommendedStudentsForJob()`: Main recommendation function
- `getRecommendationStats()`: Analytics for recommendations

#### 2. `BE/src/controllers/studentRecommendation.controller.ts`
API endpoints handlers:
- `getRecommendedStudents`: Returns ranked student list
- `getRecommendationStats`: Returns recommendation analytics

#### 3. `BE/src/routes/studentRecommendation.routes.ts`
REST API routes:
- `GET /api/student-recommendations/jobs/:jobId/students` - Get recommendations
- `GET /api/student-recommendations/jobs/:jobId/stats` - Get statistics

### API Endpoints

#### Get Recommended Students
```
GET /api/student-recommendations/jobs/:jobId/students?limit=10&minScore=0
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `minScore` (optional): Minimum match score (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "student": {
        "_id": "...",
        "fullName": "John Doe",
        "email": "john@example.com",
        "branch": "Computer Science",
        "cgpa": 8.5,
        "skills": ["JavaScript", "React", "Node.js"],
        "yearOfCompletion": 2024
      },
      "score": 85.5,
      "skillMatch": {
        "matchingSkills": ["JavaScript", "React"],
        "matchPercentage": 80.0
      },
      "meetsRequirements": {
        "cgpa": true,
        "branch": true
      }
    }
  ]
}
```

#### Get Recommendation Statistics
```
GET /api/student-recommendations/jobs/:jobId/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRecommendations": 15,
    "averageScore": 72.5,
    "topScore": 95.0,
    "skillMatchDistribution": {
      "excellent": 5,
      "good": 7,
      "fair": 2,
      "poor": 1
    }
  }
}
```

## Frontend Implementation

### Files Created

#### 1. `FE/src/services/studentRecommendationService.ts`
API client for recommendation services

#### 2. `FE/src/components/recruiter/RecommendedStudents.tsx`
React component featuring:
- Modal dialog with recommended students table
- Statistics cards showing match quality
- Visual progress bars for skill matching
- Skill chips displaying matched competencies
- Profile view links for each student

### Files Modified

#### `FE/src/pages/recruiter/ManageJobsPage.tsx`
Added:
- "View Recommended Students" button (Psychology icon)
- Button enabled only for approved jobs
- Integration with RecommendedStudents component

## How It Works

### 1. Scoring Algorithm

```typescript
Overall Score = (Skill Match × 60%) + (CGPA Score × 25%) + (Branch Match × 15%)
```

**Skill Matching:**
- Calculates percentage of required skills that student possesses
- Uses case-insensitive comparison
- Example: If job requires 5 skills and student has 4, match = 80%

**CGPA Scoring:**
- Students meeting minimum CGPA get scaled points based on how much they exceed minimum
- Formula: min(cgpa / (minCGPA + 2), 1) × 25
- No CGPA requirement = 15 points (partial credit)

**Branch Matching:**
- Full 15 points if student's course is in eligible branches
- 0 points if not eligible
- 15 points if no branch restriction

### 2. Filtering Logic

Students are filtered out if they don't meet:
- Minimum CGPA requirement
- Branch/course eligibility
- Minimum score threshold (if specified)
- Account verification status

### 3. Ranking

Students are sorted by overall score in descending order, with top N results returned.

## Usage Guide

### For Recruiters

1. **Post a Job** with required details:
   - Skills required
   - Eligible branches/courses
   - Minimum CGPA
   - Other criteria

2. **Wait for TnP Approval**
   - Recommendation feature activates after job approval

3. **View Recommendations**:
   - Click the Psychology (brain) icon on approved jobs
   - View ranked list of matching students
   - See match percentages and statistics
   - Click on students to view full profiles

### UI Features

#### Statistics Dashboard
- **Total Matches**: Number of eligible students found
- **Average Score**: Mean match score across all recommendations
- **Top Score**: Highest match score achieved
- **Excellent Matches**: Students with 80%+ skill match

#### Student Table Columns
1. **Rank**: Position in recommendation list (#1, #2, etc.)
2. **Student**: Name, avatar, and registration number
3. **Branch**: Academic program
4. **CGPA**: Grade point average with eligibility indicator
5. **Skill Match**: Visual progress bar with percentage
6. **Overall Score**: Combined match score with color coding
7. **Matching Skills**: Chips showing common skills
8. **Actions**: View profile button

#### Color Coding
- **Green (80-100%)**: Excellent match
- **Blue (60-79%)**: Good match
- **Orange (40-59%)**: Fair match
- **Red (0-39%)**: Poor match

## Benefits

### For Recruiters
- ✅ Save time screening candidates
- ✅ Find best-fit students quickly
- ✅ Data-driven hiring decisions
- ✅ Visual match indicators
- ✅ Transparent scoring methodology

### For Students
- ✅ Fair, algorithm-based evaluation
- ✅ Skills-focused matching
- ✅ Increased visibility for qualified candidates

### For TnP Officers
- ✅ Improved placement efficiency
- ✅ Better recruiter satisfaction
- ✅ Data insights on student-job matching

## Technical Details

### Dependencies
**Backend:**
- MongoDB/Mongoose (data storage)
- Express.js (API framework)
- TypeScript (type safety)

**Frontend:**
- React (UI framework)
- Material-UI (component library)
- Axios (HTTP client)

### Performance Considerations
- Recommendations calculated on-demand
- Results cached for session
- Limit parameter prevents over-fetching
- Indexed database queries for speed

### Security
- Authentication required (Recruiter/TnP roles)
- Job ownership validation
- Student data privacy (only verified, active students)
- CORS protection

## Future Enhancements

Potential improvements:
1. **Machine Learning**: Train models on successful placements
2. **Collaborative Filtering**: Consider student preferences and past applications
3. **Additional Factors**: Include projects, certifications, experience
4. **Batch Recommendations**: Recommend students for multiple jobs at once
5. **Email Notifications**: Auto-notify top matches about new jobs
6. **Interview Scheduling**: Direct integration with calendar systems
7. **Feedback Loop**: Improve algorithm based on hiring outcomes

## Testing

### Test Scenarios
1. Job with specific skill requirements
2. Job with CGPA filter
3. Job with branch restrictions
4. Job with combined filters
5. Job with no filters (all students eligible)

### Expected Behavior
- Students meeting all criteria appear first
- Partial matches ranked by score
- Ineligible students excluded
- Empty state for no matches

## Troubleshooting

### No Recommendations Showing
- Check if job is approved
- Verify students exist with required skills
- Check CGPA and branch filters aren't too restrictive
- Ensure students are verified by TnP

### Low Match Scores
- Review required skills list
- Consider broadening eligibility criteria
- Check if skills are properly formatted

### Button Disabled
- Recommendations only available for approved jobs
- Ensure job status is "Approved"

## Conclusion

This recommendation system provides an intelligent, fair, and efficient way to match students with job opportunities. By leveraging data-driven algorithms and providing transparent scoring, it benefits all stakeholders in the placement process.

---

**Version**: 1.0  
**Last Updated**: 2025-10-15  
**Author**: HireMe Development Team

