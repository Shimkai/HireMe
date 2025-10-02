# HireMe Frontend

React 18 + TypeScript + Vite + Material-UI frontend for the HireMe platform.

## Setup

```bash
cd FE
npm install
npm run dev
```

Frontend will run on: http://localhost:5173

## Features Implemented

- ✅ Material-UI theme with Ubuntu font and purple color scheme
- ✅ Redux Toolkit for state management
- ✅ React Router for navigation
- ✅ Protected routes with role-based access
- ✅ Authentication (Login/Register)
- ✅ Responsive layout with sidebar and header
- ✅ Student Dashboard (starter)
- ✅ API services with Axios
- ✅ TypeScript for type safety

## Test Accounts

- Student: john@test.com / password123
- Recruiter: recruiter1@test.com / password123
- TnP: tnp@test.com / password123

## Project Structure

```
src/
├── components/
│   └── layout/           # Header, Sidebar, MainLayout
├── features/
│   └── auth/             # Redux auth slice
├── hooks/                # Custom hooks (useAuth)
├── pages/
│   ├── auth/             # Login, Register
│   └── student/          # Student Dashboard
├── routes/               # ProtectedRoute
├── services/             # API services
├── store/                # Redux store
├── theme/                # Material-UI theme
├── types/                # TypeScript types
├── utils/                # Utilities (Axios config)
├── App.tsx               # Main app component
└── main.tsx              # Entry point
```

## Next Steps

To extend this frontend:

1. **Create more pages:**
   - Student: Job Listing, Applications, Resume Builder
   - Recruiter: Post Job, Manage Jobs, View Applicants
   - TnP: Manage Students, Approve Jobs, Analytics

2. **Add more components:**
   - Job cards
   - Application tables
   - Resume builder forms
   - Notification bell

3. **Add more services:**
   - Application service
   - Resume service
   - Notification service
   - User service

4. **Enhance features:**
   - Form validation with React Hook Form
   - PDF generation with @react-pdf/renderer
   - Animations with Framer Motion
   - Date handling with date-fns

## Building for Production

```bash
npm run build
```

Built files will be in `dist/` directory.

