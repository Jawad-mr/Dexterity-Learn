import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '../context/AuthContext';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setVerifying(false);
        setSuccess(false);
        setMessage('Missing verification token.');
        return;
      }

      try {
        const response = await api.post('/auth/verify-email', { token });
        if (response.data.success) {
          setSuccess(true);
          setMessage(response.data.message || 'Email verified successfully!');
        }
      } catch (error) {
        setSuccess(false);
        setMessage(error.response?.data?.message || 'Verification link expired or invalid.');
      } finally {
        setVerifying(false);
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-2 page-transition">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 text-center">
        
        {verifying ? (
          <div className="py-8 space-y-4">
            <Loader2 className="h-10 w-10 text-brand-500 animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Verifying your email...</h3>
            <p className="text-xs text-slate-400">Please wait while we validate your token credential.</p>
          </div>
        ) : success ? (
          <div className="py-6 space-y-4">
            <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Verification Complete</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
            <Link
              to="/login"
              className="flex items-center justify-center w-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-premium mt-6"
            >
              Log In to Account
            </Link>
          </div>
        ) : (
          <div className="py-6 space-y-4">
            <XCircle className="h-14 w-14 text-red-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Verification Failed</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
            <Link
              to="/signup"
              className="flex items-center justify-center w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold py-2.5 rounded-xl transition mt-6"
            >
              Sign Up Again
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
