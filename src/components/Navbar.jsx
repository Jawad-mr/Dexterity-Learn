import React from 'react';
import siteConfig from '../data/siteConfig.json';

// Simple SVG Icons for App layout
const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  courses: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  ),
  ebooks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  community: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
};

export default function Navbar({ currentSegment }) {
  const tabs = [
    { segment: '', label: 'home', icon: ICONS.home },
    { segment: 'courses', label: 'courses', icon: ICONS.courses },
    { segment: 'ebooks', label: 'e-books', icon: ICONS.ebooks },
    { segment: 'community', label: 'community', icon: ICONS.community }
  ];

  return (
    <>
      {/* 1. DESKTOP APP SIDEBAR */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo-area">
          <img src="/logo.png" alt="Dexterity Learn Logo" className="sidebar-logo" />
          <span className="sidebar-brand-name">{siteConfig.name}</span>
        </div>
        
        <nav className="sidebar-links">
          {tabs.map((tab) => {
            const isActive = currentSegment === tab.segment;
            return (
              <a
                key={tab.label}
                href={`#/${tab.segment}`}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="sidebar-footer-cta">
          <a
            href={siteConfig.whatsappCommunity}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-cta btn-block"
            style={{ justifyContent: 'center' }}
          >
            {/* WhatsApp Icon */}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1s-.5-.1-.7.1-.7 1-.9 1.2-.4.2-.7.1a7.6 7.6 0 0 1-2.2-1.4 8.4 8.4 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5s0-.4 0-.5-.7-1.8-1-2.4-.6-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4A3.6 3.6 0 0 0 5.4 9c0 1.3.9 2.6 1 2.8s1.8 2.8 4.4 3.9a15 15 0 0 0 1.5.5 3.6 3.6 0 0 0 1.6.1c.5-.1 1.7-.7 1.9-1.3s.3-1.2.2-1.3-.2-.2-.5-.3zM12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z"/>
            </svg>
            <span>Community</span>
          </a>
        </div>
      </aside>

      {/* 2. MOBILE TOP BANNER HEADER */}
      <header className="mobile-top-header">
        <a href="#/" className="brand">
          <img src="/logo.png" alt="Dexterity Learn Logo" className="brand-logo" />
          <span>{siteConfig.name}</span>
        </a>
      </header>

      {/* 3. MOBILE FLOATING BOTTOM NAVIGATION */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-inner">
          {tabs.map((tab) => {
            const isActive = currentSegment === tab.segment;
            return (
              <a
                key={tab.label}
                href={`#/${tab.segment}`}
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
