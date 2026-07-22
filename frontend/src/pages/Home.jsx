import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, GraduationCap, ChevronRight, Award, Compass, Play, BookOpenCheck } from 'lucide-react';
import { api, useAuth } from '../context/AuthContext';
import useSEO from '../hooks/useSEO';

import RazorpayModal from '../components/RazorpayModal';

const colors = ['#a3f058', '#fcd34d', '#c084fc', '#f472b6', '#fbbf24', '#facc15', '#fb7185', '#a78bfa'];
const getBookColor = (id) => {
  if (!id) return '#a3f058';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeAnnouncement, setActiveAnnouncement] = useState(0);

  // Razorpay Checkout State
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({
    type: 'certificate',
    name: 'Verified Full-Stack Web Developer Certificate',
    price: 499,
  });

  const handleClaimCertificate = (name, price) => {
    const pName = encodeURIComponent(name || 'Verified Software Engineer Certificate');
    const pPrice = price || 499;
    navigate(`/payment?type=certificate&name=${pName}&price=${pPrice}`);
  };

  useSEO('Home - Free Mobile-First Coding Tutorials', 'Learn web development, programming languages, and career skills on a mobile-first premium learning interface.');


  // Fetch courses, books, categories, announcements
  const { data: coursesData } = useQuery({
    queryKey: ['popular-courses'],
    queryFn: () => api.get('/courses').then((res) => res.data.courses),
  });

  const { data: booksData } = useQuery({
    queryKey: ['popular-books'],
    queryFn: () => api.get('/books').then((res) => res.data.books),
  });

  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.get('/admin/announcements').then((res) => res.data.announcements).catch(() => []), // admin endpoint, fallback or skip
  });

  // Categories list matching standard seed data
  const categories = [
    { name: 'AI Engineering', slug: 'ai-engineering', color: 'from-blue-500 to-indigo-600' },
    { name: 'Workflow Automation', slug: 'workflow-automation', color: 'from-teal-400 to-emerald-600' },
    { name: 'AI Design & Creative', slug: 'ai-design-creative', color: 'from-purple-500 to-indigo-700' },
    { name: 'AI Career Prep', slug: 'ai-career-prep', color: 'from-orange-400 to-red-500' },
  ];

  // Dummy announcements if database empty or endpoint fails (since admin authentication applies to that route)
  const defaultAnnouncements = [
    {
      title: 'Complete MERN Stack Rewrite Active!',
      content: 'Welcome to the brand new Dexterity Learn app. Enjoy smooth page transitions, PWA offline reading, and robust course progress tracking!',
      category: 'Feature Launch',
      image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400&q=80',
      gradient: 'from-teal-300 to-emerald-450',
    },
    {
      title: 'Learn for Free, Always ❤️',
      content: 'Education is a human right. We will never charge you a single rupee to learn advanced software engineering, systems design, or full-stack web development.',
      category: 'Free Education',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
      gradient: 'from-rose-300 to-pink-400',
    },
    {
      title: 'Earn Verified Certificates',
      content: 'Complete any syllabus, clear the checkpoint quizzes, and claim your official graduation certificate. Stand out to employers.',
      category: 'Certifications',
      image: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=400&q=80',
      gradient: 'from-amber-300 to-orange-400',
    },
    {
      title: 'Jsn Creative & Founder Message ❤️',
      content: 'This premium version of Dexterity Learn is proudly built by Jsn Creative and the founder Muhammad Jawad M R. One Love to all our student community!',
      category: 'Founder Message',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80',
      gradient: 'from-violet-300 to-fuchsia-400',
    },
    {
      title: 'PWA Offline Learning Manuals',
      content: 'Read your tech ebooks and checklists offline during travel. Your progress syncs back automatically when you connect to the internet.',
      category: 'Feature Launch',
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&q=80',
      gradient: 'from-blue-300 to-indigo-400',
    }
  ];

  const activeAnnounces = announcements && announcements.length > 0 ? announcements : defaultAnnouncements;

  // Auto slide announcements
  useEffect(() => {
    if (activeAnnounces.length <= 1) return;
    const interval = setInterval(() => {
      setActiveAnnouncement((prev) => (prev + 1) % activeAnnounces.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeAnnounces]);

  return (
    <div className="space-y-6 pb-4">
      {/* 1. Announcements Sliding Banner (Fixed Size Rectangle with Images) */}
      {activeAnnounces.length > 0 && (
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${activeAnnounces[activeAnnouncement].gradient || 'from-brand-300 to-brand-400'} p-3 md:p-4 text-slate-900 border-2 border-slate-950 shadow-flat-lg flex items-center justify-between h-32 md:h-36 transition-all duration-350 select-none`}>
          <div className="flex-1 flex flex-col justify-between h-full pr-2 md:pr-3 min-w-0">
            <div className="space-y-0.5 md:space-y-1">
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-wider bg-slate-950 text-white px-2 py-0.5 rounded-full w-fit">
                {activeAnnounces[activeAnnouncement].category || 'Update'}
              </span>
              <h3 className="text-[11px] md:text-sm font-black tracking-tight line-clamp-1">
                {activeAnnounces[activeAnnouncement].title}
              </h3>
              <p className="text-[9px] md:text-xs font-medium text-slate-850 leading-tight line-clamp-2 md:line-clamp-3">
                {activeAnnounces[activeAnnouncement].content}
              </p>
            </div>
            
            {/* Slide dots */}
            {activeAnnounces.length > 1 && (
              <div className="flex gap-1.5 mt-1">
                {activeAnnounces.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveAnnouncement(idx)}
                    className={`h-1.5 w-1.5 rounded-full transition-all border border-slate-950 ${
                      idx === activeAnnouncement ? 'bg-slate-950 w-3' : 'bg-slate-950/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {activeAnnounces[activeAnnouncement].image && (
            <div className="h-full w-20 md:w-36 rounded-xl md:rounded-2xl border-2 border-slate-950 overflow-hidden shrink-0 bg-slate-100 shadow-flat-sm">
              <img
                src={activeAnnounces[activeAnnouncement].image}
                alt="Announcement"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* 2. Categories Horizontal Container */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
          Explore Topics
        </h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => navigate(`/courses?category=${cat.slug}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-950 text-xs font-black text-slate-900 dark:text-slate-100 hover:bg-brand-100 shadow-flat-sm transition-all shrink-0 active:translate-y-[1px] active:shadow-none"
            >
              <span className={`h-2.5 w-2.5 rounded-full border border-slate-950 bg-gradient-to-r ${cat.color}`} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Popular Courses Horizontal Scroll */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Popular Syllabus
          </h2>
          <Link to="/courses" className="flex items-center text-[11px] text-brand-500 hover:text-brand-600 font-semibold">
            All Courses <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar py-1">
          {coursesData && coursesData.length > 0 ? (
            coursesData.map((course) => {
              // Find progress if enrolled
              const enrollment = user?.enrolledCourses?.find(
                (c) => c.courseId?._id === course._id || c.courseId === course._id
              );
              const progress = enrollment ? enrollment.progress : 0;

              return (
                <div
                  key={course._id}
                  className="flex flex-col w-36 md:w-40 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-950 dark:border-slate-800 shadow-flat hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-flat-sm transition-all shrink-0 overflow-hidden"
                >
                  <div className="h-14 md:h-18 w-full overflow-hidden bg-slate-100 relative border-b-2 border-slate-950 dark:border-slate-800">
                    <img
                      src={course.image || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&q=80'}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-1 right-1 bg-brand-400 text-slate-950 text-[8px] font-black border border-slate-950 px-1.5 py-0.5 rounded-full shadow-flat-sm">
                      {course.difficulty}
                    </div>
                  </div>
                  <div className="p-2 md:p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{course.category}</span>
                      <h4 className="text-[10px] font-black text-slate-900 dark:text-slate-100 truncate mt-0.5">{course.title}</h4>
                    </div>

                    <div className="mt-2 pt-2 border-t-2 border-slate-950 dark:border-slate-800">
                      {enrollment ? (
                        <div>
                          <div className="flex justify-between text-[8px] text-slate-450 font-black mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-150 dark:bg-slate-800 border border-slate-950 dark:border-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-400 border-r border-slate-950" style={{ width: `${progress}%` }} />
                          </div>
                          <Link
                            to={`/courses/${course.slug}`}
                            className="flex items-center justify-center gap-0.5 w-full bg-brand-400 hover:bg-brand-300 text-slate-950 text-[8px] font-black py-1 border-2 border-slate-950 rounded-lg mt-1.5 shadow-flat-sm transition active:translate-y-[1px] active:shadow-none"
                          >
                            <Play className="h-2.5 w-2.5 fill-slate-950" /> Continue
                          </Link>
                        </div>
                      ) : (
                        <Link
                          to={`/courses/${course.slug}`}
                          className="flex items-center justify-center w-full bg-white hover:bg-brand-100 text-slate-950 text-[8px] font-black py-1 border-2 border-slate-950 rounded-lg shadow-flat-sm transition active:translate-y-[1px] active:shadow-none"
                        >
                          Start Course
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Skeleton loaders
            [1, 2].map((i) => (
              <div key={i} className="w-36 md:w-40 h-40 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 animate-pulse shrink-0" />
            ))
          )}
        </div>
      </div>

      {/* 4. Popular Books Horizontal Scroll */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Premium Study Manuals
          </h2>
          <Link to="/books" className="flex items-center text-[11px] text-brand-500 hover:text-brand-600 font-semibold">
            All Books <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar py-1">
          {booksData && booksData.length > 0 ? (
            booksData.map((book) => {
              const isUnlocked = user?.unlockedBooks?.some((b) => b._id === book._id || b === book._id);
              return (
                <Link
                  key={book._id}
                  to={`/books/${book.slug}`}
                  className="flex flex-col w-28 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-950 dark:border-slate-800 shadow-flat hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-flat-sm transition-all shrink-0 p-1.5 overflow-hidden"
                >
                  <div
                    className="h-32 w-full overflow-hidden rounded-xl relative border-2 border-slate-950 dark:border-slate-800 flex flex-col justify-between p-2 select-none text-slate-950"
                    style={{ backgroundColor: getBookColor(book._id) }}
                  >
                    {/* Spine shadow */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/10 border-r border-black/15" />
                    
                    {/* Badge/Header */}
                    <div className="flex justify-between items-start w-full relative z-10">
                      <span className="text-[5px] font-black uppercase tracking-widest bg-slate-950 text-white px-1.5 py-0.5 rounded-sm border border-slate-950">
                        GUIDE
                      </span>
                    </div>

                    {/* Main Title */}
                    <div className="my-auto text-left relative z-10 pt-0.5">
                      <h4 className="text-[8px] font-black uppercase tracking-tight leading-tight line-clamp-3">
                        {book.title}
                      </h4>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between w-full border-t border-black/10 pt-1 text-[7px] font-black uppercase tracking-wider relative z-10">
                      <span className="truncate max-w-[55px]">{book.author || 'DEXTERITY'}</span>
                      <span>v1.0</span>
                    </div>

                    {isUnlocked && (
                      <div className="absolute bottom-1 right-1 bg-brand-400 text-slate-950 border border-slate-950 rounded-full p-0.5 shadow-flat-sm z-20" title="Unlocked">
                        <BookOpenCheck className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </div>
                  <div className="pt-2 px-0.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[9px] font-black text-slate-900 dark:text-slate-100 truncate leading-tight">{book.title}</h4>
                      <span className="text-[7px] text-slate-400 block truncate mt-0.5">{book.author}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[8px] font-bold text-slate-500">★ {book.rating || '4.5'}</span>
                      <span className="text-[8px] font-black text-brand-600 dark:text-brand-400">
                        {isUnlocked ? 'Read' : `₹${book.price}`}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            // Skeleton loaders
            [1, 2, 3].map((i) => (
              <div key={i} className="w-28 h-40 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 animate-pulse shrink-0" />
            ))
          )}
        </div>
      </div>

      {/* 4. Earn Verified Certificates Section */}
      <div className="bg-gradient-to-br from-amber-500/10 via-brand-500/10 to-emerald-500/10 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-flat space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full border border-slate-950">
              Verified Credentials
            </span>
            <h2 className="text-base font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
              <Award className="h-5 w-5 text-amber-500" /> Earn Verified Certificates
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Learning is 100% free! Claim an official gold certificate upon completion.
            </p>
          </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 pt-1 scroll-smooth">
          {coursesData && coursesData.length > 0 ? (
            coursesData.map((course) => (
              <div key={course._id} className="w-48 sm:w-56 shrink-0 bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl p-3 shadow-flat-sm flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[14px]">🏆</span>
                    <span className="text-[8px] font-black bg-brand-100 text-brand-800 border border-brand-300 px-1.5 py-0.5 rounded uppercase">
                      {course.category || 'Course'}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white mt-2 leading-tight truncate">{course.title}</h4>
                  <p className="text-[9.5px] text-slate-500 font-semibold mt-1 line-clamp-2">{course.shortDescription || course.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Claim via WA</span>
                  </div>
                  <button
                    onClick={() => navigate(`/courses/${course.slug}`)}
                    className="bg-brand-400 hover:bg-brand-300 text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-xl border border-slate-950 shadow-flat-sm transition active:translate-y-0.5"
                  >
                    Start Course
                  </button>
                </div>
              </div>
            ))
          ) : (
            [1, 2, 3].map((i) => (
              <div key={i} className="w-48 h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse shrink-0" />
            ))
          )}
        </div>
      </div>

      {/* 5. Minimalist Footer */}
      <footer className="pt-6 border-t border-slate-200 dark:border-slate-900 text-center space-y-1">
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Made with ❤️ from India by JSN CREATIVE
        </p>
        <p className="text-[9px] text-slate-400 dark:text-slate-600">
          © {new Date().getFullYear()} Dexterity Learn. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
