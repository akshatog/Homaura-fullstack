import React from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext.jsx";
import "../styles/ProductCardUser.css";
import { optimizeImageUrl } from "../utils/imageUtils";

function ProductCardUser({
  product,
  onProductClick = () => { },
  onAddToCart = () => { },
  onViewDetails = () => { },
}) {
  const { items, updateQuantity, removeFromCart } = useCart();

  const cartItem = items.find(item => item.id === product.id);

  const shortDescription =
    product.description?.length > 90
      ? `${product.description.slice(0, 87)}…`
      : product.description || "Pastel-perfect keepsakes for heartfelt gifting.";

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

  return (
    <motion.div
      className="product-card-user"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      <motion.button
        type="button"
        className="product-image-wrapper"
        onClick={() => onProductClick(product.id)}
        whileHover="hover"
        initial="rest"
      >
        <motion.img
          src={optimizeImageUrl(product.imageUrl, 400)}
          alt={product.name}
          className="product-image"
          loading="lazy"
          variants={{
            rest: { scale: 1 },
            hover: { scale: 1.1 }
          }}
          transition={{ duration: 0.4 }}
        />
        {product.badge && (
          <motion.div
            className="product-tag-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {product.badge}
          </motion.div>
        )}
        <motion.div
          className={`product-badge ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {product.stock > 0 ? "In Stock" : "Sold Out"}
        </motion.div>
      </motion.button>

      <div className="product-card-content">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{shortDescription}</p>
        <div className="product-meta-row">
          <span className="product-price">₹{product.price}</span>
          <span className="product-stock-label">
            {product.stock > 0 ? `${product.stock} left` : "Sold out"}
          </span>
        </div>

        <div className="product-card-actions">
          <motion.button
            type="button"
            className="btn-outline"
            onClick={() => onViewDetails(product.id)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            View Details
          </motion.button>

          {cartItem ? (
            <motion.div
              className="quantity-selector-inline"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                className="quantity-btn-inline"
                onClick={handleDecrement}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                −
              </motion.button>
              <motion.span
                className="quantity-value-inline"
                key={cartItem.quantity}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {cartItem.quantity}
              </motion.span>
              <motion.button
                className="quantity-btn-inline"
                onClick={handleIncrement}
                disabled={cartItem.quantity >= product.stock}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                +
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              type="button"
              className="btn-solid"
              disabled={product.stock === 0}
              onClick={() => onAddToCart(product)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Add to Cart
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default React.memo(ProductCardUser);

