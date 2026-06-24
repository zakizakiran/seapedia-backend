const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discount.controller');
const discountValidator = require('../validators/discount.validator');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.post(
    '/vouchers',
    discountValidator.createVoucherValidator,
    validateMiddleware,
    discountController.createVoucher
);
router.get('/vouchers', discountController.getVouchers);
router.get('/vouchers/:id', discountController.getVoucherById);

router.post(
    '/promos',
    discountValidator.createPromoValidator,
    validateMiddleware,
    discountController.createPromo
);
router.get('/promos', discountController.getPromos);
router.get('/promos/:id', discountController.getPromoById);

module.exports = router;
