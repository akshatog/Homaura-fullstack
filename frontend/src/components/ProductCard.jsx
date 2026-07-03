import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import "../styles/ProductCard.css";

import { optimizeImageUrl } from "../utils/imageUtils";

function ProductCard({ product, onOrderClick, loading, isAdmin, onProductDeleted, onStockUpdated }) {
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showStockInput, setShowStockInput] = useState(false);
  const [newStock, setNewStock] = useState(product.stock);
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.min(Math.max(value, 1), product.stock));
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(prev + 1, product.stock));
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: location } });
      return;
    }

    setIsProcessing(true);
    try {
      await onOrderClick(product.id, quantity);
    } finally {
      setIsProcessing(false);
      setQuantity(1);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/products/${product.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (onProductDeleted) {
        onProductDeleted(product.id);
      }
    } catch (err) {
      alert("Failed to delete product: " + (err.response?.data?.error || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStock = async () => {
    const stockNum = parseInt(newStock);
    if (isNaN(stockNum) || stockNum < 0) {
      alert("Please enter a valid stock amount");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/products/${product.id}/stock`,
        { stock: stockNum },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (onStockUpdated) {
        onStockUpdated(product.id, stockNum);
      }

      setShowStockInput(false);
      setNewStock(stockNum);
    } catch (err) {
      alert("Failed to update stock: " + (err.response?.data?.error || err.message));
    }
  };

  const isOutOfStock = product.stock === 0;
  const isDisabled = isOutOfStock || loading || isProcessing;

  return (
    <div className="product-card-user">
      <div className="product-image-wrapper">
        <img
          src={optimizeImageUrl(product.imageUrl, 400)}
          alt={product.name}
          className="product-image"
          loading="lazy"

        />
        <div className={`product-badge ${isOutOfStock ? "out-of-stock" : "in-stock"}`}>
          {isOutOfStock ? "Out of Stock" : "In Stock"}
        </div>
        {!isOutOfStock && (
          <div className="stock-count">
            Stock: <strong>{product.stock}</strong>
          </div>
        )}
        {isOutOfStock && isAdmin && (
          <div className="stock-count admin">
            <button
              onClick={() => setShowStockInput(!showStockInput)}
              className="btn-add-stock"
              title="Add stock"
            >
              ➕ Add Stock
            </button>
          </div>
        )}
      </div>

      <div className="product-content">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          {isAdmin && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                className="btn-edit-product"
                title="Edit product"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="btn-delete-product"
                title="Delete product"
              >
                {isDeleting ? "..." : "🗑️"}
              </button>
            </div>
          )}
        </div>
        <p className="product-description">{product.description}</p>

        <div className="product-footer">
          <div className="product-price">₹{product.price}</div>
          <div className="product-category">{product.category}</div>
        </div>

        {!isOutOfStock && !isAdmin && (
          <div className="quantity-section">
            <label>Quantity:</label>
            <div className="quantity-selector">
              <button
                onClick={handleDecrement}
                disabled={isDisabled || quantity === 1}
                className="qty-btn"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={handleQuantityChange}
                disabled={isDisabled}
                className="qty-input"
              />
              <button
                onClick={handleIncrement}
                disabled={isDisabled || quantity === product.stock}
                className="qty-btn"
              >
                +
              </button>
            </div>
            <span className="qty-limit">Max: {product.stock}</span>
          </div>
        )}

        {isAdmin && isOutOfStock && showStockInput && (
          <div className="stock-input-section">
            <label>New Stock Amount:</label>
            <div className="stock-input-group">
              <input
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Enter stock amount"
                className="stock-input"
              />
              <button onClick={handleUpdateStock} className="btn-confirm-stock">
                ✓
              </button>
              <button
                onClick={() => {
                  setShowStockInput(false);
                  setNewStock(product.stock);
                }}
                className="btn-cancel-stock"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {!isAdmin && (
          <button
            onClick={handlePlaceOrder}
            disabled={isDisabled}
            className={`btn-order ${isDisabled ? "disabled" : ""}`}
          >
            {isProcessing ? "Placing Order..." : isOutOfStock ? "Out of Stock" : "🛒 Place Order"}
          </button>
        )}
      </div>
    </div>
  );
}

export default React.memo(ProductCard);

