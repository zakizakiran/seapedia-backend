const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const walletValidator = require('../validators/wallet.validator');

router.use(authMiddleware);
router.use(roleMiddleware('BUYER'));

router.get('/', walletController.getWalletDetails);
router.post('/top-up', walletValidator.topUpValidator, validateMiddleware, walletController.topUp);

module.exports = router;
