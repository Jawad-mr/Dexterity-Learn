import React from 'react';
import siteConfig from '../data/siteConfig.json';

export default function Navbar({ currentSegment }) {
  const tabs = [
    { segment: '', label: 'home', ext: '.md' },
    { segment: 'courses', label: 'courses', ext: '.json' },
    { segment: 'ebooks', label: 'ebooks', ext: '.json' },
    { segment: 'community', label: 'community', ext: '.md' }
  ];

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a href="#/" className="brand">
          <img src="/logo.png" alt="Dexterity Learn Logo" className="brand-logo" />
          <span>{siteConfig.name}</span>
        </a>
        
        <nav className="nav-links">
          {tabs.map((tab) => {
            const isActive = currentSegment === tab.segment;
            return (
              <a
                key={tab.label}
                href={`#/${tab.segment}`}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {tab.label}
                <span className="nav-link-ext">{tab.ext}</span>
              </a>
            );
          })}
        </nav>

        <a
          href={siteConfig.whatsappCommunity}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-cta"
        >
          {/* WhatsApp inline SVG */}
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1s-.5-.1-.7.1-.7 1-.9 1.2-.4.2-.7.1a7.6 7.6 0 0 1-2.2-1.4 8.4 8.4 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5s0-.4 0-.5-.7-1.8-1-2.4-.6-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4A3.6 3.6 0 0 0 5.4 9c0 1.3.9 2.6 1 2.8s1.8 2.8 4.4 3.9a15 15 0 0 0 1.5.5 3.6 3.6 0 0 0 1.6.1c.5-.1 1.7-.7 1.9-1.3s.3-1.2.2-1.3-.2-.2-.5-.3zM12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z"/>
          </svg>
          <span>Community</span>
        </a>
      </div>
    </header>
  );
}
