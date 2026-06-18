const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password.utils');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    getRefreshTokenExpirationMs,
} = require('../utils/jwt.utils');
const ApiError = require('../utils/apiError');

const NON_ADMIN_ROLES = ['SELLER', 'BUYER', 'DRIVER'];

const formatRoles = (userRoles) => userRoles.map((ur) => ur.role);

const resolveActiveRole = (roles) => {
    if (roles.length === 1) {
        return { activeRole: roles[0], requiresRoleSelection: false };
    }
    return { activeRole: null, requiresRoleSelection: true };
};

const register = async ({ email, password, name, roles }) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw ApiError.conflict('Email is already registered');
    }

    if (!roles || roles.length === 0) {
        throw ApiError.badRequest('At least one role is required');
    }

    for (const role of roles) {
        if (!NON_ADMIN_ROLES.includes(role)) {
            throw ApiError.badRequest(
                `Invalid role '${role}'. Allowed roles: ${NON_ADMIN_ROLES.join(', ')}`
            );
        }
    }

    const uniqueRoles = [...new Set(roles)];

    const { activeRole } = resolveActiveRole(uniqueRoles);

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            activeRole,
            userRoles: {
                create: uniqueRoles.map((role) => ({ role })),
            },
        },
        select: {
            id: true,
            email: true,
            name: true,
            activeRole: true,
            createdAt: true,
            userRoles: {
                select: { role: true },
            },
        },
    });

    const formattedRoles = formatRoles(user.userRoles);
    const requiresRoleSelection = uniqueRoles.length > 1;

    const accessToken = generateAccessToken({
        userId: user.id,
        activeRole: user.activeRole,
    });
    const refreshToken = generateRefreshToken({ userId: user.id });

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + getRefreshTokenExpirationMs()),
        },
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: formattedRoles,
            activeRole: user.activeRole,
        },
        requiresRoleSelection,
        accessToken,
        refreshToken,
    };
};

const login = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            userRoles: {
                select: { role: true },
            },
        },
    });

    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
        throw ApiError.unauthorized('Account has been deactivated');
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    const roles = formatRoles(user.userRoles);
    const isAdmin = roles.length === 1 && roles[0] === 'ADMIN';

    let activeRole = user.activeRole;
    let requiresRoleSelection = false;

    if (roles.length === 1 && !activeRole) {
        activeRole = roles[0];
        await prisma.user.update({
            where: { id: user.id },
            data: { activeRole },
        });
    } else if (roles.length > 1 && !activeRole) {
        requiresRoleSelection = true;
    }

    const accessToken = generateAccessToken({
        userId: user.id,
        activeRole,
    });
    const refreshToken = generateRefreshToken({ userId: user.id });

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + getRefreshTokenExpirationMs()),
        },
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            roles,
            activeRole,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
        requiresRoleSelection,
        accessToken,
        refreshToken,
    };
};

const selectRole = async (userId, role) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            userRoles: {
                select: { role: true },
            },
        },
    });

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    const roles = formatRoles(user.userRoles);

    if (!roles.includes(role)) {
        throw ApiError.badRequest(
            `You do not have the '${role}' role. Your roles: ${roles.join(', ')}`
        );
    }

    await prisma.user.update({
        where: { id: userId },
        data: { activeRole: role },
    });

    const accessToken = generateAccessToken({
        userId: user.id,
        activeRole: role,
    });

    return {
        activeRole: role,
        roles,
        accessToken,
    };
};

const refreshAccessToken = async (token) => {
    let decoded;
    try {
        decoded = verifyRefreshToken(token);
    } catch (error) {
        throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const storedToken = await prisma.refreshToken.findUnique({
        where: { token },
        include: {
            user: {
                include: {
                    userRoles: {
                        select: { role: true },
                    },
                },
            },
        },
    });

    if (!storedToken) {
        throw ApiError.unauthorized('Refresh token not found or already revoked');
    }

    if (new Date() > storedToken.expiresAt) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        throw ApiError.unauthorized('Refresh token has expired');
    }

    if (!storedToken.user.isActive) {
        throw ApiError.unauthorized('Account has been deactivated');
    }

    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newAccessToken = generateAccessToken({
        userId: storedToken.user.id,
        activeRole: storedToken.user.activeRole,
    });
    const newRefreshToken = generateRefreshToken({
        userId: storedToken.user.id,
    });

    await prisma.refreshToken.create({
        data: {
            token: newRefreshToken,
            userId: storedToken.user.id,
            expiresAt: new Date(Date.now() + getRefreshTokenExpirationMs()),
        },
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

const logout = async (token) => {
    const deletedToken = await prisma.refreshToken.findUnique({
        where: { token },
    });

    if (deletedToken) {
        await prisma.refreshToken.delete({ where: { id: deletedToken.id } });
    }

    return true;
};

const getProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
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
            store: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    const roles = formatRoles(user.userRoles);

    const financialSummary = {};

    if (roles.includes('BUYER')) {
        financialSummary.buyer = {
            walletBalance: 0,     
            totalSpending: 0,     
        };
    }

    if (roles.includes('SELLER')) {
        financialSummary.seller = {
            totalIncome: 0,       
            store: user.store || null,
        };
    }

    if (roles.includes('DRIVER')) {
        financialSummary.driver = {
            totalEarnings: 0,     
        };
    }

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
        activeRole: user.activeRole,
        isActive: user.isActive,
        financialSummary,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

module.exports = {
    register,
    login,
    selectRole,
    refreshAccessToken,
    logout,
    getProfile,
};
