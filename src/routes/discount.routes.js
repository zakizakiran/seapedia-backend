const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discount.controller');
const authorize = require('../middlewares/role.middleware');
const authenticate = require('../middlewares/auth.middleware');

router.use(authenticate);

router.use(authorize('ADMIN'));

router.post('/vouchers', discountController.createVoucher);
router.get('/vouchers', discountController.getVouchers);

router.post('/promos', discountController.createPromo);
router.get('/promos', discountController.getPromos);

module.exports = router;
