/**
 * Product image utilities — URL resolution, optimization, and fallbacks.
 */

export const PLACEHOLDER_IMAGE = '/images/product-placeholder.svg';

export const IMAGE_SIZES = {
  thumb: 120,
  card: 480,
  gallery: 1200,
  lightbox: 1600,
  cart: 180,
  checkout: 120,
  search: 96,
};

/** Returns true if the string looks like a usable image URL or path */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return false;
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  );
};

/** Collect all image URLs from a product object (imageUrl + images JSON) */
export const parseProductImages = (product) => {
  if (!product) return [];

  const urls = [];

  if (product.images) {
    try {
      const parsed =
        typeof product.images === 'string'
          ? JSON.parse(product.images)
          : product.images;
      if (Array.isArray(parsed)) {
        parsed.forEach((u) => {
          if (isValidImageUrl(u) && !urls.includes(u.trim())) {
            urls.push(u.trim());
          }
        });
      }
    } catch {
      /* ignore malformed JSON */
    }
  }

  if (isValidImageUrl(product.imageUrl)) {
    const primary = product.imageUrl.trim();
    if (!urls.includes(primary)) {
      urls.unshift(primary);
    }
  }

  return urls;
};

/** Resolve the primary display URL for a product (may still 404 at runtime) */
export const getProductImageUrl = (product, width = 'auto') => {
  const urls = parseProductImages(product);
  if (urls.length === 0) return PLACEHOLDER_IMAGE;
  return optimizeImageUrl(urls[0], width);
};

/** Ordered candidate URLs for img onError fallback chain */
export const getProductImageCandidates = (product, width = 'auto') => {
  const raw = parseProductImages(product);
  const optimized = raw.map((u) => optimizeImageUrl(u, width));
  const unique = [...new Set(optimized.filter(Boolean))];

  if (unique.length === 0) return [PLACEHOLDER_IMAGE];
  return unique;
};

/**
 * Optimizes Cloudinary image URLs for sharp, consistent delivery.
 * Non-Cloudinary URLs (Unsplash, etc.) are returned unchanged.
 */
export const optimizeImageUrl = (url, width = 'auto') => {
  if (!url || typeof url !== 'string') return PLACEHOLDER_IMAGE;
  const trimmed = url.trim();
  if (!isValidImageUrl(trimmed)) return PLACEHOLDER_IMAGE;

  if (!trimmed.includes('res.cloudinary.com')) return trimmed;

  const uploadMarker = '/upload/';
  const uploadIdx = trimmed.indexOf(uploadMarker);
  if (uploadIdx === -1) return trimmed;

  const base = trimmed.slice(0, uploadIdx + uploadMarker.length);
  let assetPath = trimmed.slice(uploadIdx + uploadMarker.length);

  while (assetPath.includes('/')) {
    const segment = assetPath.split('/')[0];
    const isTransform =
      segment.includes(',') ||
      /^(f_|q_|w_|h_|c_|dpr_|g_|e_)/.test(segment);
    if (!isTransform) break;
    assetPath = assetPath.slice(segment.length + 1);
  }

  const transforms =
    width === 'auto'
      ? 'f_auto,q_auto:best,dpr_auto'
      : `f_auto,q_auto:best,dpr_auto,c_fill,g_auto,w_${width}`;

  return `${base}${transforms}/${assetPath}`;
};

/** Resolve image URL from a cart/order item that may nest product data */
export const getItemImageUrl = (item, width = 'auto') => {
  if (!item) return PLACEHOLDER_IMAGE;

  if (isValidImageUrl(item.imageUrl)) {
    return optimizeImageUrl(item.imageUrl.trim(), width);
  }

  if (item.product) {
    return getProductImageUrl(item.product, width);
  }

  return PLACEHOLDER_IMAGE;
};

/** Build candidate list for cart/order items */
export const getItemImageCandidates = (item, width = 'auto') => {
  if (item?.product) {
    return getProductImageCandidates(item.product, width);
  }
  if (isValidImageUrl(item?.imageUrl)) {
    return [optimizeImageUrl(item.imageUrl.trim(), width), PLACEHOLDER_IMAGE];
  }
  return [PLACEHOLDER_IMAGE];
};
