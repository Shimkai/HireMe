import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { ApiSuccess } from '../utils/apiResponse';
import User from '../models/User.model';
import Job from '../models/Job.model';
import Application from '../models/Application.model';
import axios from 'axios';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8001';

// @desc Get recommended students for a job
// @route GET /api/recommendations/:jobId
// @access Private (Recruiter, TnP)
export const getRecommendedStudents = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const top_k = parseInt(req.query.top_k as string) || 20;

  // Find the job
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  // Only job owner can view recommendations
  if (!req.user) {
    throw ApiError.unauthorized('User not authenticated');
  }
  
  if (job.postedBy.toString() !== req.user.id) {
    throw ApiError.forbidden('You can only view recommendations for your own jobs');
  }

  // Only show recommendations for approved jobs
  if (job.status !== 'Approved') {
    throw ApiError.badRequest('Recommendations are only available for approved jobs');
  }

  try {
    // Get all students who have applied to this job
    const applications = await Application.find({ jobId: jobId }).select('studentId');
    const studentIds = applications.map(app => app.studentId);
    
    console.log(`Found ${studentIds.length} applications for job ${jobId}`);
    
    if (studentIds.length === 0) {
      ApiSuccess.send(res, [], 'No students have applied to this job yet');
      return;
    }
    
    // Get only students who applied
    const students = await User.find({ 
      role: 'Student',
      _id: { $in: studentIds }
    });
    
    console.log(`Found ${students.length} students who applied`);

    // Prepare data for ML API
    const jobData = {
      job_id: (job._id as any).toString(),
      job_title: job.title,
      required_skills: job.skillsRequired || [],
      min_cgpa: job.eligibility?.minCGPA || 7.0,
      min_tenth: job.eligibility?.minTenthPercentage || 70,
      min_twelfth: job.eligibility?.minTwelfthPercentage || 70,
    };

    const studentsData = students.map((student: any) => ({
      student_id: student._id.toString(),
      name: student.fullName || 'Unknown',
      branch: student.studentDetails?.courseName || 'N/A',
      cgpa: student.studentDetails?.cgpa || 7.0,
      tenth_percentage: student.studentDetails?.tenthMarks?.percentage || 80,
      twelfth_percentage: student.studentDetails?.twelfthMarks?.percentage || 75,
      skills: student.studentDetails?.skills || [],
      areaOfInterest: student.studentDetails?.areaOfInterest || [],
    }));
    
    console.log('Students data for ML:', studentsData);

    // Call ML API for recommendations
    const mlResponse = await axios.post(`${ML_API_URL}/recommend`, {
      job: jobData,
      students: studentsData,
      top_k: top_k,
    });

    ApiSuccess.send(res, mlResponse.data, 'Recommendations fetched successfully');
  } catch (error: any) {
    // If ML API fails, use simple rule-based matching
    console.log('ML API not available, using rule-based matching');
    
    // Get all students who have applied to this job
    const applications = await Application.find({ jobId: jobId }).select('studentId');
    const studentIds = applications.map(app => app.studentId);
    
    console.log(`Found ${studentIds.length} applications for job ${jobId}`);
    
    if (studentIds.length === 0) {
      ApiSuccess.send(res, [], 'No students have applied to this job yet');
    return;
  }

    // Get all students who applied
    const students = await User.find({ 
      role: 'Student',
      _id: { $in: studentIds }
    });

    console.log(`Found ${students.length} students who applied`);
    
    // Include ALL students who applied, don't filter by eligibility criteria
    // The match score will reflect how well they match, and recruiters can still see all applicants
    const recommendations = students
      .map((student: any) => {
        const studentSkillsArray = (student.studentDetails?.skills || []).map((s: any) => String(s).toLowerCase());
        const studentInterestsArray = (student.studentDetails?.areaOfInterest || []).map((s: any) => String(s).toLowerCase());
        const jobSkillsArray = (job.skillsRequired || []).map((s: any) => String(s).toLowerCase());
        
        const jobSkills = new Set(jobSkillsArray);
        
        // Match skills
        const commonSkills = studentSkillsArray.filter((skill: string) => jobSkills.has(skill));
        
        // Match area of interest with job skills (skills can be considered as area of interest)
        const commonInterests = studentInterestsArray.filter((interest: string) => jobSkills.has(interest));
        
        // Calculate skill overlap
        const skill_overlap = jobSkills.size > 0 ? (commonSkills.length / jobSkills.size) * 100 : 0;
        
        // Calculate interest overlap (20% weight)
        const interest_overlap = jobSkills.size > 0 ? (commonInterests.length / jobSkills.size) * 100 : 0;
        
        // Combined match score: 70% skills + 20% interests + 10% base score
        const match_score = Math.round((skill_overlap / 100) * 70 + (interest_overlap / 100) * 20 + 10);

        const recommendation = {
          student_id: student._id.toString(),
          name: student.fullName || 'Unknown',
          branch: student.studentDetails?.courseName || 'N/A',
          cgpa: student.studentDetails?.cgpa || 7.0,
          tenth_percentage: student.studentDetails?.tenthMarks?.percentage || 80,
          twelfth_percentage: student.studentDetails?.twelfthMarks?.percentage || 75,
          match_score,
          skill_overlap: Math.round(skill_overlap),
          interest_overlap: Math.round(interest_overlap),
          skills: student.studentDetails?.skills || [],
          areaOfInterest: student.studentDetails?.areaOfInterest || [],
          reason: `${Math.round(skill_overlap)}% skill match, ${Math.round(interest_overlap)}% interest match`,
        };
        
        console.log(`Student recommendation:`, recommendation.name, recommendation.student_id);
        return recommendation;
      })
      .sort((a: any, b: any) => b.match_score - a.match_score)
      .slice(0, top_k);

    ApiSuccess.send(res, recommendations, 'Recommendations fetched successfully (rule-based)');
  }
});

