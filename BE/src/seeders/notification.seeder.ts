import mongoose from 'mongoose';
import User from '../models/User.model';
import Notification from '../models/Notification.model';

const notificationSeeder = async () => {
  try {
    console.log('🌱 Starting notification seeder...');

    // Clear existing notifications
    await Notification.deleteMany({});
    console.log('✅ Cleared existing notifications');

    // Get some test users
    const students = await User.find({ role: 'Student' }).limit(3);
    const recruiters = await User.find({ role: 'Recruiter' }).limit(2);
    const tnpUsers = await User.find({ role: 'TnP' }).limit(2);

    if (students.length === 0 || recruiters.length === 0 || tnpUsers.length === 0) {
      console.log('⚠️  Not enough test users found. Please run user seeder first.');
      return;
    }

    // Create sample notifications for students
    const studentNotifications = [
      {
        userId: students[0]._id,
        role: 'Student',
        title: 'New Job Available',
        message: 'Software Engineer position at Google is now available for applications. Apply now!',
        type: 'job_posting',
        priority: 'high',
        isRead: false,
        metadata: {
          jobId: new mongoose.Types.ObjectId(),
          status: 'available'
        }
      },
      {
        userId: students[0]._id,
        role: 'Student',
        title: 'Application Status Update',
        message: 'Congratulations! Your application for Data Scientist at Microsoft has been Placed!',
        type: 'application_status',
        priority: 'high',
        isRead: false,
        metadata: {
          applicationId: new mongoose.Types.ObjectId(),
          status: 'Placed'
        }
      },
      {
        userId: students[0]._id,
        role: 'Student',
        title: 'New Job Available',
        message: 'Frontend Developer role at Amazon is now open for applications.',
        type: 'job_posting',
        priority: 'medium',
        isRead: true,
        metadata: {
          jobId: new mongoose.Types.ObjectId(),
          status: 'available'
        }
      },
      {
        userId: students[1]._id,
        role: 'Student',
        title: 'Application Status Update',
        message: 'Your application for Backend Engineer at Facebook is Under Review.',
        type: 'application_status',
        priority: 'medium',
        isRead: false,
        metadata: {
          applicationId: new mongoose.Types.ObjectId(),
          status: 'Under Review'
        }
      }
    ];

    // Create sample notifications for TnP users
    const tnpNotifications = [
      {
        userId: tnpUsers[0]._id,
        role: 'TnP',
        title: 'Job Approval Required',
        message: 'New job posting "Senior Software Engineer" from Infosys requires your approval.',
        type: 'job_approval',
        priority: 'high',
        isRead: false,
        metadata: {
          jobId: new mongoose.Types.ObjectId(),
          status: 'pending'
        }
      },
      {
        userId: tnpUsers[0]._id,
        role: 'TnP',
        title: 'Job Approval Required',
        message: 'Data Analyst position from Wipro is pending for approval for 2 days.',
        type: 'job_approval',
        priority: 'medium',
        isRead: false,
        metadata: {
          jobId: new mongoose.Types.ObjectId(),
          status: 'pending'
        }
      },
      {
        userId: tnpUsers[0]._id,
        role: 'TnP',
        title: 'Student Placed',
        message: 'John Doe has been placed at Google for the position "Software Engineer".',
        type: 'application_status',
        priority: 'high',
        isRead: true,
        metadata: {
          status: 'Placed'
        }
      }
    ];

    // Create sample notifications for recruiters
    const recruiterNotifications = [
      {
        userId: recruiters[0]._id,
        role: 'Recruiter',
        title: 'Job Approved',
        message: 'Your job posting "UI/UX Designer" has been Approved by TnP and is now live!',
        type: 'job_approval',
        priority: 'high',
        isRead: false,
        metadata: {
          jobId: new mongoose.Types.ObjectId(),
          status: 'approved'
        }
      },
      {
        userId: recruiters[0]._id,
        role: 'Recruiter',
        title: 'Job Rejected',
        message: 'Your job posting "Marketing Intern" was rejected by TnP. Reason: Incomplete details.',
        type: 'job_rejection',
        priority: 'high',
        isRead: false,
        metadata: {
          jobId: new mongoose.Types.ObjectId(),
          status: 'rejected'
        }
      },
      {
        userId: recruiters[0]._id,
        role: 'Recruiter',
        title: 'New Application Received',
        message: 'Sarah Johnson has applied for your job "Full Stack Developer".',
        type: 'application_status',
        priority: 'medium',
        isRead: true,
        metadata: {
          applicationId: new mongoose.Types.ObjectId(),
          status: 'applied'
        }
      },
      {
        userId: recruiters[1]._id,
        role: 'Recruiter',
        title: 'Job Approved',
        message: 'Your job posting "DevOps Engineer" has been approved and is now visible to students.',
        type: 'job_approval',
        priority: 'medium',
        isRead: true,
        metadata: {
          jobId: new mongoose.Types.ObjectId(),
          status: 'approved'
        }
      }
    ];

    // Insert all notifications
    const allNotifications = [...studentNotifications, ...tnpNotifications, ...recruiterNotifications];
    await Notification.insertMany(allNotifications);

    console.log(`✅ Created ${allNotifications.length} sample notifications`);
    console.log(`   - ${studentNotifications.length} for students`);
    console.log(`   - ${tnpNotifications.length} for TnP users`);
    console.log(`   - ${recruiterNotifications.length} for recruiters`);

    // Show unread counts
    const unreadCounts = await Promise.all([
      Notification.countDocuments({ role: 'Student', isRead: false }),
      Notification.countDocuments({ role: 'TnP', isRead: false }),
      Notification.countDocuments({ role: 'Recruiter', isRead: false })
    ]);

    console.log('📊 Unread notification counts:');
    console.log(`   - Students: ${unreadCounts[0]}`);
    console.log(`   - TnP: ${unreadCounts[1]}`);
    console.log(`   - Recruiters: ${unreadCounts[2]}`);

    console.log('🎉 Notification seeder completed successfully!');
  } catch (error) {
    console.error('❌ Error in notification seeder:', error);
    throw error;
  }
};

export default notificationSeeder;
