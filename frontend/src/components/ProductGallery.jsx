import { useState, useEffect, useCallback, useRef } from "react";
import "../styles/ProductGallery.css";
import { optimizeImageUrl } from "../utils/imageUtils";

/**
 * ProductGallery
 * Props:
 *   product  — full product object (imageUrl, images JSON string, videoUrl)
 *   className — optional extra class
 */
export default function ProductGallery({ product, className = "" }) {
  // Build the ordered list of media items
  const buildMedia = useCallback(() => {
    const items = [];

    // Parse images JSON array first
    let imageUrls = [];
    if (product.images) {
      try {
        imageUrls = JSON.parse(product.images);
      } catch {
        imageUrls = [];
      }
    }
    // Fallback to single imageUrl if no gallery
    if (imageUrls.length === 0 && product.imageUrl) {
      imageUrls = [product.imageUrl];
    }

    imageUrls.forEach((url) => {
      if (url) items.push({ type: "image", url });
    });

    // Video goes at the end
    if (product.videoUrl) {
      items.push({ type: "video", url: product.videoUrl });
    }

    return items;
  }, [product]);

  const [media, setMedia]           = useState(() => buildMedia());
  const [activeIdx, setActiveIdx]   = useState(0);
  const [lightboxOpen, setLightbox] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const autoplayRef = useRef(null);

  // Rebuild when product changes
  useEffect(() => {
    setMedia(buildMedia());
    setActiveIdx(0);
  }, [buildMedia]);

  // Auto-slide every 3.5 s (images only, not video)
  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setActiveIdx((prev) => {
        const imageCount = media.filter((m) => m.type === "image").length;
        const next = (prev + 1) % (imageCount > 0 ? imageCount : media.length);
        return next;
      });
    }, 3500);
  }, [media]);

  useEffect(() => {
    if (media.length > 1) startAutoplay();
    return () => clearInterval(autoplayRef.current);
  }, [media, startAutoplay]);

  const stopAutoplay = () => clearInterval(autoplayRef.current);

  const goTo = (idx) => {
    setActiveIdx(idx);
    stopAutoplay();
    startAutoplay();
  };

  const prev = () => goTo((activeIdx - 1 + media.length) % media.length);
  const next = () => goTo((activeIdx + 1) % media.length);

  // Lightbox keyboard
  useEffect(() => {
    if (!lightboxOpen) return;
    const handle = (e) => {
      if (e.key === "Escape")      setLightbox(false);
      if (e.key === "ArrowRight")  setLightboxIdx((i) => (i + 1) % media.length);
      if (e.key === "ArrowLeft")   setLightboxIdx((i) => (i - 1 + media.length) % media.length);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [lightboxOpen, media.length]);

  const openLightbox = (idx) => {
    setLightboxIdx(idx);
    setLightbox(true);
    stopAutoplay();
  };

  const closeLightbox = () => {
    setLightbox(false);
    startAutoplay();
  };

  if (media.length === 0) return null;

  const current = media[activeIdx] || media[0];

  return (
    <div className={`pg-gallery ${className}`}>
      {/* ── Main viewer ─────────────────────────────────────────────────── */}
      <div className="pg-main-viewer">
        {current.type === "image" ? (
          <img
            key={current.url}
            src={optimizeImageUrl(current.url, 1200)}
            alt="Product"
            className="pg-main-image pg-fade-in"
            onClick={() => openLightbox(activeIdx)}
            title="Click to zoom"
          />
        ) : (
          <video
            key={current.url}
            src={current.url}
            className="pg-main-video"
            controls
            playsInline
          />
        )}

        {/* Zoom hint for images */}
        {current.type === "image" && (
          <span className="pg-zoom-hint" onClick={() => openLightbox(activeIdx)}>
            🔍 Zoom
          </span>
        )}

        {/* Arrows */}
        {media.length > 1 && (
          <>
            <button className="pg-arrow pg-arrow--left"  onClick={prev} aria-label="Previous">‹</button>
            <button className="pg-arrow pg-arrow--right" onClick={next} aria-label="Next">›</button>
          </>
        )}
      </div>

      {/* ── Thumbnails ──────────────────────────────────────────────────── */}
      {media.length > 1 && (
        <div className="pg-thumbnails">
          {media.map((item, i) => (
            <button
              key={i}
              className={`pg-thumb ${i === activeIdx ? "pg-thumb--active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`View media ${i + 1}`}
            >
              {item.type === "image" ? (
                <img src={optimizeImageUrl(item.url, 200)} alt={`Thumbnail ${i + 1}`} />
              ) : (
                <span className="pg-thumb-video-icon">▶ Video</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Dot indicators ──────────────────────────────────────────────── */}
      {media.length > 1 && (
        <div className="pg-dots">
          {media.map((_, i) => (
            <button
              key={i}
              className={`pg-dot ${i === activeIdx ? "pg-dot--active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div className="pg-lightbox" onClick={closeLightbox}>
          <div
            className="pg-lightbox__content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="pg-lightbox__close" onClick={closeLightbox}>✕</button>

            {media.length > 1 && (
              <button
                className="pg-lightbox__arrow pg-lightbox__arrow--left"
                onClick={() => setLightboxIdx((i) => (i - 1 + media.length) % media.length)}
              >
                ‹
              </button>
            )}

            {media[lightboxIdx]?.type === "image" ? (
              <img
                src={optimizeImageUrl(media[lightboxIdx].url, 1600)}
                alt="Zoomed product"
                className="pg-lightbox__image"
              />
            ) : (
              <video
                src={media[lightboxIdx]?.url}
                className="pg-lightbox__video"
                controls
                autoPlay
                playsInline
              />
            )}

            {media.length > 1 && (
              <button
                className="pg-lightbox__arrow pg-lightbox__arrow--right"
                onClick={() => setLightboxIdx((i) => (i + 1) % media.length)}
              >
                ›
              </button>
            )}

            <div className="pg-lightbox__counter">
              {lightboxIdx + 1} / {media.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
