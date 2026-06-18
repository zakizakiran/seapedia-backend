const storeService = require('../services/store.service');

const getMyStore = async (req, res, next) => {
    try {
        const store = await storeService.getMyStore(req.user.id);

        res.status(200).json({
            status: 'success',
            data: {
                store,
            },
        });
    } catch (error) {
        next(error);
    }
};

const createStore = async (req, res, next) => {
    try {
        const store = await storeService.createStore(req.user.id, req.body);

        res.status(201).json({
            status: 'success',
            message: 'Store created successfully',
            data: {
                store,
            },
        });
    } catch (error) {
        next(error);
    }
};

const updateStore = async (req, res, next) => {
    try {
        const store = await storeService.updateStore(req.user.id, req.body);

        res.status(200).json({
            status: 'success',
            message: 'Store updated successfully',
            data: {
                store,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyStore,
    createStore,
    updateStore,
};
