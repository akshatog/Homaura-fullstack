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
      {/* Breadcrumb */}
      <div className="ha-breadcrumbs" style={{marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--gray-500)', display: 'flex', gap: '0.5rem'}}>
        <span style={{cursor:'pointer'}} onClick={() => navigate('/')}>Home</span>
        <span>/</span>
        <span>Cart</span>
      </div>

      <section className="cart-header">
        <h1>My Cart ({items.length})</h1>
        <div className="cart-header-actions">
          <button className="btn-ghost" onClick={() => navigate("/shop")}>
            Continue Shopping
          </button>
          <button
            className="btn-primary"
            onClick={handleBuyNow}
            disabled={selectedItems.length === 0}
          >
            Proceed to Checkout →
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
              <h2>Order Summary</h2>
              <div className="cart-summary__row">
                <span>Subtotal</span>
                <strong>₹{cartTotal.toFixed(2)}</strong>
              </div>
              <div className="cart-summary__row">
                <span>Delivery</span>
                <strong className={deliveryCharge === 0 ? "text-success" : ""}>
                  {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                </strong>
              </div>
              {deliveryCharge > 0 && cartTotal > 0 && (
                <div className="cart-summary__note">
                  <small>Add ₹{(500 - cartTotal).toFixed(0)} more for FREE delivery</small>
                </div>
              )}
              {deliveryCharge === 0 && cartTotal > 0 && (
                <div className="cart-summary__note cart-summary__note--success">
                  <small>🎉 You qualify for FREE delivery!</small>
                </div>
              )}
              <div className="cart-summary__row cart-summary__row--total">
                <span>Total</span>
                <strong>₹{finalTotal.toFixed(2)}</strong>
              </div>
              <button
                className="cart-summary__cta"
                onClick={handleBuyNow}
                disabled={selectedItems.length === 0}
              >
                Proceed to Checkout →
              </button>

              {/* Trust icons */}
              <div className="cart-trust">
                <div className="cart-trust__item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <div className="cart-trust__text">
                    <strong>SECURE CHECKOUT</strong>
                    <span>100% secure &amp; trusted checkout</span>
                  </div>
                </div>
                <div className="cart-trust__item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  <div className="cart-trust__text">
                    <strong>7 DAYS RETURNS</strong>
                    <span>Hassle-free returns within 7 days</span>
                  </div>
                </div>
                <div className="cart-trust__item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  <div className="cart-trust__text">
                    <strong>COD AVAILABLE</strong>
                    <span>Pay safely on delivery</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

