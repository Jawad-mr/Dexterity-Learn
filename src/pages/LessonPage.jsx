import React, { useState, useEffect } from 'react';
import { 
  progressStorage, 
  getAllLessons, 
  getCourseProgress 
} from '../utils/storage';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Quiz from '../components/Quiz';

export default function LessonPage({ course, lessonId }) {
  const [completedList, setCompletedList] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});

  // Flattened lessons list
  const lessons = getAllLessons(course);
  
  // Find current lesson object or default to the first lesson
  const currentIdx = lessons.findIndex((l) => l.id === lessonId);
  const activeLesson = currentIdx !== -1 ? lessons[currentIdx] : lessons[0];
  
  // Load state on mount/course swap
  useEffect(() => {
    const saved = progressStorage.get(course.id);
    setCompletedList(saved.completed);

    // Expand the module containing the active lesson by default
    if (activeLesson) {
      setExpandedModules((prev) => ({
        ...prev,
        [activeLesson.moduleId]: true
      }));
    }
  }, [course.id, activeLesson?.id]);

  if (!activeLesson) {
    return (
      <div className="container not-found">
        <h2>No lessons found in this course.</h2>
      </div>
    );
  }

  // Calculate course completion progress parameters
  const doneCount = lessons.filter(l => completedList.includes(l.id)).length;
  const totalCount = lessons.length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const isCourseFinished = doneCount === totalCount && totalCount > 0;

  const isCompleted = completedList.includes(activeLesson.id);

  // Mark lesson as complete handler
  const handleToggleComplete = () => {
    const newStatus = progressStorage.toggleCompleted(course.id, activeLesson.id);
    const saved = progressStorage.get(course.id);
    setCompletedList(saved.completed);
  };

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  const handleQuizPassed = () => {
    // Re-trigger layout rendering if needed
  };

  // Nav buttons links
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  return (
    <div className="lesson-page">
      {/* SIDEBAR NAVIGATION */}
      <aside className="lesson-sidebar">
        <div className="sidebar-course-title">{course.title}</div>
        
        <div className="progress-wrap">
          <div className="progress-label">
            <span>{doneCount} / {totalCount} lessons completed</span>
            <span>{pct}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
          </div>
        </div>

        <div className="sidebar-modules">
          {course.modules.map((m) => {
            const isOpen = expandedModules[m.id];
            return (
              <div key={m.id} className="module-block">
                <div 
                  className={`module-header ${isOpen ? 'open' : ''}`}
                  onClick={() => toggleModule(m.id)}
                >
                  <span>
                    <span 
                      style={{ 
                        display: 'inline-block', 
                        marginRight: '6px', 
                        fontSize: '9px',
                        transform: isOpen ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      &bull;
                    </span>
                    {m.title}
                  </span>
                  <span className="chev">&rsaquo;</span>
                </div>
                
                {isOpen && (
                  <div className="lesson-items">
                    {m.lessons.map((l) => {
                      const isActive = l.id === activeLesson.id;
                      const isDone = completedList.includes(l.id);
                      return (
                        <a
                          key={l.id}
                          href={`#/course/${course.id}/${l.id}`}
                          className={`lesson-item ${isActive ? 'active' : ''}`}
                        >
                          <span className={`lesson-check ${isDone ? 'done' : ''}`}>
                            {isDone && (
                              <svg viewBox="0 0 16 16" fill="none">
                                <path 
                                  d="M3 8.5l3 3 7-7" 
                                  stroke="#ffffff" 
                                  strokeWidth="2.5" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          <span>{l.title}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* LESSON PANEL */}
      <main className="lesson-main">
        <div className="crumb">
          <a href="#/courses">courses</a> &nbsp;/&nbsp; 
          <a href={`#/course/${course.id}`}>{course.title}</a> &nbsp;/&nbsp; 
          <span style={{ color: 'var(--text-mute)' }}>{activeLesson.title}</span>
        </div>

        {/* Content Render */}
        <MarkdownRenderer markdown={activeLesson.content} />

        {/* Action Toggle */}
        <div className="complete-row">
          <button 
            onClick={handleToggleComplete}
            className={`btn ${isCompleted ? 'btn-teal' : 'btn-outline'}`}
          >
            {isCompleted ? (
              <>
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                  <path d="M3 8.5l3 3 7-7" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>&nbsp;Completed</span>
              </>
            ) : (
              'Mark as Complete'
            )}
          </button>
        </div>

        {/* Bottom Nav */}
        <div className="lesson-nav">
          {prevLesson ? (
            <a href={`#/course/${course.id}/${prevLesson.id}`} className="nav-btn">
              <span className="dir">&larr; Previous</span>
              {prevLesson.title}
            </a>
          ) : (
            <span></span>
          )}

          {nextLesson ? (
            <a href={`#/course/${course.id}/${nextLesson.id}`} className="nav-btn right">
              <span className="dir">Next &rarr;</span>
              {nextLesson.title}
            </a>
          ) : (
            <span></span>
          )}
        </div>

        {/* Certification widget on 100% progress */}
        {isCourseFinished && course.certificationAvailable && (
          <div style={{ marginTop: '48px' }}>
            <Quiz course={course} onQuizPassed={handleQuizPassed} />
          </div>
        )}
      </main>
    </div>
  );
}
