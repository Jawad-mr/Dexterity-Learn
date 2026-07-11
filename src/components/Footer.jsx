import React from 'react';
import siteConfig from '../data/siteConfig.json';
import courses from '../data/courses.json';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const popularCourses = courses.slice(0, 4);

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h4>{siteConfig.name}</h4>
            <p>{siteConfig.tagline}</p>
          </div>

          <div>
            <h4>Learn</h4>
            <a href="#/courses">All Courses</a>
            <a href="#/ebooks">E-books</a>
            <a href="#/community">Community Hub</a>
          </div>

          <div>
            <h4>Popular Courses</h4>
            {popularCourses.map((c) => (
              <a key={c.id} href={`#/course/${c.id}`}>
                {c.title}
              </a>
            ))}
          </div>

          <div>
            <h4>Connect</h4>
            <a href={siteConfig.whatsappCommunity} target="_blank" rel="noopener noreferrer">
              WhatsApp Community
            </a>
            <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
            <a href={siteConfig.socials.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href={siteConfig.socials.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {currentYear} {siteConfig.name}. All rights reserved.</span>
          <span className="mono" style={{ fontSize: '12px' }}>
            frontend-only &middot; zero trackers &middot; no login required
          </span>
        </div>
      </div>
    </footer>
  );
}
