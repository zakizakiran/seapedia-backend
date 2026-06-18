const { body } = require('express-validator');

const createStoreValidator = [
    body('name')
        .notEmpty()
        .withMessage('Store name is required')
        .isString()
        .withMessage('Store name must be a string')
        .isLength({ min: 3, max: 50 })
        .withMessage('Store name must be between 3 and 50 characters'),
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
];

const updateStoreValidator = [
    body('name')
        .optional()
        .isString()
        .withMessage('Store name must be a string')
        .isLength({ min: 3, max: 50 })
        .withMessage('Store name must be between 3 and 50 characters'),
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
];

module.exports = {
    createStoreValidator,
    updateStoreValidator,
};
