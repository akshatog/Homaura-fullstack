
import express from "express";
import prisma from "../prisma/client.js";
import auth from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import cloudinary from "../utils/cloudinary.js";
import productMediaUpload from "../utils/productMediaUpload.js";
import validateFileTypes from "../utils/validateFileTypes.js";

const router = express.Router();

// ─── Cloudinary helpers ────────────────────────────────────────────────────────

const uploadToCloudinary = (fileBuffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(fileBuffer);
  });

/**
 * Given a req with:
 *   req.files.images[]  — new image File objects
 *   req.files.video[]   — (optional) single video File object
 *   req.body.keepImages — JSON array of existing Cloudinary URLs to keep
 *
 * Returns { imageUrl, imagesJson, videoUrl }
 */
const processProductMedia = async (req, existingImageUrl = "", existingImagesJson = null, existingVideoUrl = null) => {
  // ── Images ──────────────────────────────────────────────────────────────────
  // Start with URLs the admin explicitly wants to keep
  let keptUrls = [];
  if (req.body.keepImages) {
    try {
      keptUrls = JSON.parse(req.body.keepImages);
    } catch {
      keptUrls = [];
    }
  } else if (existingImagesJson) {
    // If no keepImages field sent (e.g. simple create), keep nothing extra
    keptUrls = [];
  }

  // Upload new images
  const newImageFiles = req.files?.images || [];
  const newImageUrls = [];
  for (const file of newImageFiles) {
    const result = await uploadToCloudinary(file.buffer, {
      folder: "presento_products",
      resource_type: "auto",
    });
    newImageUrls.push(result.secure_url);
  }

  // Merge: kept + new
  const allImageUrls = [...keptUrls, ...newImageUrls];

  // Fallback: if no images at all, keep the existing single imageUrl
  if (allImageUrls.length === 0 && existingImageUrl) {
    allImageUrls.push(existingImageUrl);
  }

  const imageUrl = allImageUrls[0] || existingImageUrl || "";
  const imagesJson = allImageUrls.length > 0 ? JSON.stringify(allImageUrls) : existingImagesJson;

  // ── Video ────────────────────────────────────────────────────────────────────
  let videoUrl = existingVideoUrl;
  const videoFiles = req.files?.video || [];
  if (videoFiles.length > 0) {
    const result = await uploadToCloudinary(videoFiles[0].buffer, {
      folder: "presento_products_videos",
      resource_type: "video",
    });
    videoUrl = result.secure_url;
  }

  // If admin explicitly cleared the video
  if (req.body.clearVideo === "true") {
    videoUrl = null;
  }

  return { imageUrl, imagesJson, videoUrl };
};

// ─── Shared product field validator ───────────────────────────────────────────

/**
 * Validates required product fields from req.body.
 * Returns an error string on failure, null on success.
 */
const validateProductFields = ({ name, price, stock, category }) => {
  if (!name || String(name).trim().length === 0) return "Product name is required";
  if (String(name).length > 255) return "Product name must be 255 characters or fewer";
  if (!category || String(category).trim().length === 0) return "Category is required";
  const priceNum = Number(price);
  if (!price || isNaN(priceNum) || priceNum <= 0) return "Price must be a positive number";
  const stockNum = Number(stock);
  if (stock === undefined || stock === null || stock === "" || isNaN(stockNum) || stockNum < 0)
    return "Stock must be a non-negative number";
  return null;
};

// ─── Routes ───────────────────────────────────────────────────────────────────

