const discountService = require('../services/discount.service');

const createVoucher = async (req, res, next) => {
    try {
        const voucher = await discountService.createVoucher(req.body);

        res.status(201).json({
            status: 'success',
            message: 'Voucher created successfully',
            data: { voucher },
        });
    } catch (error) {
        next(error);
    }
};

const getVouchers = async (req, res, next) => {
    try {
        const vouchers = await discountService.getVouchers();

        res.status(200).json({
            status: 'success',
            data: { vouchers },
        });
    } catch (error) {
        next(error);
    }
};

const getVoucherById = async (req, res, next) => {
    try {
        const voucher = await discountService.getVoucherById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: { voucher },
        });
    } catch (error) {
        next(error);
    }
};

const createPromo = async (req, res, next) => {
    try {
        const promo = await discountService.createPromo(req.body);

        res.status(201).json({
            status: 'success',
            message: 'Promo created successfully',
            data: { promo },
        });
    } catch (error) {
        next(error);
    }
};

const getPromos = async (req, res, next) => {
    try {
        const promos = await discountService.getPromos();

        res.status(200).json({
            status: 'success',
            data: { promos },
        });
    } catch (error) {
        next(error);
    }
};

const getPromoById = async (req, res, next) => {
    try {
        const promo = await discountService.getPromoById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: { promo },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createVoucher,
    getVouchers,
    getVoucherById,
    createPromo,
    getPromos,
    getPromoById,
};
