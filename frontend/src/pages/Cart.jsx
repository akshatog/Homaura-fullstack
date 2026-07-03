import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import "../styles/Cart.css";
import { optimizeImageUrl } from "../utils/imageUtils";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, toggleItemSelection, cartTotal, deliveryCharge, finalTotal, selectedItems } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = () => {
    if (!selectedItems.length) return;

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      navigate("/login", {
        state: { from: { pathname: "/checkout" } }
      });
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="cart-page">
      <section className="cart-header">
        <div>
          <p>Your curated picks</p>
          <h1>Cart</h1>
        </div>
        <div className="cart-header-actions">
          <button className="btn-ghost" onClick={() => navigate("/shop")}>
            Continue Shopping
          </button>
          <button
            className="btn-primary"
            onClick={handleBuyNow}
            disabled={selectedItems.length === 0}
          >
            Buy Now ({selectedItems.length})
          </button>
        </div>
      </section>

      {items.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <button className="btn-primary" onClick={() => navigate("/shop")}>
            Browse products
          </button>
        </div>
      ) : (
        <>
          <div className="cart-content">
            <div className="cart-list">
              {items.map((item) => (
                <article
                  key={item.id}
                  className={`cart-item ${!item.selected ? 'cart-item--unselected' : ''}`}
                >
                  <div className="cart-item__select">
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleItemSelection(item.id)}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>
                  <img src={optimizeImageUrl(item.imageUrl, 200)} alt={item.name} />
                  <div className="cart-item__info">
                    <h3>{item.name}</h3>
                    <p>₹{item.price}</p>
                    <div className="cart-qty">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity === 1}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity === item.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item__actions">
                    <strong>₹{item.quantity * item.price}</strong>
                    <button onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="cart-summary">
              <div className="cart-summary__row">
                <span>Subtotal ({selectedItems.length} items)</span>
                <strong>₹{cartTotal.toFixed(2)}</strong>
              </div>
              <div className="cart-summary__row">
                <span>Delivery Charge</span>
                <strong className={deliveryCharge === 0 ? "text-success" : ""}>
                  {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                </strong>
              </div>
              {deliveryCharge > 0 && cartTotal > 0 && (
                <div className="cart-summary__note">
                  <small>💡 Add ₹{(500 - cartTotal).toFixed(0)} more for FREE delivery!</small>
                </div>
              )}
              {deliveryCharge === 0 && cartTotal > 0 && (
                <div className="cart-summary__note cart-summary__note--success">
                  <small>🎉 You got FREE delivery!</small>
                </div>
              )}
              <div className="cart-summary__row cart-summary__row--total">
                <span>Grand Total</span>
                <strong>₹{finalTotal.toFixed(2)}</strong>
              </div>
              <button
                className="btn-primary cart-summary__cta"
                onClick={handleBuyNow}
                disabled={selectedItems.length === 0}
              >
                Buy Now
              </button>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

