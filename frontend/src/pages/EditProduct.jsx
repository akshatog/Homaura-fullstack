import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api, { updateProduct } from '../utils/api';
import '../styles/AddProductForm.css';
import '../styles/Admin.css';

const MAX_IMAGES = 5;

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        shortDescription: "",
        price: "",
        stock: "",
        category: "Personalized",
        badge: "",
        discount: "",
        sku: "",
        isFeatured: false,
    });

    // Existing images already on Cloudinary (URLs as strings)
    const [existingImages, setExistingImages] = useState([]);
    // New image files picked by admin (array of { file, preview })
    const [newImages, setNewImages] = useState([]);
    // Existing video URL (string or null)
    const [existingVideo, setExistingVideo] = useState(null);
    // New video file picked by admin
    const [newVideo, setNewVideo] = useState(null);
    // Whether admin wants to clear the existing video
    const [clearVideo, setClearVideo] = useState(false);

    const [loading, setLoading]       = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState("");
    const [success, setSuccess]       = useState("");

    const imageInputRef = useRef();
    const videoInputRef = useRef();

    // ── Load product ─────────────────────────────────────────────────────────
    useEffect(() => {
        async function fetchProduct() {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }

                const { data: product } = await api.get(`/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setFormData({
                    name:             product.name             || "",
                    description:      product.description      || "",
                    shortDescription: product.shortDescription || "",
                    price:            product.price            || "",
                    stock:            product.stock            || "",
                    category:         product.category         || "Personalized",
                    badge:            product.badge            || "",
                    discount:         product.discount         || "",
                    sku:              product.sku              || "",
                    isFeatured:       product.isFeatured       || false,
                });

                // Parse existing images JSON
                if (product.images) {
                    try {
                        const parsed = JSON.parse(product.images);
                        setExistingImages(Array.isArray(parsed) ? parsed : []);
                    } catch {
                        setExistingImages(product.imageUrl ? [product.imageUrl] : []);
                    }
                } else if (product.imageUrl) {
                    setExistingImages([product.imageUrl]);
                }

                setExistingVideo(product.videoUrl || null);
            } catch (err) {
                console.error('Fetch product error:', err);
                setError('Failed to load product');
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [id, navigate]);

    // ── Form field change ────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const generateSKU = () => {
        const lastSKU = localStorage.getItem('lastSKU') || '1000';
        const nextSKU = (parseInt(lastSKU) + 1).toString();
        localStorage.setItem('lastSKU', nextSKU);
        setFormData(prev => ({ ...prev, sku: nextSKU }));
    };

    // ── Image handling ───────────────────────────────────────────────────────
    const totalImages = existingImages.length + newImages.length;

    const handleNewImagesChange = (e) => {
        const files = Array.from(e.target.files || []);
        const remaining = MAX_IMAGES - totalImages;
        const toAdd = files.slice(0, remaining).map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setNewImages(prev => [...prev, ...toAdd]);
        e.target.value = '';
    };

    const removeExistingImage = (idx) => {
        setExistingImages(prev => prev.filter((_, i) => i !== idx));
    };

    const removeNewImage = (idx) => {
        setNewImages(prev => {
            URL.revokeObjectURL(prev[idx].preview);
            return prev.filter((_, i) => i !== idx);
        });
    };

    // ── Video handling ───────────────────────────────────────────────────────
    const handleNewVideoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (newVideo) URL.revokeObjectURL(newVideo.preview);
        setNewVideo({ file, preview: URL.createObjectURL(file) });
        setClearVideo(false);
        e.target.value = '';
    };

    const handleClearVideo = () => {
        if (newVideo) { URL.revokeObjectURL(newVideo.preview); setNewVideo(null); }
        setClearVideo(true);
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");

        if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.stock) {
            setError("Please fill in all required fields"); return;
        }
        if (isNaN(formData.price) || isNaN(formData.stock)) {
            setError("Price and Stock must be valid numbers"); return;
        }
        if (parseFloat(formData.price) < 1) {
            setError("Price must be at least ₹1"); return;
        }
        if (parseInt(formData.stock) < 0) {
            setError("Stock must be non-negative"); return;
        }
        if (formData.discount && (formData.discount < 0 || formData.discount > 100)) {
            setError("Discount must be between 0 and 100"); return;
        }

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("name",        formData.name);
            fd.append("description", formData.description);
            if (formData.shortDescription) fd.append("shortDescription", formData.shortDescription);
            fd.append("price",       parseFloat(formData.price));
            fd.append("stock",       parseInt(formData.stock));
            fd.append("category",    formData.category);
            if (formData.badge)     fd.append("badge",     formData.badge);
            if (formData.discount)  fd.append("discount",  parseInt(formData.discount));
            if (formData.sku)       fd.append("sku",       formData.sku);
            fd.append("isFeatured", formData.isFeatured);

            // Existing image URLs the admin wants to keep
            fd.append("keepImages", JSON.stringify(existingImages));

            // New image files
            newImages.forEach(({ file }) => fd.append("images", file));

            // Video
            if (newVideo) {
                fd.append("video", newVideo.file);
            }
            if (clearVideo) {
                fd.append("clearVideo", "true");
            }

            await updateProduct(id, fd);
            setSuccess("✓ Product updated successfully!");
            setTimeout(() => navigate('/admin/products'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update product");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-page__inner admin-loading">
                    <div className="admin-spinner" />
                    <span>Loading product...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-form-page">
                <div className="add-product-form">
            <div className="form-header">
                <Link to="/admin/products" className="btn-back-link">← Back to Products</Link>
                <span className="admin-eyebrow">HomAura Admin</span>
                <h2>Edit Product</h2>
            </div>

            {error   && <div className="message-error">{error}</div>}
            {success && <div className="message-success">{success}</div>}

            <form onSubmit={handleSubmit}>
                {/* ── Product Information ──────────────────────────────────── */}
                <div className="form-section">
                    <h3>Product Information</h3>

                    <div className="form-group">
                        <label htmlFor="name">Product Name *</label>
                        <input id="name" type="text" name="name"
                            placeholder="e.g., Luxury Home Decor Set"
                            value={formData.name} onChange={handleInputChange} disabled={submitting} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category *</label>
                        <select id="category" name="category"
                            value={formData.category} onChange={handleInputChange} disabled={submitting}>
                            <option value="Personalized">Personalized</option>
                            <option value="Hampers">Hampers</option>
                            <option value="Gifts for Her">Gifts for Her</option>
                            <option value="Gifts for Him">Gifts for Him</option>
                            <option value="Kids Gifts">Kids Gifts</option>
                            <option value="Couple Gifts">Couple Gifts</option>
                            <option value="Romantic">Romantic</option>
                            <option value="Birthday">Birthday</option>
                            <option value="Anniversary">Anniversary</option>
                            <option value="Home Decor">Home Decor</option>
                            <option value="Festive Gifts">Festive Gifts</option>
                            <option value="Luxury Gifts">Luxury Gifts</option>
                            <option value="Accessories">Accessories</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="shortDescription">Short Description (Optional)</label>
                        <textarea id="shortDescription" name="shortDescription"
                            placeholder="Brief product summary for cards (max 150 characters)..."
                            value={formData.shortDescription} onChange={handleInputChange}
                            disabled={submitting} rows="2" maxLength="150" />
                        <small style={{ color: '#666', fontSize: '12px' }}>
                            {formData.shortDescription.length}/150 characters
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Full Description *</label>
                        <textarea id="description" name="description"
                            placeholder="Describe your product..."
                            value={formData.description} onChange={handleInputChange}
                            disabled={submitting} rows="4" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="price">Price (₹) *</label>
                            <input id="price" type="number" name="price" placeholder="9999"
                                value={formData.price} onChange={handleInputChange}
                                disabled={submitting} step="1" min="1" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="discount">Discount % (Optional)</label>
                            <input id="discount" type="number" name="discount" placeholder="0"
                                value={formData.discount} onChange={handleInputChange}
                                disabled={submitting} min="0" max="100" step="1" />
                            {formData.price && formData.discount && (
                                <small style={{ color: '#2e7d32', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    Final Price: ₹{Math.round(formData.price * (1 - formData.discount / 100))}
                                </small>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="stock">Stock Quantity *</label>
                            <input id="stock" type="number" name="stock" placeholder="10"
                                value={formData.stock} onChange={handleInputChange}
                                disabled={submitting} min="0" step="1" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="sku">Order ID (Auto-generated)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input id="sku" type="text" name="sku"
                                    placeholder="Auto-generated: 1001, 1002..."
                                    value={formData.sku} onChange={handleInputChange}
                                    disabled={submitting} style={{ flex: 1 }} readOnly />
                                <button type="button" onClick={generateSKU}
                                    disabled={submitting} className="btn-generate-sku">Generate</button>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="badge">Tag (Optional)</label>
                            <select id="badge" name="badge"
                                value={formData.badge} onChange={handleInputChange} disabled={submitting}>
                                <option value="">No Tag</option>
                                <option value="Best Seller">Best Seller</option>
                                <option value="Trending">Trending</option>
                                <option value="Popular">Popular</option>
                                <option value="Limited Edition">Limited Edition</option>
                                <option value="New Arrival">New Arrival</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="isFeatured" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                <input id="isFeatured" type="checkbox" name="isFeatured"
                                    checked={formData.isFeatured} onChange={handleInputChange}
                                    disabled={submitting} style={{ width: "auto", margin: 0 }} />
                                <span>Featured on Home Page</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* ── Photos Section ───────────────────────────────────────── */}
                <div className="form-section">
                    <h3>📸 Product Photos</h3>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                        Up to {MAX_IMAGES} photos. First photo = cover image. Remove any photo by clicking ✕.
                    </p>

                    <div className="ep-media-grid">
                        {/* Existing images */}
                        {existingImages.map((url, i) => (
                            <div key={`existing-${i}`}
                                className={`ep-thumb ${i === 0 && newImages.length === 0 ? 'ep-thumb--cover' : ''}`}>
                                <img src={url} alt={`Existing ${i + 1}`} />
                                {i === 0 && existingImages.length + newImages.length > 0 && (
                                    <span className="ep-cover-badge">Cover</span>
                                )}
                                <button type="button" className="ep-remove-btn"
                                    onClick={() => removeExistingImage(i)}
                                    disabled={submitting} title="Remove photo">✕</button>
                            </div>
                        ))}

                        {/* New images */}
                        {newImages.map((img, i) => (
                            <div key={`new-${i}`}
                                className={`ep-thumb ep-thumb--new ${existingImages.length === 0 && i === 0 ? 'ep-thumb--cover' : ''}`}>
                                <img src={img.preview} alt={`New ${i + 1}`} />
                                {existingImages.length === 0 && i === 0 && (
                                    <span className="ep-cover-badge">Cover</span>
                                )}
                                <span className="ep-new-badge">New</span>
                                <button type="button" className="ep-remove-btn"
                                    onClick={() => removeNewImage(i)}
                                    disabled={submitting} title="Remove photo">✕</button>
                            </div>
                        ))}
                    </div>

                    {totalImages < MAX_IMAGES && (
                        <div style={{ marginTop: '12px' }}>
                            <button type="button" className="ep-upload-btn"
                                onClick={() => imageInputRef.current?.click()}
                                disabled={submitting}>
                                📸 {totalImages === 0 ? 'Add Photos' : `Add More (${totalImages}/${MAX_IMAGES})`}
                            </button>
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleNewImagesChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    )}
                    {totalImages >= MAX_IMAGES && (
                        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                            Maximum {MAX_IMAGES} photos reached. Remove one to add another.
                        </p>
                    )}
                </div>

                {/* ── Video Section ────────────────────────────────────────── */}
                <div className="form-section">
                    <h3>🎥 Product Video</h3>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                        Optional. Supported formats: mp4, webm, mov.
                    </p>

                    {/* Existing video */}
                    {existingVideo && !clearVideo && !newVideo && (
                        <div className="ep-video-container">
                            <video src={existingVideo} controls className="ep-video-player" />
                            <div className="ep-video-actions">
                                <button type="button" className="ep-upload-btn"
                                    onClick={() => videoInputRef.current?.click()}
                                    disabled={submitting}>
                                    🔄 Replace Video
                                </button>
                                <button type="button" className="ep-remove-video-btn"
                                    onClick={handleClearVideo} disabled={submitting}>
                                    🗑️ Remove Video
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Cleared state */}
                    {clearVideo && !newVideo && (
                        <div className="ep-video-cleared">
                            <p>Video will be removed on save.</p>
                            <button type="button" className="ep-upload-btn"
                                onClick={() => { setClearVideo(false); videoInputRef.current?.click(); }}
                                disabled={submitting}>
                                ↩️ Undo / Add Video Instead
                            </button>
                        </div>
                    )}

                    {/* New video preview */}
                    {newVideo && (
                        <div className="ep-video-container">
                            <video src={newVideo.preview} controls className="ep-video-player" />
                            <div className="ep-video-actions">
                                <span className="ep-new-video-label">📌 New video (not saved yet)</span>
                                <button type="button" className="ep-remove-video-btn"
                                    onClick={() => { URL.revokeObjectURL(newVideo.preview); setNewVideo(null); }}
                                    disabled={submitting}>
                                    ✕ Remove
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Upload button — shown when no video at all */}
                    {!existingVideo && !newVideo && !clearVideo && (
                        <button type="button" className="ep-upload-btn"
                            onClick={() => videoInputRef.current?.click()}
                            disabled={submitting}>
                            🎥 Add Product Video
                        </button>
                    )}

                    <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleNewVideoChange}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* ── Form actions ─────────────────────────────────────────── */}
                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/admin/products')}
                        className="btn-cancel" disabled={submitting}>Cancel</button>
                    <button type="submit" className="btn-submit" disabled={submitting}>
                        {submitting ? "Updating..." : "✓ Update Product"}
                    </button>
                </div>
            </form>
                </div>
            </div>
        </div>
    );
}
