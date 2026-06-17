const ApiError = require('../utils/apiError');

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(ApiError.unauthorized('Authentication required'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                ApiError.forbidden(
                    `Role '${req.user.role}' is not authorized to access this resource`
                )
            );
        }

        next();
    };
};

module.exports = authorize;
