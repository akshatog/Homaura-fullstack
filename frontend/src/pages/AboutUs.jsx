import { Link } from "react-router-dom";
import "./AboutUs.css";

const values = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
    ),
    title: "Rooted in Nature",
    desc: "We draw inspiration from earthy tones and natural materials.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: "Made to Inspire",
    desc: "Beautiful pieces that bring joy and meaning to your spaces.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
    title: "Curated with Care",
    desc: "Every item is handpicked for quality, beauty, and purpose.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
        <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z"/>
        <path d="M19 13l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5z"/>
      </svg>
    ),
    title: "Timeless by Design",
    desc: "Thoughtful designs that stay with you, season after season.",
  },
];

export default function AboutUs() {
  return (
    <div className="ha-about">
      {/* Breadcrumb */}
      <div className="ha-about__breadcrumb">
        <div className="ha-about__breadcrumb-inner">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>About Us</span>
        </div>
      </div>

      {/* Story header */}
      <section className="ha-about__story">
        <div className="ha-about__story-inner">
          <p className="ha-about__eyebrow">OUR STORY</p>
          <h1 className="ha-about__title">The Story Behind HomAura</h1>
          <p className="ha-about__lead">
            HomAura was born from a simple belief—your home should reflect who you are. We curate
            thoughtfully crafted decor that brings warmth, character, and calm into everyday living.
            Each piece is chosen with care to help you create spaces that feel truly yours.
          </p>
        </div>
      </section>

      <div className="ha-about__hero-img">
        <img src="/images/aboutus.png" alt="About HomAura" />
      </div>

      {/* Values section */}
      <section className="ha-about__values">
        <div className="ha-about__values-inner">
          <p className="ha-about__eyebrow ha-about__eyebrow--center">OUR VALUES</p>
          <div className="ha-about__values-grid">
            {values.map((v) => (
              <div key={v.title} className="ha-about__value-card">
                <div className="ha-about__value-icon">{v.icon}</div>
                <h3 className="ha-about__value-title">{v.title}</h3>
                <p className="ha-about__value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission band */}
      <section className="ha-about__mission">
        <div className="ha-about__mission-inner">
          <p className="ha-about__mission-text">
            At HomAura, our mission is to help you create a home that feels warm, lived-in,
            and unmistakably you.
          </p>
          <Link to="/shop" className="ha-about__mission-btn">
            Shop Now <span>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
