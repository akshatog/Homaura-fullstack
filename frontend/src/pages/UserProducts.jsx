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
import ProductImage from "../components/ProductImage";
import { IMAGE_SIZES } from "../utils/imageUtils";
import "./products.css";
import "../styles/Filters.css";
import "../styles/MyOrders.css";

export default function UserProducts({ defaultTab = "products" }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([299, 49999]);
  const [sortBy, setSortBy] = useState("Featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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
    const user = JSON.parse(localStorage.getItem("user"));

    if (defaultTab === "orders" && !user?.id) {
      navigate("/login", { state: { from: location } });
      return;
    }

    setProductsLoading(true);
    fetchAllProducts()
      .then(res => {
        const allProducts = res.products || res || [];
        setProducts(allProducts);
      })
      .catch(err => {
        console.error("Products load error:", err);
        setErrorMessage("Failed to load products. Please refresh the page.");
      })
      .finally(() => {
        setProductsLoading(false);
      });

    if (user?.id) {
      setOrdersLoading(true);
      fetchUserOrders(user.id)
        .then(ordersData => {
          setOrders(ordersData);
        })
        .catch(err => {
          console.error("Orders load error:", err);
        })
        .finally(() => {
          setOrdersLoading(false);
        });
    } else {
      setOrdersLoading(false);
    }
  }, [fetchAllProducts, fetchUserOrders, navigate, defaultTab, location]);

  const filteredProducts = useMemo(() => {
    const baseProducts = searchQuery ? searchResults : products;

    let filtered = baseProducts.filter(product => {
      if (selectedCategory !== "All" && product.category !== selectedCategory) {
        return false;
      }

      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      return true;
    });

    if (sortBy === "PriceLowHigh") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "PriceHighLow") {
      filtered.sort((a, b) => b.price - a.price);
    }
    // "Featured" can just be the default order, or we could sort by some other logic if available.
    return filtered;
  }, [products, searchQuery, searchResults, selectedCategory, priceRange, sortBy]);

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



  const isLoading = activeTab === "products" ? productsLoading : ordersLoading;

  if (isLoading) {
    return (
      <div className="products-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="ha-products-page">
      {/* Header with breadcrumbs and counts was removed per user request to save space */}


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

      <div className="page-title-section">
        {activeTab === "products" ? (
          <h2>
            All Products
          </h2>
        ) : (
          <h2>
            My Orders ({orders.length})
          </h2>
        )}
      </div>

      {activeTab === "products" && (
        <div className="ha-shop-layout">
          
          <div className="ha-mobile-filter-trigger">
            <button className="ha-btn-mobile-filter" onClick={() => setShowMobileFilters(true)}>
              <span className="filter-icon">⚙️</span> Filters
            </button>
          </div>
          
          {showMobileFilters && (
            <div className="mobile-filter-overlay" onClick={() => setShowMobileFilters(false)}></div>
          )}

          <aside className={`ha-shop-sidebar ${showMobileFilters ? 'open' : ''}`}>
            <div className="ha-sidebar-header mobile-only">
              <h3>Filters</h3>
              <button className="btn-close-filters" onClick={() => setShowMobileFilters(false)}>✕</button>
            </div>
            
            <div className="ha-filters-section">
              <h2 className="ha-filters-title">Filters</h2>
              
              <div className="ha-filter-group">
                <label className="ha-filter-label">Category</label>
                <div className="ha-category-list">
                  {["All", ...new Set(products.map(p => p.category).filter(Boolean))].map(cat => (
                    <label key={cat} className="ha-category-item">
                      <input 
                        type="radio" 
                        name="category" 
                        value={cat} 
                        checked={selectedCategory === cat} 
                        onChange={(e) => setSelectedCategory(e.target.value)} 
                        className="ha-radio-as-checkbox"
                      />
                      <span className="ha-category-text">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="ha-filter-group">
                <label className="ha-filter-label">Price Range</label>
                <div className="ha-price-range-slider">
                  {/* Single slider for max price — clear and overflow-safe */}
                  <div className="price-labels">
                    <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
                    <span>up to ₹{priceRange[1].toLocaleString('en-IN')}</span>
                  </div>
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
                    className="range-slider"
                  />
                  <div className="price-inputs">
                    <div className="price-input-group">
                      <span className="price-input-label">Min</span>
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
                        placeholder="299"
                      />
                    </div>
                    <span className="price-inputs-dash">–</span>
                    <div className="price-input-group">
                      <span className="price-input-label">Max</span>
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
                        placeholder="49999"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="ha-filter-actions">
                <label className="ha-filter-label">Sort By</label>
                <select 
                  className="ha-sort-select" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="Featured">Featured</option>
                  <option value="PriceLowHigh">Price: Low to High</option>
                  <option value="PriceHighLow">Price: High to Low</option>
                </select>
                <button
                  className="btn-reset-filters"
                  style={{marginTop: '1rem', width: '100%', padding: '0.75rem', borderRadius: '50px', background: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600'}}
                  onClick={() => {
                    setSelectedCategory("All");
                    setPriceRange([299, 49999]);
                    setSortBy("Featured");
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </aside>

          <div className="ha-shop-main-content">
            <div className="ha-search-wrapper" style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <div style={{ width: "100%", maxWidth: "540px" }}>
                <SearchBar
                  products={products}
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                />
              </div>
            </div>

            <div className="ha-products-container">
              {filteredProducts.length === 0 ? (
                <div className="no-products">
                  <div className="no-products-icon">🔍</div>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters</p>
                </div>
              ) : (
                <div className="ha-products-grid">
                  {filteredProducts.map((product) => (
                    <ProductCardUser
                      key={product.id}
                      product={product}
                      onProductClick={() => navigate(`/products/${product.id}`, { state: { product } })}
                      onAddToCart={addToCart}
                      onViewDetails={() => navigate(`/products/${product.id}`, { state: { product } })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
                              <ProductImage
                                item={item}
                                width={IMAGE_SIZES.thumb}
                                alt={item.product?.name || "Product"}
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
