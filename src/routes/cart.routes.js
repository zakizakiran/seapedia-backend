const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const cartValidator = require('../validators/cart.validator');

router.use(authMiddleware);
router.use(roleMiddleware('BUYER'));

router.get('/', cartController.getCart);
router.post('/items', cartValidator.addToCartValidator, validateMiddleware, cartController.addOrUpdateItem);
router.delete('/items/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
