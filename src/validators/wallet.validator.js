const { body } = require('express-validator');

const topUpValidator = [
    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isFloat({ min: 1000 })
        .withMessage('Amount must be at least 1000')
];

module.exports = {
    topUpValidator
};
