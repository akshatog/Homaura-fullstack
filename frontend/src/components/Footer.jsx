import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
    <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z"/>
    <path d="M19 13l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5z"/>
  </svg>
);

const valueBand = [
  { icon: <TagIcon />, label: "CURATED WITH CARE", desc: "Handpicked pieces, just for you" },
  { icon: <HeartIcon />, label: "MADE TO INSPIRE", desc: "Beautiful spaces, every day" },
  { icon: <LeafIcon />, label: "ROOTED IN NATURE", desc: "Earthy tones, natural materials" },
  { icon: <SparkleIcon />, label: "TIMELESS BY DESIGN", desc: "Pieces that stay, styles that evolve" },
];

export default function Footer() {
  return (
    <footer className="ha-footer">
      {/* ── Olive value band ── */}
      <div className="ha-footer__value-band">
        {valueBand.map((item, i) => (
          <React.Fragment key={item.label}>
            <div className="ha-footer__value-item">
              <span className="ha-footer__value-icon">{item.icon}</span>
              <div className="ha-footer__value-text">
                <span className="ha-footer__value-label">{item.label}</span>
                <span className="ha-footer__value-desc">{item.desc}</span>
              </div>
            </div>
            {i < valueBand.length - 1 && <div className="ha-footer__value-divider" />}
          </React.Fragment>
        ))}
      </div>

      {/* ── Main footer body ── */}
      <div className="ha-footer__body">
        <div className="ha-footer__inner">

          {/* Brand column */}
          <div className="ha-footer__brand">
            <div className="ha-footer__brand-logo">
              <svg className="ha-footer__leaf" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" fill="none">
                <path d="M20 4C20 4 8 14 8 26C8 33.7 13.3 40 20 42C26.7 40 32 33.7 32 26C32 14 20 4 20 4Z" fill="#5C6B47" opacity="0.85"/>
                <path d="M14 16C14 16 8 22 8 30" stroke="#4A5638" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                <path d="M20 42L20 46" stroke="#5C6B47" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 18C20 18 24 24 22 32" stroke="#FAF7F2" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
              </svg>
              <span className="ha-footer__brand-name">HomAura</span>
            </div>
            <p className="ha-footer__brand-desc">
              Thoughtfully curated home decor that brings warmth, character, and calm into your everyday spaces.
            </p>
            <div className="ha-footer__social">
              <a href="https://www.instagram.com/akshat_sanghi_/" target="_blank" rel="noreferrer" className="ha-footer__social-link" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop links */}
          <div className="ha-footer__col">
            <h4 className="ha-footer__col-heading">Shop</h4>
            <Link to="/shop">All Products</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/cart">My Cart</Link>
            <Link to="/profile">My Account</Link>
          </div>

          {/* Explore links */}
          <div className="ha-footer__col">
            <h4 className="ha-footer__col-heading">Explore</h4>
            <Link to="/about">About Us</Link>
            <Link to="/inspiration">Inspiration</Link>
            <Link to="/contact">Contact</Link>
          </div>

          {/* Legal links */}
          <div className="ha-footer__col">
            <h4 className="ha-footer__col-heading">Legal</h4>
            <Link to="/terms">Terms &amp; Conditions</Link>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="ha-footer__bottom">
        <div className="ha-footer__bottom-inner">
          <p>© {new Date().getFullYear()} HomAura. All rights reserved.</p>
          <p>Made with care for beautiful homes.</p>
        </div>
      </div>
    </footer>
  );
}
