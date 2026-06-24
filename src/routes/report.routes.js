const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

router.use(authenticate);

router.get(
    '/buyer/spending',
    authorize('BUYER'),
    reportController.getBuyerSpendingReport
);

router.get(
    '/seller/income',
    authorize('SELLER'),
    reportController.getSellerIncomeReport
);

module.exports = router;
