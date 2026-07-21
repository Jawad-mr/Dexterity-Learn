import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, Award, Flame, Zap, Bookmark, BookOpen, GraduationCap, Clock, CheckCircle, ShieldCheck, Download, Settings, History, Camera, Loader2, Key } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import useSEO from '../hooks/useSEO';

const colors = ['#a3f058', '#fcd34d', '#c084fc', '#f472b6', '#fbbf24', '#facc15', '#fb7185', '#a78bfa'];
const getBookColor = (id) => {
  if (!id) return '#a3f058';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const learnerLevels = [
  { name: 'Bronze Learner', minXp: 0 },
  { name: 'Silver Learner', minXp: 201 },
  { name: 'Gold Learner', minXp: 501 },
  { name: 'Platinum Learner', minXp: 1001 },
  { name: 'Diamond Learner', minXp: 2501 }
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

export default function Dashboard() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  useSEO('Student Dashboard', 'Track your streaks, certificates, unlocked books, bookmarks, and account configuration.');


  const [activeTab, setActiveTab] = useState('courses'); // courses, books, certificates, bookmarks, settings
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  // Certificate Modal State
  const [selectedCert, setSelectedCert] = useState(null);
  const [certSearch, setCertSearch] = useState('');
  const [certFilter, setCertFilter] = useState('all'); // all, unlocked, pending

  // Fetch payment history
  const { data: payments } = useQuery({
    queryKey: ['payments-history'],
    queryFn: () => api.get('/payments/history').then((res) => res.data.payments),
    enabled: !!user,
  });

  // Fetch user certificates (unlocked certificates)
  const { data: certificates } = useQuery({
    queryKey: ['user-certificates'],
    queryFn: () => api.get('/auth/profile').then((res) => res.data.certificates || []),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <GraduationCap className="h-12 w-12 text-slate-300" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Log in required</h3>
        <p className="text-xs text-slate-500 max-w-xs">Please log in to track your course progress and unlock premium study manuals.</p>
        <Link to="/login" className="bg-brand-500 hover:bg-brand-650 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition">
          Log In Now
        </Link>
      </div>
    );
  }

  // Upload Profile Image Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);

    try {
      const res = await api.post('/auth/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        await refreshUser();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload profile image.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Change Password Handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (res.data.success) {
        setPassSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPassError(err.response?.data?.message || 'Incorrect current password');
    }
  };

  const completedCourses = user.enrolledCourses?.filter((c) => c.progress === 100) || [];

  return (
    <div className="space-y-6 pb-6 lg:grid lg:grid-cols-4 lg:gap-6 lg:space-y-0">
      
      {/* Left Column: Profile Card & Badges */}
      <div className="space-y-6 lg:col-span-1">
        {/* 1. Profile Streak & Badge Hero */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-flat-lg space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-full border-2 border-slate-950 bg-slate-100 dark:bg-slate-850 overflow-hidden flex items-center justify-center group shrink-0 shadow-flat-sm">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.username} className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-slate-400" />
            )}
            
            {/* Upload trigger overlay */}
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
              {uploadingImage ? (
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              ) : (
                <Camera className="h-4 w-4 text-white" />
              )}
              <input type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
            </label>
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 truncate">{user.username}</h2>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            {user.role === 'admin' && (
              <Link to="/admin" className="text-[10px] text-brand-600 font-bold hover:underline flex items-center gap-0.5 mt-1">
                <Key className="h-3 w-3" /> Admin Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* User Stats Grid (Neobrutalist cards) */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t-2 border-slate-950 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-950 rounded-2xl p-2 text-center">
            <Flame className="h-5 w-5 text-orange-500 mx-auto" />
            <span className="text-xs font-black block mt-1">{user.progress?.streak || 0}</span>
            <span className="text-[9px] text-slate-450 uppercase font-extrabold">Streak</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-950 rounded-2xl p-2 text-center">
            <Zap className="h-5 w-5 text-yellow-500 mx-auto" />
            <span className="text-xs font-black block mt-1">{user.progress?.xp || 0}</span>
            <span className="text-[9px] text-slate-450 uppercase font-extrabold">XP</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-950 rounded-2xl p-2 text-center">
            <Award className="h-5 w-5 text-purple-500 mx-auto" />
            <span className="text-xs font-black block mt-1">{user.progress?.badges?.length || 0}</span>
            <span className="text-[9px] text-slate-450 uppercase font-extrabold">Badges</span>
          </div>
        </div>
      </div>

      {/* Badges Carousel Grid */}
      {user.progress?.badges?.length > 0 && (
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 px-1">Earned Badges</span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {user.progress.badges.map((badge, idx) => (
              <span
                key={idx}
                className="text-[10px] font-black px-3 py-1 rounded-full bg-brand-400 text-slate-950 border-2 border-slate-950 shadow-flat-sm shrink-0"
              >
                🏆 {badge}
              </span>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Right Column: Navigation Tabs & Tab Panels */}
      <div className="space-y-6 lg:col-span-3">
        {/* Tab select Navigation (Bottom border style) */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'courses', label: 'My Courses', icon: GraduationCap },
          { id: 'books', label: 'My Shelf', icon: BookOpen },
          { id: 'certificates', label: 'Certificates', icon: Award },
          { id: 'gamification', label: 'Learner Stats', icon: Flame },
          { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
          { id: 'payments', label: 'Payments', icon: History },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-center text-xs font-bold border-b-2 flex flex-col items-center gap-1 transition ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[9px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="page-transition">
        {/* TAB 1: Courses */}
        {activeTab === 'courses' && (
          <div className="space-y-3">
            {user.enrolledCourses && user.enrolledCourses.length > 0 ? (
              user.enrolledCourses.map((c) => (
                <div
                  key={c.courseId?._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{c.courseId?.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{c.courseId?.category}</p>
                    </div>
                    {c.progress === 100 && (
                      <span
                        onClick={() => setSelectedCert({ title: c.courseId?.title, username: user.username })}
                        className="text-[9px] font-bold bg-brand-500 hover:bg-brand-600 text-white px-2.5 py-1 rounded-lg cursor-pointer transition flex items-center gap-1 shrink-0"
                      >
                        <Award className="h-3 w-3" /> Certificate
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-semibold mb-1">
                      <span>Completion Progress</span>
                      <span>{c.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">
                You are not enrolled in any courses yet.{' '}
                <Link to="/courses" className="text-brand-500 hover:underline block mt-1 font-semibold">
                  Browse Catalog
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Shelf Books */}
        {activeTab === 'books' && (
          <div className="space-y-3">
            {user.unlockedBooks && user.unlockedBooks.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {user.unlockedBooks.map((book) => (
                  <Link
                    key={book._id}
                    to={`/books/${book.slug}`}
                    className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-2.5 flex items-center gap-2.5 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition shadow-flat-sm"
                  >
                    <div
                      className="h-14 w-10 overflow-hidden rounded-lg shrink-0 border border-slate-950 flex flex-col justify-between p-1 select-none text-slate-950 relative"
                      style={{ backgroundColor: getBookColor(book._id) }}
                    >
                      {/* Spine shadow */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10 border-r border-black/15" />
                      
                      <div className="text-[4px] font-black uppercase bg-slate-950 text-white px-0.5 py-0 rounded-sm w-fit leading-none relative z-10 scale-[0.8] origin-left">
                        GUIDE
                      </div>
                      
                      <div className="text-[5.5px] font-black uppercase tracking-tight leading-tight line-clamp-2 relative z-10 pt-0.5">
                        {book.title}
                      </div>

                      <div className="text-[4px] font-black text-right relative z-10 scale-[0.8] origin-right opacity-70">
                        v1.0
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10px] font-black text-slate-900 dark:text-slate-100 truncate leading-snug">{book.title}</h4>
                      <span className="text-[9px] text-slate-400 block mt-0.5 truncate">{book.author}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">
                You have not unlocked any premium ebooks yet.{' '}
                <Link to="/books" className="text-brand-500 hover:underline block mt-1 font-semibold">
                  Unlock E-books
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Certificates Showcase & Store */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3 select-none">
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-4 shadow-flat-sm text-center">
                <span className="text-[10px] font-black uppercase text-slate-400 block font-bold">Certificates Earned</span>
                <span className="text-xl font-black text-slate-905 dark:text-white mt-1 block">
                  {certificates?.length || 0}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-4 shadow-flat-sm text-center">
                <span className="text-[10px] font-black uppercase text-slate-400 block font-bold">Pending Unlock</span>
                <span className="text-xl font-black text-amber-500 mt-1 block">
                  {Math.max(0, completedCourses.length - (certificates?.length || 0))}
                </span>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-2 select-none">
              <input
                type="text"
                placeholder="Search certificate..."
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-100 font-bold"
              />
              <select
                value={certFilter}
                onChange={(e) => setCertFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs outline-none font-black"
              >
                <option value="all">All Status</option>
                <option value="unlocked">Unlocked</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Certificate Cards Grid */}
            <div className="grid grid-cols-1 gap-3">
              {/* Unlocked / Paid Certificates */}
              {certificates
                ?.filter((c) => c.courseTitle?.toLowerCase().includes(certSearch.toLowerCase()))
                ?.filter((c) => certFilter === 'all' || certFilter === 'unlocked')
                ?.map((cert) => (
                  <div
                    key={cert._id}
                    className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-4 shadow-flat flex flex-col justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex justify-between items-start select-none">
                        <span className="text-[8px] font-black uppercase tracking-wider bg-brand-400 text-slate-950 px-2 py-0.5 border border-slate-950 rounded-full shadow-flat-sm">
                          Verified Credential
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-950 dark:text-white mt-1.5">{cert.courseTitle}</h4>
                      <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase select-all font-bold">ID: {cert.certificateId}</p>
                    </div>

                    <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      <Link
                        to={`/verify-certificate/${cert.certificateId}`}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 py-1.5 rounded-xl text-center text-[10.5px] font-black text-slate-900 dark:text-white shadow-flat-xs active:translate-y-[1px] select-none"
                      >
                        Verify Public Link
                      </Link>
                      <button
                        onClick={() => navigate(`/courses/${cert.courseId?.slug || 'prompt-engineering'}`)}
                        className="flex-1 bg-brand-400 hover:bg-brand-300 text-slate-955 font-black py-1.5 border-2 border-slate-950 rounded-xl text-center text-[10.5px] shadow-flat-xs active:translate-y-[1px] select-none"
                      >
                        View & Print
                      </button>
                    </div>
                  </div>
                ))}

              {/* Pending / Completed but Unpaid Certificates */}
              {completedCourses
                ?.filter((c) => c.courseId?.title?.toLowerCase().includes(certSearch.toLowerCase()))
                ?.filter((c) => !certificates?.some((cert) => cert.courseId === c.courseId?._id || cert.courseId?._id === c.courseId?._id))
                ?.filter((c) => certFilter === 'all' || certFilter === 'pending')
                ?.map((c) => (
                  <div
                    key={c.courseId?._id}
                    className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-4 shadow-flat flex flex-col justify-between gap-3 text-xs opacity-90"
                  >
                    <div>
                      <div className="flex justify-between items-start select-none">
                        <span className="text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 border border-slate-350 rounded-full">
                          Locked Pending Unlock
                        </span>
                        <span className="text-[10px] text-amber-500 font-black">100% Completed</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-200 mt-1.5">{c.courseId?.title}</h4>
                      <p className="text-[9.5px] text-slate-500 mt-1 font-bold">Complete final checkpoints & assignments to verify authenticity.</p>
                    </div>

                    <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      <Link
                        to={`/courses/${c.courseId?.slug}`}
                        className="flex-1 bg-brand-400 hover:bg-brand-300 text-slate-955 text-center py-2 font-black border-2 border-slate-950 rounded-xl text-[10.5px] shadow-flat-sm active:translate-y-[1px] select-none"
                      >
                        Claim & Unlock Certificate
                      </Link>
                    </div>
                  </div>
                ))}
            </div>

            {/* Certificate Store Benefits Card */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-flat space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block select-none">Dexterity Verified Certification Benefits</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <h5 className="font-black text-slate-850 dark:text-white">✓ Career Enhancement</h5>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Share your verified credential URL on your Resume, CV, and Portfolio to get noticed by recruiters.</p>
                </div>
                <div className="space-y-1">
                  <h5 className="font-black text-slate-850 dark:text-white">✓ LinkedIn Integration</h5>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Add to your LinkedIn profile Licenses & Certifications section in one click.</p>
                </div>
                <div className="space-y-1">
                  <h5 className="font-black text-slate-850 dark:text-white">✓ Public Registry</h5>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">A permanent secure verification page with QR code lookup for anybody to check authentic validity.</p>
                </div>
                <div className="space-y-1">
                  <h5 className="font-black text-slate-850 dark:text-white">✓ High-res Printouts</h5>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Print in high-resolution double-border gold credentials with security seal and instructor signature.</p>
                </div>
              </div>
            </div>

            {/* FAQ section */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-flat space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block select-none">Frequently Asked Questions</span>
              <div className="space-y-2 text-xs">
                <div className="space-y-0.5">
                  <p className="font-black text-slate-900 dark:text-slate-100">How long is the certificate valid?</p>
                  <p className="text-[10.5px] text-slate-500">Every Dexterity Learn certificate has lifetime validity and public hosting. There are no recurring fees.</p>
                </div>
                <div className="space-y-0.5">
                  <p className="font-black text-slate-900 dark:text-slate-100">Is the payment secure?</p>
                  <p className="text-[10.5px] text-slate-500">Yes! We route checkout orders through secure UPI verification channels via WhatsApp activation. Your access is instantly updated.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: Learner Stats & Gamification */}
        {activeTab === 'gamification' && (
          <div className="space-y-4">
            
            {/* Level Rank Card */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-flat space-y-4">
              <div className="flex justify-between items-center select-none">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400">Learner Rank Level</span>
                  <h3 className="text-sm font-black text-slate-955 dark:text-white mt-0.5 flex items-center gap-1.5">
                    🏆 {getLevelInfo(user.progress?.xp || 0).name}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-full border-2 border-slate-950 bg-slate-100 flex items-center justify-center font-bold text-lg shadow-flat-sm">
                  {user.progress?.xp >= 2501 ? '💎' : user.progress?.xp >= 1001 ? '🧬' : user.progress?.xp >= 501 ? '🥇' : user.progress?.xp >= 201 ? '🥈' : '🥉'}
                </div>
              </div>

              {/* Progress to next level */}
              <div>
                <div className="flex justify-between text-[10px] font-black text-slate-455 mb-1.5">
                  <span>XP PROGRESS</span>
                  <span>{user.progress?.xp || 0} XP</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-400 border-r border-slate-950" style={{ width: `${Math.min(100, ((user.progress?.xp || 0) / 3000) * 100)}%` }} />
                </div>
                <span className="text-[8.5px] text-slate-400 block mt-1.5 font-bold">Earn XP by completing lessons (+10 XP) and enrolling in new courses (+20 XP). Reach 2500 XP to unlock Diamond Learner status.</span>
              </div>
            </div>

            {/* Streaks & Milestones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 select-none">
              
              {/* Daily Streak Index */}
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-4 shadow-flat-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wide block">Active Daily Streak</span>
                  <h4 className="text-xl font-black text-orange-500 mt-1 flex items-center gap-1.5">
                    <Flame className="h-6 w-6 text-orange-500 fill-orange-500 animate-pulse" /> {user.progress?.streak || 0} Days
                  </h4>
                </div>
                <p className="text-[9.5px] text-slate-500 dark:text-slate-400 leading-normal mt-2">Log in daily to keep your learning streak burning. Streak resets if inactive for more than 24 hours.</p>
              </div>

              {/* Level milestones */}
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-4 shadow-flat-sm space-y-2">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wide block">Milestones Unlocked</span>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/40 pb-1">
                    <span className="font-bold">Bronze Status (0 XP)</span>
                    <span className="text-emerald-600 font-black">✓ Unlocked</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/40 pb-1">
                    <span className="font-bold">Silver Status (200 XP)</span>
                    <span>{user.progress?.xp >= 201 ? <span className="text-emerald-600 font-black">✓ Unlocked</span> : <span className="text-slate-400">Locked</span>}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Gold Status (500 XP)</span>
                    <span>{user.progress?.xp >= 501 ? <span className="text-emerald-600 font-black">✓ Unlocked</span> : <span className="text-slate-400">Locked</span>}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Public profile sharing action */}
            <div className="bg-brand-100 dark:bg-brand-950/20 border-2 border-brand-400 rounded-3xl p-4 flex justify-between items-center select-none">
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-slate-955 dark:text-white">Professional Student Profile</h4>
                <p className="text-[10px] text-slate-505 dark:text-slate-400 font-bold">Publish your achievements and verified credentials to the public.</p>
              </div>

              <Link
                to={`/profile/${user.username}`}
                className="bg-brand-400 hover:bg-brand-300 text-slate-955 text-[11px] font-black px-4 py-2 border-2 border-slate-950 rounded-xl shadow-flat-sm active:translate-y-[1px] active:shadow-none transition shrink-0"
              >
                View Public Profile
              </Link>
            </div>

          </div>
        )}

        {/* TAB 3: Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-2">
            {user.bookmarks && user.bookmarks.length > 0 ? (
              user.bookmarks.map((b, idx) => (
                <Link
                  key={idx}
                  to={b.url}
                  className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 hover:border-brand-500 transition"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <Bookmark className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{b.title}</span>
                  </div>
                  <span className="text-[8px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {b.type}
                  </span>
                </Link>
              ))
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">No active bookmarks saved.</div>
            )}
          </div>
        )}

        {/* TAB 4: Payments history */}
        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden">
            {payments && payments.length > 0 ? (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full border-collapse text-[10px] text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-850 font-bold border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3 text-left">Invoice</th>
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payments.map((p) => (
                      <tr key={p._id}>
                        <td className="p-3 font-semibold">{p.invoiceNumber}</td>
                        <td className="p-3 capitalize">{p.productType}</td>
                        <td className="p-3 font-bold text-slate-850 dark:text-slate-100">₹{p.amount}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                            p.status === 'completed' 
                              ? 'bg-emerald-500/20 text-emerald-500' 
                              : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">No transaction logs available.</div>
            )}
          </div>
        )}

        {/* TAB 5: Account Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-soft space-y-5">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">Security Credentials</h3>

            {passSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 p-3 text-xs text-emerald-600">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}
            {passError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 p-3 text-xs text-red-600">
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 py-2 px-3 text-xs border border-slate-200 dark:border-slate-800 outline-none focus:border-brand-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 py-2 px-3 text-xs border border-slate-200 dark:border-slate-800 outline-none focus:border-brand-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-650 text-white text-xs font-bold py-2.5 rounded-xl transition"
              >
                Change Password
              </button>
            </form>

            <button
              onClick={logout}
              className="w-full border border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 text-xs font-bold py-2.5 rounded-xl transition mt-4"
            >
              Log Out Session
            </button>
          </div>
        )}
      </div>

      </div> {/* Close Right Column wrapper */}

      {/* Certificate Viewer Popup modal (Beautiful HTML styling) */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-flat-lg max-w-sm w-full text-center relative space-y-4">
            
            <button 
              onClick={() => setSelectedCert(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 animate-pulse"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Certificate Sepia Layout */}
            <div id="print-certificate-area" className="border-[8px] border-double border-amber-600 bg-amber-50/50 dark:bg-[#1a1510] p-4 text-[#4a3b2b] dark:text-[#c4b3a0] rounded-2xl space-y-4 shadow-inner-soft">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-700 block">Certificate of Completion</span>
              
              <div className="space-y-1">
                <span className="text-[9px] italic text-slate-550 block">This is proudly awarded to</span>
                <span className="text-sm font-bold block uppercase tracking-wide border-b border-amber-600/35 pb-1 max-w-[200px] mx-auto">{selectedCert.username}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] italic text-slate-550 block">for successfully completing the syllabus requirements of</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">{selectedCert.title}</span>
              </div>

              <div className="flex justify-between items-end pt-4 text-[8px] text-slate-500">
                <div className="text-left">
                  <span>Authorized Signature</span>
                  <span className="block font-semibold text-[#4a3b2b] dark:text-[#c4b3a0] mt-0.5 font-serif italic">Muhammad Jawad M R</span>
                </div>
                <div className="text-right">
                  <span>Issued Date</span>
                  <span className="block font-semibold text-[#4a3b2b] dark:text-[#c4b3a0] mt-0.5">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 bg-brand-400 hover:bg-brand-300 text-slate-950 text-xs font-black py-2.5 w-full border-2 border-slate-950 rounded-xl shadow-flat-sm active:translate-y-[1px] active:shadow-none transition"
            >
              <Download className="h-4 w-4" /> Print / Save Certificate
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
