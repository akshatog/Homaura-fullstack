import express from 'express';
import prisma from '../prisma/client.js';
import authenticateToken from '../middleware/authMiddleware.js';
import reviewMediaUpload from '../utils/reviewMediaUpload.js';
import cloudinary from '../utils/cloudinary.js';
import validateFileTypes from '../utils/validateFileTypes.js';

const router = express.Router();

router.get('/can-review/:productId', authenticateToken, async (req, res) => {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });

    try {
        const userId = req.user.userId;

        const deliveredOrder = await prisma.order.findFirst({
            where: {
                userId: userId,
                status: 'delivered',
                items: {
                    some: {
                        productId: productId
                    }
                }
            }
        });

        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId: userId,
                    productId: productId
                }
            }
        });

        res.json({
            canReview: !!deliveredOrder,
            hasReviewed: !!existingReview,
            reviewId: existingReview?.id
        });
    } catch (error) {
        console.error('Error checking review eligibility:', error);
        res.status(500).json({ error: 'Failed to check review eligibility' });
    }
});

router.get('/product/:productId', async (req, res) => {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });

    try {

        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const reviewsWithParsedPhotos = reviews.map(review => ({
            ...review,
            photos: review.photos ? JSON.parse(review.photos) : []
        }));

        const avgRating = reviewsWithParsedPhotos.length > 0
            ? reviewsWithParsedPhotos.reduce((sum, r) => sum + r.rating, 0) / reviewsWithParsedPhotos.length
            : 0;

        res.json({
            reviews: reviewsWithParsedPhotos,
            averageRating: avgRating,
            totalReviews: reviewsWithParsedPhotos.length
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

router.get('/user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const reviews = await prisma.review.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const reviewsWithParsedPhotos = reviews.map(review => ({
            ...review,
            photos: review.photos ? JSON.parse(review.photos) : []
        }));

        res.json(reviewsWithParsedPhotos);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ error: 'Failed to fetch user reviews' });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    const reviewId = parseInt(req.params.id, 10);
    if (isNaN(reviewId)) return res.status(400).json({ error: 'Invalid review ID' });

    try {
        const userId = req.user.userId;

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const reviewResponse = {
            ...review,
            photos: review.photos ? JSON.parse(review.photos) : []
        };

        res.json(reviewResponse);
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({ error: 'Failed to fetch review' });
    }
});

router.post('/', authenticateToken, reviewMediaUpload.fields([
    { name: 'photos', maxCount: 5 },
    { name: 'video', maxCount: 1 }
]), validateFileTypes({ allowVideos: true }), async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.userId;

        const parsedProductId = parseInt(productId, 10);
        if (!productId || isNaN(parsedProductId)) {
            return res.status(400).json({ error: 'A valid product ID is required' });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        if (comment && String(comment).length > 2000) {
            return res.status(400).json({ error: 'Comment must be 2000 characters or fewer' });
        }

        const deliveredOrder = await prisma.order.findFirst({
            where: {
                userId: userId,
                status: 'delivered',
                items: {
                    some: {
                        productId: parsedProductId
                    }
                }
            }
        });

        if (!deliveredOrder) {
            return res.status(403).json({ error: 'You can only review products from delivered orders' });
        }

        let photoUrls = [];
        let videoUrl = null;

        if (req.files?.photos) {
            const photoUploadPromises = req.files.photos.map(file => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: "presento_reviews/photos",
                            resource_type: "image",
                            transformation: [
                                { width: 1200, height: 1200, crop: "limit" },
                                { quality: "auto" }
                            ]
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result.secure_url);
                        }
                    );
                    stream.end(file.buffer);
                });
            });

            try {
                photoUrls = await Promise.all(photoUploadPromises);
            } catch (uploadError) {
                console.error('Photo upload error:', uploadError);
                return res.status(500).json({ error: 'Failed to upload photos' });
            }
        }

        if (req.files?.video && req.files.video[0]) {
            try {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: "presento_reviews/videos",
                            resource_type: "video",
                            transformation: [
                                { duration: "0-20" },
                                { quality: "auto" }
                            ]
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(req.files.video[0].buffer);
                });
                videoUrl = result.secure_url;
            } catch (uploadError) {
                console.error('Video upload error:', uploadError);
                return res.status(500).json({ error: 'Failed to upload video' });
            }
        }

        const review = await prisma.review.create({
            data: {
                userId,
                productId: parsedProductId,
                rating: parseInt(rating),
                comment: comment || null,
                photos: photoUrls.length > 0 ? JSON.stringify(photoUrls) : null,
                video: videoUrl
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        const reviewResponse = {
            ...review,
            photos: review.photos ? JSON.parse(review.photos) : []
        };

        res.status(201).json(reviewResponse);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'You have already reviewed this product' });
        }
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});

