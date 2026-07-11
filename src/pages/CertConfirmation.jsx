import React from 'react';
import siteConfig from '../data/siteConfig.json';

export default function CertConfirmation({ course }) {
  return (
    <section className="section">
      <div className="container">
        <div className="confirm-card">
          <div className="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="8" r="5" />
              <path d="M8.5 12.5L7 22l5-3 5 3-1.5-9.5" />
            </svg>
          </div>
          
          <h2 style={{ marginBottom: '8px' }}>Almost There — Verification Action</h2>
          <p className="mute">
            To prepare and issue your verified certificate for <strong>{course.title}</strong>, please complete this manual verification step:
          </p>

          <ol className="steps-list">
            <li>
              Submit your full certificate name and email on our Google Form: &nbsp;
              <a 
                href="https://forms.gle/dexteritylearn-certificate-request" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Open Certificate Form &rarr;
              </a>
            </li>
            <li>
              Or send your payment screenshot directly to our community support chat: &nbsp;
              <a 
                href={`${siteConfig.whatsappCommunity}?text=Hi!%20I%20have%20completed%20the%20${encodeURIComponent(course.title)}%20certification%20payment.`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Message on WhatsApp &rarr;
              </a>
            </li>
            <li>
              Our support team will generate and send your certificate within 2–3 business days after confirming the transaction.
            </li>
          </ol>

          <a href={`#/course/${course.id}`} className="btn btn-outline" style={{ marginTop: '16px' }}>
            &larr; Back to Course
          </a>
        </div>
      </div>
    </section>
  );
}
