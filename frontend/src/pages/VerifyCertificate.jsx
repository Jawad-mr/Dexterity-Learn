import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, ShieldCheck, Printer, User, Calendar, FileText, ArrowLeft, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { api } from '../context/AuthContext';
import useSEO from '../hooks/useSEO';

export default function VerifyCertificate() {
  const { certId } = useParams();

  useSEO('Verify Professional Certificate - Dexterity Learn', 'Instantly verify official Dexterity Learn academic certificates and student credentials.');

  // Fetch certificate details from backend
  const { data: certRes, isLoading, error } = useQuery({
    queryKey: ['verify-certificate', certId],
    queryFn: () => api.get(`/payments/verify-certificate/${certId}`).then((res) => res.data),
    retry: false,
  });

  const cert = certRes?.certificate;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-2">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        <span className="text-xs font-bold text-slate-400">Resolving credentials signature...</span>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-6 bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl shadow-flat space-y-4">
        <ShieldCheck className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-base font-black text-slate-900 dark:text-white">Invalid Verification Code</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The requested Certificate ID does not match any official records on our verification registry. Please check the spelling or contact support.
        </p>
        <Link to="/courses" className="inline-block bg-brand-400 hover:bg-brand-300 text-slate-955 text-xs font-black px-5 py-2.5 rounded-xl border-2 border-slate-950 shadow-flat-sm active:translate-y-[1px]">
          Explore Syllabus Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-6 space-y-6 px-4 pb-12 page-transition">
      {/* Back navigation */}
      <Link
        to="/"
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      {/* Verification success callout */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-500/30 rounded-3xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-3 shadow-flat-sm">
        <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Verification Registry Success</h3>
          <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 leading-relaxed">
            This certifies that the credential ID matches our official registry database. The course materials and final evaluation requirements were successfully completed by the student.
          </p>
        </div>
      </div>

      {/* Premium Neobrutalist Certificate preview card */}
      <div className="border-[8px] border-double border-amber-600 bg-amber-50/45 dark:bg-[#1a1510] p-6 sm:p-8 text-[#4a3b2b] dark:text-[#c4b3a0] rounded-3xl relative shadow-flat select-none overflow-hidden text-center space-y-6">
        <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
          <Award className="h-48 w-48" />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-amber-700 block">Official Verified Credential</span>
            <div className="h-0.5 w-16 bg-amber-600/40 mt-1" />
          </div>
          
          <div className="space-y-1.5">
            <span className="text-[10.5px] italic text-slate-505 block font-serif">This is proudly awarded to</span>
            <span className="text-lg sm:text-xl font-serif font-black block uppercase tracking-wide border-b-2 border-amber-600/30 pb-1 max-w-[280px] mx-auto text-slate-900 dark:text-white">
              {cert.userName}
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10.5px] italic text-slate-505 block font-serif">for successfully completing the syllabus requirements of</span>
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 block max-w-[450px] mx-auto leading-snug">{cert.courseTitle}</span>
          </div>

          {/* Verification seal, dates, and sign */}
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end pt-6 gap-4 border-t border-amber-600/20 text-[9px] text-slate-500">
            <div className="text-center sm:text-left space-y-0.5">
              <span className="block font-semibold text-[#4a3b2b] dark:text-[#c4b3a0] font-serif italic text-[11px]">Muhammad Jawad M R</span>
              <span className="text-[8px] uppercase tracking-wider block">Founder, Dexterity Learn</span>
            </div>

            {/* Dexterity Gold Seal */}
            <div className="h-14 w-14 rounded-full border-4 border-amber-600 bg-amber-500/10 flex items-center justify-center relative shrink-0 shadow-inner">
              <div className="absolute inset-1.5 border border-dashed border-amber-600/40 rounded-full" />
              <Award className="h-6 w-6 text-amber-600" />
            </div>

            <div className="text-center sm:text-right space-y-0.5">
              <span>Verification Date</span>
              <span className="block font-semibold text-[#4a3b2b] dark:text-[#c4b3a0] text-[10px]">{new Date(cert.issuedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Credential Details Grid */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-flat space-y-4 text-xs">
        <h3 className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Credential Verification Details</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <FileText className="h-4 w-4" />
              <span className="font-bold">Credential Name</span>
            </div>
            <p className="font-black text-slate-850 dark:text-slate-200">{cert.courseTitle} Certificate</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-bold">Status</span>
            </div>
            <p className="font-black text-emerald-600 flex items-center gap-1">✓ Verified Official</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <User className="h-4 w-4" />
              <span className="font-bold">Recipient Student</span>
            </div>
            <p className="font-black text-slate-850 dark:text-slate-200">
              <Link to={`/profile/${cert.userId?.username}`} className="text-brand-500 hover:underline">
                @{cert.userId?.username || cert.userName}
              </Link>
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="h-4 w-4" />
              <span className="font-bold">Issue Date</span>
            </div>
            <p className="font-black text-slate-850 dark:text-slate-200">{new Date(cert.issuedAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Registry Signature Hash</span>
          <p className="font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-800 break-all select-all font-bold">
            {cert.certificateId}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-brand-400 hover:bg-brand-300 text-slate-950 font-black py-2 rounded-xl border-2 border-slate-950 shadow-flat-sm flex items-center justify-center gap-1.5 active:translate-y-[1px] active:shadow-none transition"
          >
            <Printer className="h-4 w-4" /> Print Registry Record
          </button>
        </div>
      </div>
    </div>
  );
}