// @desc Shortlist a student for a job
// @route POST /api/recommendations/shortlist
// @access Private (Recruiter, TnP)
export const shortlistStudent = asyncHandler(async (req: Request, res: Response) => {
  const { jobId, studentId } = req.body;

  if (!jobId || !studentId) {
    throw ApiError.badRequest('Job ID and Student ID are required');
  }

  // Find the job and verify ownership
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (!req.user) {
    throw ApiError.unauthorized('User not authenticated');
  }
  
  if (job.postedBy.toString() !== req.user.id) {
    throw ApiError.forbidden('You can only shortlist students for your own jobs');
  }

  // Only allow actions on approved jobs
  if (job.status !== 'Approved') {
    throw ApiError.badRequest('This action is only available for approved jobs');
  }

  // Create or update application status
  const Application = require('../models/Application.model').default;
  
  const application = await Application.findOneAndUpdate(
    { jobId: jobId, studentId: studentId },
    {
      $set: {
        status: 'Shortlisted',
        shortlistedAt: new Date(),
        updatedAt: new Date(),
      }
    },
    { upsert: true, new: true }
  );

  // Create notification for student
  const Notification = require('../models/Notification.model').default;
  
  // Get student details for notification
  const student = await User.findById(studentId);
  if (student) {
    await Notification.create({
      userId: studentId,
      role: student.role as 'Student' | 'TnP' | 'Recruiter',
      type: 'application_status',
      title: 'Application Shortlisted',
      message: `Congratulations! Your application for ${job.title} at ${job.companyName} has been shortlisted.`,
      priority: 'high',
      metadata: {
        jobId: job._id,
        status: 'Shortlisted'
      }
    });
  }

  ApiSuccess.send(res, application, 'Student shortlisted successfully');
});

// @desc Place a student for a job
// @route POST /api/recommendations/place
// @access Private (Recruiter, TnP)
export const placeStudent = asyncHandler(async (req: Request, res: Response) => {
  const { jobId, studentId } = req.body;

  if (!jobId || !studentId) {
    throw ApiError.badRequest('Job ID and Student ID are required');
  }

  // Find the job and verify ownership
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (!req.user) {
    throw ApiError.unauthorized('User not authenticated');
  }
  
  if (job.postedBy.toString() !== req.user.id) {
    throw ApiError.forbidden('You can only place students for your own jobs');
  }

  // Only allow actions on approved jobs
  if (job.status !== 'Approved') {
    throw ApiError.badRequest('This action is only available for approved jobs');
  }

  const Application = require('../models/Application.model').default;
  const Notification = require('../models/Notification.model').default;

  // Update application status to "Offered" or "Accepted"
  const application = await Application.findOneAndUpdate(
    { jobId: jobId, studentId: studentId },
    {
      $set: {
        status: 'Accepted',
        offeredAt: new Date(),
        updatedAt: new Date(),
      }
    },
    { new: true }
  );

  // Update student placement status
  const student = await User.findById(studentId);
  if (student && student.studentDetails) {
    student.studentDetails.placementStatus = 'Placed';
    await student.save();
  }

  // Get student details for notification
  if (student) {
    // Create notification for student
    await Notification.create({
      userId: studentId,
      role: student.role as 'Student' | 'TnP' | 'Recruiter',
      type: 'application_status',
      title: 'Job Offer Received!',
      message: `Congratulations! You have been offered the position of ${job.title} at ${job.companyName}.`,
      priority: 'high',
      metadata: {
        jobId: job._id,
        status: 'Accepted'
      }
    });
  }

  ApiSuccess.send(
    res,
    {
      application,
      studentName: student?.fullName || 'Student',
      jobTitle: job.title,
    },
    'Student accepted/placed successfully!'
  );
});

