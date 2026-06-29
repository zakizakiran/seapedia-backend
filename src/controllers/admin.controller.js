const adminService = require('../services/admin.service');
const overdueService = require('../services/overdue.service');
const { advanceDays, resetTime, getTimeOffset } = require('../utils/time.utils');

const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await adminService.getDashboardStats();

        res.status(200).json({
            status: 'success',
            data: { stats },
        });
    } catch (error) {
        next(error);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await adminService.getAllUsers();

        res.status(200).json({
            status: 'success',
            data: { users },
        });
    } catch (error) {
        next(error);
    }
};

const getAllOrders = async (req, res, next) => {
    try {
        const orders = await adminService.getAllOrders();

        res.status(200).json({
            status: 'success',
            data: { orders },
        });
    } catch (error) {
        next(error);
    }
};

const getOverdueOrders = async (req, res, next) => {
    try {
        const orders = await adminService.getOverdueOrders();

        res.status(200).json({
            status: 'success',
            data: { orders },
        });
    } catch (error) {
        next(error);
    }
};

const processOverdue = async (req, res, next) => {
    try {
        const result = await overdueService.processOverdueOrders();

        res.status(200).json({
            status: 'success',
            message: `Processed ${result.processed} overdue orders`,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const simulateNextDay = async (req, res, next) => {
    try {
        const days = parseInt(req.body.days, 10) || 1;
        const newTime = advanceDays(days);

        res.status(200).json({
            status: 'success',
            message: `Time advanced by ${days} day(s)`,
            data: {
                simulatedTime: newTime,
                ...getTimeOffset(),
            },
        });
    } catch (error) {
        next(error);
    }
};

const resetSimulatedTime = async (req, res, next) => {
    try {
        const newTime = resetTime();

        res.status(200).json({
            status: 'success',
            message: 'Simulated time reset to real time',
            data: {
                simulatedTime: newTime,
                ...getTimeOffset(),
            },
        });
    } catch (error) {
        next(error);
    }
};

const getTimeInfo = async (req, res, next) => {
    try {
        res.status(200).json({
            status: 'success',
            data: getTimeOffset(),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    getAllOrders,
    getOverdueOrders,
    processOverdue,
    simulateNextDay,
    resetSimulatedTime,
    getTimeInfo,
};
