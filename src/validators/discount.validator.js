const { body } = require('express-validator');

const createVoucherValidator = [
    body('code')
        .notEmpty()
        .withMessage('Voucher code is required')
        .isString()
        .withMessage('Voucher code must be a string'),
    body('expiryDate')
        .notEmpty()
        .withMessage('Expiry date is required')
        .isISO8601()
        .withMessage('Expiry date must be a valid date'),
    body('remainingUsage')
        .notEmpty()
        .withMessage('Remaining usage is required')
        .isInt({ min: 1 })
        .withMessage('Remaining usage must be a positive integer'),
    body('discountAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Discount amount must be a positive number'),
    body('discountPercent')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Discount percent must be between 0 and 100'),
];

const createPromoValidator = [
    body('code')
        .notEmpty()
        .withMessage('Promo code is required')
        .isString()
        .withMessage('Promo code must be a string'),
    body('expiryDate')
        .notEmpty()
        .withMessage('Expiry date is required')
        .isISO8601()
        .withMessage('Expiry date must be a valid date'),
    body('discountAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Discount amount must be a positive number'),
    body('discountPercent')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Discount percent must be between 0 and 100'),
];

module.exports = {
    createVoucherValidator,
    createPromoValidator,
};
