import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';
import BottomNav from '../components/BottomNav';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];
  const isPublicPath = publicPaths.some((path) => location.pathname.startsWith(path));

  // Only protect reading content (lessons/ebooks reader) and dashboard profiles
  const isProtectedPath =
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.includes('/lessons/') ||
    (location.pathname.startsWith('/books/') && location.pathname !== '/books');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-950 border-t-transparent" />
      </div>
    );
  }

  // Redirect guest users to login only if accessing protected reading/profile actions
  if (!user && isProtectedPath) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect logged-in users to home if they navigate to login/signup page
  if (user && isPublicPath) {
    return <Navigate to="/" replace />;
  }

  if (isPublicPath) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 transition-colors duration-200">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      
      {/* Fixed Sticky Header */}
      <TopNav />

      {/* Main App Content Viewport */}
      <main className="flex-1 w-full max-w-lg md:max-w-7xl mx-auto px-4 pt-4 pb-20 overflow-x-hidden page-transition">
        <Outlet />
      </main>

      {/* Bottom Sticky Tabbar */}
      <BottomNav />
      
    </div>
  );
}
