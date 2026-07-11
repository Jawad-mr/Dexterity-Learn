import React from 'react';
import siteConfig from '../data/siteConfig.json';
import courses from '../data/courses.json';

export default function Community() {
  const coursesWithGroups = courses.filter((c) => c.whatsappGroup);

  return (
    <div className="community-page">
      <section className="page-hero">
        <div className="container">
          <h1>Community Access</h1>
          <p>
            Dexterity Learn runs its community directly on WhatsApp. No logins, profiles, or forums to maintain.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Main Community CTA card */}
          <div className="card" style={{ maxWidth: '640px', padding: '32px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '8px' }}>Main Community Group</h3>
            <p className="desc" style={{ marginBottom: '20px' }}>
              Our main general community chat is open to everyone. Ask for help, share progress, and discuss development with other students.
            </p>
            <a
              href={siteConfig.whatsappCommunity}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-teal"
              style={{ alignSelf: 'flex-start' }}
            >
              {/* WhatsApp Icon */}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1s-.5-.1-.7.1-.7 1-.9 1.2-.4.2-.7.1a7.6 7.6 0 0 1-2.2-1.4 8.4 8.4 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5s0-.4 0-.5-.7-1.8-1-2.4-.6-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4A3.6 3.6 0 0 0 5.4 9c0 1.3.9 2.6 1 2.8s1.8 2.8 4.4 3.9a15 15 0 0 0 1.5.5 3.6 3.6 0 0 0 1.6.1c.5-.1 1.7-.7 1.9-1.3s.3-1.2.2-1.3-.2-.2-.5-.3zM12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z"/>
              </svg>
              <span>Join General Community</span>
            </a>
          </div>

          {/* Dynamic course group directories */}
          <div style={{ marginTop: '56px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '8px' }}>Course-Specific Communities</h3>
            <p className="mono" style={{ textAlign: 'center', color: 'var(--text-mute)', fontSize: '13.5px', marginBottom: '32px' }}>
              Focus on a single course syllabus with localized peer help groups.
            </p>

            <div className="community-grid">
              {coursesWithGroups.map((course) => (
                <div key={course.id} className="community-card">
                  <h4>{course.title} Community</h4>
                  <p>{course.shortDescription}</p>
                  <a
                    href={course.whatsappGroup}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignSelf: 'flex-start', marginTop: '12px' }}
                  >
                    {/* WhatsApp Icon */}
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1s-.5-.1-.7.1-.7 1-.9 1.2-.4.2-.7.1a7.6 7.6 0 0 1-2.2-1.4 8.4 8.4 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5s0-.4 0-.5-.7-1.8-1-2.4-.6-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4A3.6 3.6 0 0 0 5.4 9c0 1.3.9 2.6 1 2.8s1.8 2.8 4.4 3.9a15 15 0 0 0 1.5.5 3.6 3.6 0 0 0 1.6.1c.5-.1 1.7-.7 1.9-1.3s.3-1.2.2-1.3-.2-.2-.5-.3zM12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z"/>
                    </svg>
                    <span>Join Group</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
