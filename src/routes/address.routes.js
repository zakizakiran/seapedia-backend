const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const addressValidator = require('../validators/address.validator');

router.use(authMiddleware);
router.use(roleMiddleware('BUYER'));

router.post('/', addressValidator.createAddressValidator, validateMiddleware, addressController.createAddress);
router.get('/', addressController.getUserAddresses);
router.get('/:id', addressController.getAddressById);
router.put('/:id', addressValidator.updateAddressValidator, validateMiddleware, addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.put('/:id/default', addressController.setDefaultAddress);

module.exports = router;
