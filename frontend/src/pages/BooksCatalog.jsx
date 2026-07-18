import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Star, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { api, useAuth } from '../context/AuthContext';
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

export default function BooksCatalog() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useSEO('Premium Manuals - Ebooks', 'Access our premium study manuals, cheatsheets, and coding books to master web layout and systems development.');


  // Fetch books catalog
  const { data: books, isLoading, error } = useQuery({
    queryKey: ['books-catalog'],
    queryFn: () => api.get('/books').then((res) => res.data.books),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-bold text-red-500 font-medium">Failed to load manual book guides.</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Study E-books</h1>
        <p className="text-xs text-slate-500">Accelerate your progression with comprehensive tech cheat-sheets</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
        {books?.map((book) => {
          const isUnlocked = user?.unlockedBooks?.some((b) => b._id === book._id || b === book._id) || user?.role === 'admin';
          return (
            <div
              key={book._id}
              onClick={() => navigate(`/books/${book.slug}`)}
              className="flex flex-col bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl shadow-flat hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-flat-sm cursor-pointer transition p-2 overflow-hidden"
            >
              <div
                className="h-32 w-full rounded-xl border-2 border-slate-950 dark:border-slate-800 overflow-hidden relative flex flex-col justify-between p-2 select-none text-slate-950"
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
                  <span className="truncate max-w-[65px]">{book.author || 'DEXTERITY'}</span>
                  <span>v1.0</span>
                </div>

                {isUnlocked && (
                  <div className="absolute top-1 right-1 bg-brand-400 text-slate-950 text-[7px] font-black px-1.5 py-0.5 border border-slate-950 rounded-full flex items-center gap-0.5 shadow-flat-sm z-20">
                    <CheckCircle2 className="h-2 w-2" /> Unlocked
                  </div>
                )}
              </div>

              <div className="pt-2 px-1 flex-1 flex flex-col justify-between space-y-1.5">
                <div>
                  <h3 className="text-[10px] font-black text-slate-900 dark:text-slate-100 line-clamp-1 leading-snug">
                    {book.title}
                  </h3>
                  <span className="text-[8px] text-slate-400 block mt-0.5">{book.author}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-250 dark:border-slate-805">
                  <div className="flex items-center gap-0.5 text-[9px] text-slate-500 font-bold">
                    <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                    <span>{book.rating || '4.5'}</span>
                  </div>
                  <span className="text-[10px] font-black text-brand-600 dark:text-brand-400">
                    {isUnlocked ? 'Read' : `₹${book.price}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
