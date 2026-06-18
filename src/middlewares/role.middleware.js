const ApiError = require('../utils/apiError');

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(ApiError.unauthorized('Authentication required'));
        }

        if (!req.user.activeRole) {
            return next(
                ApiError.forbidden(
                    'No active role selected. Please select an active role before accessing this resource.'
                )
            );
        }

        if (!allowedRoles.includes(req.user.activeRole)) {
            return next(
                ApiError.forbidden(
                    `Active role '${req.user.activeRole}' is not authorized to access this resource. Required: ${allowedRoles.join(', ')}`
                )
            );
        }

        next();
    };
};

module.exports = authorize;