// Create product — admin only
router.post(
  "/",
  auth,
  adminMiddleware,
  productMediaUpload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
    // legacy single-image support
    { name: "image", maxCount: 1 },
  ]),
  validateFileTypes({ allowVideos: true }),
  async (req, res) => {
    try {
      const {
        name, description, shortDescription, price, stock,
        category, badge, discount, sku, isFeatured,
      } = req.body;

      // Handle legacy single-image field (AddProduct.jsx simple form)
      if (req.files?.image?.length && !req.files?.images?.length) {
        req.files.images = req.files.image;
      }

      const fieldError = validateProductFields({ name, price, stock, category });
      if (fieldError) return res.status(400).json({ error: fieldError });

      if (discount && (discount < 0 || discount > 100)) {
        return res.status(400).json({ error: "Discount must be between 0 and 100" });
      }

      const { imageUrl, imagesJson, videoUrl } = await processProductMedia(req);

      const productData = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        imageUrl,
        images: imagesJson,
        videoUrl: videoUrl || null,
        isFeatured: isFeatured === "true" || isFeatured === true,
      };

      if (shortDescription) productData.shortDescription = shortDescription;
      if (discount)         productData.discount = Number(discount);
      if (sku)              productData.sku = sku;
      if (badge)            productData.badge = badge;

      const product = await prisma.product.create({ data: productData });
      res.status(201).json(product);
    } catch (err) {
      console.error("Product create error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all products (paginated) — public
router.get("/", async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    // Cap at 100 to prevent a caller from fetching the entire catalogue in one request
    const limit = Math.min(parseInt(req.query.limit) || 12, 100);
    const skip  = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({ orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.product.count(),
    ]);

    res.json({
      products,
      pagination: {
        currentPage:     page,
        totalPages:      Math.ceil(totalProducts / limit),
        totalProducts,
        limit,
        hasNextPage:     page < Math.ceil(totalProducts / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Products fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single product — public
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid product ID" });

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Fetch product error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update product — admin only
router.put(
  "/:id",
  auth,
  adminMiddleware,
  productMediaUpload.fields([
    { name: "images", maxCount: 5 },
    { name: "video",  maxCount: 1 },
    { name: "image",  maxCount: 1 }, // legacy
  ]),
  validateFileTypes({ allowVideos: true }),
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid product ID" });

    try {
      const {
        name, description, shortDescription, price, stock,
        category, badge, discount, sku, isFeatured,
      } = req.body;

      const existingProduct = await prisma.product.findUnique({ where: { id } });
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Legacy single-image field fallback
      if (req.files?.image?.length && !req.files?.images?.length) {
        req.files.images = req.files.image;
      }

      const fieldError = validateProductFields({ name, price, stock, category });
      if (fieldError) return res.status(400).json({ error: fieldError });

      if (discount && (discount < 0 || discount > 100)) {
        return res.status(400).json({ error: "Discount must be between 0 and 100" });
      }

      const { imageUrl, imagesJson, videoUrl } = await processProductMedia(
        req,
        existingProduct.imageUrl,
        existingProduct.images,
        existingProduct.videoUrl
      );

      const updateData = {
        name,
        description,
        shortDescription: shortDescription || null,
        price:  Number(price),
        stock:  Number(stock),
        category,
        imageUrl,
        images:   imagesJson,
        videoUrl: videoUrl !== undefined ? videoUrl : existingProduct.videoUrl,
        badge:    badge    || null,
        discount: discount ? Number(discount) : null,
        sku:      sku      || null,
        isFeatured: isFeatured === "true" || isFeatured === true,
      };

      const updatedProduct = await prisma.product.update({ where: { id }, data: updateData });

      console.log("✅ Product updated:", updatedProduct.name, "(ID:", id, ")");
      res.json(updatedProduct);
    } catch (err) {
      console.error("Product update error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete product — admin only
router.delete("/:id", auth, adminMiddleware, async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) return res.status(400).json({ error: "Invalid product ID" });

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await prisma.orderItem.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });

    res.json({ success: true, message: "Product deleted successfully", deletedProductId: productId });
  } catch (err) {
    console.error("Product delete error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update stock — admin only
router.put("/:id/stock", auth, adminMiddleware, async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) return res.status(400).json({ error: "Invalid product ID" });

  try {
    const { stock } = req.body;
    if (stock === undefined || stock === null) {
      return res.status(400).json({ error: "Stock amount is required" });
    }
    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ error: "Stock must be a non-negative number" });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: stockNum },
    });

    res.json({ success: true, message: "Stock updated successfully", product: updatedProduct });
  } catch (err) {
    console.error("Stock update error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
