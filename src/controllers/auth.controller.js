const authService = require('../services/auth.service');

const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        const result = await authService.register({ email, password, name });

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await authService.login({ email, password });

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;

        const result = await authService.refreshAccessToken(token);

        res.status(200).json({
            status: 'success',
            message: 'Token refreshed successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;

        await authService.logout(token);

        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user.id);

        res.status(200).json({
            status: 'success',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    getProfile,
};
