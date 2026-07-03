import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import './add-product.css';

const MAX_IMAGES = 5;

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });

  // Multi-image state: array of { file, preview }
  const [images, setImages] = useState([]);
  // Video state: { file, preview }
  const [video, setVideo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const imageInputRef = useRef();
  const videoInputRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Images ─────────────────────────────────────────────────────────────────
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...toAdd]);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // ── Video ───────────────────────────────────────────────────────────────────
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (video) URL.revokeObjectURL(video.preview);
    setVideo({ file, preview: URL.createObjectURL(file) });
    e.target.value = '';
  };

  const removeVideo = () => {
    if (video) URL.revokeObjectURL(video.preview);
    setVideo(null);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/'); return; }

      const fd = new FormData();
      fd.append('name',        formData.name);
      fd.append('description', formData.description);
      fd.append('price',       formData.price);
      fd.append('stock',       formData.stock);
      fd.append('category',    formData.category);

      images.forEach(({ file }) => fd.append('images', file));
      if (video) fd.append('video', video.file);

      await api.post('/products', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      navigate('/admin/products');
    } catch (err) {
      console.error('Add product error:', err);
      setError(err.response?.data?.error || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <header className="add-product-header">
        <Link to="/admin/products" className="btn-back">← Back to Products</Link>
        <h1>➕ Add New Product</h1>
      </header>

      <div className="add-product-container">
        <div className="form-card">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="product-form">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input type="text" id="name" name="name" value={formData.name}
                onChange={handleChange} placeholder="Enter product name" required />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea id="description" name="description" value={formData.description}
                onChange={handleChange} placeholder="Describe your product..." rows="4" required />
            </div>

            {/* Price + Stock */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (₹) *</label>
                <input type="number" id="price" name="price" value={formData.price}
                  onChange={handleChange} placeholder="0.00" min="0" step="0.01" required />
              </div>
              <div className="form-group">
                <label htmlFor="stock">Stock Quantity *</label>
                <input type="number" id="stock" name="stock" value={formData.stock}
                  onChange={handleChange} placeholder="0" min="0" required />
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select id="category" name="category" value={formData.category}
                onChange={handleChange} required>
                <option value="">Select a category</option>
                <option value="Home Decor">Home Decor</option>
                <option value="Personalized">Personalized</option>
                <option value="Hampers">Hampers</option>
                <option value="Gifts for Her">Gifts for Her</option>
                <option value="Gifts for Him">Gifts for Him</option>
                <option value="Birthday">Birthday</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Festive Gifts">Festive Gifts</option>
                <option value="Luxury Gifts">Luxury Gifts</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* ── Images Section ─────────────────────────────────────────── */}
            <div className="form-group">
              <label>
                Product Photos
                <span className="form-hint"> (up to {MAX_IMAGES}, first photo = cover)</span>
              </label>

              {images.length > 0 && (
                <div className="ap-image-grid">
                  {images.map((img, i) => (
                    <div key={i} className={`ap-image-thumb ${i === 0 ? 'ap-image-thumb--cover' : ''}`}>
                      <img src={img.preview} alt={`Preview ${i + 1}`} />
                      {i === 0 && <span className="ap-cover-badge">Cover</span>}
                      <button type="button" className="ap-remove-btn"
                        onClick={() => removeImage(i)} title="Remove">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {images.length < MAX_IMAGES && (
                <>
                  <button type="button" className="ap-upload-btn"
                    onClick={() => imageInputRef.current?.click()}>
                    📸 {images.length === 0 ? 'Add Photos' : `Add More (${images.length}/${MAX_IMAGES})`}
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    style={{ display: 'none' }}
                  />
                </>
              )}
            </div>

            {/* ── Video Section ──────────────────────────────────────────── */}
            <div className="form-group">
              <label>
                Product Video
                <span className="form-hint"> (optional — mp4 / webm / mov)</span>
              </label>

              {video ? (
                <div className="ap-video-preview">
                  <video src={video.preview} controls className="ap-video-player" />
                  <button type="button" className="ap-remove-btn ap-remove-btn--video"
                    onClick={removeVideo}>✕ Remove Video</button>
                </div>
              ) : (
                <>
                  <button type="button" className="ap-upload-btn"
                    onClick={() => videoInputRef.current?.click()}>
                    🎥 Add Product Video
                  </button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    style={{ display: 'none' }}
                  />
                </>
              )}
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}