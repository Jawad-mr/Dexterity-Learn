import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  Award,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Volume2,
  ListOrdered,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { api } from '../context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentSection, setCurrentSection] = useState('analytics'); // analytics, users, courses, books, announcements
  
  // Create / Edit modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('course'); // course, book, announcement, category
  const [editId, setEditId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Programming');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [estimatedTime, setEstimatedTime] = useState('4 hours');
  const [price, setPrice] = useState(299);
  const [author, setAuthor] = useState('');

  // 1. Fetch Admin Metrics
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((res) => res.data),
  });

  // 2. Fetch Users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((res) => res.data.users),
    enabled: currentSection === 'users',
  });

  // 3. Fetch Courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => api.get('/courses?admin=true').then((res) => res.data.courses),
    enabled: currentSection === 'courses',
  });

  // 4. Fetch Books
  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ['admin-books'],
    queryFn: () => api.get('/books').then((res) => res.data.books),
    enabled: currentSection === 'books',
  });

  // 5. Fetch Announcements
  const { data: announcements, isLoading: announcesLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: () => api.get('/admin/announcements').then((res) => res.data.announcements).catch(() => []),
    enabled: currentSection === 'announcements',
  });

  // ==========================================
  // MUTATIONS (CRUD OPERATIONS)
  // ==========================================
  const deleteMutation = useMutation({
    mutationFn: ({ type, id }) => api.delete(`/admin/${type}/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries([`admin-${variables.type}`]);
      queryClient.invalidateQueries(['admin-stats']);
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({ type, data }) => {
      if (editId) {
        return api.put(`/admin/${type}/${editId}`, data);
      }
      return api.post(`/admin/${type}`, data);
    },
    onSuccess: () => {
      setShowModal(false);
      resetForm();
      queryClient.invalidateQueries(['admin-courses']);
      queryClient.invalidateQueries(['admin-books']);
      queryClient.invalidateQueries(['admin-announcements']);
      queryClient.invalidateQueries(['admin-stats']);
    },
  });

  const toggleUserVerification = useMutation({
    mutationFn: ({ id, isVerified }) => api.put(`/admin/users/${id}`, { isVerified }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
    },
  });

  const toggleCourseDraft = useMutation({
    mutationFn: ({ id, isDraft }) => api.put(`/admin/courses/${id}`, { isDraft }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses']);
    },
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Programming');
    setDifficulty('Beginner');
    setEstimatedTime('4 hours');
    setPrice(299);
    setAuthor('');
    setEditId(null);
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    const payload = {};
    if (modalType === 'course') {
      Object.assign(payload, { title, description, shortDescription: description.slice(0, 100), category, difficulty, estimatedTime, isDraft: true });
    } else if (modalType === 'book') {
      Object.assign(payload, { title, description, author, price, rating: 4.5, coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80' });
    } else if (modalType === 'announcement') {
      Object.assign(payload, { title, content: description, category, active: true });
    }
    saveMutation.mutate({ type: modalType + 's', data: payload });
  };

  const openEdit = (type, item) => {
    setModalType(type);
    setEditId(item._id);
    setTitle(item.title);
    setDescription(item.description || item.content || '');
    if (type === 'course') {
      setCategory(item.category);
      setDifficulty(item.difficulty);
      setEstimatedTime(item.estimatedTime);
    } else if (type === 'book') {
      setAuthor(item.author);
      setPrice(item.price);
    }
    setShowModal(true);
  };

  if (statsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
      </div>
    );
  }

  const stats = adminStats?.stats || {
    totalUsers: 0,
    dau: 0,
    totalCourses: 0,
    totalBooks: 0,
    certificatesSold: 0,
    booksSold: 0,
    totalRevenue: 0,
  };

  return (
    <div className="space-y-6 pb-8 page-transition">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-805 dark:text-slate-100 flex items-center gap-1.5">
            <TrendingUp className="h-5 w-5 text-red-500" /> Admin Console
          </h1>
          <p className="text-xs text-slate-500">System management and analytics charts</p>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-655"
        >
          <ArrowLeft className="h-4.5 w-4.5" /> Back Profile
        </button>
      </div>

      {/* Analytics widgets metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Users', val: stats.totalUsers, icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
          { label: 'Daily Actives', val: stats.dau, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Courses / Books', val: `${stats.totalCourses} / ${stats.totalBooks}`, icon: GraduationCap, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
          { label: 'Total Income', val: `₹${stats.totalRevenue}`, icon: DollarSign, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-4 shadow-flat hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-flat-sm transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.label}</span>
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center border-2 border-slate-950 ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 mt-2">{item.val}</h3>
            </div>
          );
        })}
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'analytics', label: 'Overview' },
          { id: 'users', label: 'Users' },
          { id: 'courses', label: 'Courses' },
          { id: 'books', label: 'Ebooks' },
          { id: 'announcements', label: 'Banners' },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setCurrentSection(sec.id)}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              currentSection === sec.id
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: Analytics summary lists */}
      {currentSection === 'analytics' && (
        <div className="space-y-4">
          {/* Recent Signups */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-808 rounded-3xl p-4 shadow-soft">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3 uppercase tracking-wider">Recent Registrations</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-2">
              {adminStats?.recentSignups?.map((usr) => (
                <div key={usr._id} className="flex justify-between py-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 block">{usr.username}</span>
                    <span className="text-[10px] text-slate-400">{usr.email}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 self-center">{new Date(usr.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Users Management Grid */}
      {currentSection === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-soft">
          {usersLoading ? (
            <div className="text-center py-8"><Loader2 className="h-5 w-5 text-red-500 animate-spin mx-auto" /></div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse text-[10px] text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-850 font-bold border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3 text-left">Username</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Verified</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users?.map((usr) => (
                    <tr key={usr._id}>
                      <td className="p-3 font-semibold">{usr.username}</td>
                      <td className="p-3 capitalize">{usr.role}</td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleUserVerification.mutate({ id: usr._id, isVerified: !usr.isVerified })}
                          className={`px-2 py-0.5 rounded font-semibold ${
                            usr.isVerified ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {usr.isVerified ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this user?")) {
                              deleteMutation.mutate({ type: 'users', id: usr._id });
                            }
                          }}
                          className="text-red-500 hover:text-red-655"
                        >
                          <Trash2 className="h-3.5 w-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Courses management */}
      {currentSection === 'courses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setModalType('course');
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-premium"
            >
              <Plus className="h-3.5 w-3.5" /> Add Course
            </button>
          </div>

          <div className="grid gap-3">
            {coursesLoading ? (
              <div className="text-center"><Loader2 className="h-5 w-5 text-red-500 animate-spin" /></div>
            ) : (
              courses?.map((c) => (
                <div key={c._id} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-soft text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{c.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{c.category} • {c.difficulty}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCourseDraft.mutate({ id: c._id, isDraft: !c.isDraft })}
                      className="text-slate-400 hover:text-slate-655"
                      title={c.isDraft ? 'Draft (Publish now)' : 'Live (Revert to draft)'}
                    >
                      {c.isDraft ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-brand-500" />}
                    </button>
                    <button onClick={() => openEdit('course', c)} className="text-blue-500">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Delete course and all its lessons?")) {
                          deleteMutation.mutate({ type: 'courses', id: c._id });
                        }
                      }}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: Books Management */}
      {currentSection === 'books' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setModalType('book');
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-premium"
            >
              <Plus className="h-3.5 w-3.5" /> Add E-book
            </button>
          </div>

          <div className="grid gap-3">
            {booksLoading ? (
              <div className="text-center"><Loader2 className="h-5 w-5 text-red-505 animate-spin" /></div>
            ) : (
              books?.map((b) => (
                <div key={b._id} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-soft text-xs">
                  <div>
                    <h4 className="font-bold text-slate-855 dark:text-slate-100">{b.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Author: {b.author} • Price: ₹{b.price}</p>
                  </div>
                  <div className="flex gap-2.5">
                    <button onClick={() => openEdit('book', b)} className="text-blue-500">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this book manual?")) {
                          deleteMutation.mutate({ type: 'books', id: b._id });
                        }
                      }}
                      className="text-red-550"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: Announcements Management */}
      {currentSection === 'announcements' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setModalType('announcement');
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-1 bg-red-550 hover:bg-red-650 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-premium"
            >
              <Plus className="h-3.5 w-3.5" /> Add Banner
            </button>
          </div>

          <div className="grid gap-3">
            {announcesLoading ? (
              <div className="text-center"><Loader2 className="h-5 w-5 text-red-500 animate-spin" /></div>
            ) : (
              announcements?.map((a) => (
                <div key={a._id} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-soft text-xs">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-bold text-slate-805 dark:text-slate-100 truncate">{a.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{a.content}</p>
                  </div>
                  <div className="flex gap-2.5 shrink-0">
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this banner announcement?")) {
                          deleteMutation.mutate({ type: 'announcements', id: a._id });
                        }
                      }}
                      className="text-red-550"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Edit / Create Form Modal popups */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 w-full max-w-sm shadow-premium space-y-4 page-transition">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-805 dark:text-slate-100 capitalize">
                {editId ? 'Edit' : 'Add'} {modalType}
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-655">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-3.5 text-xs">
              {/* Title */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 py-2 px-3 border border-slate-200 dark:border-slate-800 outline-none text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Description / Content text block */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  {modalType === 'announcement' ? 'Banner Text' : 'Detailed Description'}
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 rounded-xl bg-slate-50 dark:bg-slate-800 py-2 px-3 border border-slate-200 dark:border-slate-808 outline-none text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Course Fields */}
              {modalType === 'course' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 py-1.5 px-2 border border-slate-250 dark:border-slate-800"
                    >
                      <option>Programming</option>
                      <option>Web Development</option>
                      <option>AI & Machine Learning</option>
                      <option>Interview & Career</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 py-1.5 px-2 border border-slate-250 dark:border-slate-800"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Book Fields */}
              {modalType === 'book' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Author</label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 py-1.5 px-2 border border-slate-250 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Price (INR)</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value))}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-850 py-1.5 px-2 border border-slate-250 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}

              {/* Banner Category */}
              {modalType === 'announcement' && (
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-450 block mb-1">Banner Type</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 py-1.5 px-2 border border-slate-250 dark:border-slate-808"
                  >
                    <option>General</option>
                    <option>Feature Launch</option>
                    <option>Exam Prep</option>
                    <option>Sales Alert</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full bg-red-500 hover:bg-red-650 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition mt-4"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
