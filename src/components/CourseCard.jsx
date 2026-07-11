import React from 'react';
import { getAllLessons } from '../utils/storage';

export default function CourseCard({ course }) {
  const { id, title, shortDescription, level, tags, certificationAvailable } = course;
  
  const badgeClass = 
    level === 'Beginner' ? 'badge-beginner' : 
    level === 'Intermediate' ? 'badge-intermediate' : 
    'badge-advanced';

  const totalLessons = getAllLessons(course).length;

  return (
    <a href={`#/course/${id}`} className="card">
      <div className="tag-row">
        <span className={`badge ${badgeClass}`}>{level}</span>
        {certificationAvailable && (
          <span className="cert-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="5" />
              <path d="M8.5 12.5L7 22l5-3 5 3-1.5-9.5" />
            </svg>
            <span>certificate</span>
          </span>
        )}
      </div>

      <h3>{title}</h3>
      <p className="desc">{shortDescription}</p>

      <div className="tag-row">
        {tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="card-foot">
        <span className="mono" style={{ fontSize: '12px', color: 'var(--text-mute)' }}>
          {totalLessons} lessons
        </span>
        <span className="mono" style={{ fontSize: '13px', color: 'var(--teal-accent)', fontWeight: 600 }}>
          start &rarr;
        </span>
      </div>
    </a>
  );
}
