const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    registerValidator,
    loginValidator,
    refreshTokenValidator,
    logoutValidator,
} = require('../validators/auth.validator');

// Public routes
router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/refresh-token', refreshTokenValidator, validate, authController.refreshToken);

// Protected routes
router.delete('/logout', authenticate, logoutValidator, validate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
