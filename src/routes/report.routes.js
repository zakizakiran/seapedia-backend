const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.use(authMiddleware);

router.get(
    '/buyer/spending',
    roleMiddleware('BUYER'),
    reportController.getBuyerSpendingReport
);

router.get(
    '/seller/income',
    roleMiddleware('SELLER'),
    reportController.getSellerIncomeReport
);

module.exports = router;
