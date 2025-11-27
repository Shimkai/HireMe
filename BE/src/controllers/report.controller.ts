import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiSuccess } from '../utils/apiResponse';
import User from '../models/User.model';
import Job from '../models/Job.model';
import Application from '../models/Application.model';

export const getReportData = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Fetching real-time report data from MongoDB...');

    // Get TnP user's college to filter data
    if (!req.user || req.user.role !== 'TnP') {
      throw new Error('Access denied. Only TnP users can access this data.');
    }

    const tnpUser = await User.findById(req.user.id);
    if (!tnpUser) {
      throw new Error('TnP user not found');
    }

    const collegeId = tnpUser.tnpDetails?.college;
    if (!collegeId) {
      throw new Error('College not assigned to TnP user');
    }

    console.log('Filtering report data by college:', collegeId);

    // Get students placed per company (from actual job applications) - filtered by college
    const studentsPerCompany = await Application.aggregate([
      { $match: { status: 'Accepted' } },
      { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $match: { 'student.role': 'Student', 'student.studentDetails.college': collegeId } },
      { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' } },
      { $unwind: '$job' },
      { $group: { _id: '$job.companyName', count: { $sum: 1 } } },
      { $project: { company: '$_id', students: '$count', _id: 0 } },
      { $sort: { students: -1 } },
      { $limit: 10 }
    ]);

    // Get jobs posted by recruiters (from actual jobs)
    const jobsByRecruiter = await Job.aggregate([
      { $group: { _id: '$postedBy', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'recruiter' } },
      { $unwind: '$recruiter' },
      { $project: { recruiter: '$recruiter.fullName', jobs: '$count', _id: 0 } },
      { $sort: { jobs: -1 } },
      { $limit: 10 }
    ]);

    // Get placement statistics by branch (from actual student data) - filtered by college
    // First, get all students grouped by course/branch
    const studentsByBranch = await User.aggregate([
      { $match: { 
        role: 'Student', 
        'studentDetails.courseName': { $exists: true, $ne: null },
        'studentDetails.college': collegeId
      }},
      { $group: { 
        _id: '$studentDetails.courseName', 
        total: { $sum: 1 },
        placedByStatus: {
          $sum: {
            $cond: [
              { $eq: ['$studentDetails.placementStatus', 'Placed'] },
              1,
              0
            ]
          }
        }
      }},
      { $project: { 
        branch: '$_id', 
        total: 1,
        placedByStatus: 1,
        _id: 0 
      }}
    ]);

    // Get placed students from applications (Accepted or Offered status) - filtered by college
    const placedFromApplications = await Application.aggregate([
      { $match: { status: { $in: ['Accepted', 'Offered'] } } },
      { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $match: { 
        'student.role': 'Student', 
        'student.studentDetails.courseName': { $exists: true, $ne: null },
        'student.studentDetails.college': collegeId
      }},
      { $group: {
        _id: '$student.studentDetails.courseName',
        placedCount: { $addToSet: '$studentId' } // Use addToSet to count unique students
      }},
      { $project: {
        branch: '$_id',
        placedCount: { $size: '$placedCount' },
        _id: 0
      }}
    ]);

    // Merge the two results
    const placementMap = new Map();
    
    // Add all branches with totals
    studentsByBranch.forEach((item: any) => {
      placementMap.set(item.branch, {
        branch: item.branch,
        total: item.total,
        placed: item.placedByStatus || 0
      });
    });

    // Update with application-based placements (take the higher count)
    placedFromApplications.forEach((item: any) => {
      const existing = placementMap.get(item.branch);
      if (existing) {
        // Use the maximum of placementStatus and application status
        existing.placed = Math.max(existing.placed, item.placedCount);
      } else {
        // If branch not in student list, add it
        placementMap.set(item.branch, {
          branch: item.branch,
          total: item.placedCount, // Approximate total
          placed: item.placedCount
        });
      }
    });

    // Convert to array and calculate percentages
    const placementByBranch = Array.from(placementMap.values()).map((item: any) => ({
      branch: item.branch || 'Unknown',
      total: item.total || 0,
      placed: item.placed || 0,
      percentage: item.total > 0 ? Math.round((item.placed / item.total) * 100) : 0
    })).sort((a, b) => b.percentage - a.percentage);

    // Get applications vs selections trend (last 6 months from actual applications) - filtered by college
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const applicationsVsSelections = await Application.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $match: { 'student.role': 'Student', 'student.studentDetails.college': collegeId } },
      { $group: { 
        _id: { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' } 
        },
        applications: { $sum: 1 },
        selections: { $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } }
      }},
      { $project: { 
        month: { 
          $dateToString: { 
            format: '%b', 
            date: { $dateFromParts: { year: '$_id.year', month: '$_id.month' } }
          }
        },
        applications: 1,
        selections: 1,
        _id: 0
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get additional real-time statistics - filtered by college
    const totalStudents = await User.countDocuments({ 
      role: 'Student',
      'studentDetails.college': collegeId
    });
    
    // Count approved and active jobs (jobs that students can apply to)
    const totalJobs = await Job.countDocuments({ 
      status: 'Approved',
      isActive: true,
      applicationDeadline: { $gte: new Date() }
    });
    
    // Count applications from students in this college
    const studentIds = await User.find({ 
      role: 'Student',
      'studentDetails.college': collegeId
    }).select('_id').lean();
    const studentIdArray = studentIds.map(s => s._id);
    
    const totalApplications = await Application.countDocuments({ 
      studentId: { $in: studentIdArray }
    });
    
    const totalSelections = await Application.countDocuments({ 
      studentId: { $in: studentIdArray },
      status: { $in: ['Accepted', 'Offered'] }
    });
    
    const totalRecruiters = await User.countDocuments({ role: 'Recruiter' });

    // Prepare fallback data if no real data exists
    const fallbackData = {
      studentsPerCompany: [
        { company: 'No Data Available', students: 0 }
      ],
      jobsByRecruiter: [
        { recruiter: 'No Data Available', jobs: 0 }
      ],
      placementByBranch: [
        { branch: 'No Data Available', placed: 0, total: 0, percentage: 0 }
      ],
      applicationsVsSelections: [
        { month: 'No Data', applications: 0, selections: 0 }
      ]
    };

    const reportData = {
      studentsPerCompany: studentsPerCompany.length > 0 ? studentsPerCompany : fallbackData.studentsPerCompany,
      jobsByRecruiter: jobsByRecruiter.length > 0 ? jobsByRecruiter : fallbackData.jobsByRecruiter,
      placementByBranch: placementByBranch.length > 0 ? placementByBranch : fallbackData.placementByBranch,
      applicationsVsSelections: applicationsVsSelections.length > 0 ? applicationsVsSelections : fallbackData.applicationsVsSelections,
      // Add real-time statistics
      statistics: {
        totalStudents,
        totalJobs,
        totalApplications,
        totalSelections,
        totalRecruiters,
        placementRate: totalStudents > 0 ? Math.round((totalSelections / totalStudents) * 100) : 0,
        lastUpdated: new Date().toISOString()
      }
    };

    console.log('Report data fetched successfully:', {
      studentsPerCompany: reportData.studentsPerCompany.length,
      jobsByRecruiter: reportData.jobsByRecruiter.length,
      placementByBranch: reportData.placementByBranch.length,
      placementByBranchData: reportData.placementByBranch, // Log actual data
      applicationsVsSelections: reportData.applicationsVsSelections.length,
      statistics: reportData.statistics
    });

    ApiSuccess.send(res, reportData, 'Real-time report data fetched successfully');
  } catch (error) {
    console.error('Error fetching report data:', error);
    throw error;
  }
});

export const downloadReportPDF = asyncHandler(async (req: Request, res: Response) => {
  const { reportType } = req.params;
  
  // This would generate a PDF on the server side
  // For now, we'll return a success response
  // In a real implementation, you'd use libraries like puppeteer or pdfkit
  
  res.json({
    success: true,
    message: `PDF generation for ${reportType} would be implemented here`,
    downloadUrl: `/api/analytics/report/pdf/${reportType}/download`
  });
});
