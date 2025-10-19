import User from '../models/User.model';
import Job from '../models/Job.model';

interface SkillMatch {
  matchingSkills: string[];
  matchPercentage: number;
}

interface StudentScore {
  student: any;
  score: number;
  skillMatch: SkillMatch;
  meetsRequirements: {
    cgpa: boolean;
    branch: boolean;
  };
}

/**
 * Calculate cosine similarity between two skill sets
 * Uses Jaccard similarity as a simpler alternative to cosine similarity
 */
const calculateSkillSimilarity = (jobSkills: string[], studentSkills: string[]): SkillMatch => {
  if (!jobSkills || jobSkills.length === 0) {
    return { matchingSkills: [], matchPercentage: 0 };
  }

  // Convert to lowercase for case-insensitive comparison
  const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());
  const normalizedStudentSkills = (studentSkills || []).map(s => s.toLowerCase().trim());

  // Find matching skills
  const matchingSkills = normalizedJobSkills.filter(skill => 
    normalizedStudentSkills.includes(skill)
  );
  
  // Calculate match percentage based on job requirements
  const matchPercentage = normalizedJobSkills.length > 0 
    ? (matchingSkills.length / normalizedJobSkills.length) * 100 
    : 0;

  return {
    matchingSkills: matchingSkills.map(skill => {
      // Return original casing from student skills
      const originalSkill = studentSkills.find(s => s.toLowerCase().trim() === skill);
      return originalSkill || skill;
    }),
    matchPercentage: Math.round(matchPercentage * 100) / 100
  };
};

/**
 * Calculate overall match score for a student
 * Scoring breakdown:
 * - Skills match: 60%
 * - CGPA: 25%
 * - Branch match: 15%
 */
const calculateMatchScore = (
  job: any,
  student: any,
  skillMatch: SkillMatch
): number => {
  let score = 0;

  // 1. Skills matching (60 points max)
  score += (skillMatch.matchPercentage / 100) * 60;

  // 2. CGPA score (25 points max)
  const minCGPA = job.eligibility?.minCGPA;
  if (minCGPA && student.studentDetails?.cgpa) {
    const cgpa = student.studentDetails.cgpa;
    
    if (cgpa >= minCGPA) {
      // Give full points if CGPA is well above minimum
      const cgpaRatio = Math.min(cgpa / (minCGPA + 2), 1);
      score += cgpaRatio * 25;
    }
  } else if (!minCGPA) {
    // If no CGPA requirement, give partial credit
    score += 15;
  }

  // 3. Branch match (15 points max)
  const allowedCourses = job.eligibility?.allowedCourses;
  if (allowedCourses && allowedCourses.length > 0) {
    const studentBranch = student.studentDetails?.courseName?.toLowerCase().trim();
    const eligibleBranches = allowedCourses.map((b: string) => b.toLowerCase().trim());
    
    if (studentBranch && eligibleBranches.includes(studentBranch)) {
      score += 15;
    }
  } else {
    // If no branch requirement, give full credit
    score += 15;
  }

  return Math.round(score * 100) / 100;
};

/**
 * Check if student meets basic eligibility requirements
 */
const meetsBasicRequirements = (job: any, student: any): { cgpa: boolean; branch: boolean } => {
  const requirements = {
    cgpa: true,
    branch: true
  };

  // Check CGPA requirement
  const minCGPA = job.eligibility?.minCGPA;
  if (minCGPA && student.studentDetails?.cgpa) {
    requirements.cgpa = student.studentDetails.cgpa >= minCGPA;
  }

  // Check branch requirement
  const allowedCourses = job.eligibility?.allowedCourses;
  if (allowedCourses && allowedCourses.length > 0) {
    const studentBranch = student.studentDetails?.courseName?.toLowerCase().trim();
    const eligibleBranches = allowedCourses.map((b: string) => b.toLowerCase().trim());
    requirements.branch = eligibleBranches.includes(studentBranch || '');
  }

  return requirements;
};

/**
 * Get recommended students for a specific job
 */
export const getRecommendedStudentsForJob = async (
  jobId: string,
  options: { limit?: number; minScore?: number } = {}
): Promise<StudentScore[]> => {
  const { limit = 10, minScore = 0 } = options;

  // Fetch the job
  const job = await Job.findById(jobId)
    .populate('postedBy', 'recruiterDetails.companyName');

  if (!job) {
    throw new Error('Job not found');
  }

  // Fetch all verified students
  const query: any = {
    role: 'Student',
    'studentDetails.isVerified': true,
    isActive: true
  };

  const students = await User.find(query)
    .select('fullName email studentDetails profileAvatar')
    .lean();

  // Calculate scores for each student
  const studentScores: StudentScore[] = students.map(student => {
    const skillMatch = calculateSkillSimilarity(
      job.skillsRequired || [],
      student.studentDetails?.skills || []
    );

    const meetsRequirements = meetsBasicRequirements(job, student);
    
    const score = calculateMatchScore(job, student, skillMatch);

    return {
      student: {
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        profileAvatar: student.profileAvatar,
        branch: student.studentDetails?.courseName,
        cgpa: student.studentDetails?.cgpa,
        yearOfCompletion: student.studentDetails?.yearOfCompletion,
        skills: student.studentDetails?.skills,
        registrationNumber: student.studentDetails?.registrationNumber
      },
      score,
      skillMatch,
      meetsRequirements
    };
  });

  // Filter by minimum score and basic requirements
  const filteredStudents = studentScores.filter(
    s => s.score >= minScore && s.meetsRequirements.cgpa && s.meetsRequirements.branch
  );

  // Sort by score in descending order
  filteredStudents.sort((a, b) => b.score - a.score);

  // Return top N students
  return filteredStudents.slice(0, limit);
};

/**
 * Get recommendation statistics for a job
 */
export const getRecommendationStats = async (jobId: string) => {
  const recommendations = await getRecommendedStudentsForJob(jobId, { limit: 100 });

  return {
    totalRecommendations: recommendations.length,
    averageScore: recommendations.length > 0
      ? recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length
      : 0,
    topScore: recommendations.length > 0 ? recommendations[0].score : 0,
    skillMatchDistribution: {
      excellent: recommendations.filter(r => r.skillMatch.matchPercentage >= 80).length,
      good: recommendations.filter(r => r.skillMatch.matchPercentage >= 60 && r.skillMatch.matchPercentage < 80).length,
      fair: recommendations.filter(r => r.skillMatch.matchPercentage >= 40 && r.skillMatch.matchPercentage < 60).length,
      poor: recommendations.filter(r => r.skillMatch.matchPercentage < 40).length,
    }
  };
};

export default {
  getRecommendedStudentsForJob,
  getRecommendationStats
};

