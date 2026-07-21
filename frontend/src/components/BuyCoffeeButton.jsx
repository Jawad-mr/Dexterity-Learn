import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee } from 'lucide-react';

export default function BuyCoffeeButton({ className = '' }) {
  const navigate = useNavigate();

  const handleCoffeeClick = () => {
    const pName = encodeURIComponent('Buy Me a Coffee Support');
    navigate(`/payment?type=coffee&name=${pName}&price=100`);
  };

  return (
    <button
      onClick={handleCoffeeClick}
      className={`flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] md:text-xs font-black px-2.5 md:px-3 py-1.5 rounded-xl border-2 border-slate-950 shadow-flat-sm transition active:translate-y-0.5 ${className}`}
      title="Buy Me a Coffee Support"
    >
      <Coffee className="h-3.5 w-3.5" />
      <span className="hidden xs:inline">Buy Coffee</span>
    </button>
  );
}
