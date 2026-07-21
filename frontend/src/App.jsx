import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Wrappers
import AppLayout from './layouts/AppLayout';

// Public & Student Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import CoursesCatalog from './pages/CoursesCatalog';
import CourseSyllabus from './pages/CourseSyllabus';
import LessonReader from './pages/LessonReader';
import BooksCatalog from './pages/BooksCatalog';
import BookReader from './pages/BookReader';
import Dashboard from './pages/Dashboard';
import PaymentPage from './pages/PaymentPage';

// Admin Vault Pages
import AdminGate from './pages/AdminGate';
import AdminDashboard from './pages/AdminDashboard';

// 404 Component
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4 page-transition">
      <AlertCircle className="h-12 w-12 text-slate-300" />
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Syllabus Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-xs">We could not resolve this course route segment. Make sure the pathway spelling is correct.</p>
      <Link to="/courses" className="bg-brand-500 hover:bg-brand-650 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition">
        Browse Free Courses
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes>
          {/* Main App-styled layout (Top Nav + Bottom Nav wrapper) */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            
            {/* Catalog & Readers */}
            <Route path="courses" element={<CoursesCatalog />} />
            <Route path="courses/:slug" element={<CourseSyllabus />} />
            <Route path="courses/:courseSlug/lessons/:lessonSlug" element={<LessonReader />} />
            <Route path="books" element={<BooksCatalog />} />
            <Route path="books/:slug" element={<BookReader />} />
            
            {/* Profile Dashboard & Payments */}
            <Route path="profile" element={<Dashboard />} />
            <Route path="payment" element={<PaymentPage />} />
            
            {/* Authentications */}
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            
            {/* Admin passkey lock portal */}
            <Route path="admin" element={<AdminGate />} />
            <Route path="admin/dashboard" element={<AdminDashboard />} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}
