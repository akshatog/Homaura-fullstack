import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import FAQ from "../components/FAQ";
import { optimizeImageUrl } from "../utils/imageUtils";
import "../styles/Home.css";

// --- SVG Icons ---
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
  </svg>
);

const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="M9 12l2 2 4-4"></path>
  </svg>
);

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

const PackageCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16l2 2 4-4"></path>
    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path>
    <path d="M16.5 9.4L7.55 4.24"></path>
    <polyline points="3.29 7 12 12 20.71 7"></polyline>
    <line x1="12" y1="22" x2="12" y2="12"></line>
  </svg>
);

const HeadphonesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
  </svg>
);

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"></path>
  </svg>
);


export default function Home() {
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(2); // Show more items on smaller screens for categories
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(4);
      } else {
        setItemsPerPage(6); // Show 6 per row as per mockup
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const { data } = await api.get("/products");
        const featured = data.products
          ? data.products.filter((p) => p.isFeatured)
          : data.filter((p) => p.isFeatured);
        // We fetch up to 12 to use as our "Shop By Category" stand-ins
        setTrendingProducts(
          featured.length > 0 ? featured.slice(0, 12) : (data.products || data).slice(0, 12)
        );
      } catch (err) {
        console.error("Error fetching featured products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    if (trendingProducts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + itemsPerPage;
        return nextIndex >= trendingProducts.length ? 0 : nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [trendingProducts, itemsPerPage]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="home-page">
      {/* ── Hero Section ── */}
      <section className="ha-hero">
        <div className="ha-hero__content">
          <span className="ha-hero__eyebrow">CURATED DECOR</span>
          <h1 className="ha-hero__heading">
            Timeless Pieces.<br />
            Thoughtful Living.
          </h1>
          <p className="ha-hero__description">
            Discover handpicked decor that brings warmth, character, and calm into your everyday spaces.
          </p>
          <button className="ha-btn-primary" onClick={() => navigate("/shop")}>
            Shop Now <ArrowRightIcon />
          </button>
        </div>
        <div className="ha-hero__image-wrapper">
          <img src="/images/hero_decor.png" alt="HomAura modern living room decor" className="ha-hero__image" />
        </div>
      </section>

      {/* ── Trust Badges Row ── */}
      <section className="ha-trust-badges">
        <div className="ha-trust-badge">
          <LeafIcon />
          <div>
            <strong>SUSTAINABLE MATERIALS</strong>
            <p>Conscious choices for a better tomorrow</p>
          </div>
        </div>
        <div className="ha-trust-badge__divider"></div>
        <div className="ha-trust-badge">
          <ShieldCheckIcon />
          <div>
            <strong>SECURE PAYMENTS</strong>
            <p>100% secure & trusted checkout</p>
          </div>
        </div>
        <div className="ha-trust-badge__divider"></div>
        <div className="ha-trust-badge">
          <TruckIcon />
          <div>
            <strong>PAN INDIA DELIVERY</strong>
            <p>Delivering happiness to your doorstep</p>
          </div>
        </div>
        <div className="ha-trust-badge__divider"></div>
        <div className="ha-trust-badge">
          <PackageCheckIcon />
          <div>
            <strong>EASY RETURNS</strong>
            <p>Hassle-free returns within 7 days</p>
          </div>
        </div>
        <div className="ha-trust-badge__divider"></div>
        <div className="ha-trust-badge">
          <HeadphonesIcon />
          <div>
            <strong>CUSTOMER SUPPORT</strong>
            <p>We're here to help you, always</p>
          </div>
        </div>
      </section>

      {/* ── Shop By Category (reusing trendingProducts logic) ── */}
      <section className="ha-categories-section">
        <div className="ha-categories__header">
          <span className="ha-categories__eyebrow">EXPLORE OUR COLLECTION</span>
          <h2 className="ha-categories__heading">Shop By Category</h2>
        </div>

        {loading ? (
          <div className="ha-categories__loading">Loading...</div>
        ) : (
          <div className="ha-categories__carousel-wrapper">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="ha-categories__grid"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {trendingProducts
                  .slice(currentIndex, currentIndex + itemsPerPage)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="ha-category-card"
                      onClick={() => handleProductClick(product.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="ha-category-card__image-wrapper">
                        <img
                          src={optimizeImageUrl(product.imageUrl, 400)}
                          alt={product.name}
                          loading="lazy"
                        />
                      </div>
                      <h3 className="ha-category-card__title">{product.name}</h3>
                      <span className="ha-category-card__link">
                        Shop Now <ArrowRightIcon />
                      </span>
                    </div>
                  ))}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ── Bottom Band ── */}
      <section className="ha-bottom-band">
        <div className="ha-bottom-band__inner">
          <div className="ha-bottom-value">
            <TagIcon />
            <div>
              <strong>CURATED WITH CARE</strong>
              <p>Handpicked pieces, just for you</p>
            </div>
          </div>
          <div className="ha-bottom-band__divider"></div>
          <div className="ha-bottom-value">
            <HeartIcon />
            <div>
              <strong>MADE TO INSPIRE</strong>
              <p>Beautiful spaces, every day</p>
            </div>
          </div>
          <div className="ha-bottom-band__divider"></div>
          <div className="ha-bottom-value">
            <LeafIcon />
            <div>
              <strong>ROOTED IN NATURE</strong>
              <p>Earthy tones, natural materials</p>
            </div>
          </div>
          <div className="ha-bottom-band__divider"></div>
          <div className="ha-bottom-value">
            <SparklesIcon />
            <div>
              <strong>TIMELESS BY DESIGN</strong>
              <p>Pieces that stay, styles that evolve</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Keeping FAQ just in case, as it was in the original */}
      <FAQ />
    </div>
  );
}
