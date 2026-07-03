import React, { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import "../styles/ProductCardUser.css";
import { optimizeImageUrl } from "../utils/imageUtils";

const HeartIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#5C6B47" : "none"} stroke={filled ? "#5C6B47" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

function ProductCardUser({
  product,
  onProductClick = () => { },
  onAddToCart = () => { },
  onViewDetails = () => { },
}) {
  const { items, updateQuantity, removeFromCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false); // Visual toggle for mockup matching

  const cartItem = items.find(item => item.id === product.id);

  const handleIncrement = () => {
    if (cartItem && cartItem.quantity < product.stock) {
      updateQuantity(product.id, cartItem.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateQuantity(product.id, cartItem.quantity - 1);
      } else {
        removeFromCart(product.id);
      }
    }
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="ha-product-card">
      <div
        className="ha-product-image-wrapper"
        onClick={() => onProductClick(product.id)}
        role="button"
        tabIndex={0}
      >
        <img
          src={optimizeImageUrl(product.imageUrl, 400)}
          alt={product.name}
          className="ha-product-image"
          loading="lazy"
        />
        
        <button 
          className="ha-product-wishlist-btn" 
          onClick={toggleWishlist}
          aria-label="Toggle wishlist"
        >
          <HeartIcon filled={isWishlisted} />
        </button>

        {product.stock === 0 && (
          <div className="ha-product-badge out-of-stock">Sold Out</div>
        )}
      </div>

      <div className="ha-product-info">
        <h3 className="ha-product-name">{product.name}</h3>
        <span className="ha-product-price">₹ {product.price.toLocaleString("en-IN")}</span>

        <div className="ha-product-actions">
          <button
            type="button"
            className="ha-btn-pill ha-btn-outline"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product.id);
            }}
          >
            Details
          </button>

          {cartItem ? (
            <div className="ha-quantity-selector" onClick={(e) => e.stopPropagation()}>
              <button className="ha-qty-btn" onClick={handleDecrement}>−</button>
              <span className="ha-qty-val">{cartItem.quantity}</span>
              <button
                className="ha-qty-btn"
                onClick={handleIncrement}
                disabled={cartItem.quantity >= product.stock}
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="ha-btn-pill ha-btn-solid"
              disabled={product.stock === 0}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProductCardUser);
