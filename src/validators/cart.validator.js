const { body } = require('express-validator');

const addToCartValidator = [
    body('productId')
        .notEmpty()
        .withMessage('Product ID is required'),
    body('quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be an integer greater than 0')
];

module.exports = {
    addToCartValidator
};
