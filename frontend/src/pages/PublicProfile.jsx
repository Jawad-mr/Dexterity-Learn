import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Award, Flame, Zap, ShieldCheck, Clock, BookOpen, GraduationCap, ArrowLeft, Loader2, Share2, Sparkles } from 'lucide-react';
import { api } from '../context/AuthContext';
import useSEO from '../hooks/useSEO';

const learnerLevels = [
  { name: 'Bronze Learner', minXp: 0, color: 'from-amber-700 to-amber-850' },
  { name: 'Silver Learner', minXp: 201, color: 'from-slate-400 to-slate-600' },
  { name: 'Gold Learner', minXp: 501, color: 'from-yellow-400 to-yellow-600' },
  { name: 'Platinum Learner', minXp: 1001, color: 'from-teal-400 to-emerald-600' },
  { name: 'Diamond Learner', minXp: 2501, color: 'from-blue-450 to-indigo-600' }
];

const getLevelInfo = (xp) => {
  let matched = learnerLevels[0];
  for (const lvl of learnerLevels) {
    if (xp >= lvl.minXp) {
      matched = lvl;
    }
  }
  return matched;
};

export default function PublicProfile() {
  const { username } = useParams();

  useSEO(`@${username} Student Profile - Dexterity Learn`, 'Explore achievements, unlocked learning badges, and verified coding credentials.');

  // Fetch public profile details from backend
  const { data: profileRes, isLoading, error } = useQuery({
    queryKey: ['public-profile', username],
    queryFn: () => api.get(`/auth/public-profile/${username}`).then((res) => res.data),
    retry: false,
  });

  const profile = profileRes?.profile;
  const certificates = profileRes?.certificates || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-2">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        <span className="text-xs font-bold text-slate-400">Loading student achievements...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-6 bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl shadow-flat space-y-4">
        <User className="h-12 w-12 text-slate-300 mx-auto" />
        <h2 className="text-base font-black text-slate-900 dark:text-white">Profile Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The requested student username does not exist or has set their credentials to private mode.
        </p>
        <Link to="/courses" className="inline-block bg-brand-400 hover:bg-brand-300 text-slate-955 text-xs font-black px-5 py-2.5 rounded-xl border-2 border-slate-950 shadow-flat-sm active:translate-y-[1px]">
          Explore Course Syllabus
        </Link>
      </div>
    );
  }

  const levelInfo = getLevelInfo(profile.progress?.xp || 0);

  return (
    <div className="max-w-3xl mx-auto my-6 space-y-6 px-4 pb-12 page-transition">
      {/* Top Navigation */}
      <div className="flex justify-between items-center select-none">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Share profile button */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Public profile link copied to clipboard!');
          }}
          className="flex items-center gap-1 text-[10.5px] font-black bg-white dark:bg-slate-900 text-slate-950 dark:text-white px-3 py-1.5 border-2 border-slate-950 dark:border-slate-800 rounded-xl shadow-flat-sm active:translate-y-[1px] active:shadow-none transition"
        >
          <Share2 className="h-3.5 w-3.5" /> Share Profile
        </button>
      </div>

      {/* Main Showcase Hero Profile Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-flat space-y-6">
        
        {/* Avatar and name banner */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left select-none">
          <div className="h-20 w-20 rounded-full border-2 border-slate-950 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 shadow-flat-sm">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt={profile.username} className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-slate-400" />
            )}
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white truncate">@{profile.username}</h2>
              <span className="text-[9px] font-black bg-brand-400 text-slate-950 border border-slate-950 px-2 py-0.5 rounded-full w-fit mx-auto sm:mx-0 shadow-flat-sm">
                🏆 {levelInfo.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold max-w-md">
              Dexterity Learner specializing in advanced AI Engineering, Prompt Engineering, and Agentic Workflow Automation.
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-3 border-t-2 border-slate-950 dark:border-slate-800 pt-5">
          <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-950 rounded-2xl p-2.5 text-center">
            <Flame className="h-6 w-6 text-orange-500 mx-auto" />
            <span className="text-sm font-black block mt-1">{profile.progress?.streak || 0}</span>
            <span className="text-[9.5px] text-slate-450 uppercase font-black block mt-0.5">Active Streak</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-950 rounded-2xl p-2.5 text-center">
            <Zap className="h-6 w-6 text-yellow-500 mx-auto" />
            <span className="text-sm font-black block mt-1">{profile.progress?.xp || 0}</span>
            <span className="text-[9.5px] text-slate-450 uppercase font-black block mt-0.5">Total XP</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-950 rounded-2xl p-2.5 text-center">
            <Award className="h-6 w-6 text-purple-500 mx-auto" />
            <span className="text-sm font-black block mt-1">{profile.badges?.length || 0}</span>
            <span className="text-[9.5px] text-slate-450 uppercase font-black block mt-0.5">Badges</span>
          </div>
        </div>
      </div>

      {/* Badges and milestones */}
      {profile.badges?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 px-1">Earned Badges</h3>
          <div className="flex gap-2 flex-wrap">
            {profile.badges.map((badge, idx) => (
              <span
                key={idx}
                className="text-[10px] font-black px-3.5 py-1.5 rounded-xl bg-brand-400 text-slate-955 border-2 border-slate-950 shadow-flat-sm flex items-center gap-1 select-none"
              >
                🏆 {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Public Certificate Showcase section */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 px-1">Verified Credentials ({certificates.length})</h3>
        
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-4 shadow-flat flex flex-col justify-between space-y-4"
              >
                <div className="space-y-1">
                  <span className="text-[8px] font-black bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 border border-brand-350 dark:border-brand-850 px-2 py-0.5 rounded-full uppercase w-fit block">
                    ✓ Official Verified
                  </span>
                  <h4 className="text-xs font-black text-slate-950 dark:text-white leading-tight">{cert.courseTitle}</h4>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-[9px] text-slate-500 font-bold">
                    <span>Issued {new Date(cert.issuedAt).toLocaleDateString()}</span>
                  </div>

                  <Link
                    to={`/verify-certificate/${cert.certificateId}`}
                    className="text-[10.5px] font-black bg-brand-400 hover:bg-brand-300 text-slate-955 px-3 py-1.5 border-2 border-slate-950 rounded-xl shadow-flat-sm active:translate-y-[1px] active:shadow-none transition shrink-0"
                  >
                    Verify Credential
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl text-xs text-slate-400 select-none">
            No public certificates verified yet.
          </div>
        )}
      </div>

      {/* Completed courses list */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 px-1">Syllabus Completion</h3>
        <div className="grid gap-2">
          {profile.enrolledCourses?.filter((c) => c.courseId).map((c) => (
            <div
              key={c.courseId?._id}
              className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-flat-sm select-none"
            >
              <div className="min-w-0">
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-455 block">{c.courseId?.category}</span>
                <span className="text-xs font-black text-slate-900 dark:text-white truncate block">{c.courseId?.title}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-black px-2.5 py-1 border border-slate-950 rounded-lg ${
                  c.progress === 100 
                    ? 'bg-brand-400 text-slate-950' 
                    : 'bg-slate-100 dark:bg-slate-850 text-slate-500'
                }`}>
                  {c.progress === 100 ? 'GRADUATED ✓' : `${c.progress}% COMPLETED`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
