const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password.utils');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    getRefreshTokenExpirationMs,
} = require('../utils/jwt.utils');
const ApiError = require('../utils/apiError');


const register = async ({ email, password, name }) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw ApiError.conflict('Email is already registered');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: 'USER',
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
        },
    });

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + getRefreshTokenExpirationMs()),
        },
    });

    return {
        user,
        accessToken,
        refreshToken,
    };
};

const login = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email },
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

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + getRefreshTokenExpirationMs()),
        },
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
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
        include: { user: true },
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
        role: storedToken.user.role,
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
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    return user;
};

module.exports = {
    register,
    login,
    refreshAccessToken,
    logout,
    getProfile,
};
