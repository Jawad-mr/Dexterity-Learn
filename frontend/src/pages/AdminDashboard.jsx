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

  // 6. Fetch Payments / Access Requests
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => api.get('/admin/payments').then((res) => res.data.payments).catch(() => []),
    enabled: currentSection === 'payments',
  });

  // Manual Grant State
  const [grantUserId, setGrantUserId] = useState('');
  const [grantTargetType, setGrantTargetType] = useState('certificate'); // certificate, course, book
  const [grantTargetId, setGrantTargetId] = useState('');
  const [grantStatusMsg, setGrantStatusMsg] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setGrantStatusMsg('');
    if (!grantUserId || !grantTargetId) {
      setGrantStatusMsg('Please select a user and provide a target ID.');
      return;
    }
    setGrantLoading(true);
    try {
      const res = await api.post('/admin/grant-access', {
        userId: grantUserId,
        targetType: grantTargetType,
        targetId: grantTargetId,
      });
      setGrantStatusMsg(res.data.message || 'Access granted successfully!');
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['admin-payments']);
    } catch (err) {
      setGrantStatusMsg(err.response?.data?.message || 'Failed to grant access');
    } finally {
      setGrantLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      await api.post(`/admin/payments/approve/${paymentId}`);
      queryClient.invalidateQueries(['admin-payments']);
      queryClient.invalidateQueries(['admin-stats']);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve payment');
    }
  };

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
          { id: 'payments', label: 'Payments & Access' },
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

      {/* SECTION: Analytics Overview */}
      {currentSection === 'analytics' && (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-flat space-y-4">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            ⚙️ Database Seeding & Setup Utilities
          </h3>
          <p className="text-[11px] text-slate-500 leading-normal">
            Completely reset and rebuild the Dexterity Learn MERN database. This will drop all collections and generate 9 detailed premium AI courses, 32 sequential lessons per course, and 5 playbooks with full chapters, previews, and prompt configurations.
          </p>

          <button
            onClick={async () => {
              if (window.confirm("WARNING: This will drop all database collections (Users, Courses, Lessons, Books, Categories, Announcements) and reseed with fresh premium data. Proceed?")) {
                try {
                  const res = await api.post('/admin/seed-db');
                  alert(res.data.message || 'Seeding completed successfully!');
                  window.location.reload();
                } catch (err) {
                  alert(err.response?.data?.message || 'Database seeding failed.');
                }
              }
            }}
            className="flex items-center justify-center gap-2 bg-brand-400 hover:bg-brand-300 text-slate-950 text-xs font-black py-2.5 px-4 rounded-xl border-2 border-slate-950 shadow-flat-sm transition active:translate-y-[1px]"
          >
            Reseed Premium Database
          </button>
        </div>
      )}

      {/* SECTION: Payments & Access Grants */}
      {currentSection === 'payments' && (
        <div className="space-y-6">
          {/* Manual Access Grant Box */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 rounded-3xl p-5 shadow-flat">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-500" /> Manual User Access Grant
            </h3>

            {grantStatusMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-700">
                {grantStatusMsg}
              </div>
            )}

            <form onSubmit={handleGrantAccess} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target User ID</label>
                <input
                  type="text"
                  placeholder="User ID (e.g. 60f...)"
                  value={grantUserId}
                  onChange={(e) => setGrantUserId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 p-2 text-xs border-2 border-slate-950 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Grant Type</label>
                <select
                  value={grantTargetType}
                  onChange={(e) => setGrantTargetType(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 p-2 text-xs border-2 border-slate-950 font-bold text-slate-900 dark:text-white"
                >
                  <option value="certificate">Certificate Access</option>
                  <option value="course">Complete Course (100%)</option>
                  <option value="book">Unlock Ebook</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Course / Book ID</label>
                <input
                  type="text"
                  placeholder="Course or Book Object ID"
                  value={grantTargetId}
                  onChange={(e) => setGrantTargetId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 p-2 text-xs border-2 border-slate-950 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={grantLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl border-2 border-slate-950 shadow-flat-sm text-xs transition"
                >
                  {grantLoading ? 'Granting...' : 'Grant Access Now'}
                </button>
              </div>
            </form>
          </div>

          {/* WhatsApp Payment Requests Table */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 rounded-3xl overflow-hidden shadow-flat">
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b-2 border-slate-950 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                WhatsApp Payment & Access Logs
              </h3>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-300">
                {payments?.length || 0} Orders
              </span>
            </div>

            {paymentsLoading ? (
              <div className="py-8 text-center"><Loader2 className="h-5 w-5 text-red-500 animate-spin mx-auto" /></div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-[10px] text-slate-700 dark:text-slate-200">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase">
                    <tr>
                      <th className="p-3 text-left">Invoice</th>
                      <th className="p-3 text-left">Customer</th>
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-left">Promo</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payments?.map((pmt) => (
                      <tr key={pmt._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold">{pmt.invoiceNumber || pmt._id.substring(0, 8)}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white">{pmt.customerName || pmt.userId?.username || 'User'}</div>
                          <div className="text-[9px] text-slate-400">{pmt.customerPhone || pmt.customerEmail}</div>
                        </td>
                        <td className="p-3 font-bold uppercase">{pmt.productType}</td>
                        <td className="p-3 font-mono text-emerald-600 font-bold">{pmt.promoCode || '—'}</td>
                        <td className="p-3 font-bold">₹{pmt.amount}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            pmt.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {pmt.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {pmt.status !== 'completed' ? (
                            <button
                              onClick={() => handleApprovePayment(pmt._id)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-2.5 py-1 rounded-lg border border-slate-950 shadow-flat-sm text-[9px] transition"
                            >
                              Approve Access
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400">Approved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

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
