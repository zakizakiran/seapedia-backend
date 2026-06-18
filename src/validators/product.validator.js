const { body } = require('express-validator');

const createProductValidator = [
    body('name')
        .notEmpty()
        .withMessage('Product name is required')
        .isString()
        .withMessage('Product name must be a string')
        .isLength({ min: 3, max: 100 })
        .withMessage('Product name must be between 3 and 100 characters'),
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isInt({ min: 0 })
        .withMessage('Price must be a positive integer'),
    body('stock')
        .notEmpty()
        .withMessage('Stock is required')
        .isInt({ min: 0 })
        .withMessage('Stock must be a positive integer'),
    body('imageUrl')
        .optional({ nullable: true })
        .isURL()
        .withMessage('Image URL must be a valid URL'),
];

const updateProductValidator = [
    body('name')
        .optional()
        .isString()
        .withMessage('Product name must be a string')
        .isLength({ min: 3, max: 100 })
        .withMessage('Product name must be between 3 and 100 characters'),
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    body('price')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Price must be a positive integer'),
    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock must be a positive integer'),
    body('imageUrl')
        .optional({ nullable: true })
        .isURL()
        .withMessage('Image URL must be a valid URL'),
];

module.exports = {
    createProductValidator,
    updateProductValidator,
};
