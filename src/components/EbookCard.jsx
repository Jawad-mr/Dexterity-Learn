import React from 'react';
import siteConfig from '../data/siteConfig.json';

export default function EbookCard({ ebook }) {
  const { id, title, shortDescription, price, coverGradient } = ebook;

  // Calculate pricing discounts for sales urgency
  const originalPriceMap = {
    'frontend-field-guide': { original: '₹999', discount: '50% OFF' },
    'js-patterns': { original: '₹799', discount: '50% OFF' },
    'python-crash-notes': { original: '₹599', discount: '50% OFF' },
    'first-portfolio': { original: '₹499', discount: '50% OFF' }
  };

  const pricing = originalPriceMap[id] || { original: '₹999', discount: '50% OFF' };

  // Formulate high-converting WhatsApp pre-filled message
  const purchaseMessage = `Hi Dexterity Learn! I want to buy the e-book: "${title}" (Special Offer: ${price}). Please send me the payment QR code/details.`;
  const whatsappBuyUrl = `${siteConfig.whatsappCommunity}?text=${encodeURIComponent(purchaseMessage)}`;

  return (
    <div className="card">
      <span className="sale-flag">{pricing.discount}</span>
      
      <div className="ebook-cover" style={{ background: coverGradient }}>
        {title}
      </div>
      
      <p className="desc">{shortDescription}</p>

      {/* Pricing comparison card */}
      <div className="price-box">
        <div className="price-row">
          <span className="price-sale">{price}</span>
          <span className="price-original">{pricing.original}</span>
          <span className="price-discount-pill">Save 50%</span>
        </div>
        
        <ul className="value-bullets">
          <li>Immediate PDF file delivery</li>
          <li>Lifetime updates & study guides</li>
          <li>WhatsApp author support access</li>
        </ul>
      </div>

      <a 
        href={whatsappBuyUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="btn btn-teal btn-block"
        style={{ marginTop: '4px' }}
      >
        Buy on WhatsApp
      </a>

      <a 
        href={`#/ebook-confirmation/${id}`} 
        className="mono" 
        style={{ 
          fontSize: '12px', 
          color: 'var(--text-mute)', 
          borderBottom: '1px dashed var(--slate-300)',
          alignSelf: 'center',
          marginTop: '6px',
          paddingBottom: '2px'
        }}
      >
        already paid? verify request &rarr;
      </a>
    </div>
  );
}
