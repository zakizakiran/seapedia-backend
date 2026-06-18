const { body } = require('express-validator');

const VALID_ROLES = ['SELLER', 'BUYER', 'DRIVER'];

const registerValidator = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/\d/)
        .withMessage('Password must contain at least one number'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('roles')
        .isArray({ min: 1 })
        .withMessage('Roles must be a non-empty array'),
    body('roles.*')
        .isIn(VALID_ROLES)
        .withMessage(`Each role must be one of: ${VALID_ROLES.join(', ')}`),
];

const loginValidator = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

const selectRoleValidator = [
    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn([...VALID_ROLES, 'ADMIN'])
        .withMessage(`Role must be one of: ${[...VALID_ROLES, 'ADMIN'].join(', ')}`),
];

const refreshTokenValidator = [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required'),
];

const logoutValidator = [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required'),
];

module.exports = {
    registerValidator,
    loginValidator,
    selectRoleValidator,
    refreshTokenValidator,
    logoutValidator,
};
