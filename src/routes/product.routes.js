const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const productValidator = require('../validators/product.validator');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

router.get(
    '/seller/my-products',
    authenticate,
    authorize('SELLER'),
    productController.getMyProducts
);

router.post(
    '/seller',
    authenticate,
    authorize('SELLER'),
    productValidator.createProductValidator,
    validate,
    productController.createProduct
);

router.put(
    '/seller/:id',
    authenticate,
    authorize('SELLER'),
    productValidator.updateProductValidator,
    validate,
    productController.updateProduct
);

router.delete(
    '/seller/:id',
    authenticate,
    authorize('SELLER'),
    productController.deleteProduct
);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
