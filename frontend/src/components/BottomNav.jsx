import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, GraduationCap, User } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Courses', path: '/courses', icon: GraduationCap },
    { label: 'Books', path: '/books', icon: BookOpen },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-slate-950 bg-white/95 pb-safe backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 shadow-lg">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around px-2 sm:max-w-xl md:max-w-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-1 px-3 text-slate-500 hover:text-brand-500 transition duration-150 rounded-xl focus:outline-none ${
                  isActive ? 'nav-bottom-active text-brand-600 dark:text-brand-500 font-medium' : 'text-slate-400 dark:text-slate-500'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
