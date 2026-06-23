const cartService = require('../services/cart.service');

const getCart = async (req, res, next) => {
    try {
        const cart = await cartService.getCart(req.user.id);
        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

const addOrUpdateItem = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const result = await cartService.addOrUpdateItem(req.user.id, productId, quantity);
        res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const removeItem = async (req, res, next) => {
    try {
        const result = await cartService.removeItem(req.user.id, req.params.productId);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const clearCart = async (req, res, next) => {
    try {
        const result = await cartService.clearCart(req.user.id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addOrUpdateItem,
    removeItem,
    clearCart
};
