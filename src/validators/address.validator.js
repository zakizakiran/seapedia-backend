const { body } = require('express-validator');

const createAddressValidator = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 50 })
        .withMessage('Title must not exceed 50 characters'),
    body('recipientName')
        .trim()
        .notEmpty()
        .withMessage('Recipient name is required')
        .isLength({ max: 100 })
        .withMessage('Recipient name must not exceed 100 characters'),
    body('phoneNumber')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required')
        .isLength({ max: 20 })
        .withMessage('Phone number must not exceed 20 characters'),
    body('fullAddress')
        .trim()
        .notEmpty()
        .withMessage('Full address is required'),
    body('isDefault')
        .optional()
        .isBoolean()
        .withMessage('isDefault must be a boolean value')
];

const updateAddressValidator = [
    body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Title cannot be empty if provided')
        .isLength({ max: 50 })
        .withMessage('Title must not exceed 50 characters'),
    body('recipientName')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Recipient name cannot be empty if provided')
        .isLength({ max: 100 })
        .withMessage('Recipient name must not exceed 100 characters'),
    body('phoneNumber')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Phone number cannot be empty if provided')
        .isLength({ max: 20 })
        .withMessage('Phone number must not exceed 20 characters'),
    body('fullAddress')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Full address cannot be empty if provided'),
    body('isDefault')
        .optional()
        .isBoolean()
        .withMessage('isDefault must be a boolean value')
];

module.exports = {
    createAddressValidator,
    updateAddressValidator
};
