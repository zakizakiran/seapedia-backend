const { body } = require('express-validator');

const createReviewValidator = [
    body('reviewerName')
        .trim()
        .notEmpty()
        .withMessage('Reviewer name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Reviewer name must be between 2 and 100 characters'),
    body('rating')
        .notEmpty()
        .withMessage('Rating is required')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be an integer between 1 and 5'),
    body('comment')
        .trim()
        .notEmpty()
        .withMessage('Comment is required')
        .isLength({ min: 5, max: 1000 })
        .withMessage('Comment must be between 5 and 1000 characters'),
];

module.exports = {
    createReviewValidator,
};
