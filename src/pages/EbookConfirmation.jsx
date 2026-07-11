import React from 'react';
import siteConfig from '../data/siteConfig.json';

export default function EbookConfirmation({ ebook }) {
  return (
    <section className="section">
      <div className="container">
        <div className="confirm-card">
          <div className="icon">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          <h2 style={{ marginBottom: '8px' }}>Thank You for Purchasing!</h2>
          <p className="mute" style={{ marginBottom: '24px' }}>
            Your transaction for <strong>{ebook.title}</strong> has been initiated securely via Razorpay.
          </p>

          <ol className="steps-list">
            <li>
              Download your e-book directly from our hosted drive: &nbsp;
              <a 
                href={ebook.downloadLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontWeight: 600 }}
              >
                Download PDF &rarr;
              </a>
            </li>
            <li>
              Or request the PDF file directly in our WhatsApp support channel with your receipt: &nbsp;
              <a 
                href={`${siteConfig.whatsappCommunity}?text=Hi!%20I%20have%20purchased%20the%20${encodeURIComponent(ebook.title)}%20e-book.`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Send WhatsApp Message &rarr;
              </a>
            </li>
          </ol>

          <a href="#/ebooks" className="btn btn-outline" style={{ marginTop: '16px' }}>
            &larr; Back to E-books
          </a>
        </div>
      </div>
    </section>
  );
}
