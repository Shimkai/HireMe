# Notification System Documentation

## Overview

The HireMe notification system provides real-time notifications for all user roles (Student, Recruiter, TnP) with robust error handling, polling fallback, and comprehensive state management.

## Architecture

### Backend Components

#### 1. Notification Model (`BE/src/models/Notification.model.ts`)
- **Purpose**: MongoDB schema for storing notifications
- **Key Features**:
  - TTL index for automatic cleanup (30 days)
  - Compound indexes for efficient queries
  - JSON transformation for frontend compatibility
  - Role-based filtering support

#### 2. Notification Controller (`BE/src/controllers/notification.controller.ts`)
- **Endpoints**:
  - `GET /api/notifications` - Fetch user notifications with pagination
  - `GET /api/notifications/unread-count` - Get unread notification count
  - `PUT /api/notifications/:id/read` - Mark notification as read
  - `PUT /api/notifications/mark-all-read` - Mark all notifications as read
  - `DELETE /api/notifications/:id` - Delete notification
  - `GET /api/notifications/stats` - Get notification statistics

#### 3. Notification Service (`BE/src/services/notification.service.ts`)
- **Purpose**: Business logic for notification creation and management
- **Key Methods**:
  - `createNotification()` - Create single notification
  - `createBulkNotifications()` - Create multiple notifications efficiently
  - `notifyJobPosted()` - Notify TnP when job is posted
  - `notifyJobApproved()` - Notify recruiter and students when job is approved
  - `notifyJobRejected()` - Notify recruiter when job is rejected
  - `notifyJobApplication()` - Notify recruiter when student applies
  - `notifyApplicationStatusChange()` - Notify student of status changes
  - `notifyStudentPlaced()` - Notify TnP when student is placed
  - `notifyStudentVerification()` - Notify student when verified

### Frontend Components

#### 1. Notification Service (`FE/src/services/notificationService.ts`)
- **Purpose**: API client for notification operations
- **Methods**:
  - `fetchNotifications()` - Get paginated notifications
  - `fetchUnreadCount()` - Get unread count
  - `markAsRead()` - Mark notification as read
  - `markAllAsRead()` - Mark all as read
  - `deleteNotification()` - Delete notification

#### 2. Redux Store (`FE/src/features/notifications/notificationSlice.ts`)
- **State Management**:
  - `notifications` - Array of notification objects
  - `unreadCount` - Number of unread notifications
  - `pagination` - Pagination metadata
  - `filters` - Active filters
  - `error` - Error state
- **Actions**:
  - `fetchNotifications` - Async thunk for fetching
  - `fetchUnreadCount` - Async thunk for unread count
  - `markNotificationAsRead` - Mark single notification
  - `markAllAsRead` - Mark all notifications
  - `deleteNotification` - Delete notification
  - `addNotification` - Add new notification (with deduplication)
  - `updateNotification` - Update existing notification
  - `removeNotification` - Remove notification from state

#### 3. Notification Hook (`FE/src/hooks/useNotifications.ts`)
- **Purpose**: Custom hook for notification management
- **Features**:
  - Automatic polling with exponential backoff
  - WebSocket connection management
  - Real-time updates
  - Error handling and retry logic
  - Cleanup on unmount

#### 4. Notification Dropdown (`FE/src/components/NotificationDropdown.tsx`)
- **UI Features**:
  - Material-UI design with smooth animations
  - Role-based notification titles
  - Read/unread visual indicators
  - Priority-based color coding
  - Individual notification actions (mark as read, delete)
  - Mark all as read functionality
  - Empty state handling
  - Loading states
  - Error handling with ErrorBoundary

#### 5. Header Integration (`FE/src/components/layout/Header.tsx`)
- **Features**:
  - Real-time badge count with animation
  - Connection status indicator
  - Error boundary protection
  - Tooltip with connection status

## Notification Types

### Job-Related Notifications
1. **Job Posted** (`job_posting`)
   - **Trigger**: Recruiter posts new job
   - **Recipients**: All TnP officers
   - **Priority**: Medium

2. **Job Approved** (`job_approval`)
   - **Trigger**: TnP approves job
   - **Recipients**: Job poster (recruiter), eligible students
   - **Priority**: High

3. **Job Rejected** (`job_rejection`)
   - **Trigger**: TnP rejects job
   - **Recipients**: Job poster (recruiter)
   - **Priority**: Medium

### Application-Related Notifications
4. **Application Submitted** (`application_status`)
   - **Trigger**: Student applies to job
   - **Recipients**: Job poster (recruiter)
   - **Priority**: Medium

5. **Application Status Changed** (`application_status`)
   - **Trigger**: Recruiter updates application status
   - **Recipients**: Student applicant
   - **Priority**: High

6. **Student Placed** (`general`)
   - **Trigger**: Application status set to "Placed"
   - **Recipients**: TnP officers
   - **Priority**: High

