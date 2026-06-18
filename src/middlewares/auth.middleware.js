const { verifyAccessToken } = require('../utils/jwt.utils');
const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('Access token is required');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw ApiError.unauthorized('Access token is required');
        }

        const decoded = verifyAccessToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                activeRole: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                userRoles: {
                    select: { role: true },
                },
            },
        });

        if (!user) {
            throw ApiError.unauthorized('User no longer exists');
        }

        if (!user.isActive) {
            throw ApiError.unauthorized('User account has been deactivated');
        }

        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.userRoles.map((ur) => ur.role),
            activeRole: user.activeRole,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            return next(error);
        }

        if (error.name === 'TokenExpiredError') {
            return next(ApiError.unauthorized('Access token has expired'));
        }

        if (error.name === 'JsonWebTokenError') {
            return next(ApiError.unauthorized('Invalid access token'));
        }

        next(ApiError.unauthorized('Authentication failed'));
    }
};

module.exports = authenticate;
