import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminGate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, skip the gate
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleGateSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Secure passkey gate check (checks matching admin passphrase)
    setTimeout(() => {
      setLoading(false);
      if (passkey === 'admin123') {
        // Direct entry granted
        if (user && user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          setError('Admin user session required. Please sign in with admin details first.');
        }
      } else {
        setError('Incorrect administrator passkey.');
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-2 page-transition">
      <div className="w-full max-w-sm rounded-3xl border-2 border-slate-950 bg-white p-6 shadow-flat dark:border-slate-850 dark:bg-slate-900 text-center">
        
        <div className="h-12 w-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto border-2 border-slate-950 shadow-flat-sm mb-4">
          <Lock className="h-6 w-6" />
        </div>

        <h2 className="text-base font-black text-slate-900 dark:text-slate-101">Administrator Vault</h2>
        <p className="text-xs text-slate-550 mt-1 font-medium">This zone is restricted. Enter passkey credential to clear lock.</p>

        {error && (
          <div className="my-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 border-2 border-slate-950 p-3 text-xs font-bold text-red-600 dark:text-red-400 text-left">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleGateSubmit} className="space-y-4 mt-6">
          <input
            type="password"
            placeholder="Enter Admin Passkey (e.g. admin123)"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-805/50 py-2.5 px-4 text-center text-xs border-2 border-slate-950 outline-none focus:bg-brand-50 font-mono tracking-widest text-slate-800 dark:text-slate-200"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-400 hover:bg-brand-300 text-slate-950 text-xs font-black py-2.5 rounded-xl border-2 border-slate-950 shadow-flat-sm transition active:translate-y-[1px] active:shadow-none"
          >
            {loading ? 'Decrypting...' : 'Clear Lock'}
          </button>
        </form>

      </div>
    </div>
  );
}
