import React from 'react';
import ebooks from '../data/ebooks.json';
import EbookCard from '../components/EbookCard';

export default function EbooksCatalog() {
  return (
    <div className="ebooks-page">
      <section className="page-hero">
        <div className="container">
          <h1>E-books</h1>
          <p>
            Detailed, practical guides to advance your skills. Instant download and lifetime access.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid">
            {ebooks.map((ebook) => (
              <EbookCard key={ebook.id} ebook={ebook} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
