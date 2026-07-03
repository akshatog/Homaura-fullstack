import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useOrders } from "../hooks/useOrders.js";
import api from "../utils/api";
import ProductImage from "../components/ProductImage";
import { IMAGE_SIZES } from "../utils/imageUtils";
import "../styles/Checkout.css";

const emptyDetails = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Checkout() {
  const { selectedItems, cartTotal, deliveryCharge, finalTotal, removeSelectedItems } = useCart();
  const { createOrder } = useOrders();
  const [details, setDetails] = useState(emptyDetails);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const [showPlaceOrder, setShowPlaceOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [allowEmptyRedirect, setAllowEmptyRedirect] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const userId = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      return stored.id || null;
    } catch {
      return null;
    }
  }, []);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login", {
        state: { from: location },
        replace: true
      });
    }
  }, [userId, token, navigate, location]);

  useEffect(() => {
    if (userId && token) {
      api
        .get("/addresses", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setSavedAddresses(res.data);
          if (res.data.length > 0) {

            const recent = res.data[0];
            setSelectedAddressId(recent.id);
            setDetails({
              fullName: recent.fullName,
              phone: recent.phone,
              email: recent.email,
              address: recent.address,
              city: recent.city,
              state: recent.state,
              pincode: recent.pincode,
            });
          }
        })
        .catch((err) => console.error("Failed to fetch addresses", err));
    }
  }, [userId, token]);

  const storageKey = useMemo(
    () => (userId ? `presento-customer-${userId}` : "presento-customer-guest"),
    [userId]
  );

  useEffect(() => {
    if (!allowEmptyRedirect) {
      return;
    }
    if (!selectedItems.length) {
      navigate("/cart", { replace: true });
      return;
    }

    if (selectedAddressId === "new") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setDetails({ ...emptyDetails, ...parsed });
        }
      } catch {

      }
    }
    setLoading(false);
  }, [selectedItems.length, navigate, storageKey, allowEmptyRedirect, selectedAddressId]);

  useEffect(() => {
    if (!loading && selectedAddressId === "new") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(details));
      } catch {

      }
    }
  }, [details, loading, storageKey, selectedAddressId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
    if (selectedAddressId !== "new") {
      setSelectedAddressId("new");
    }
  };

  const handleAddressSelect = (e) => {
    const id = e.target.value;
    setSelectedAddressId(id);
    if (id === "new") {
      setDetails(emptyDetails);
    } else {
      const addr = savedAddresses.find((a) => a.id === parseInt(id));
      if (addr) {
        setDetails({
          fullName: addr.fullName,
          phone: addr.phone,
          email: addr.email,
          address: addr.address,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
        });
      }
    }
  };

  const validateDetails = () => {
    if (
      !details.fullName.trim() ||
      !details.phone.trim() ||
      !details.email.trim() ||
      !details.address.trim() ||
      !details.city.trim() ||
      !details.state.trim() ||
      !details.pincode.trim()
    ) {
      setError("Please fill in all customer details before continuing.");
      return false;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(details.phone.replace(/\s+/g, ""))) {
      setError("Please enter a valid 10-digit Indian mobile number (starting with 6–9).");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(details.email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }

    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(details.pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
      return false;
    }

    setError("");
    return true;
  };

  const handleContinue = () => {
    if (!validateDetails()) return;
    setShowPlaceOrder(true);
  };

  const handlePlaceOrder = async () => {
    if (!validateDetails() || submitting) return;
    if (!userId) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    setError("");

    try {

      if (selectedAddressId === "new") {
        await api.post(
          "/addresses",
          details,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const orderItems = selectedItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      await createOrder(userId, orderItems, { customerDetails: details });
      setAllowEmptyRedirect(false);
      removeSelectedItems();
      navigate("/orders", {
        replace: true,
        state: {
          successMessage: "Your order has been placed successfully!",
          fromCheckout: true,
        },
      });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Failed to place order. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-loading">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <div>
          <p>Review & confirm</p>
          <h1>Order Summary</h1>
        </div>
        <button className="btn-ghost" onClick={() => navigate("/cart")}>
          ← Back to Cart
        </button>
      </header>

      {error && <div className="checkout-alert">{error}</div>}

      <div className="checkout-layout">
        <section className="checkout-summary">
          <h2>Items in your cart</h2>
          <div className="checkout-items">
              {selectedItems.map((item) => (
                <div key={item.id} className="checkout-item">
                  <div className="checkout-item-main">
                    <ProductImage item={item} width={IMAGE_SIZES.checkout} alt={item.name} />
                    <div>
                      <h3>{item.name}</h3>
                      <p className="checkout-item-meta">
                        Qty: <strong>{item.quantity}</strong> × ₹{item.price}
                      </p>
                    </div>
                  </div>
                  <div className="checkout-item-total">
                    ₹{item.quantity * item.price}
                  </div>
                </div>
              ))}
          </div>
          <div className="checkout-totals">
            <div className="checkout-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="checkout-row">
              <span>Delivery Charge</span>
              <span className={deliveryCharge === 0 ? "text-success" : ""}>
                {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
              </span>
            </div>
            {deliveryCharge === 0 && cartTotal > 0 && (
              <div className="checkout-note checkout-note--success">
                <small>🎉 Free delivery on orders above ₹499!</small>
              </div>
            )}
            <div className="checkout-row checkout-row-total">
              <span>Grand Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <section className="checkout-details">
          <h2>Customer Details</h2>
          <p className="checkout-details-sub">
            We&apos;ll use these details for delivery and order updates.
          </p>

          {userId && savedAddresses.length > 0 && (
            <div className="checkout-field" style={{ marginBottom: "1.5rem" }}>
              <label>Select Saved Address</label>
              <select
                value={selectedAddressId}
                onChange={handleAddressSelect}
                className="checkout-select"
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  border: "1px solid var(--gray-200)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.95rem",
                  background: "var(--gray-50)",
                }}
              >
                {savedAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.fullName} - {addr.address}, {addr.city}
                  </option>
                ))}
                <option value="new">+ Add New Address</option>
              </select>
            </div>
          )}

          <form
            className={`checkout-form ${showPlaceOrder ? "checkout-form-locked" : ""
              }`}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="checkout-grid">
              <div className="checkout-field">
                <label>Full Name</label>
                <input
                  name="fullName"
                  value={details.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="checkout-field">
                <label>Mobile Number</label>
                <input
                  name="phone"
                  value={details.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98XXXXXX"
                />
              </div>
            </div>

            <div className="checkout-field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={details.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div className="checkout-field">
              <label>Address</label>
              <textarea
                name="address"
                rows={3}
                value={details.address}
                onChange={handleChange}
                placeholder="House / Flat, Street, Area"
              />
            </div>

            <div className="checkout-grid">
              <div className="checkout-field">
                <label>City</label>
                <input
                  name="city"
                  value={details.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>
              <div className="checkout-field">
                <label>State</label>
                <input
                  name="state"
                  value={details.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>
              <div className="checkout-field">
                <label>Pincode</label>
                <input
                  name="pincode"
                  value={details.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                />
              </div>
            </div>
          </form>

          {!showPlaceOrder ? (
            <button className="btn-primary checkout-cta" onClick={handleContinue}>
              Continue
            </button>
          ) : (
            <button
              className="btn-primary checkout-cta"
              onClick={handlePlaceOrder}
              disabled={submitting}
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
