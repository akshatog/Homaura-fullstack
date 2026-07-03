import React, { useState, useEffect } from "react";
import api from "../utils/api";
import ProductImage from "../components/ProductImage";
import { IMAGE_SIZES } from "../utils/imageUtils";
import "../styles/ProductModal.css";

export default function ProductModal({ isOpen, productId, onClose, onOrderClick }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchProductDetails() {
      if (!isOpen || !productId) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/products/${productId}`);
        if (isMounted) {
      setProduct(res.data);
      setQuantity(1);
        }
    } catch (err) {
        if (isMounted) {
      setError("Failed to load product details");
      console.error("Fetch error:", err);
        }
    } finally {
        if (isMounted) {
      setLoading(false);
        }
      }
    }
    fetchProductDetails();
    return () => {
      isMounted = false;
  };
  }, [isOpen, productId]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.min(Math.max(value, 1), product?.stock || 1));
  };

  const handleIncrement = () => {
    if (product) {
      setQuantity((prev) => Math.min(prev + 1, product.stock));
    }
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    if (!product) return;

    setIsProcessing(true);
    try {
      await onOrderClick(product.id, quantity);
      onClose();
    } catch (err) {
      console.error("Order error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="product-modal-backdrop" onClick={onClose}>
      <div className="product-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="product-modal-close" onClick={onClose}>
          ✕
        </button>

        {loading ? (
          <div className="product-modal-loading">Loading product details...</div>
        ) : error ? (
          <div className="product-modal-error">{error}</div>
        ) : product ? (
          <div className="product-modal-content">
            {}
            <div className="product-modal-image-wrapper">
              <ProductImage product={product} width={IMAGE_SIZES.gallery} alt={product.name} className="product-modal-image" />
              <div className="product-modal-badge">
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </div>
            </div>

            {}
            <div className="product-modal-details">
              <h2 className="product-modal-title">{product.name}</h2>

              <div className="product-modal-price">₹{product.price}</div>

              <div className="product-modal-category">{product.category}</div>

              <p className="product-modal-description">{product.description}</p>

              <div className="product-modal-specs">
                <div className="product-modal-spec-row">
                  <span className="product-modal-spec-label">Stock Available:</span>
                  <span className="product-modal-spec-value">{product.stock} units</span>
                </div>
                <div className="product-modal-spec-row">
                  <span className="product-modal-spec-label">Category:</span>
                  <span className="product-modal-spec-value">{product.category}</span>
                </div>
                <div className="product-modal-spec-row">
                  <span className="product-modal-spec-label">Product ID:</span>
                  <span className="product-modal-spec-value">#{product.id}</span>
                </div>
              </div>

              {product.stock > 0 && (
                <div className="product-modal-quantity">
                  <label>Select Quantity:</label>
                  <div className="product-modal-qty-controls">
                    <button
                      onClick={handleDecrement}
                      disabled={isProcessing || quantity === 1}
                      className="product-modal-qty-btn"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={handleQuantityChange}
                      disabled={isProcessing}
                      className="product-modal-qty-input"
                    />
                    <button
                      onClick={handleIncrement}
                      disabled={isProcessing || quantity === product.stock}
                      className="product-modal-qty-btn"
                    >
                      +
                    </button>
                  </div>
                  <span className="product-modal-qty-max">Max: {product.stock}</span>
                </div>
              )}

              <div className="product-modal-actions">
                <button onClick={onClose} className="product-modal-btn-close">
                  Close
                </button>
                {product.stock > 0 && (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="product-modal-btn-order"
                  >
                    {isProcessing ? "Placing Order..." : "🛒 Place Order"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
