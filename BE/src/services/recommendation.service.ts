import User from '../models/User.model';
import Job from '../models/Job.model';
import { ApiError } from '../utils/apiError';

interface JobRecommendation {
  job: any;
  matchPercentage: number;
  reasons: string[];
}

interface StudentProfile {
  skills: string[];
  branch: string;
  cgpa: number;
  yearOfCompletion: number;
}

interface JobProfile {
  requiredSkills: string[];
  eligibleBranches: string[];
  minCGPA: number;
  yearOfCompletion: number[];
}

export class RecommendationService {
  /**
   * Calculate cosine similarity between two skill arrays
   */
  private calculateCosineSimilarity(skills1: string[], skills2: string[]): number {
    if (skills1.length === 0 || skills2.length === 0) return 0;

    // Convert to lowercase for case-insensitive comparison
    const skills1Lower = skills1.map(s => s.toLowerCase().trim());
    const skills2Lower = skills2.map(s => s.toLowerCase().trim());

    // Create skill vectors
    const allSkills = [...new Set([...skills1Lower, ...skills2Lower])];
    const vector1 = allSkills.map(skill => skills1Lower.includes(skill) ? 1 : 0);
    const vector2 = allSkills.map(skill => skills2Lower.includes(skill) ? 1 : 0);

    // Calculate dot product
    const dotProduct = vector1.reduce((sum: number, val: number, index: number) => sum + val * vector2[index], 0);

    // Calculate magnitudes
    const magnitude1 = Math.sqrt(vector1.reduce((sum: number, val: number) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum: number, val: number) => sum + val * val, 0));

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Check if student meets job eligibility criteria
   */
  private checkEligibility(student: StudentProfile, job: JobProfile): { isEligible: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // Check CGPA requirement
    if (student.cgpa < job.minCGPA) {
      reasons.push(`CGPA requirement not met (${student.cgpa} < ${job.minCGPA})`);
    }

    // Check branch eligibility
    if (job.eligibleBranches.length > 0 && !job.eligibleBranches.includes(student.branch)) {
      reasons.push(`Branch not eligible (${student.branch} not in ${job.eligibleBranches.join(', ')})`);
    }

    // Check year of completion
    if (job.yearOfCompletion.length > 0 && !job.yearOfCompletion.includes(student.yearOfCompletion)) {
      reasons.push(`Year of completion not eligible (${student.yearOfCompletion} not in ${job.yearOfCompletion.join(', ')})`);
    }

    return {
      isEligible: reasons.length === 0,
      reasons
    };
  }

  /**
   * Calculate match percentage based on multiple factors
   */
  private calculateMatchPercentage(student: StudentProfile, job: JobProfile): { percentage: number; reasons: string[] } {
    const reasons: string[] = [];
    let totalScore = 0;
    let maxScore = 0;

    // Skill matching (40% weight)
    const skillSimilarity = this.calculateCosineSimilarity(student.skills, job.requiredSkills);
    const skillScore = skillSimilarity * 40;
    totalScore += skillScore;
    maxScore += 40;

    if (skillSimilarity > 0) {
      const matchedSkills = student.skills.filter(skill => 
        job.requiredSkills.some(reqSkill => 
          skill.toLowerCase().trim() === reqSkill.toLowerCase().trim()
        )
      );
      reasons.push(`Skills match: ${matchedSkills.length}/${job.requiredSkills.length} (${Math.round(skillSimilarity * 100)}%)`);
    }

    // CGPA match (20% weight)
    if (student.cgpa >= job.minCGPA) {
      const cgpaScore = Math.min(20, (student.cgpa / job.minCGPA) * 20);
      totalScore += cgpaScore;
      reasons.push(`CGPA exceeds requirement (${student.cgpa} >= ${job.minCGPA})`);
    }
    maxScore += 20;

    // Branch match (20% weight)
    if (job.eligibleBranches.length === 0 || job.eligibleBranches.includes(student.branch)) {
      totalScore += 20;
      reasons.push(`Branch eligible (${student.branch})`);
    }
    maxScore += 20;

    // Year of completion match (20% weight)
    if (job.yearOfCompletion.length === 0 || job.yearOfCompletion.includes(student.yearOfCompletion)) {
      totalScore += 20;
      reasons.push(`Year of completion eligible (${student.yearOfCompletion})`);
    }
    maxScore += 20;

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return { percentage, reasons };
  }

  /**
   * Get job recommendations for a student
   */
  async getJobRecommendations(studentId: string, limit: number = 6): Promise<JobRecommendation[]> {
    try {
      // Get student profile
      const student = await User.findById(studentId).populate('studentDetails.college');
      if (!student || student.role !== 'Student') {
        throw ApiError.notFound('Student not found');
      }

      if (!student.studentDetails) {
        throw ApiError.badRequest('Student details not found');
      }

      // Build student profile
      const studentProfile: StudentProfile = {
        skills: student.studentDetails.skills || [],
        branch: student.studentDetails.courseName || '',
        cgpa: student.studentDetails.cgpa || 0,
        yearOfCompletion: student.studentDetails.yearOfCompletion || new Date().getFullYear()
      };

      // Get all approved jobs
      const jobs = await Job.find({ status: 'Approved', isActive: true })
        .populate('postedBy', 'fullName email')
        .sort({ createdAt: -1 });

      const recommendations: JobRecommendation[] = [];

      for (const job of jobs) {
        // Build job profile
        const jobProfile: JobProfile = {
          requiredSkills: job.skillsRequired || [],
          eligibleBranches: job.eligibility?.allowedCourses || [],
          minCGPA: job.eligibility?.minCGPA || 0,
          yearOfCompletion: job.eligibility?.yearOfCompletion || []
        };

        // Check eligibility
        const eligibility = this.checkEligibility(studentProfile, jobProfile);
        
        // Calculate match percentage
        const match = this.calculateMatchPercentage(studentProfile, jobProfile);

        // Only include jobs with at least 20% match
        if (match.percentage >= 20) {
          recommendations.push({
            job: job.toObject(),
            matchPercentage: match.percentage,
            reasons: [...match.reasons, ...eligibility.reasons]
          });
        }
      }

      // Sort by match percentage (descending) and return top recommendations
      return recommendations
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting job recommendations:', error);
      throw error;
    }
  }

  /**
   * Get job recommendations for multiple students (for analytics)
   */
  async getBulkRecommendations(studentIds: string[], limit: number = 6): Promise<{ [studentId: string]: JobRecommendation[] }> {
    const results: { [studentId: string]: JobRecommendation[] } = {};

    for (const studentId of studentIds) {
      try {
        results[studentId] = await this.getJobRecommendations(studentId, limit);
      } catch (error) {
        console.error(`Error getting recommendations for student ${studentId}:`, error);
        results[studentId] = [];
      }
    }

    return results;
  }
}

export const recommendationService = new RecommendationService();
