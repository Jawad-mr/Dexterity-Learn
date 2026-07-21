import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, ShieldAlert, Award, FileText, CheckCircle2, ChevronRight, Lock, CheckCircle, CreditCard, Sparkles, Loader2, Share2, MessageCircle, ShieldCheck } from 'lucide-react';
import { api, useAuth } from '../context/AuthContext';

export default function CourseSyllabus() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [paying, setPaying] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState('');

  // Fetch Course details
  const { data, isLoading, error } = useQuery({
    queryKey: ['course-syllabus', slug],
    queryFn: () => api.get(`/courses/${slug}`).then((res) => res.data),
  });

  const course = data?.course;
  const lessons = data?.lessons;

  // Find user enrollment state
  const enrollment = user?.enrolledCourses?.find(
    (c) => c.courseId?._id === course?._id || c.courseId === course?._id
  );
  const progress = enrollment ? enrollment.progress : 0;

  // Eligibility checklist state
  const [passedQuizzes, setPassedQuizzes] = useState(progress === 100);
  const [examScore, setExamScore] = useState(progress === 100 ? 100 : 0);
  const [capstoneSubmitted, setCapstoneSubmitted] = useState(progress === 100);
  const [practicalSubmitted, setPracticalSubmitted] = useState(progress === 100);
  const [githubUrl, setGithubUrl] = useState('');
  
  // Modal states
  const [showExamModal, setShowExamModal] = useState(false);
  const [showCapstoneModal, setShowCapstoneModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);

  // Exam Answers state
  const [examAnswers, setExamAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [examResultMsg, setExamResultMsg] = useState('');

  // Confetti trigger helper
  const triggerConfetti = () => {
    if (window.confetti) {
      window.confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
      script.onload = () => {
        window.confetti && window.confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      };
      document.body.appendChild(script);
    }
  };

  const downloadCertificatePDF = () => {
    const element = document.getElementById('certificate-preview-card');
    if (!element) return;

    const runDownload = () => {
      const opt = {
        margin: 0.15,
        filename: `${course?.title || 'Course'}_Certificate.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
      };
      window.html2pdf().from(element).set(opt).save();
    };

    if (window.html2pdf) {
      runDownload();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        runDownload();
      };
      document.body.appendChild(script);
    }
  };

  // Check certificate status (locked, unpaid, paid)
  const [certData, setCertData] = useState(null);

  // Fetch certificate details if completed
  const { data: certInfo } = useQuery({
    queryKey: ['certificate-status', course?._id, user?._id],
    queryFn: () => {
      if (!course?._id || !user?._id) return null;
      return api.get(`/auth/profile`).then((res) => {
        const certs = res.data.certificates || [];
        const found = certs.find((c) => c.courseId === course._id || c.courseId?._id === course._id || c.courseId?.toString() === course._id.toString());
        return found || null;
      });
    },
    enabled: !!course?._id && !!user?._id,
  });

  // Mutator to buy certificate
  const checkoutMutation = useMutation({
    mutationFn: (courseId) => api.post('/payments/create-order', { productType: 'certificate', productId: courseId }),
    onSuccess: async (res) => {
      const { paymentId, gatewayOrderId, amount, invoiceNumber } = res.data.order;
      setPaying(true);
      
      // Simulate payment processing delay (Razorpay/Stripe checkout)
      setTimeout(async () => {
        try {
          const verifyRes = await api.post('/payments/verify', {
            paymentId,
            gatewayTransactionId: `pay_g_${Date.now()}`,
            status: 'success',
          });
          if (verifyRes.data.success) {
            setPaySuccessMsg('Payment Successful! Your Certificate is unlocked.');
            await refreshUser();
            queryClient.invalidateQueries(['course-syllabus', slug]);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setPaying(false);
        }
      }, 2000);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-bold text-red-500">Failed to load course details.</h3>
        <Link to="/courses" className="text-xs text-brand-500 mt-2 hover:underline inline-block">Back to Courses</Link>
      </div>
    );
  }

  // Check if user has an issued certificate for this course
  // We populate certificates check from user.certificates in production
  // For the rewrite, if progress is 100%, we fetch the certificate record:
  const isCompleted = progress === 100;
  
  return (
    <div className="space-y-6 pb-6 lg:grid lg:grid-cols-4 lg:gap-6 lg:items-start lg:space-y-0">
      
      {/* Left Column: Hero, Overview, and Lessons outline */}
      <div className="space-y-6 lg:col-span-3">
        {/* Course Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[160px] flex flex-col justify-end p-5 border-2 border-slate-950 dark:border-slate-800 shadow-flat-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/10 z-10" />
          <img
            src={course.image || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80'}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 space-y-2">
            <div className="flex items-center justify-between w-full">
              <span className="text-[9px] font-black uppercase tracking-wider bg-brand-400 text-slate-950 border border-slate-950 px-2 py-0.5 rounded-full w-fit shadow-flat-sm">
                {course.category}
              </span>
              
              {/* Share pathway button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Syllabus link copied to clipboard!');
                }}
                className="flex items-center gap-1 text-[8px] font-black bg-white text-slate-900 px-2.5 py-1 border border-slate-950 rounded-full shadow-flat-sm active:translate-y-[1px] active:shadow-none transition"
              >
                <Share2 className="h-2.5 w-2.5" /> Share Path
              </button>
            </div>
            <h1 className="text-lg font-black leading-tight text-white">{course.title}</h1>
            <div className="flex gap-4 text-[10px] text-slate-200 font-bold">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-brand-400" /> {course.estimatedTime}</span>
              <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-brand-400" /> {course.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-950 dark:border-slate-800 p-4 shadow-flat">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Course Overview
          </h3>
          <p className="text-xs font-medium text-slate-655 dark:text-slate-300 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Certificate Completion & Verifier Panel */}
        {(enrollment || certInfo) && (
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-flat space-y-4">
            
            {/* Completion Banner */}
            {certInfo?.isPaid || (progress === 100 && passedQuizzes && examScore >= 70 && capstoneSubmitted && practicalSubmitted) ? (
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 p-4 border border-emerald-400 rounded-3xl">
                <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border-2 border-slate-950 dark:border-slate-800 shadow-flat-sm animate-bounce">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-800 dark:text-emerald-400">🎉 Congratulations! You completed the course!</h3>
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Every certification milestone has been satisfied. Preview and claim your verified credentials below.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-400 rounded-3xl">
                <div className="h-10 w-10 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-xl flex items-center justify-center shrink-0 border-2 border-slate-950 dark:border-slate-800 shadow-flat-sm">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-800 dark:text-amber-400">⚠️ Eligibility Checkpoint</h3>
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">Complete all learning syllabus, final exams, capstone, and assignments to unlock your certificate.</p>
                </div>
              </div>
                     {/* Certificate Preview Card with Watermark or Blur */}
            <div id="certificate-preview-card" className="relative w-full max-w-[620px] mx-auto aspect-[1.414] border-[6px] border-double border-amber-600 bg-amber-50/45 dark:bg-[#1f1a14] p-6 text-[#4a3b2b] dark:text-[#c4b3a0] rounded-2xl shadow-inner overflow-hidden select-none flex flex-col justify-between text-center">
              
              {/* Confetti or Seal Watermark background */}
              <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
                <Award className="h-32 w-32" />
              </div>

              {/* Watermark Diagonal Overlay */}
              {(!certInfo || !certInfo.isPaid) && (
                <div className="absolute inset-0 bg-slate-900/10 pointer-events-none z-10 flex items-center justify-center">
                  <span className="text-red-500/20 text-4xl sm:text-5xl font-black uppercase tracking-[0.15em] select-none -rotate-12">
                    Preview Mode
                  </span>
                </div>
              )}

              {/* Blurred Mask if not eligible and unpaid */}
              {!certInfo?.isPaid && !(progress === 100 && passedQuizzes && examScore >= 70 && capstoneSubmitted && practicalSubmitted) && (
                <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm pointer-events-none z-20 flex flex-col items-center justify-center p-4 text-center text-white">
                  <Lock className="h-8 w-8 text-amber-400 mb-1" />
                  <span className="text-xs font-black uppercase tracking-wider">🔒 Preview Locked</span>
                  <span className="text-[9px] text-slate-350 max-w-xs mt-0.5 font-bold">Complete all eligibility tasks below to unlock certificate preview.</span>
                </div>
              )}

              {/* Top Section */}
              <div className="space-y-1">
                <span className="text-[8px] font-black tracking-[0.2em] uppercase text-amber-700 block">Official Certificate of Completion</span>
                <div className="h-0.5 w-12 bg-amber-600/30 mx-auto" />
              </div>

              {/* Recipient Section */}
              <div className="space-y-1">
                <span className="text-[9px] italic text-slate-500 block font-serif">This is proudly awarded to</span>
                <span className="text-base font-serif font-black block uppercase tracking-wide border-b border-amber-600/30 pb-0.5 max-w-[240px] mx-auto truncate text-slate-900 dark:text-white">
                  {user?.username || 'Student Name'}
                </span>
              </div>

              {/* Course Title Section */}
              <div className="space-y-1">
                <span className="text-[9px] italic text-slate-500 block font-serif font-bold">for successfully completing the syllabus requirements of</span>
                <span className="text-xs font-black text-slate-900 dark:text-slate-100 block leading-tight max-w-[400px] mx-auto">{course.title}</span>
              </div>

              {/* Verifier credentials & Signature / QR */}
              <div className="flex justify-between items-end pt-3 text-[8px] text-slate-550 border-t border-amber-600/20">
                <div className="text-left space-y-0.5">
                  <span className="block font-semibold text-[#4a3b2b] dark:text-[#c4b3a0] font-serif italic text-[10px]">Muhammad Jawad M R</span>
                  <span className="text-[7.5px] uppercase tracking-wider block leading-none">Founder, Dexterity Learn</span>
                </div>
                
                {/* Verification QR Code */}
                <div className="bg-white p-1 rounded-md border border-slate-300 shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://dexterity-learn.vercel.app/#/verify-certificate/${certInfo?.certificateId || 'locked'}`)}`}
                    alt="Verification QR"
                    className="w-10 h-10 object-contain"
                  />
                </div>

                <div className="text-right space-y-0.5">
                  <span>Issued Date</span>
                  <span className="block font-semibold text-[#4a3b2b] dark:text-[#c4b3a0]">{certInfo?.issuedAt ? new Date(certInfo.issuedAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Certificate ID & Verification Info */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-350 dark:border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Secure Certificate ID</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {certInfo?.isPaid ? certInfo.certificateId : '🔒 Locked (Unlock required)'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={!certInfo?.isPaid}
                  onClick={() => {
                    if (certInfo?.isPaid) {
                      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://dexterity-learn.vercel.app/#/verify-certificate/${certInfo.certificateId}`)}`;
                      window.open(shareUrl, '_blank');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-xl text-[10.5px] font-black transition-all ${
                    certInfo?.isPaid 
                      ? 'bg-[#0a66c2] text-white border-transparent hover:bg-[#004182] active:translate-y-[1px]' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Share2 className="h-3.5 w-3.5" /> LinkedIn Share
                </button>

                <button
                  disabled={!certInfo?.isPaid}
                  onClick={() => {
                    if (certInfo?.isPaid) {
                      downloadCertificatePDF();
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-xl text-[10.5px] font-black transition-all ${
                    certInfo?.isPaid 
                      ? 'bg-brand-400 hover:bg-brand-300 text-slate-955 border-slate-955 shadow-flat-sm active:translate-y-[1px] active:shadow-none' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" /> Download (PDF)
                </button>
              </div>
            </div>

            {/* Verification details button */}
            {certInfo?.isPaid && (
              <Link
                to={`/verify-certificate/${certInfo.certificateId}`}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-950 dark:text-white font-black py-2 rounded-xl border-2 border-slate-950 dark:border-slate-800 shadow-flat-sm flex items-center justify-center gap-1.5 transition active:translate-y-[1px]"
              >
                <ShieldCheck className="h-4 w-4" /> Go to Verification Registry Page
              </Link>
            )}

            {/* Eligibility Checklist card (Interactive tasks buttons) */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-4 space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Syllabus Eligibility Checklist</span>
              
              <div className="space-y-2.5 text-xs">
                {/* 1. Progress */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{progress === 100 ? '✅' : '❌'}</span>
                    <span className="font-bold">100% Course Completion</span>
                  </div>
                  <span className="font-black text-slate-500">{progress}%</span>
                </div>

                {/* 2. Quizzes */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{passedQuizzes ? '✅' : '❌'}</span>
                    <span className="font-bold">All Lesson Quizzes Passed</span>
                  </div>
                  {passedQuizzes ? (
                    <span className="font-black text-emerald-600">Passed ✓</span>
                  ) : (
                    <button
                      onClick={() => {
                        setPassedQuizzes(true);
                        triggerConfetti();
                      }}
                      className="bg-brand-400 hover:bg-brand-300 text-[10px] font-black px-2.5 py-1 border-2 border-slate-950 rounded-lg shadow-flat-xs text-slate-950"
                    >
                      Complete Quizzes
                    </button>
                  )}
                </div>

                {/* 3. Final Exam */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{examScore >= 70 ? '✅' : '❌'}</span>
                    <span className="font-bold">Final Assessment (Min 70%)</span>
                  </div>
                  {examScore >= 70 ? (
                    <span className="font-black text-emerald-600">{examScore}% Passed ✓</span>
                  ) : (
                    <button
                      onClick={() => setShowExamModal(true)}
                      className="bg-brand-400 hover:bg-brand-300 text-[10px] font-black px-2.5 py-1 border-2 border-slate-950 rounded-lg shadow-flat-xs text-slate-950"
                    >
                      Take Final Exam
                    </button>
                  )}
                </div>

                {/* 4. Capstone Project */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{capstoneSubmitted ? '✅' : '❌'}</span>
                    <span className="font-bold">Capstone Project Submitted</span>
                  </div>
                  {capstoneSubmitted ? (
                    <span className="font-black text-emerald-600">Submitted ✓</span>
                  ) : (
                    <button
                      onClick={() => setShowCapstoneModal(true)}
                      className="bg-brand-400 hover:bg-brand-300 text-[10px] font-black px-2.5 py-1 border-2 border-slate-950 rounded-lg shadow-flat-xs text-slate-950"
                    >
                      Submit Capstone
                    </button>
                  )}
                </div>

                {/* 5. Practical Exercises */}
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{practicalSubmitted ? '✅' : '❌'}</span>
                    <span className="font-bold">Practical Exercises Completed</span>
                  </div>
                  {practicalSubmitted ? (
                    <span className="font-black text-emerald-600">Completed ✓</span>
                  ) : (
                    <button
                      onClick={() => {
                        setPracticalSubmitted(true);
                        triggerConfetti();
                      }}
                      className="bg-brand-400 hover:bg-brand-300 text-[10px] font-black px-2.5 py-1 border-2 border-slate-950 rounded-lg shadow-flat-xs text-slate-950"
                    >
                      Mark Exercises Complete
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Table of Contents / Lessons */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            Syllabus Outline ({lessons?.length || 0} Lessons)
          </h3>

          <div className="grid gap-2">
            {lessons?.map((lesson, idx) => {
              const isCompleted = enrollment?.completedLessons?.includes(lesson._id);
              return (
                <Link
                  key={lesson._id}
                  to={`/courses/${course.slug}/lessons/${lesson.slug}`}
                  className="flex items-center justify-between bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl hover:bg-brand-50/50 p-3 cursor-pointer shadow-flat-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border border-slate-950 ${
                      isCompleted 
                        ? 'bg-brand-400 text-slate-950' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-250 truncate">
                      {lesson.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-450 shrink-0">
                    {isCompleted && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-450" />
                    )}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: User Progress and Certificate Checkouts */}
      <div className="space-y-6 lg:col-span-1">
        {/* User Progress Panel */}
        {enrollment ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-950 dark:border-slate-800 p-4 shadow-flat">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-808 dark:text-slate-200">Your Progress</span>
              <span className="text-xs font-black text-brand-600 dark:text-brand-400">{progress}%</span>
            </div>
            <div className="h-3 w-full bg-slate-150 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-400 border-r border-slate-950" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-950 dark:border-slate-800 p-4 shadow-flat text-center py-5">
            <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Syllabus Access</span>
            <p className="text-[10px] font-medium text-slate-450 mt-1">Select any chapter outline below to enroll and begin learning.</p>
          </div>
        )}

        {/* Certificate Claim Checkout Spot */}
        {(!certInfo || !certInfo.isPaid) && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-950 dark:border-slate-800 shadow-flat space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-brand-100 dark:bg-brand-950/40 text-brand-600 dark:text-brand-455 rounded-xl flex items-center justify-center shrink-0 border-2 border-slate-950 dark:border-slate-800 shadow-flat-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black">100% Free Learning</h3>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  All lessons & quizzes are free! Upgrade anytime to get your official verifiable certificate.
                </p>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => {
                  const pName = encodeURIComponent(`${course.title} Certificate`);
                  navigate(`/payment?type=certificate&productId=${course._id}&name=${pName}&price=${course.certificatePrice || 499}`);
                }}
                className="flex items-center justify-center gap-2 w-full bg-brand-400 hover:bg-brand-300 text-slate-950 text-xs font-black py-2.5 rounded-xl border-2 border-slate-950 shadow-flat-sm transition active:translate-y-[1px] active:shadow-none"
              >
                <MessageCircle className="h-4 w-4 fill-slate-950" /> Claim Certificate (₹{course.certificatePrice || 499})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Final Exam MCQ Modal */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-flat-lg max-w-md w-full space-y-4 text-xs text-slate-800 dark:text-slate-200">
            <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider">📝 Final Syllabus Assessment</h3>
            <p className="text-[10px] text-slate-500 font-bold">Answer all questions correctly (minimum 70% requirement) to verify your syllabus credentials.</p>
            
            {examResultMsg && (
              <p className="p-2 border border-red-500 bg-red-50 text-red-600 font-bold rounded-lg">{examResultMsg}</p>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <p className="font-black text-slate-900 dark:text-slate-100">1. What does the LLM Temperature parameter control?</p>
                <div className="space-y-1">
                  {[
                    { val: 'a', label: 'Maximum token count' },
                    { val: 'b', label: 'Output randomness and creative styling' }
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-center gap-2 p-1.5 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                      <input
                        type="radio"
                        name="q1"
                        checked={examAnswers.q1 === opt.val}
                        onChange={() => setExamAnswers({ ...examAnswers, q1: opt.val })}
                        className="accent-brand-400"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-black text-slate-900 dark:text-slate-100">2. In Prompt Engineering, what is Chain-of-Thought reasoning?</p>
                <div className="space-y-1">
                  {[
                    { val: 'a', label: 'Encoding tokens in hex format' },
                    { val: 'b', label: 'Forcing the model to output its step-by-step logic before concluding' }
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-center gap-2 p-1.5 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                      <input
                        type="radio"
                        name="q2"
                        checked={examAnswers.q2 === opt.val}
                        onChange={() => setExamAnswers({ ...examAnswers, q2: opt.val })}
                        className="accent-brand-400"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-black text-slate-900 dark:text-slate-100">3. In a standard RAG system, what role does the Vector Database play?</p>
                <div className="space-y-1">
                  {[
                    { val: 'a', label: 'Storing semantic document embeddings for context retrieval' },
                    { val: 'b', label: 'Translating input commands to python code snippets' }
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-center gap-2 p-1.5 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                      <input
                        type="radio"
                        name="q3"
                        checked={examAnswers.q3 === opt.val}
                        onChange={() => setExamAnswers({ ...examAnswers, q3: opt.val })}
                        className="accent-brand-400"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (examAnswers.q1 === 'b' && examAnswers.q2 === 'b' && examAnswers.q3 === 'a') {
                    setExamScore(100);
                    setShowExamModal(false);
                    triggerConfetti();
                  } else {
                    setExamResultMsg('Some answers are incorrect. Review and try again!');
                  }
                }}
                className="flex-1 bg-brand-400 hover:bg-brand-300 text-slate-955 font-black py-2 rounded-xl border-2 border-slate-950 shadow-flat-sm transition active:translate-y-[1px]"
              >
                Submit Exam Answers
              </button>
              <button
                type="button"
                onClick={() => setShowExamModal(false)}
                className="px-4 py-2 border-2 border-slate-955 rounded-xl font-bold bg-white dark:bg-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capstone Submission Modal */}
      {showCapstoneModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-955 dark:border-slate-800 rounded-3xl p-6 shadow-flat-lg max-w-md w-full space-y-4 text-xs text-slate-800 dark:text-slate-200">
            <h3 className="text-sm font-black text-slate-955 dark:text-white uppercase tracking-wider">💻 Submit Capstone Repository</h3>
            <p className="text-[10px] text-slate-500 font-bold">Provide your public GitHub repository link for review and activation.</p>
            
            <input
              type="url"
              required
              placeholder="e.g. https://github.com/username/capstone-project"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-850 py-2 px-3 border-2 border-slate-955 font-bold rounded-xl outline-none"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (githubUrl.includes('github.5om') || githubUrl.includes('github.com/')) {
                    setCapstoneSubmitted(true);
                    setShowCapstoneModal(false);
                    triggerConfetti();
                  } else {
                    alert('Please enter a valid GitHub repository URL!');
                  }
                }}
                className="flex-1 bg-brand-400 hover:bg-brand-300 text-slate-955 font-black py-2 rounded-xl border-2 border-slate-955 shadow-flat-sm transition active:translate-y-[1px]"
              >
                Submit Project URL
              </button>
              <button
                type="button"
                onClick={() => setShowCapstoneModal(false)}
                className="px-4 py-2 border-2 border-slate-955 rounded-xl font-bold bg-white dark:bg-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
