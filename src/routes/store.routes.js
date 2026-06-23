const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const storeValidator = require('../validators/store.validator');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');


router.get('/', storeController.getStores);


router.get(
    '/seller/my-store',
    authenticate,
    authorize('SELLER'),
    storeController.getMyStore
);


router.post(
    '/seller',
    authenticate,
    authorize('SELLER'),
    storeValidator.createStoreValidator,
    validate,
    storeController.createStore
);

router.put(
    '/seller',
    authenticate,
    authorize('SELLER'),
    storeValidator.updateStoreValidator,
    validate,
    storeController.updateStore
);


router.get('/:id', storeController.getStoreById);

module.exports = router;

