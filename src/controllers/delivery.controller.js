const deliveryService = require('../services/delivery.service');

const getAvailableJobs = async (req, res, next) => {
    try {
        const jobs = await deliveryService.getAvailableJobs();
        res.status(200).json({
            status: 'success',
            data: { jobs }
        });
    } catch (error) {
        next(error);
    }
};

const getJobDetail = async (req, res, next) => {
    try {
        const job = await deliveryService.getAvailableJobById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: { job }
        });
    } catch (error) {
        next(error);
    }
};

const takeJob = async (req, res, next) => {
    try {
        const deliveryJob = await deliveryService.takeJob(req.user.id, req.params.orderId);
        res.status(201).json({
            status: 'success',
            message: 'Job taken successfully',
            data: { deliveryJob }
        });
    } catch (error) {
        next(error);
    }
};

const completeJob = async (req, res, next) => {
    try {
        const deliveryJob = await deliveryService.completeJob(req.user.id, req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'Job completed successfully',
            data: { deliveryJob }
        });
    } catch (error) {
        next(error);
    }
};

const getDashboard = async (req, res, next) => {
    try {
        const dashboard = await deliveryService.getDriverDashboard(req.user.id);
        res.status(200).json({
            status: 'success',
            data: dashboard
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAvailableJobs,
    getJobDetail,
    takeJob,
    completeJob,
    getDashboard
};