router.put('/:id', authenticateToken, reviewMediaUpload.fields([
    { name: 'photos', maxCount: 5 },
    { name: 'video', maxCount: 1 }
]), validateFileTypes({ allowVideos: true }), async (req, res) => {
    const reviewId = parseInt(req.params.id, 10);
    if (isNaN(reviewId)) return res.status(400).json({ error: 'Invalid review ID' });

    try {
        const { rating, comment, removePhotos, removeVideo } = req.body;
        const userId = req.user.userId;

        if (comment && String(comment).length > 2000) {
            return res.status(400).json({ error: 'Comment must be 2000 characters or fewer' });
        }

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const existingReview = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!existingReview || existingReview.userId !== userId) {
            return res.status(404).json({ error: 'Review not found or unauthorized' });
        }

        let photoUrls = existingReview.photos ? JSON.parse(existingReview.photos) : [];
        let videoUrl = existingReview.video;

        if (removePhotos === 'true') {
            photoUrls = [];
        }

        if (removeVideo === 'true') {
            videoUrl = null;
        }

        if (req.files?.photos) {
            const newPhotoUploadPromises = req.files.photos.map(file => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: "presento_reviews/photos",
                            resource_type: "image",
                            transformation: [
                                { width: 1200, height: 1200, crop: "limit" },
                                { quality: "auto" }
                            ]
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result.secure_url);
                        }
                    );
                    stream.end(file.buffer);
                });
            });

            try {
                const newPhotoUrls = await Promise.all(newPhotoUploadPromises);
                photoUrls = [...photoUrls, ...newPhotoUrls];
            } catch (uploadError) {
                console.error('Photo upload error:', uploadError);
                return res.status(500).json({ error: 'Failed to upload photos' });
            }
        }

        if (req.files?.video && req.files.video[0]) {
            try {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: "presento_reviews/videos",
                            resource_type: "video",
                            transformation: [
                                { duration: "0-20" },
                                { quality: "auto" }
                            ]
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(req.files.video[0].buffer);
                });
                videoUrl = result.secure_url;
            } catch (uploadError) {
                console.error('Video upload error:', uploadError);
                return res.status(500).json({ error: 'Failed to upload video' });
            }
        }

        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: {
                ...(rating && { rating: parseInt(rating) }),
                ...(comment !== undefined && { comment: comment || null }),
                photos: photoUrls.length > 0 ? JSON.stringify(photoUrls) : null,
                video: videoUrl
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        const reviewResponse = {
            ...updatedReview,
            photos: updatedReview.photos ? JSON.parse(updatedReview.photos) : []
        };

        res.json(reviewResponse);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Failed to update review' });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    const reviewId = parseInt(req.params.id, 10);
    if (isNaN(reviewId)) return res.status(400).json({ error: 'Invalid review ID' });

    try {
        const userId = req.user.userId;

        const existingReview = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!existingReview || existingReview.userId !== userId) {
            return res.status(404).json({ error: 'Review not found or unauthorized' });
        }

        await prisma.review.delete({
            where: { id: reviewId }
        });

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

export default router;
