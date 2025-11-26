import Application from '../models/Application.model';
import Job from '../models/Job.model';

interface ApplicationExportData {
  registrationId: string | null;
  name: string;
  email: string;
  branch: string;
  college: string;
  graduationYear: number | null;
  cgpa: number | null;
  tenthPercentage: number | null;
  twelfthPercentage: number | null;
  recommendationPercentage: number;
  applicationStatus: string;
  appliedAt: Date;
  recruiterNotes: string | null;
}

/**
 * Calculate recommendation/match score for a student against a job
 * Uses the same logic as recommendation.controller.ts
 */
const calculateRecommendationScore = (student: any, job: any): number => {
  const studentSkillsArray = (student.studentDetails?.skills || []).map((s: any) => String(s).toLowerCase());
  const studentInterestsArray = (student.studentDetails?.areaOfInterest || []).map((s: any) => String(s).toLowerCase());
  const jobSkillsArray = (job.skillsRequired || []).map((s: any) => String(s).toLowerCase());
  
  const jobSkills = new Set(jobSkillsArray);
  
  // Match skills
  const commonSkills = studentSkillsArray.filter((skill: string) => jobSkills.has(skill));
  
  // Match area of interest with job skills
  const commonInterests = studentInterestsArray.filter((interest: string) => jobSkills.has(interest));
  
  // Calculate skill overlap
  const skill_overlap = jobSkills.size > 0 ? (commonSkills.length / jobSkills.size) * 100 : 0;
  
  // Calculate interest overlap (20% weight)
  const interest_overlap = jobSkills.size > 0 ? (commonInterests.length / jobSkills.size) * 100 : 0;
  
  // Combined match score: 70% skills + 20% interests + 10% base score
  const match_score = Math.round((skill_overlap / 100) * 70 + (interest_overlap / 100) * 20 + 10);
  
  return match_score;
};

/**
 * Get applications for export with student details
 */
export const getApplicationsForExport = async (
  jobId: string,
  statusFilter?: string
): Promise<ApplicationExportData[]> => {
  // Build status filter
  let statusQuery: any = {};
  
  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'shortlisted') {
      statusQuery.status = 'Shortlisted';
    } else if (statusFilter === 'placed') {
      statusQuery.status = { $in: ['Offered', 'Accepted'] };
    } else if (statusFilter === 'others') {
      statusQuery.status = { $nin: ['Shortlisted', 'Offered', 'Accepted'] };
    } else {
      // Allow other specific statuses
      statusQuery.status = statusFilter;
    }
  }

  // Find job to get job details for recommendation calculation
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  // Find applications with status filter
  const applications = await Application.find({
    jobId,
    ...statusQuery,
  })
    .populate({
      path: 'studentId',
      select: 'fullName email studentDetails',
      populate: {
        path: 'studentDetails.college',
        model: 'College',
        select: 'name',
      },
    })
    .sort({ appliedAt: -1 });

  // Transform to export format
  const exportData: ApplicationExportData[] = applications.map((app: any) => {
    const student = app.studentId;
    const studentDetails = student?.studentDetails || {};
    const college = studentDetails.college;
    
    // Calculate recommendation percentage
    const recommendationPercentage = calculateRecommendationScore(student, job);

    return {
      registrationId: studentDetails.registrationNumber || null,
      name: student?.fullName || 'N/A',
      email: student?.email || 'N/A',
      branch: studentDetails.courseName || 'N/A',
      college: college?.name || 'N/A',
      graduationYear: studentDetails.yearOfCompletion || null,
      cgpa: studentDetails.cgpa || null,
      tenthPercentage: studentDetails.tenthMarks?.percentage || null,
      twelfthPercentage: studentDetails.twelfthMarks?.percentage || null,
      recommendationPercentage,
      applicationStatus: app.status || 'N/A',
      appliedAt: app.appliedAt || app.createdAt,
      recruiterNotes: app.recruiterNotes || null,
    };
  });

  return exportData;
};

