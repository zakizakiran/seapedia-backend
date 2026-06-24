const orderService = require('../services/order.service');

const createOrder = async (req, res, next) => {
    try {
        const { addressId, deliveryMethod } = req.body;
        const result = await orderService.createOrder(req.user.id, addressId, deliveryMethod);
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getCheckoutSummary = async (req, res, next) => {
    try {
        const { addressId, deliveryMethod } = req.body;
        const result = await orderService.getCheckoutSummary(req.user.id, addressId, deliveryMethod);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getBuyerOrders = async (req, res, next) => {
    try {
        const result = await orderService.getBuyerOrders(req.user.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getBuyerOrderById = async (req, res, next) => {
    try {
        const result = await orderService.getBuyerOrderById(req.user.id, req.params.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getSellerOrders = async (req, res, next) => {
    try {
        const result = await orderService.getSellerOrders(req.user.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getSellerOrderById = async (req, res, next) => {
    try {
        const result = await orderService.getSellerOrderById(req.user.id, req.params.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const processOrder = async (req, res, next) => {
    try {
        const result = await orderService.processOrder(req.user.id, req.params.id);
        res.status(200).json({
            success: true,
            message: 'Order processed successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getCheckoutSummary,
    getBuyerOrders,
    getBuyerOrderById,
    getSellerOrders,
    getSellerOrderById,
    processOrder
};
