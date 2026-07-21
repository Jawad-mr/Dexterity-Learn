import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, BookOpen, Clock, ShieldCheck } from 'lucide-react';
import { api } from '../context/AuthContext';
import useSEO from '../hooks/useSEO';

export default function CoursesCatalog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useSEO('Syllabus Catalog - Free Coding Courses', 'Explore our interactive lessons, quizzes, and earn printable code certifications.');

  
  // Extract query filters from URL search parameters
  const currentCategory = searchParams.get('category') || '';
  const currentDifficulty = searchParams.get('difficulty') || '';
  const currentSearch = searchParams.get('search') || '';

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch courses with react-query
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses-catalog', currentCategory, currentDifficulty, currentSearch],
    queryFn: () =>
      api
        .get(
          `/courses?category=${encodeURIComponent(currentCategory)}&difficulty=${encodeURIComponent(
            currentDifficulty
          )}&search=${encodeURIComponent(currentSearch)}`
        )
        .then((res) => res.data.courses),
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchVal });
  };

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key] === undefined || newFilters[key] === '') {
        params.delete(key);
      } else {
        params.set(key, newFilters[key]);
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchVal('');
    setSearchParams({});
  };

  const categories = ['AI Engineering', 'Workflow Automation', 'AI Design & Creative', 'AI Career Prep'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="space-y-4">
      {/* 1. Header Catalog Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Syllabus Catalog</h1>
        <p className="text-xs text-slate-500">Master programming & web structures page-by-page</p>
      </div>

      {/* 2. Unified Search and Filter toggle */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-xl bg-white dark:bg-slate-900 py-2 pl-9 pr-4 text-xs border-2 border-slate-950 outline-none transition text-slate-800 dark:text-slate-200 focus:bg-brand-50/50 shadow-flat-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-950 shadow-flat-sm active:translate-y-[1px] active:shadow-none transition ${
            showFilters || currentCategory || currentDifficulty
              ? 'bg-brand-400 text-slate-950 font-black'
              : 'bg-white text-slate-700 dark:bg-slate-900'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </form>

      {/* 3. Dropdown filter panel */}
      {showFilters && (
        <div className="rounded-3xl border-2 border-slate-950 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 page-transition shadow-flat-lg">
          {/* Category */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Category</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <button
                onClick={() => updateFilters({ category: '' })}
                className={`px-3 py-1 rounded-full text-xs font-bold border-2 border-slate-950 transition active:translate-y-[1px] active:shadow-none ${
                  !currentCategory ? 'bg-brand-400 text-slate-950 shadow-none' : 'bg-white text-slate-700 shadow-flat-sm hover:translate-x-[0.5px] hover:translate-y-[0.5px]'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateFilters({ category: cat })}
                  className={`px-3 py-1 rounded-full text-xs font-bold border-2 border-slate-950 transition active:translate-y-[1px] active:shadow-none ${
                    currentCategory === cat ? 'bg-brand-400 text-slate-950 shadow-none' : 'bg-white text-slate-700 shadow-flat-sm hover:translate-x-[0.5px] hover:translate-y-[0.5px]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Difficulty</span>
            <div className="flex gap-2 mt-1.5">
              <button
                onClick={() => updateFilters({ difficulty: '' })}
                className={`px-3 py-1 rounded-full text-xs font-bold border-2 border-slate-950 transition active:translate-y-[1px] active:shadow-none ${
                  !currentDifficulty ? 'bg-brand-400 text-slate-950 shadow-none' : 'bg-white text-slate-700 shadow-flat-sm hover:translate-x-[0.5px] hover:translate-y-[0.5px]'
                }`}
              >
                All
              </button>
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => updateFilters({ difficulty: diff })}
                  className={`px-3 py-1 rounded-full text-xs font-bold border-2 border-slate-950 transition active:translate-y-[1px] active:shadow-none ${
                    currentDifficulty === diff ? 'bg-brand-400 text-slate-950 shadow-none' : 'bg-white text-slate-700 shadow-flat-sm hover:translate-x-[0.5px] hover:translate-y-[0.5px]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Actions */}
          {(currentCategory || currentDifficulty || currentSearch) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-red-500 font-semibold hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* 4. Course Cards Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course._id}
              onClick={() => navigate(`/courses/${course.slug}`)}
              className="flex items-center gap-2 md:gap-3 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border-2 border-slate-950 dark:border-slate-800 shadow-flat hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-flat-sm cursor-pointer transition p-2 md:p-2.5 overflow-hidden"
            >
              <div className="h-14 w-14 md:h-16 md:w-16 overflow-hidden rounded-xl bg-slate-150 shrink-0 border-2 border-slate-950 dark:border-slate-800">
                <img
                  src={course.image || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&q=80'}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <span>{course.category}</span>
                  <span>•</span>
                  <span className="text-brand-600 dark:text-brand-400">{course.difficulty}</span>
                </div>
                <h3 className="text-[10px] md:text-xs font-black text-slate-900 dark:text-slate-100 truncate mt-0.5">{course.title}</h3>
                <p className="text-[8.5px] md:text-[10px] font-medium text-slate-500 line-clamp-1 mt-0.5 leading-normal">
                  {course.shortDescription}
                </p>
                <div className="flex gap-2.5 mt-1.5 text-[8.5px] md:text-[10px] font-black text-slate-450">
                  <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {course.estimatedTime}</span>
                  <span className="flex items-center gap-0.5 text-brand-600 dark:text-brand-400"><ShieldCheck className="h-2.5 w-2.5" /> Cert Ready</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-xs text-slate-400 py-12">
          No courses found matching selected filters.
        </div>
      )}
    </div>
  );
}
