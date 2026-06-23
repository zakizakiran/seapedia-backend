const addressService = require('../services/address.service');

const createAddress = async (req, res, next) => {
    try {
        const address = await addressService.createAddress(req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Address created successfully',
            data: address
        });
    } catch (error) {
        next(error);
    }
};

const getUserAddresses = async (req, res, next) => {
    try {
        const addresses = await addressService.getUserAddresses(req.user.id);
        res.status(200).json({
            success: true,
            data: addresses
        });
    } catch (error) {
        next(error);
    }
};

const getAddressById = async (req, res, next) => {
    try {
        const address = await addressService.getAddressById(req.user.id, req.params.id);
        res.status(200).json({
            success: true,
            data: address
        });
    } catch (error) {
        next(error);
    }
};

const updateAddress = async (req, res, next) => {
    try {
        const address = await addressService.updateAddress(req.user.id, req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: address
        });
    } catch (error) {
        next(error);
    }
};

const deleteAddress = async (req, res, next) => {
    try {
        const result = await addressService.deleteAddress(req.user.id, req.params.id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const setDefaultAddress = async (req, res, next) => {
    try {
        const address = await addressService.setDefaultAddress(req.user.id, req.params.id);
        res.status(200).json({
            success: true,
            message: 'Default address updated successfully',
            data: address
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAddress,
    getUserAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
