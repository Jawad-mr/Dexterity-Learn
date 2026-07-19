import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/profile');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-5 bg-slate-50 dark:bg-slate-950 select-none page-transition">
      {/* Left Panel: App Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:col-span-2 bg-gradient-to-br from-brand-100 via-brand-50 to-brand-200 text-slate-900 flex-col justify-between p-10 relative border-r-2 border-slate-950 overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.12] pointer-events-none bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
        
        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="h-9 w-9 rounded-xl border-2 border-slate-950 shadow-flat-sm" />
            <span className="text-base font-black tracking-tight text-slate-955">
              Dexterity <span className="text-brand-600">Learn</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-600 mt-1 uppercase font-black tracking-widest">Mobile-First MERN Platform</p>
        </div>

        {/* Mission Statement Emotional Box */}
        <div className="relative z-10 bg-white border-2 border-slate-950 p-4 rounded-3xl shadow-flat-sm text-left my-4">
          <span className="text-lg">❤️</span>
          <h4 className="text-xs font-black text-slate-900 mt-1">100% Free Learning, Forever</h4>
          <p className="text-[9.5px] text-slate-600 mt-1 leading-relaxed">
            Education is a human right. We will never charge you a single rupee to learn advanced software engineering, databases, or systems design. Unlock all content for free.
          </p>
        </div>

        {/* Feature List Showcase */}
        <div className="relative z-10 space-y-4">
          {[
            { title: 'Premium Syllabus', desc: 'Web dev, programming & systems page-by-page', icon: '🎓' },
            { title: 'Interactive Sandbox', desc: 'Test and execute JS/HTML snippets instantly', icon: '💻' },
            { title: 'Study Manuals', desc: 'Comprehensive Tech Ebooks & Cheatsheets', icon: '📚' },
            { title: 'Verified Credentials', desc: 'Clear syllabus quizzes & unlock gold certificates', icon: '🏆' }
          ].map((feat, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white p-3.5 border-2 border-slate-950 rounded-2xl shadow-flat-sm hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-none transition-all select-none">
              <span className="text-base">{feat.icon}</span>
              <div className="text-left">
                <h4 className="text-[10.5px] font-black text-slate-900">{feat.title}</h4>
                <p className="text-[9.5px] text-slate-600 mt-0.5 leading-normal">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[10px] text-slate-600 font-bold mt-4">
          © {new Date().getFullYear()} Dexterity Learn. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Sign In Form */}
      <div className="flex-1 lg:col-span-3 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-6">
          
          {/* Sign In / Sign Up Selector Tabs */}
          <div className="flex bg-slate-150 dark:bg-slate-900 border-2 border-slate-950 rounded-2xl p-1 shadow-flat-sm">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 py-2 text-center text-xs font-black rounded-xl bg-white border-2 border-slate-950 shadow-flat-sm text-slate-950"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="flex-1 py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Create Account
            </button>
          </div>

          <div className="text-left">
            <h2 className="text-xl font-black text-slate-905 dark:text-slate-100 flex items-center gap-1.5">
              Welcome back 👋
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Sign in to your Dexterity Learn account.</p>
          </div>

          {/* Quick Demo Login Credentials Panel */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-slate-950 rounded-2xl p-3.5 shadow-flat-sm space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-500 block">⚡ Quick Demo Logins</span>
            <div className="space-y-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-350">
              <button 
                type="button"
                onClick={() => { setEmail('admin@dexteritylearn.com'); setPassword('admin123'); }}
                className="flex items-center justify-between w-full hover:bg-amber-100/50 p-1 rounded transition text-left"
              >
                <span>Arjun Sharma <span className="text-[7.5px] font-black bg-red-100 text-red-700 px-1 py-0.5 rounded border border-red-200 ml-1">ADMIN</span></span>
                <span className="font-mono text-[9px] text-slate-500 truncate">admin@dexteritylearn.com / admin123</span>
              </button>
              <button 
                type="button"
                onClick={() => { setEmail('student@dexteritylearn.com'); setPassword('user123'); }}
                className="flex items-center justify-between w-full hover:bg-amber-100/50 p-1 rounded transition text-left"
              >
                <span>Priya Menon <span className="text-[7.5px] font-black bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded border border-emerald-200 ml-1">STUDENT</span></span>
                <span className="font-mono text-[9px] text-slate-500 truncate">student@dexteritylearn.com / user123</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 border-2 border-slate-950 p-3 text-xs font-bold text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 py-2.5 pl-10 pr-4 text-xs border-2 border-slate-950 focus:bg-brand-50 outline-none transition text-slate-808 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[10px] text-brand-600 font-bold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 py-2.5 pl-10 pr-4 text-xs border-2 border-slate-950 focus:bg-brand-50 outline-none transition text-slate-808 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-2 border-slate-950 text-brand-500 focus:ring-0"
              />
              <label htmlFor="remember-me" className="ml-2 text-xs font-bold text-slate-550 dark:text-slate-400">
                Remember me
              </label>
            </div>

            {/* Action trigger */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full bg-brand-400 hover:bg-brand-300 text-slate-950 text-xs font-black py-2.5 rounded-xl border-2 border-slate-950 shadow-flat-sm transition active:translate-y-[1px] active:shadow-none mt-6"
            >
              {loading ? 'Logging in...' : (
                <>
                  <LogIn className="h-4 w-4" /> Log In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-450 font-bold">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 hover:underline font-black">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
