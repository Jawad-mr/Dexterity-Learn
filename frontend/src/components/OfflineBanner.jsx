import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showRestored) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 transition-all duration-300 animate-slide-down">
      {isOffline ? (
        <div className="flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg border border-red-500 justify-center text-center">
          <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
          <span>You are currently offline. Check your internet connection.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg border border-emerald-500 justify-center text-center">
          <Wifi className="h-4 w-4 shrink-0" />
          <span>Internet connection restored!</span>
        </div>
      )}
    </div>
  );
}
