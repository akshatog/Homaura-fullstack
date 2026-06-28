import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import ProductCardUser from "../components/ProductCardUser";
import ProductModal from "../components/ProductModal";
import OrderConfirmation from "../components/OrderConfirmation";
import ReviewModal from "../components/ReviewModal";
import { renderIcon } from "../components/IconComponents";
import { useProducts } from "../hooks/useProducts";
import { useOrders } from "../hooks/useOrders";
import { useCart } from "../context/CartContext.jsx";
import SearchBar from "../components/SearchBar";
import { searchProducts, saveSearchToHistory } from "../utils/searchUtils";
import "./products.css";
import "../styles/Filters.css";
import "../styles/MyOrders.css";

export default function UserProducts({ defaultTab = "products" }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All Tags");
  const [priceRange, setPriceRange] = useState([299, 49999]);
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedDiscount, setSelectedDiscount] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const contactLinks = [
    {
      label: "WhatsApp",
      href: "https://wa.me/917322073770",
      type: "whatsapp",
    },
    {
      label: "Phone",
      href: "tel:+917322073770",
      type: "phone",
    },
    {
      label: "Email",
      href: "mailto:akshatsanghi900@gmail.com",
      type: "email",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/akshat_sanghi_/",
      type: "instagram",
    },
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setActiveTab("orders");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const { fetchAllProducts } = useProducts();
  const { fetchUserOrders, createOrder } = useOrders();

  useEffect(() => {
    async function loadData() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (defaultTab === "orders" && !user?.id) {
          navigate("/login", { state: { from: location } });
          return;
        }

        const response = await fetchAllProducts();
        const allProducts = response.products || response || [];
        setProducts(allProducts);

        if (user?.id) {
          const ordersData = await fetchUserOrders(user.id);
          setOrders(ordersData);
        }
      } catch (err) {
        console.error("Load error:", err);
        setErrorMessage("Failed to load data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [fetchAllProducts, fetchUserOrders, navigate, defaultTab]);

  const filteredProducts = useMemo(() => {
    const baseProducts = searchQuery ? searchResults : products;

    return baseProducts.filter(product => {
      if (selectedCategory !== "All" && product.category !== selectedCategory) {
        return false;
      }

      if (selectedTag !== "All Tags" && product.badge !== selectedTag) {
        return false;
      }

      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      if (selectedRating !== "All") {
        const minRating = parseInt(selectedRating);
        const productRating = product.averageRating || 0;
        if (productRating < minRating) {
          return false;
        }
      }

      if (selectedDiscount !== "All") {
        const minDiscount = parseInt(selectedDiscount);
        const productDiscount = product.discount || 0;
        if (productDiscount < minDiscount) {
          return false;
        }
      }

      if (selectedAvailability === "In Stock" && product.stock === 0) {
        return false;
      }
      if (selectedAvailability === "Out of Stock" && product.stock > 0) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, searchResults, selectedCategory, selectedTag, priceRange, selectedRating, selectedDiscount, selectedAvailability]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const results = searchProducts(query, products);
    setSearchResults(results);
    if (query && results.length > 0) {
      saveSearchToHistory(query, results);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const handlePlaceOrder = async (productId, quantity) => {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const product = products.find((p) => p.id === productId);

      if (!product) {
        setErrorMessage("Product not found");
        return;
      }

      if (product.stock < quantity) {
        setErrorMessage(
          `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`
        );
        return;
      }

      const orderData = await createOrder(user.id, [
        {
          productId,
          quantity,
          price: product.price,
        },
      ]);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, stock: p.stock - quantity }
            : p
        )
      );

      setOrders((prev) => [orderData, ...prev]);

      navigate("/orders", {
        replace: true,
        state: {
          successMessage: `Order placed successfully! Order ID: ${orderData.id}`,
        },
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to place order. Please try again.";
      setErrorMessage(errorMsg);
    }
  };

  const handleOpenReviewModal = useCallback((product) => {
    setReviewProduct(product);
    setShowReviewModal(true);
  }, []);

  const handleSubmitReview = useCallback(async (reviewData) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        '/reviews',
        reviewData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('Review submitted successfully!');
      setShowReviewModal(false);
      setReviewProduct(null);
    } catch (err) {
      throw err;
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "placed":
        return "#1976d2";
      case "ready":
        return "#7b1fa2";
      case "out_for_delivery":
        return "#e65100";
      case "delivered":
        return "#2e7d32";
      case "pending":
        return "#f57c00";
      case "cancelled":
        return "#dc2626";
      default:
        return "#999";
    }
  };



  if (loading) {
    return (
      <div className="products-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <header className="products-header">
        <div className="header-content">
          <div className="header-left">
            <h1>{activeTab === "products" ? "🛍️ Shop" : "📦 My Orders"}</h1>
            <p>{activeTab === "products" ? "Browse our curated collection" : "Track your recent purchases"}</p>
          </div>
        </div>
      </header>

      {errorMessage && (
        <div className="message-banner error-banner">
          <span>{errorMessage}</span>
          <button
            className="close-banner"
            onClick={() => setErrorMessage("")}
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="message-banner success-banner">
          <span>{successMessage}</span>
          <button
            className="close-banner"
            onClick={() => setSuccessMessage("")}
          >
            ✕
          </button>
        </div>
      )}

      <div className="user-tabs" style={{ display: "none" }}>
        <button
          className={`tab ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          🛒 All Products ({products.length})
        </button>
        <button
          className={`tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          📦 My Orders ({orders.length})
        </button>
      </div>

      <div className="page-title-section" style={{ padding: "0 2rem", marginBottom: "1rem" }}>
        {activeTab === "products" ? (
          <h2>All Products ({filteredProducts.length})</h2>
        ) : (
          <h2>My Orders ({orders.length})</h2>
        )}
      </div>

      {activeTab === "products" && (
        <>
          <SearchBar
            products={products}
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />

          <div className="filters-section">
            <div className="filter-group">
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option>All</option>
                <option>Personalized</option>
                <option>Hampers</option>
                <option>Gifts for Her</option>
                <option>Gifts for Him</option>
                <option>Kids Gifts</option>
                <option>Couple Gifts</option>
                <option>Romantic</option>
                <option>Birthday</option>
                <option>Anniversary</option>
                <option>Home Decor</option>
                <option>Festive Gifts</option>
                <option>Luxury Gifts</option>
                <option>Accessories</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Tags</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option>All Tags</option>
                <option>Best Seller</option>
                <option>Trending</option>
                <option>Popular</option>
                <option>Limited Edition</option>
                <option>New Arrival</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-range-slider">
                <div className="price-labels">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="299"
                  max="49999"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value);
                    if (newMin < priceRange[1]) {
                      setPriceRange([newMin, priceRange[1]]);
                    }
                  }}
                  className="range-slider range-min"
                />
                <input
                  type="range"
                  min="299"
                  max="49999"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value);
                    if (newMax > priceRange[0]) {
                      setPriceRange([priceRange[0], newMax]);
                    }
                  }}
                  className="range-slider range-max"
                />
                <div className="price-inputs">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value) || 299;
                      if (newMin < priceRange[1]) {
                        setPriceRange([newMin, priceRange[1]]);
                      }
                    }}
                    min="299"
                    max={priceRange[1]}
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value) || 49999;
                      if (newMax > priceRange[0]) {
                        setPriceRange([priceRange[0], newMax]);
                      }
                    }}
                    min={priceRange[0]}
                    max="49999"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            <div className="filter-group">
              <label>Rating</label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
              >
                <option>All</option>
                <option value="4">4★ & above</option>
                <option value="3">3★ & above</option>
                <option value="2">2★ & above</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Discount</label>
              <select
                value={selectedDiscount}
                onChange={(e) => setSelectedDiscount(e.target.value)}
              >
                <option>All</option>
                <option value="10">10%+</option>
                <option value="20">20%+</option>
                <option value="30">30%+</option>
                <option value="50">50%+</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Availability</label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
              >
                <option>All</option>
                <option>In Stock</option>
                <option>Out of Stock</option>
              </select>
            </div>

            <div className="filter-actions">
              <button
                className="btn-reset-filters"
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedTag("All Tags");
                  setPriceRange([299, 49999]);
                  setSelectedRating("All");
                  setSelectedDiscount("All");
                  setSelectedAvailability("All");
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>


          <div className="products-container">
            {filteredProducts.length === 0 ? (
              <div className="no-products">
                <div className="no-products-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCardUser
                    key={product.id}
                    product={product}
                    onProductClick={(productId) => {
                      setSelectedProductId(productId);
                      setShowDetailsModal(true);
                    }}
                    onAddToCart={addToCart}
                    onViewDetails={(productId) => navigate(`/products/${productId}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "orders" && (
        <div className="orders-page-wrapper">
          <div className="orders-page-header">
            <h2>📦 My Orders ({orders.length})</h2>
            <p>Track and manage all your recent purchases</p>
          </div>

          {orders.length === 0 ? (
            <div className="orders-empty">
              <div className="empty-icon">📭</div>
              <h3>No orders yet</h3>
              <p>Browse our products and place your first order!</p>
            </div>
          ) : (
            <div className="orders-list-premium">
              {orders.map((order) => {
                const totalAmount = order.items?.reduce(
                  (sum, item) => sum + (item.product?.price || 0) * item.quantity,
                  0
                );

                const timelineSteps = [
                  { key: "placed", label: "Confirmed", icon: "📋" },
                  { key: "ready", label: "Ready", icon: "📦" },
                  { key: "out_for_delivery", label: "On the Way", icon: "🚚" },
                  { key: "delivered", label: "Delivered", icon: "✅" },
                ];

                const statusOrder = ["pending", "placed", "ready", "out_for_delivery", "delivered"];
                const currentIndex = statusOrder.indexOf(order.status);

                return (
                  <div key={order.id} className="order-card-premium">
                    {/* Top Bar */}
                    <div className="order-card-topbar">
                      <div>
                        <div className="order-id">Order #{order.id}</div>
                        <div className="order-date">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <span
                        className="order-status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="order-card-body">

                      {/* Items */}
                      <div className="order-items-section">
                        <h4>Items Ordered</h4>
                        <div className="order-items-grid">
                          {order.items?.map((item) => (
                            <div key={item.id} className="order-item-row">
                              <img
                                src={item.product?.imageUrl}
                                alt={item.product?.name || "Product"}
                                loading="lazy"
                                onError={(e) => { e.target.src = "/images/placeholder.png"; }}
                              />
                              <div className="order-item-info">
                                <span className="order-item-name">{item.product?.name || "Unknown Product"}</span>
                                <div className="order-item-sub">
                                  <span className="order-item-qty">Qty: {item.quantity}</span>
                                  <span className="order-item-price">₹{(item.product?.price || 0) * item.quantity}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Total */}
                      <div className="order-total-row">
                        <span className="order-total-label">Order Total</span>
                        <span className="order-total-amount">₹{totalAmount?.toLocaleString("en-IN")}</span>
                      </div>

                      {/* Estimated Delivery */}
                      {!["delivered", "cancelled"].includes(order.status) && (
                        <div className="order-delivery-info">
                          ⏱️ Estimated Delivery: 5–8 business days
                        </div>
                      )}

                      {/* Timeline */}
                      {order.status !== "cancelled" ? (
                        <div className="order-timeline-premium">
                          {timelineSteps.map((step, idx) => {
                            const stepIndex = statusOrder.indexOf(step.key);
                            const isCompleted = currentIndex >= stepIndex;
                            const isActive = currentIndex === stepIndex - 1 || (order.status === "pending" && idx === 0);
                            return (
                              <div
                                key={step.key}
                                className={`timeline-step ${
                                  isCompleted ? "completed" : isActive ? "active" : ""
                                }`}
                              >
                                <div className="timeline-step-dot">
                                  {isCompleted ? "✓" : step.icon}
                                </div>
                                <div className="timeline-step-label">{step.label}</div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="order-cancelled-banner">
                          ❌ This order has been cancelled
                        </div>
                      )}

                      {/* Review Section */}
                      {order.status === "delivered" && order.items?.length > 0 && (
                        <div className="order-review-section-premium">
                          <h4>Rate Your Purchase</h4>
                          <div className="review-btns">
                            {order.items.map((item) => (
                              <button
                                key={item.id}
                                className="btn-review-premium"
                                onClick={() => handleOpenReviewModal(item.product)}
                              >
                                ⭐ Rate {item.product?.name || "Product"}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <OrderConfirmation
        isOpen={!!orderConfirmation}
        orderId={orderConfirmation?.orderId}
        items={orderConfirmation?.items || []}
        totalPrice={orderConfirmation?.totalPrice || 0}
        onClose={() => setOrderConfirmation(null)}
      />

      <ProductModal
        isOpen={showDetailsModal}
        productId={selectedProductId}
        onClose={() => setShowDetailsModal(false)}
        onAddToCart={addToCart}
      />

      {showReviewModal && reviewProduct && (
        <ReviewModal
          productId={reviewProduct.id}
          productName={reviewProduct.name}
          onClose={() => {
            setShowReviewModal(false);
            setReviewProduct(null);
          }}
          onSubmit={handleSubmitReview}
        />
      )}

      <section className="contact-section">
        <div className="contact-wrapper">
          <div className="contact-header">
            <p className="contact-pill">Need help?</p>
            <h2>Contact Us / Connect With Us</h2>
            <p>We are just a message away for order updates, styling tips, or bulk gifting queries.</p>
          </div>
          <div className="contact-grid">
            {contactLinks.map((item) => (
              <a
                key={item.label}
                className="contact-item"
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className={`contact-icon ${item.type}`}>{renderIcon(item.type)}</span>
                <div className="contact-content">
                  <span className="contact-label">{item.label}</span>
                  <span className="contact-value">{item.value}</span>
                </div>
                <span className="contact-action" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
