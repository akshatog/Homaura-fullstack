import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import FAQ from "../components/FAQ";
import {
  slideUp,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerItem,
  cardHover,
  floatingAnimation,
  fadeIn
} from "../utils/animationVariants";
import "../styles/Home.css";

import { optimizeImageUrl } from "../utils/imageUtils";

const getBadgeClass = (badgeText) => {
  if (!badgeText) return "";
  if (badgeText === "Best Seller") return "";
  if (badgeText === "New Arrival") return "new";
  if (badgeText === "Popular") return "popular";
  if (badgeText === "Limited Edition") return "limited";
  if (badgeText === "Trending") return "trending";
  return "";
};


export default function Home() {
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  const offerings = [
    { title: "Personalized Nikah Nama", icon: "✨" },
    { title: "Hampers & Gift Boxes", icon: "🎁" },
    { title: "Wallets, Pens & Keychains (for him)", icon: "🕴️" },
    { title: "Scrunchies, Chudiyan & Jhumkas (for her)", icon: "💖" },
  ];

  const reasons = [
    { title: "Customized with love", text: "Every detail reflects your story." },
    { title: "Creative packaging", text: "Layered textures, ribbons, and luxe touches." },
    { title: "Gifts for both him & her", text: "Balanced curation for every recipient." },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(4);
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
    }, 4000);

    return () => clearInterval(interval);
  }, [trendingProducts, itemsPerPage]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };



  return (
    <motion.div
      className="home-page"
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ position: 'relative', zIndex: 1 }}
    >
      <section className="home-hero">
        <motion.div
          className="home-hero__content"
          variants={slideInLeft}
        >
          <motion.p
            className="home-pill"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Homaura
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Where every gift tells a story
          </motion.h1>
          <motion.p
            className="home-hero__text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Personalized & thoughtful gifts for every occasion. Discover curated hampers,
            Nikah Namas, and keepsakes infused with pastel elegance.
          </motion.p>
          <motion.div
            className="home-hero__cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <motion.button
              className="btn-primary"
              onClick={() => navigate("/shop")}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Shop Now
            </motion.button>
            <motion.button
              className="btn-ghost"
              onClick={() => navigate("/contact")}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Talk to us
            </motion.button>
          </motion.div>
        </motion.div>
        <motion.div
          className="home-hero__visual"
          variants={slideInRight}
        >
          <div className="hero-card">
            <span className="hero-card__tag">Pastel Dreams</span>
            <h3>Custom Hampers</h3>
            <p>Soft palettes. Luxe elements. Love in every layer.</p>
          </div>
          <div className="hero-card hero-card--secondary">
            <h3>Nikah Nama</h3>
            <p>Made-to-order artworks to celebrate sacred promises.</p>
          </div>
        </motion.div>
      </section>

      <motion.section
        className="trending-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="trending-container">
          <motion.div
            className="trending-header"
            variants={slideUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2>Trending Gifts This Season</h2>
            <p>Our most loved creations, curated just for you 💞</p>
          </motion.div>

          {loading ? (
            <div className="trending-loading">Loading products...</div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  className="trending-grid"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {trendingProducts
                    .slice(currentIndex, currentIndex + itemsPerPage)
                    .map((product, index) => {
                      const badgeClass = getBadgeClass(product.badge);
                      return (
                        <motion.div
                          key={product.id}
                          className="trending-card"
                          whileHover={{
                            y: -8,
                            scale: 1.02,
                            transition: { duration: 0.3 }
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleProductClick(product.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <motion.div
                            className="trending-image-wrapper"
                            whileHover="hover"
                            initial="rest"
                          >
                            <motion.img
                              src={optimizeImageUrl(product.imageUrl, 600)}
                              alt={product.name}
                              loading="lazy"

                              variants={{
                                rest: { scale: 1 },
                                hover: { scale: 1.1 }
                              }}
                              transition={{ duration: 0.4 }}
                            />
                            {product.badge && (
                              <motion.span
                                className={`trending-badge ${badgeClass}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                              >
                                {product.badge}
                              </motion.span>
                            )}
                          </motion.div>
                          <div className="trending-info">
                            <h3>{product.name}</h3>
                            <p className="trending-price">₹{product.price}</p>
                            <p className="trending-category">{product.category}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                </motion.div>
              </AnimatePresence>

              <motion.div
                className="trending-view-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.button
                  className="btn-secondary"
                  onClick={() => navigate("/shop")}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Products →
                </motion.button>
              </motion.div>
            </>
          )}
        </div>
      </motion.section>

      <motion.section
        className="home-section home-card--about"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2>About Us !</h2>
        <p>
          A one-stop shop for personalized & thoughtful gifts because every occasion
          deserves something special.
        </p>
      </motion.section>

      <motion.section
        className="home-section home-card--occasions"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2>For Every Occasion</h2>
        <p>Weddings | Birthdays | Anniversaries | Festive Moments</p>
        <span>We make celebrations unforgettable!</span>
      </motion.section>

      <motion.section
        className="home-section home-card--offerings"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2>What We Offer</h2>
        <motion.div
          className="home-offerings-grid"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {offerings.map((item) => (
            <motion.article
              key={item.title}
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <span>{item.icon}</span>
              <p>{item.title}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="home-why"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Why Choose Homaura?
        </motion.h2>
        <motion.div
          className="home-why__grid"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {reasons.map((card) => (
            <motion.div
              key={card.title}
              className="home-why__card"
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="home-section home-card--cta"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Let Homaura be part of your next celebration!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          DM us for orders | Follow for ideas
        </motion.p>
        <motion.a
          href="https://www.instagram.com/akshat_sanghi_/"
          target="_blank"
          rel="noreferrer"
          className="btn-instagram"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          Follow us on Instagram
        </motion.a>
      </motion.section>

      <FAQ />
    </motion.div>
  );
}
