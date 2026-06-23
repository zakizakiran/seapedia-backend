const prisma = require('../config/database');
const ApiError = require('../utils/apiError');
const { escapeHtml } = require('../utils/sanitize.utils');

const createReview = async ({ reviewerName, rating, comment, userId = null }) => {
    const sanitizedName = escapeHtml(reviewerName);
    const sanitizedComment = escapeHtml(comment);

    const review = await prisma.review.create({
        data: {
            reviewerName: sanitizedName,
            rating,
            comment: sanitizedComment,
            userId,
        },
        select: {
            id: true,
            reviewerName: true,
            rating: true,
            comment: true,
            userId: true,
            createdAt: true,
        },
    });

    return review;
};

const getReviews = async ({ page = 1, limit = 10, sort = 'newest' }) => {
    const skip = (page - 1) * limit;

    const orderBy =
        sort === 'highest'
            ? { rating: 'desc' }
            : sort === 'lowest'
              ? { rating: 'asc' }
              : { createdAt: 'desc' };

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            skip,
            take: limit,
            orderBy,
            select: {
                id: true,
                reviewerName: true,
                rating: true,
                comment: true,
                createdAt: true,
            },
        }),
        prisma.review.count(),
    ]);

    const stats = await prisma.review.aggregate({
        _avg: { rating: true },
        _count: { rating: true },
    });

    return {
        reviews,
        stats: {
            averageRating: stats._avg.rating ? parseFloat(stats._avg.rating.toFixed(1)) : 0,
            totalReviews: stats._count.rating,
        },
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

module.exports = {
    createReview,
    getReviews,
};
