import React, { useState } from "react";
import api from "../utils/api";
import "../styles/OrderTrackingModal.css";

export default function OrderTrackingModal({ isOpen, onClose }) {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const handleSearchOrder = async () => {
    if (!orderId.trim()) {
      setError("Please enter an Order ID");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!order) return;

    setUpdatingStatus(newStatus);
    setError("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await api.put(
        `/orders/${order.id}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrder(res.data);
      setSuccessMessage(`Order status updated to ${newStatus.toUpperCase()}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleReset = () => {
    setOrderId("");
    setOrder(null);
    setError("");
    setSuccessMessage("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📦 Track Order</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-body">
          {!order ? (
            <div className="search-section">
              <label htmlFor="order-id">Order ID</label>
              <div className="search-input-group">
                <input
                  id="order-id"
                  type="text"
                  placeholder="Enter Order ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchOrder()}
                  disabled={loading}
                />
                <button
                  onClick={handleSearchOrder}
                  disabled={loading || !orderId.trim()}
                  className="btn-search"
                >
                  {loading ? "🔍..." : "🔍"}
                </button>
              </div>
            </div>
          ) : null}

          {error && <div className="message-error">{error}</div>}
          {successMessage && <div className="message-success">{successMessage}</div>}

          {order && (
            <div className="order-details">
              <div className="order-header">
                <h3>Order #{order.id}</h3>
                <button className="btn-back" onClick={handleReset}>← Back</button>
              </div>

              <div className="order-info">
                <div className="info-item">
                  <label>Customer</label>
                  <p>{order.user.name}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{order.user.email}</p>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <p className={`status-badge status-${order.status}`}>
                    {order.status.toUpperCase().replace(/_/g, " ")}
                  </p>
                </div>
                <div className="info-item">
                  <label>Message</label>
                  <p className="message-text">{order.message}</p>
                </div>
              </div>

              <div className="admin-actions">
                <h4>Update Status</h4>
                <div className="action-buttons">
                  <button
                    onClick={() => handleUpdateStatus("placed")}
                    disabled={updatingStatus !== null || order.status === "cancelled"}
                    className="btn-action btn-placed"
                  >
                    ✓ Order Confirmed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("ready")}
                    disabled={updatingStatus !== null || order.status === "cancelled"}
                    className="btn-action btn-ready"
                  >
                    ✓ Order Ready
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("out_for_delivery")}
                    disabled={updatingStatus !== null || order.status === "cancelled"}
                    className="btn-action btn-delivery"
                  >
                    ✓ Out for Delivery
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("delivered")}
                    disabled={updatingStatus !== null || order.status === "cancelled"}
                    className="btn-action btn-delivered"
                  >
                    ✓ Delivered
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt("Enter cancellation reason (optional):");
                      if (reason !== null) {
                        handleUpdateStatus("cancelled");
                      }
                    }}
                    disabled={updatingStatus !== null || order.status === "cancelled" || order.status === "delivered"}
                    className="btn-action btn-cancel"
                  >
                    ❌ Cancel Order
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
