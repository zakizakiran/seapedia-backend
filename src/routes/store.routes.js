const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const storeValidator = require('../validators/store.validator');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

router.use(authenticate);
router.use(authorize('SELLER'));

router.get('/my-store', storeController.getMyStore);

router.post(
    '/',
    storeValidator.createStoreValidator,
    validate,
    storeController.createStore
);

router.put(
    '/',
    storeValidator.updateStoreValidator,
    validate,
    storeController.updateStore
);

module.exports = router;
