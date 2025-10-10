import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiSuccess } from '../utils/apiResponse';
import User from '../models/User.model';
import Job from '../models/Job.model';
import Application from '../models/Application.model';

export const getReportData = asyncHandler(async (_req: Request, res: Response) => {
  try {
    console.log('Fetching real-time report data from MongoDB...');

    // Get students placed per company (from actual job applications)
    const studentsPerCompany = await Application.aggregate([
      { $match: { status: 'Accepted' } },
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

    // Get placement statistics by branch (from actual student data)
    const placementByBranch = await User.aggregate([
      { $match: { role: 'Student' } },
      { $group: { 
        _id: '$studentDetails.courseName', 
        total: { $sum: 1 },
        placed: { 
          $sum: { 
            $cond: [
              { $in: ['$_id', { $map: { input: { $objectToArray: '$studentDetails' }, as: 'item', in: '$$item.v' } }] },
              1, 
              0
            ]
          }
        }
      }},
      { $project: { 
        branch: '$_id', 
        total: 1, 
        placed: { $min: ['$total', '$placed'] }, // Ensure placed doesn't exceed total
        percentage: { 
          $cond: [
            { $gt: ['$total', 0] },
            { $multiply: [{ $divide: ['$placed', '$total'] }, 100] },
            0
          ]
        },
        _id: 0 
      }},
      { $sort: { percentage: -1 } }
    ]);

    // Get applications vs selections trend (last 6 months from actual applications)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const applicationsVsSelections = await Application.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
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

    // Get additional real-time statistics
    const totalStudents = await User.countDocuments({ role: 'Student' });
    const totalJobs = await Job.countDocuments({ status: 'Active' });
    const totalApplications = await Application.countDocuments();
    const totalSelections = await Application.countDocuments({ status: 'Accepted' });
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
