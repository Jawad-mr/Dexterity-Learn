import React from 'react';
import siteConfig from '../data/siteConfig.json';
import courses from '../data/courses.json';
import ebooks from '../data/ebooks.json';
import CourseCard from '../components/CourseCard';
import EbookCard from '../components/EbookCard';

export default function Home() {
  const featuredCourses = courses.slice(0, 3);
  const featuredEbooks = ebooks.slice(0, 3);

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container hero-inner">
          <img 
            src="/logo.png" 
            alt="Dexterity Learn Logo" 
            className="hero-logo" 
            style={{ 
              width: '90px', 
              height: '90px', 
              borderRadius: '20px', 
              marginBottom: '24px', 
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
              border: '2px solid rgba(250, 247, 235, 0.15)'
            }} 
          />
          <h1>
            Learn to code the way <span className="accent">documentation</span> should have taught you.
          </h1>
          <p className="sub">
            {siteConfig.tagline} No paywalled lessons, no signup gates — just clear, text-based guides you can read instantly.
          </p>
          <div className="hero-actions">
            <a href="#/courses" className="btn btn-amber">
              Start Learning
            </a>
            <a
              href={siteConfig.whatsappCommunity}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost-dark"
            >
              {/* WhatsApp Icon */}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ verticalAlign: 'middle' }}>
                <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1s-.5-.1-.7.1-.7 1-.9 1.2-.4.2-.7.1a7.6 7.6 0 0 1-2.2-1.4 8.4 8.4 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5s0-.4 0-.5-.7-1.8-1-2.4-.6-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4A3.6 3.6 0 0 0 5.4 9c0 1.3.9 2.6 1 2.8s1.8 2.8 4.4 3.9a15 15 0 0 0 1.5.5 3.6 3.6 0 0 0 1.6.1c.5-.1 1.7-.7 1.9-1.3s.3-1.2.2-1.3-.2-.2-.5-.3zM12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z"/>
              </svg>
              <span>Join Community</span>
            </a>
          </div>
          
          <div className="hero-stats">
            <div className="hero-stat">
              <b>{courses.length}</b>
              <span>free courses</span>
            </div>
            <div className="hero-stat">
              <b>{ebooks.length}</b>
              <span>curated e-books</span>
            </div>
            <div className="hero-stat">
              <b>0</b>
              <span>accounts required</span>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR COURSES SECTION */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Start Learning</span>
              <h2>Popular Courses</h2>
              <p>Explore free text-based courses. Paid certificates are entirely optional.</p>
            </div>
            <a href="#/courses" className="link-more">
              view all courses &rarr;
            </a>
          </div>

          <div className="grid">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EBOOKS SECTION */}
      <section className="section" style={{ backgroundColor: 'var(--paper-dim)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Go Deeper</span>
              <h2>Featured E-books</h2>
              <p>Downloadable guidebooks that you keep for life.</p>
            </div>
            <a href="#/ebooks" className="link-more">
              view all e-books &rarr;
            </a>
          </div>

          <div className="grid">
            {featuredEbooks.map((ebook) => (
              <EbookCard key={ebook.id} ebook={ebook} />
            ))}
          </div>
        </div>
      </section>

      {/* WHATSAPP CTA BAND */}
      <section className="wa-band">
        <div className="container wa-inner">
          <div>
            <h2>Join the {siteConfig.name} WhatsApp Community</h2>
            <p>
              Ask questions, get feedback on your playground experiments, and learn directly alongside other students.
            </p>
          </div>
          <a
            href={siteConfig.whatsappCommunity}
            target="_blank"
            rel="noopener noreferrer"
            className="btn wa-btn"
          >
            {/* WhatsApp Icon */}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1s-.5-.1-.7.1-.7 1-.9 1.2-.4.2-.7.1a7.6 7.6 0 0 1-2.2-1.4 8.4 8.4 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5s0-.4 0-.5-.7-1.8-1-2.4-.6-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4A3.6 3.6 0 0 0 5.4 9c0 1.3.9 2.6 1 2.8s1.8 2.8 4.4 3.9a15 15 0 0 0 1.5.5 3.6 3.6 0 0 0 1.6.1c.5-.1 1.7-.7 1.9-1.3s.3-1.2.2-1.3-.2-.2-.5-.3zM12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z"/>
            </svg>
            <span>Join Group</span>
          </a>
        </div>
      </section>
    </div>
  );
}
