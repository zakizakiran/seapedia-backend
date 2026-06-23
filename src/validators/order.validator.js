const { body } = require('express-validator');

const createOrderValidator = [
    body('addressId')
        .notEmpty()
        .withMessage('Address ID is required'),
    body('deliveryMethod')
        .notEmpty()
        .withMessage('Delivery method is required')
        .isIn(['INSTANT', 'NEXT_DAY', 'REGULAR'])
        .withMessage('Invalid delivery method')
];

module.exports = {
    createOrderValidator
};
