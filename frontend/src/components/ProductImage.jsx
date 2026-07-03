import React, { useMemo, useState, useCallback } from 'react';
import {
  PLACEHOLDER_IMAGE,
  getProductImageCandidates,
  getItemImageCandidates,
} from '../utils/imageUtils';

/**
 * Renders a product image with automatic fallback:
 * tries each candidate URL on error, then shows a clean placeholder.
 */
export default function ProductImage({
  product,
  item,
  width = 'auto',
  alt = 'Product',
  className = '',
  loading = 'lazy',
  ...props
}) {
  const candidates = useMemo(() => {
    let list = [];
    if (product) list = getProductImageCandidates(product, width);
    else if (item) list = getItemImageCandidates(item, width);
    return [...list, PLACEHOLDER_IMAGE];
  }, [product, item, width]);

  const [index, setIndex] = useState(0);
  const src = candidates[Math.min(index, candidates.length - 1)];

  const handleError = useCallback(() => {
    setIndex((prev) => Math.min(prev + 1, candidates.length - 1));
  }, [candidates.length]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={handleError}
      {...props}
    />
  );
}
