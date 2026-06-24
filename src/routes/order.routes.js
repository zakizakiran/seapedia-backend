const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const orderValidator = require('../validators/order.validator');

router.use(authMiddleware);


router.post(
    '/summary',
    roleMiddleware('BUYER'),
    orderValidator.createOrderValidator,
    validateMiddleware,
    orderController.getCheckoutSummary
);
router.post(
    '/',
    roleMiddleware('BUYER'),
    orderValidator.createOrderValidator,
    validateMiddleware,
    orderController.createOrder
);
router.get(
    '/buyer',
    roleMiddleware('BUYER'),
    orderController.getBuyerOrders
);
router.get(
    '/buyer/:id',
    roleMiddleware('BUYER'),
    orderController.getBuyerOrderById
);


router.get(
    '/seller',
    roleMiddleware('SELLER'),
    orderController.getSellerOrders
);
router.get(
    '/seller/:id',
    roleMiddleware('SELLER'),
    orderController.getSellerOrderById
);

router.patch(
    '/seller/:id/process',
    roleMiddleware('SELLER'),
    orderController.processOrder
);

module.exports = router;
