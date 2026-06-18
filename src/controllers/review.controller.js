const reviewService = require('../services/review.service');
const { verifyAccessToken } = require('../utils/jwt.utils');

const createReview = async (req, res, next) => {
    try {
        const { reviewerName, rating, comment } = req.body;

        // Optionally extract userId if user is logged in (but don't require it)
        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = verifyAccessToken(token);
                userId = decoded.userId;
            } catch {
                // Token invalid/expired — proceed as guest
            }
        }

        const review = await reviewService.createReview({
            reviewerName,
            rating,
            comment,
            userId,
        });

        res.status(201).json({
            status: 'success',
            message: 'Review submitted successfully',
            data: { review },
        });
    } catch (error) {
        next(error);
    }
};

const getReviews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'newest'; // newest, highest, lowest

        const result = await reviewService.getReviews({ page, limit, sort });

        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReview,
    getReviews,
};
