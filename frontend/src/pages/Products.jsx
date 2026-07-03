import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../utils/api";
import AddProductForm from "../components/AddProductForm";
import OrderTrackingModal from "../components/OrderTrackingModal";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import "./products.css";
import "../styles/Admin.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchProducts } = useProducts();

  useEffect(() => {
    const adminFlag = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(adminFlag);

    async function load() {
      try {
        const response = await fetchProducts(1, 1000);
        setProducts(response.products || response);
      } catch (err) {
        console.error("❌ Products fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fetchProducts]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  const handleProductAdded = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    setShowAddForm(false);
  };

  const handleProductDeleted = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleStockUpdated = (productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: newStock } : p
      )
    );
  };

  const handleOrderClick = useCallback(async (productId, quantity) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      await api.post(
        "/orders",
        { userId: user.id, items: [{ productId, quantity }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Order placed successfully!");
      const response = await fetchProducts(1, 1000);
      setProducts(response.products || response);
    } catch (err) {
      alert("Failed to place order: " + (err.response?.data?.error || err.message));
    }
  }, [fetchProducts]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__inner admin-loading">
          <div className="admin-spinner" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__inner">
        <header className="admin-header">
          <div className="admin-header__top">
            <div className="admin-header__title-block">
              <span className="admin-eyebrow">HomAura Admin</span>
              <h1 className="admin-header__title">
                {isAdmin ? "Product Dashboard" : "Products Showcase"}
              </h1>
              <p className="admin-header__subtitle">
                {isAdmin
                  ? "Manage your product catalog and track orders."
                  : "Discover our latest beautiful collection."}
              </p>
            </div>

            <div className="admin-header__actions">
              <button onClick={handleLogout} className="ha-btn-pill ha-btn-danger">
                Logout
              </button>
            </div>
          </div>

          {isAdmin && (
            <>
              <nav className="admin-nav-tabs" aria-label="Admin navigation">
                <Link
                  to="/admin/products"
                  className={`admin-nav-tab ${location.pathname === "/admin/products" ? "admin-nav-tab--active" : ""}`}
                >
                  Products
                </Link>
                <Link
                  to="/admin/analytics"
                  className={`admin-nav-tab ${location.pathname === "/admin/analytics" ? "admin-nav-tab--active" : ""}`}
                >
                  Analytics
                </Link>
              </nav>

              <div className="admin-header__actions">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="ha-btn-pill ha-btn-solid"
                >
                  {showAddForm ? "Close Form" : "Add Product"}
                </button>
                <button
                  onClick={() => setShowOrderModal(true)}
                  className="ha-btn-pill ha-btn-outline"
                >
                  Track Orders
                </button>
              </div>
            </>
          )}
        </header>

        {isAdmin && showAddForm && (
          <div style={{ marginBottom: "2rem" }}>
            <AddProductForm onProductAdded={handleProductAdded} />
          </div>
        )}

        {isAdmin && (
          <OrderTrackingModal
            isOpen={showOrderModal}
            onClose={() => setShowOrderModal(false)}
          />
        )}

        <div className="ha-shop-layout">
          <div className="ha-shop-main-content">
            {products.length === 0 ? (
              <div className="admin-empty">
                {isAdmin
                  ? "No products yet. Click 'Add Product' to get started!"
                  : "No products found."}
              </div>
            ) : (
              <div className="ha-products-grid">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isAdmin={isAdmin}
                    loading={loading}
                    onOrderClick={handleOrderClick}
                    onProductDeleted={handleProductDeleted}
                    onStockUpdated={handleStockUpdated}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
