import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle, Heart, GraduationCap, Terminal, BookOpen, Award, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signup(username, email, password);
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
      <div 
        className="hidden lg:flex lg:col-span-2 text-white flex-col justify-between p-10 relative border-r-2 border-slate-950 overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Dark overlay backdrop to make cards pop */}
        <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
        
        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="h-9 w-9 rounded-xl border-2 border-slate-950 shadow-flat-sm" />
            <span className="text-base font-black tracking-tight text-white">
              Dexterity <span className="text-brand-400">Learn</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-300 mt-1 uppercase font-black tracking-widest">Mobile-First MERN Platform</p>
        </div>

        {/* Mission Statement Emotional Box */}
        <div className="relative z-10 bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 p-4 rounded-3xl shadow-flat-sm text-left my-4 text-slate-900 dark:text-white">
          <Heart className="h-5 w-5 text-red-500 fill-red-500 shrink-0 mb-1" />
          <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1">100% Free Learning, Forever</h4>
          <p className="text-[9.5px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            Education is a human right. We will never charge you a single rupee to learn advanced software engineering, databases, or systems design. Unlock all content for free.
          </p>
        </div>

        {/* Feature List Showcase */}
        <div className="relative z-10 space-y-4">
          {[
            { title: 'Premium Syllabus', desc: 'Web dev, programming & systems page-by-page', icon: GraduationCap, iconColor: 'text-brand-500' },
            { title: 'Interactive Sandbox', desc: 'Test and execute JS/HTML snippets instantly', icon: Terminal, iconColor: 'text-teal-500' },
            { title: 'Study Manuals', desc: 'Comprehensive Tech Ebooks & Cheatsheets', icon: BookOpen, iconColor: 'text-amber-500' },
            { title: 'Verified Credentials', desc: 'Clear syllabus quizzes & unlock gold certificates', icon: Award, iconColor: 'text-purple-500' }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3.5 border-2 border-slate-950 dark:border-slate-800 rounded-2xl shadow-flat-sm hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-none transition-all select-none text-slate-900 dark:text-white">
                <Icon className={`h-5 w-5 ${feat.iconColor} shrink-0`} />
                <div className="text-left">
                  <h4 className="text-[10.5px] font-black text-slate-900 dark:text-white">{feat.title}</h4>
                  <p className="text-[9.5px] text-slate-600 dark:text-slate-400 mt-0.5 leading-normal">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[10px] text-slate-300 font-bold mt-4">
          © {new Date().getFullYear()} Dexterity Learn. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Sign Up Form */}
      <div className="flex-1 lg:col-span-3 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-6">
          
          {/* Back to Home Button (Visible in all screens) */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-[11px] font-black bg-white dark:bg-slate-900 text-slate-955 dark:text-white px-3 py-1.5 border-2 border-slate-950 dark:border-slate-800 rounded-xl shadow-flat-sm active:translate-y-[1px] active:shadow-none transition-all w-fit"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </button>
          </div>

          {/* Sign In / Sign Up Selector Tabs */}
          <div className="flex bg-slate-150 dark:bg-slate-900 border-2 border-slate-950 rounded-2xl p-1 shadow-flat-sm">
            <Link
              to="/login"
              className="flex-1 py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="flex-1 py-2 text-center text-xs font-black rounded-xl bg-white border-2 border-slate-950 shadow-flat-sm text-slate-950"
            >
              Create Account
            </Link>
          </div>

          <div className="text-left">
            <h2 className="text-xl font-black text-slate-905 dark:text-slate-100 flex items-center gap-1.5">
              Create Account 🚀
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Start your free coding path today.</p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 border-2 border-slate-950 p-3 text-xs font-bold text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border-2 border-slate-950 p-3 text-xs font-bold text-emerald-800">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="codenewbie"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 py-2.5 pl-10 pr-4 text-xs border-2 border-slate-950 focus:bg-brand-50 outline-none transition text-slate-808 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Email Address */}
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

              {/* Password */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 py-2.5 pl-10 pr-4 text-xs border-2 border-slate-950 focus:bg-brand-50 outline-none transition text-slate-808 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full bg-brand-400 hover:bg-brand-300 text-slate-955 text-xs font-black py-2.5 rounded-xl border-2 border-slate-950 shadow-flat-sm transition active:translate-y-[1px] active:shadow-none mt-6"
              >
                {loading ? 'Creating...' : (
                  <>
                    <UserPlus className="h-4 w-4" /> Sign Up
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-450 font-bold">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:underline font-black">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
