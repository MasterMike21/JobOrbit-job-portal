import React from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Navbar from './components/shared/Navbar'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Home from './components/Home'
import Jobs from './components/Jobs'
import Browse from './components/Browse'
import Profile from './components/Profile'
import JobDescription from './components/JobDescription'

// Admin / Recruiter Imports
import AdminJobs from "./components/admin/AdminJobs"
import PostJob from './components/admin/PostJob'
import Applicants from './components/admin/Applicants'
import CompanyProfile from './components/admin/CompanyProfile'
import ProtectedRoute from './components/admin/ProtectedRoute'

const appRouter = createBrowserRouter([
  // Public & Applicant Routes
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: "/jobs",
    element: <Jobs />
  },
  {
    path: "/description/:id",
    element: <JobDescription />
  },
  {
    path: "/browse",
    element: <Browse />
  },
  {
    path: "/profile",
    element: <Profile />
  },

  // Recruiter Routes
  {
    path: "/admin/company",
    element: <ProtectedRoute><CompanyProfile /></ProtectedRoute>
  },
  {
    path: "/admin/companies",
    element: <Navigate to="/admin/company" replace />
  },
  {
    path: "/admin/companies/create",
    element: <Navigate to="/admin/company" replace />
  },
  {
    path: "/admin/jobs",
    element: <ProtectedRoute><AdminJobs /></ProtectedRoute>
  },
  {
    path: "/admin/jobs/create",
    element: <ProtectedRoute><PostJob /></ProtectedRoute>
  },
  {
    path: "/admin/jobs/:id/edit",
    element: <ProtectedRoute><PostJob editMode={true} /></ProtectedRoute>
  },
  {
    path: "/admin/jobs/:id",
    element: <ProtectedRoute><PostJob editMode={true} /></ProtectedRoute>
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: <ProtectedRoute><Applicants /></ProtectedRoute>
  }
]);

function App() {
  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App;