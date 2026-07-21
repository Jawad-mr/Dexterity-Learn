import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, User, Sun, Moon, LogOut, X, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import BuyCoffeeButton from './BuyCoffeeButton';

export default function TopNav() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  // Load user notifications when logged in
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Click outside listener to dismiss search/notif popups
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults(null);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  // Perform instant global search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const response = await api.get(`/search?query=${encodeURIComponent(searchQuery)}`);
          if (response.data.success) {
            setSearchResults(response.data);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const markAllNotifRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((n) => n._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResultClick = (url) => {
    setSearchQuery('');
    setSearchResults(null);
    navigate(url);
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-slate-950 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-1.5 focus:outline-none shrink-0">
            <img src="/logo.png" alt="Dexterity Learn Logo" className="h-8 w-8 rounded-lg border-2 border-slate-950 shadow-flat-sm" />
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-slate-200">
              Dexterity <span className="text-brand-600 dark:text-brand-400 font-black">Learn</span>
            </span>
          </Link>
        </div>

        {/* Center: Global Search Bar */}
        <div ref={searchRef} className="relative flex flex-1 max-w-[160px] xs:max-w-[200px] mx-2">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-slate-100 dark:bg-slate-800 py-1 pl-8 pr-3 text-xs outline-none border border-transparent focus:border-brand-500 transition text-slate-800 dark:text-slate-200"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Search Dropdown Panel */}
          {searchResults && (
            <div className="absolute right-[-40px] top-11 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900 page-transition">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Search Results</h4>
              {isSearching ? (
                <div className="text-center text-xs text-slate-400 py-4">Searching...</div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-3 no-scrollbar">
                  {/* Courses Section */}
                  {searchResults.courses?.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-brand-500">Courses</span>
                      <div className="mt-1 space-y-1">
                        {searchResults.courses.map((c) => (
                          <div
                            key={c._id}
                            onClick={() => handleResultClick(`/courses/${c.slug}`)}
                            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                          >
                            <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                            <div className="font-medium text-slate-700 dark:text-slate-300 truncate">{c.title}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lessons Section */}
                  {searchResults.lessons?.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-brand-500">Lessons</span>
                      <div className="mt-1 space-y-1">
                        {searchResults.lessons.map((l) => (
                          <div
                            key={l._id}
                            onClick={() => handleResultClick(`/courses/${l.courseSlug}/lessons/${l.slug}`)}
                            className="flex flex-col rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                          >
                            <div className="font-medium text-slate-700 dark:text-slate-300 truncate">{l.title}</div>
                            <div className="text-[9px] text-slate-400 truncate">{l.courseTitle}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Books Section */}
                  {searchResults.books?.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-brand-500">Ebooks</span>
                      <div className="mt-1 space-y-1">
                        {searchResults.books.map((b) => (
                          <div
                            key={b._id}
                            onClick={() => handleResultClick(`/books/${b.slug}`)}
                            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                          >
                            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                            <div className="font-medium text-slate-700 dark:text-slate-300 truncate">{b.title}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results Fallback */}
                  {(!searchResults.courses?.length && !searchResults.lessons?.length && !searchResults.books?.length) && (
                    <div className="text-center text-xs text-slate-400 py-4">No matching results found.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions (Theme, Buy Coffee, Notifications, Dashboard Profile) */}
        <div className="flex items-center gap-1.5">
          <BuyCoffeeButton />

          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications Trigger */}
          {user && (
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Open Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 top-11 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900 page-transition">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Alerts ({unreadNotifCount})</span>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={markAllNotifRead}
                        className="text-[10px] text-brand-500 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 no-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`group flex items-start gap-2 rounded-xl p-2 cursor-pointer transition ${
                            n.read ? 'opacity-60 bg-transparent' : 'bg-slate-50 dark:bg-slate-800/50'
                          }`}
                          onClick={async () => {
                            if (!n.read) {
                              try {
                                await api.put(`/notifications/${n._id}/read`);
                                setNotifications(notifications.map((not) => not._id === n._id ? { ...not, read: true } : not));
                              } catch (err) {}
                            }
                          }}
                        >
                          <CheckCircle className={`h-4 w-4 mt-0.5 ${n.read ? 'text-slate-400' : 'text-brand-500'}`} />
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{n.title}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{n.content}</div>
                          </div>
                          <button
                            onClick={(e) => deleteNotif(n._id, e)}
                            className="hidden group-hover:block text-slate-400 hover:text-red-500 ml-1"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-slate-400 py-6">No notifications yet.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Shortcut */}
          <Link
            to="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 hover:opacity-90"
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt="User Avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4 text-slate-500" />
            )}
          </Link>
        </div>

      </div>
    </header>
  );
}
