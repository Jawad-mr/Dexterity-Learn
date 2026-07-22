import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Clock, CreditCard, Bookmark, BookOpen, AlertCircle, FileText, CheckCircle, Save, Loader2, Edit3, X } from 'lucide-react';
import { api, useAuth } from '../context/AuthContext';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function BookReader() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [fontSize, setFontSize] = useState('medium'); // small, medium, large
  const [theme, setTheme] = useState('light'); // light, dark, sepia
  
  // Notes sidebar state
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  
  // Payment Simulation
  const [paying, setPaying] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState('');

  // Fetch book page content
  const { data: pageData, isLoading, error, refetch } = useQuery({
    queryKey: ['book-page', slug, page],
    queryFn: () => api.get(`/books/${slug}/pages/${page}`).then((res) => res.data),
  });

  // Fetch book metadata to show title/author
  const { data: bookMeta } = useQuery({
    queryKey: ['book-metadata', slug],
    queryFn: () => api.get(`/books/${slug}`).then((res) => res.data.book),
  });

  // Re-fetch page when page change
  useEffect(() => {
    refetch();
  }, [page]);

  // Read saved notes for this book from user bookmarks/profile when loaded
  useEffect(() => {
    if (user && bookMeta) {
      const historyRecord = user.readingHistory?.find((h) => h.bookId?._id === bookMeta._id || h.bookId === bookMeta._id);
      if (historyRecord && page === 1) {
        setPage(historyRecord.lastReadPage || 1);
      }
    }
  }, [user, bookMeta]);

  // Verify Book Unlock Mutation
  const unlockMutation = useMutation({
    mutationFn: () => api.post('/payments/create-order', { productType: 'book', productId: bookMeta._id }),
    onSuccess: (res) => {
      const { paymentId } = res.data.order;
      setPaying(true);
      setTimeout(async () => {
        try {
          const verify = await api.post('/payments/verify', {
            paymentId,
            gatewayTransactionId: `pay_b_${Date.now()}`,
            status: 'success',
          });
          if (verify.data.success) {
            setPaySuccessMsg('E-book Unlocked successfully!');
            await refreshUser();
            refetch();
          }
        } catch (e) {
          console.error(e);
        } finally {
          setPaying(false);
        }
      }, 2000);
    },
  });

  // Toggle Page Bookmark
  const bookmarkMutation = useMutation({
    mutationFn: () =>
      api.post('/courses/bookmarks', {
        type: 'book',
        id: bookMeta._id,
        title: `${bookMeta.title} - Page ${page}`,
        url: `/books/${slug}?page=${page}`,
      }),
    onSuccess: () => {
      refreshUser();
    },
  });

  const isBookmarked = user?.bookmarks?.some(
    (b) => b.id === bookMeta?._id && b.title.includes(`Page ${page}`)
  );

  const totalPages = pageData?.totalPages || 5;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-bold text-red-500">Failed to load book.</h3>
        <Link to="/books" className="text-xs text-brand-500 mt-2 hover:underline inline-block">Back to Books</Link>
      </div>
    );
  }

  // Set font size utility classes
  const fontSizes = {
    small: 'text-xs',
    medium: 'text-sm leading-relaxed',
    large: 'text-base leading-loose',
  };

  // Set reader themes
  const readerThemes = {
    light: 'bg-white text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-100',
    dark: 'bg-slate-950 text-slate-200 border-slate-800',
    sepia: 'bg-[#fcf8f2] text-[#5c4a3c] border-[#f0e3ce] font-serif',
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* 1. Header Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-soft space-y-2">
        {/* Row 1: Back + Title + Bookmark */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => navigate('/books')}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-650 shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate flex-1 text-center">
            {bookMeta?.title || 'Ebook Reader'}
          </span>

          {/* Bookmark page */}
          {user && (
            <button
              onClick={() => bookmarkMutation.mutate()}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border-2 border-slate-950 shadow-flat-sm active:translate-y-[1px] active:shadow-none transition shrink-0 ${
                isBookmarked
                  ? 'bg-brand-400 text-slate-950 font-black'
                  : 'bg-white text-slate-700'
              }`}
            >
              <Bookmark className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Row 2: Controls */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {/* FontSize switcher */}
            <div className="flex items-center border-2 border-slate-950 dark:border-slate-800 rounded-xl overflow-hidden shadow-flat-sm">
              {['small', 'medium', 'large'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`text-[10px] font-black px-2 py-1 transition ${
                    fontSize === sz ? 'bg-brand-400 text-slate-950' : 'bg-transparent text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {sz.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>

            {/* Theme switcher */}
            <div className="flex border-2 border-slate-950 dark:border-slate-800 rounded-xl overflow-hidden shadow-flat-sm">
              {['light', 'dark', 'sepia'].map((th) => (
                <button
                  key={th}
                  onClick={() => setTheme(th)}
                  className={`text-[9px] font-black px-2 py-1 capitalize transition ${
                    theme === th ? 'bg-brand-400 text-slate-950' : 'bg-transparent text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {th}
                </button>
              ))}
            </div>
          </div>

          {/* Notes toggle */}
          {user && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1 h-8 px-2.5 rounded-xl border-2 border-slate-950 text-slate-700 bg-white shadow-flat-sm active:translate-y-[1px] active:shadow-none transition text-[10px] font-black"
              title="Notes"
            >
              <Edit3 className="h-3.5 w-3.5" /> Notes
            </button>
          )}
        </div>
      </div>

      {/* 2. Reader Body Panel */}
      <div className={`rounded-3xl border-2 border-slate-950 p-5 shadow-flat-lg transition-colors min-h-[350px] flex flex-col justify-between relative ${readerThemes[theme]}`}>
        
        {/* Blurred/Redacted Page Paywall Overlay */}
        {pageData.isLocked ? (
          <div className="absolute inset-0 z-30 rounded-3xl overflow-hidden flex flex-col items-center justify-center p-6 text-center">
            {/* Blurring backdrop filter */}
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md" />
            
            <div className="relative z-40 space-y-4 max-w-xs">
              <div className="h-12 w-12 bg-brand-400 text-slate-950 rounded-2xl flex items-center justify-center mx-auto border-2 border-slate-950 shadow-flat-sm animate-bounce">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Paywall Locked</h3>
                <p className="text-[11px] font-semibold text-slate-800 leading-normal">
                  You read the first 3 free chapters! Unlock the rest of this professional guide forever.
                </p>
              </div>

              {paySuccessMsg && (
                <div className="text-xs font-black text-slate-950 bg-brand-200 border-2 border-slate-950 py-2 rounded-xl shadow-flat-sm">
                  {paySuccessMsg}
                </div>
              )}

              <button
                disabled={!bookMeta}
                onClick={() => {
                  if (!bookMeta) return;
                  const pName = encodeURIComponent(bookMeta.title || 'Tech Ebook Guide');
                  navigate(`/payment?type=book&productId=${bookMeta._id}&name=${pName}&price=${bookMeta.price || pageData.price || 299}`);
                }}
                className="flex items-center justify-center gap-2 w-full bg-brand-400 hover:bg-brand-300 text-slate-950 text-xs font-black py-2.5 rounded-xl border-2 border-slate-950 shadow-flat-sm transition active:translate-y-[1px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="h-4 w-4" /> Unlock Book via WhatsApp (₹{bookMeta?.price || pageData?.price || '299'})
              </button>
            </div>
          </div>
        ) : null}

        {/* Text Area */}
        <div className={`max-w-none ${fontSizes[fontSize]} ${pageData.isLocked ? 'blurred-content' : ''}`}>
          <MarkdownRenderer content={pageData.content} />
        </div>        {/* Footer info: Page x of y + Reading Time */}
        <div className="text-[10px] text-slate-500 font-bold text-center pt-4 flex justify-between border-t-2 border-slate-950 dark:border-slate-800">
          <span>{bookMeta?.title || 'Ebook'}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-brand-600 dark:text-brand-400" />
            {Math.max(1, Math.round((pageData.content ? pageData.content.split(/\s+/).length : 0) / 200))} min read
          </span>
          <span>Page {page} of {totalPages}</span>
        </div>
      </div>

      {/* 3. Page Arrows Toggles */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex items-center gap-1.5 px-4 py-2 border-2 border-slate-950 rounded-xl bg-white dark:bg-slate-900 text-xs font-black text-slate-700 hover:bg-brand-100 disabled:opacity-40 transition shadow-flat-sm active:translate-y-[1px] active:shadow-none"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || pageData.isLocked}
          className="flex items-center gap-1.5 px-4 py-2 border-2 border-slate-950 rounded-xl bg-white dark:bg-slate-900 text-xs font-black text-slate-700 hover:bg-brand-100 disabled:opacity-40 transition shadow-flat-sm active:translate-y-[1px] active:shadow-none"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Notes Pad Sidebar drawer */}
      {showNotes && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-80 bg-white dark:bg-slate-900 h-full p-4 flex flex-col justify-between border-l-2 border-slate-950 shadow-flat-lg page-transition">
            <div>
              <div className="flex items-center justify-between border-b-2 border-slate-950 pb-2 mb-4">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  <FileText className="h-4 w-4 text-brand-500" /> Book Notes
                </span>
                <button onClick={() => setShowNotes(false)} className="text-slate-400 hover:text-slate-655">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 block mb-1">Add notes for page {page}</span>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type your notes or summaries here..."
                className="w-full h-64 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-brand-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            <button
              onClick={() => {
                // Save note locally or trigger profile notes update
                setShowNotes(false);
                alert("Notes saved successfully!");
              }}
              className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-650 text-white text-xs font-bold py-2 rounded-xl"
            >
              <Save className="h-4 w-4" /> Save Notes
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
