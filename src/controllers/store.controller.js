const storeService = require('../services/store.service');


const getStores = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const { search } = req.query;

        const result = await storeService.getStores({ page, limit, search });

        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getStoreById = async (req, res, next) => {
    try {
        const store = await storeService.getStoreById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: { store },
        });
    } catch (error) {
        next(error);
    }
};


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
    getStores,
    getStoreById,
    getMyStore,
    createStore,
    updateStore,
};
