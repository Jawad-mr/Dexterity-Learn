import React from 'react';

export default function EbookCard({ ebook }) {
  const { id, title, shortDescription, price, coverGradient, razorpayLink } = ebook;

  return (
    <div className="card">
      <div className="ebook-cover" style={{ background: coverGradient }}>
        {title}
      </div>
      <p className="desc">{shortDescription}</p>
      
      <div className="price-row">
        <span className="price">{price}</span>
        <a 
          href={razorpayLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-teal btn-sm"
        >
          Buy Now
        </a>
      </div>

      <a 
        href={`#/ebook-confirmation/${id}`} 
        className="mono" 
        style={{ 
          fontSize: '12px', 
          color: 'var(--text-mute)', 
          borderBottom: '1px dashed var(--paper-border)',
          alignSelf: 'flex-start',
          marginTop: '4px',
          paddingBottom: '2px'
        }}
      >
        already purchased? get your download &rarr;
      </a>
    </div>
  );
}
