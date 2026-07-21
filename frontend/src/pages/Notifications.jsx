import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle, Trash2, ArrowLeft, Loader2, Award, BookOpen, GraduationCap } from 'lucide-react';
import { api } from '../context/AuthContext';
import useSEO from '../hooks/useSEO';

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useSEO('My Notifications - Dexterity Learn', 'Stay updated on unlocked certificates, book purchases, and course completions.');

  // Fetch notifications
  const { data: notifRes, isLoading, refetch } = useQuery({
    queryKey: ['user-notifications'],
    queryFn: () => api.get('/notifications').then((res) => res.data.notifications || []),
  });

  // Mark single notification as read
  const markReadMutation = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-notifications']);
    },
  });

  // Mark all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-notifications']);
    },
  });

  // Delete notification
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-notifications']);
    },
  });

  const notifications = notifRes || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-2">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        <span className="text-xs font-bold text-slate-400">Loading alerts inbox...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-6 space-y-6 px-4 pb-12 page-transition">
      {/* Header */}
      <div className="flex justify-between items-center select-none">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="text-[10px] font-black bg-brand-400 hover:bg-brand-300 text-slate-950 px-3.5 py-1.5 border-2 border-slate-950 rounded-xl shadow-flat-sm active:translate-y-[1px] active:shadow-none transition"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-flat space-y-5">
        <div className="flex items-center gap-2 select-none">
          <Bell className="h-5 w-5 text-brand-500" />
          <h2 className="text-sm font-black text-slate-955 dark:text-white uppercase tracking-wider">
            Alerts Inbox ({unreadCount})
          </h2>
        </div>

        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((n) => {
              const isCertificate = n.type === 'certificate' || n.title?.toLowerCase().includes('cert');
              const isBook = n.type === 'book' || n.title?.toLowerCase().includes('book');

              return (
                <div
                  key={n._id}
                  className={`border-2 border-slate-950 dark:border-slate-800 rounded-2xl p-4 flex gap-3 items-start justify-between transition-all ${
                    n.read ? 'bg-slate-50/50 dark:bg-slate-900/50 opacity-70' : 'bg-white dark:bg-slate-800/20'
                  }`}
                  onClick={() => {
                    if (!n.read) {
                      markReadMutation.mutate(n._id);
                    }
                  }}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${n.read ? 'text-slate-400' : 'text-brand-500'}`} />
                    <div className="space-y-1.5 min-w-0">
                      <h4 className="text-xs font-black text-slate-950 dark:text-white leading-snug">{n.title}</h4>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{n.content}</p>

                      {/* CTA Links in notification based on type */}
                      {isCertificate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/profile', { state: { activeTab: 'certificates' } });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 border border-slate-950 rounded-lg bg-brand-400 text-slate-955 text-[10px] font-black shadow-flat-xs active:translate-y-[1px]"
                        >
                          <Award className="h-3.5 w-3.5" /> Go to Certificates
                        </button>
                      )}

                      {isBook && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/profile', { state: { activeTab: 'books' } });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 border border-slate-950 rounded-lg bg-brand-400 text-slate-955 text-[10px] font-black shadow-flat-xs active:translate-y-[1px]"
                        >
                          <BookOpen className="h-3.5 w-3.5" /> Go to Shelf Books
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(n._id);
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center text-xs text-slate-400 py-12 select-none">
              Your notifications inbox is currently empty.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
