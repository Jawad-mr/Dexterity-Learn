import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, ShieldAlert, Award, FileText, CheckCircle2, ChevronRight, Lock, CheckCircle, CreditCard, Sparkles, Loader2, Share2, MessageCircle } from 'lucide-react';
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

  // Check certificate status (locked, unpaid, paid)
  const [certData, setCertData] = useState(null);

  // Fetch certificate details if completed
  useQuery({
    queryKey: ['certificate-status', course?._id, user?._id],
    queryFn: () => {
      if (!course?._id || !user?._id) return null;
      return api.get(`/auth/profile`).then((res) => {
        // Find certificate in populated user model or query certificate directly
        // Query server payments/certificates
        const userCerts = res.data.user.enrolledCourses;
        // Let's call a profile reload to sync certs
        return null;
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
              <MessageCircle className="h-4 w-4 fill-slate-950" /> Claim Certificate via WhatsApp (₹{course.certificatePrice || 499})
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