### User-Related Notifications
7. **Student Verification** (`general`)
   - **Trigger**: TnP verifies student
   - **Recipients**: Student
   - **Priority**: High

## Real-Time Features

### Polling Mechanism
- **Interval**: 30 seconds base delay
- **Exponential Backoff**: Up to 5 retries with increasing delays
- **Max Delay**: 5 minutes between retries
- **Auto-Recovery**: Resets retry count on successful requests

### WebSocket Support (Currently Disabled)
- **Status**: Temporarily disabled to prevent errors
- **Fallback**: Polling mechanism provides reliable updates
- **Future**: Will be re-enabled when backend WebSocket is properly configured

## Error Handling

### Backend Error Handling
- **Try-Catch Blocks**: All notification service methods wrapped
- **Null Checks**: Validation for user/job/application existence
- **Graceful Degradation**: Notification failures don't break main flows
- **Logging**: Comprehensive error logging with Winston

### Frontend Error Handling
- **ErrorBoundary**: Prevents notification errors from crashing app
- **Retry Logic**: Exponential backoff for failed requests
- **Fallback States**: Graceful handling of network issues
- **User Feedback**: Clear error messages and loading states

## Performance Optimizations

### Database Optimizations
- **Indexes**: Compound indexes for efficient queries
- **TTL**: Automatic cleanup of old notifications
- **Pagination**: Limits data transfer for large notification lists

### Frontend Optimizations
- **Deduplication**: Prevents duplicate notifications in state
- **State Limits**: Maximum 50 notifications in memory
- **Lazy Loading**: Notifications loaded on demand
- **Memoization**: React.memo for expensive components

## Security Features

### Authentication
- **JWT Tokens**: All API requests require valid tokens
- **Role-Based Access**: Users can only access their own notifications
- **Input Validation**: Joi schemas validate all inputs

### Data Protection
- **Sanitization**: All user inputs sanitized
- **Rate Limiting**: Prevents abuse of notification endpoints
- **CORS**: Proper cross-origin request handling

## Testing

### Backend Testing
- **API Endpoints**: All endpoints tested with proper authentication
- **Error Scenarios**: Invalid IDs, malformed requests, unauthorized access
- **Integration**: Notification triggers tested with job/application flows

### Frontend Testing
- **Component Testing**: NotificationDropdown tested with various states
- **Error Scenarios**: Network failures, invalid data, edge cases
- **Performance**: Polling reliability and memory usage

## Configuration

### Environment Variables
```env
# Backend
MONGODB_URI=mongodb://localhost:27017/hireme
JWT_SECRET=your-secret-key
PORT=5000

# Frontend
VITE_API_URL=http://localhost:5000/api
```

### Polling Configuration
```typescript
const baseDelay = 30000; // 30 seconds
const maxRetries = 5;
const maxDelay = 300000; // 5 minutes
```

## Troubleshooting

### Common Issues

1. **Notifications Not Appearing**
   - Check authentication token
   - Verify API endpoints are accessible
   - Check browser console for errors

2. **Polling Failures**
   - Check network connectivity
   - Verify backend server is running
   - Check exponential backoff logs

3. **Duplicate Notifications**
   - Check deduplication logic in Redux
   - Verify notification IDs are unique
   - Check for race conditions

### Debug Tools
- **Browser DevTools**: Network tab for API calls
- **Redux DevTools**: State inspection
- **Console Logs**: Error and warning messages
- **Backend Logs**: Winston logging for server-side issues

## Future Enhancements

### Planned Features
1. **WebSocket Re-enablement**: Real-time bidirectional communication
2. **Push Notifications**: Browser push notifications
3. **Email Notifications**: Email fallback for important notifications
4. **Notification Preferences**: User-configurable notification settings
5. **Rich Notifications**: Images, actions, and interactive elements

### Performance Improvements
1. **Caching**: Redis cache for frequently accessed notifications
2. **Batch Operations**: Bulk notification operations
3. **Compression**: Gzip compression for API responses
4. **CDN**: Content delivery network for static assets

## API Reference

### GET /api/notifications
Fetch user notifications with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `type` (string): Filter by notification type
- `isRead` (boolean): Filter by read status
- `priority` (string): Filter by priority

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### GET /api/notifications/unread-count
Get the count of unread notifications for the current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

### PUT /api/notifications/:id/read
Mark a specific notification as read.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "notification-id",
    "isRead": true,
    "readAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/notifications/mark-all-read
Mark all notifications as read for the current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "modifiedCount": 5
  }
}
```

### DELETE /api/notifications/:id
Delete a specific notification.

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

## Conclusion

The notification system provides a robust, scalable solution for real-time user notifications with comprehensive error handling, performance optimizations, and security features. The system is designed to handle high loads while maintaining reliability and user experience.
