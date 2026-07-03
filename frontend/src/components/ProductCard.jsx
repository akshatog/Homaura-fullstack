import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import ProductImage from "./ProductImage";
import { IMAGE_SIZES } from "../utils/imageUtils";
import "../styles/ProductCardUser.css";

function ProductCard({ product, onOrderClick, loading, isAdmin, onProductDeleted, onStockUpdated }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showStockInput, setShowStockInput] = useState(false);
  const [newStock, setNewStock] = useState(product.stock);
  const navigate = useNavigate();

  const handleDeleteProduct = async (e) => {
    e.stopPropagation();
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

  const handleUpdateStock = async (e) => {
    e.stopPropagation();
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

  return (
    <div className="ha-product-card">
      <div className="ha-product-image-wrapper">
        <ProductImage
          product={product}
          width={IMAGE_SIZES.card}
          alt={product.name}
          className="ha-product-image"
        />

        {isOutOfStock ? (
          <div className="ha-product-badge out-of-stock">Sold Out</div>
        ) : (
          <div className="ha-product-badge in-stock">
            Stock: {product.stock}
          </div>
        )}
      </div>

      <div className="ha-product-info">
        <h3 className="ha-product-name">{product.name}</h3>
        <span className="ha-product-price">₹ {product.price.toLocaleString("en-IN")}</span>

        {isAdmin && showStockInput && (
          <div className="admin-stock-row" onClick={(e) => e.stopPropagation()}>
            <input
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              className="admin-stock-input"
              min="0"
            />
            <button onClick={handleUpdateStock} className="ha-btn-pill ha-btn-solid" style={{ padding: '0.5rem 1rem' }}>
              Save
            </button>
            <button onClick={(e) => { e.stopPropagation(); setShowStockInput(false); }} className="ha-btn-pill ha-btn-outline" style={{ padding: '0.5rem 1rem' }}>
              Cancel
            </button>
          </div>
        )}

        {isAdmin && !showStockInput && (
          <div className="ha-product-actions admin-actions-grid">
            <button
              type="button"
              className="ha-btn-pill ha-btn-outline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/products/edit/${product.id}`);
              }}
            >
              Edit
            </button>
            
            <button
              type="button"
              className="ha-btn-pill ha-btn-danger"
              disabled={isDeleting}
              onClick={handleDeleteProduct}
            >
              {isDeleting ? "..." : "Delete"}
            </button>

            {isOutOfStock && (
              <button
                type="button"
                className="ha-btn-pill ha-btn-solid full-width"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStockInput(true);
                }}
              >
                + Add Stock
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(ProductCard);
