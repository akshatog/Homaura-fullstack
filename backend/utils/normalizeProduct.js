/**
 * Ensures product.imageUrl is populated from the images gallery when missing.
 */
export function normalizeProduct(product) {
  if (!product) return product;

  let primary = product.imageUrl?.trim() || "";

  if (!primary && product.images) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed[0]) {
        primary = String(parsed[0]).trim();
      }
    } catch {
      /* ignore */
    }
  }

  return { ...product, imageUrl: primary };
}

export function normalizeProducts(products) {
  return products.map(normalizeProduct);
}
