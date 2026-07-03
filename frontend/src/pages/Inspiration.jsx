import { useState } from "react";
import { Link } from "react-router-dom";
import "./Inspiration.css";

const TABS = ["All", "Minimal", "Boho", "Modern Rustic", "Earthy Tones"];

const LOOKS = [
  { id: 1, title: "Boho Living Room", tag: "Boho", size: "large", image: "/images/inspo/inspo_boho_living_1783091351264.png" },
  { id: 2, title: "Earthy Console Styling", tag: "Earthy Tones", size: "tall", image: "/images/inspo/inspo_earthy_console_1783091359453.png" },
  { id: 3, title: "Cozy Reading Nook", tag: "Minimal", size: "normal", image: "/images/inspo/inspo_cozy_nook_1783091371504.png" },
  { id: 4, title: "Minimal Bedroom", tag: "Minimal", size: "normal", image: "/images/inspo/inspo_minimal_bedroom_1783091379415.png" },
  { id: 5, title: "Modern Rustic Dining", tag: "Modern Rustic", size: "small", image: "/images/inspo/inspo_rustic_dining_1783091386499.png" },
  { id: 6, title: "Shelf Styling Ideas", tag: "Earthy Tones", size: "small", image: "/images/inspo/inspo_shelf_styling_1783091394414.png" },
  { id: 7, title: "Candle & Fragrance Corner", tag: "Boho", size: "normal", image: "/images/inspo/inspo_candle_corner_1783091407552.png" },
];

export default function Inspiration() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = activeTab === "All"
    ? LOOKS
    : LOOKS.filter((l) => l.tag === activeTab);

  return (
    <div className="ha-inspo">
      {/* Breadcrumb */}
      <div className="ha-inspo__breadcrumb">
        <div className="ha-inspo__breadcrumb-inner">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Inspiration</span>
        </div>
      </div>

      {/* Header */}
      <section className="ha-inspo__header">
        <div className="ha-inspo__header-inner">
          <p className="ha-inspo__eyebrow">STYLE GUIDE</p>
          <h1 className="ha-inspo__title">Find Your Aesthetic</h1>
          <p className="ha-inspo__subtitle">
            Explore curated looks and styling ideas to inspire your space and reflect your unique style.
          </p>

          {/* Filter tabs */}
          <div className="ha-inspo__tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={`ha-inspo__tab ${activeTab === tab ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery grid */}
      <section className="ha-inspo__gallery">
        <div className="ha-inspo__gallery-inner">
          <div className="ha-inspo__grid">
            {filtered.map((look) => (
              <div key={look.id} className={`ha-inspo__card ha-inspo__card--${look.size}`}>
                {/* Actual generated image */}
                <img src={look.image} alt={look.title} className="ha-inspo__card-img" />
                {/* Overlay */}
                <div className="ha-inspo__card-overlay">
                  <span className="ha-inspo__card-title">{look.title}</span>
                  <Link to="/shop" className="ha-inspo__card-cta">
                    Shop This Look →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
