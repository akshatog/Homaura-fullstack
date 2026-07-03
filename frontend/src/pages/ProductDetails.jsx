import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { useCart } from "../context/CartContext.jsx";
import StarRating from "../components/StarRating";
import ReviewModal from "../components/ReviewModal";
import ReviewList from "../components/ReviewList";
import {
  pageTransition,
  slideUp,
  slideInLeft,
  slideInRight,
  scaleIn,
  notificationVariants,
  imageZoom
} from "../utils/animationVariants";
import ProductGallery from "../components/ProductGallery";
import "../styles/ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(location.state?.product || null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchProduct = useCallback(async () => {
    if (!location.state?.product) setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
    } catch (err) {
      console.error("Product fetch error:", err);
      if (!location.state?.product) setError("Unable to load product.");
    } finally {
      if (!location.state?.product) setLoading(false);
    }
  }, [id, location.state]);

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await api.get(`/reviews/product/${id}`);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  }, [id]);

  const checkReviewEligibility = useCallback(async () => {
    try {
      const { data } = await api.get(`/reviews/can-review/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanReview(data.canReview);
      setHasReviewed(data.hasReviewed);
      if (data.hasReviewed && data.reviewId) {
        const review = await api.get(`/reviews/${data.reviewId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExistingReview(review.data);
      }
    } catch (err) {
      console.error("Error checking review eligibility:", err);
    }
  }, [id, token]);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    if (token) {
      checkReviewEligibility();
    }
  }, [id, token]);

  const handleSubmitReview = async (formData) => {
    try {
      if (existingReview) {
        await api.put(
          `/reviews/${existingReview.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        await api.post(
          '/reviews',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      await fetchReviews();
      await checkReviewEligibility();
      setShowReviewModal(false);
      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      throw err;
    }
  };

  const handleEditReview = (review) => {
    setExistingReview(review);
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
      checkReviewEligibility();
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => {
      const newQty = prev + delta;
      if (newQty < 1) return 1;
      if (newQty > product.stock) return product.stock;
      return newQty;
    });
  };

  const handleBuyNow = () => {
    if (!token) {
      navigate("/login", { state: { from: location } });
      return;
    }

    addToCart({ ...product, quantity });
    navigate("/checkout");
  };

  if (loading) {
    return <div className="product-details-page">Loading product…</div>;
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <p>{error || "Product not found"}</p>
        <button className="btn-ghost" onClick={() => navigate("/shop")}>
          Back to shop
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="product-details-page"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Breadcrumb matching HomAura design system */}
      <div className="ha-products-breadcrumb" style={{ padding: '0 0 2rem 0', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', color: 'var(--gray-500)', fontFamily: 'var(--font-body)' }}>
        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/')}>Home</span>
        <span>/</span>
        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/shop')}>Shop</span>
        <span>/</span>
        <span style={{ color: 'var(--color-primary)' }}>{product.name}</span>
      </div>

      <motion.div
        className="product-details-card"
        variants={scaleIn}
        initial="initial"
        animate="animate"
      >
        {/* Product Gallery — supports multiple images + video */}
        <ProductGallery product={product} />
        <motion.div
          className="product-details-info"
          variants={slideInRight}
          initial="initial"
          animate="animate"
        >
          <motion.p
            className="product-details-tag"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {product.category}
          </motion.p>
          {product.badge && (
            <motion.p
              className="product-details-badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              {product.badge}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {product.name}
          </motion.h1>

          {totalReviews > 0 && (
            <motion.div
              className="product-rating-summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <StarRating rating={averageRating} size="medium" />
              <span className="rating-text">
                {averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </motion.div>
          )}

          <motion.p
            className="product-details-price"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            ₹{product.price}
          </motion.p>
          <motion.p
            className="product-details-desc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {product.description}
          </motion.p>

          <motion.div
            className="quantity-selector"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <label>Quantity:</label>
            <div className="quantity-controls">
              <motion.button
                className="quantity-btn"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                −
              </motion.button>
              <motion.span
                className="quantity-value"
                key={quantity}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {quantity}
              </motion.span>
              <motion.button
                className="quantity-btn"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                +
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            className="product-details-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <AnimatePresence mode="wait">
              {!addedToCart ? (
                <motion.button
                  key="add-to-cart"
                  className="btn-primary"
                  onClick={() => {
                    const token = localStorage.getItem("token");
                    if (!token) {
                      navigate("/login", { state: { from: location } });
                    } else {
                      addToCart({ ...product, quantity });
                      setAddedToCart(true);
                    }
                  }}
                  disabled={product.stock === 0}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {product.stock === 0 ? "Sold Out" : "Add to Cart"}
                </motion.button>
              ) : (
                <motion.button
                  key="go-to-cart"
                  className="btn-primary"
                  onClick={() => navigate("/cart")}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Go to Cart
                </motion.button>
              )}
            </AnimatePresence>
            <motion.button
              className="btn-primary"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Buy Now
            </motion.button>
          </motion.div>
          <motion.small
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Stock available: {product.stock} units
          </motion.small>
        </motion.div>
      </motion.div>

      <motion.div
        className="product-reviews-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="reviews-header">
          <h2>Customer Reviews</h2>
          {canReview && (
            <motion.button
              className="btn-secondary"
              onClick={() => setShowReviewModal(true)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {hasReviewed ? 'Edit Your Review' : 'Write a Review'}
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              className="review-success-message"
              variants={notificationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              ✓ Review submitted successfully! Thank you for your feedback.
            </motion.div>
          )}
        </AnimatePresence>

        <ReviewList
          reviews={reviews}
          currentUserId={user.id}
          onEdit={handleEditReview}
          onDelete={handleDeleteReview}
        />
      </motion.div>

      {showReviewModal && (
        <ReviewModal
          productId={parseInt(id)}
          productName={product.name}
          existingReview={existingReview}
          onClose={() => {
            setShowReviewModal(false);
            setExistingReview(null);
          }}
          onSubmit={handleSubmitReview}
        />
      )}
    </motion.div>
  );
}
