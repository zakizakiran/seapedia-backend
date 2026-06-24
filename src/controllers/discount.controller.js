const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

const createVoucher = async (req, res, next) => {
    try {
        const { code, discountAmount, discountPercent, expiryDate, remainingUsage } = req.body;

        if (!code || !expiryDate || remainingUsage === undefined) {
            throw new ApiError('Missing required fields', 400);
        }

        if (!discountAmount && !discountPercent) {
            throw new ApiError('Must provide either discountAmount or discountPercent', 400);
        }

        const voucher = await prisma.voucher.create({
            data: {
                code,
                discountAmount,
                discountPercent,
                expiryDate: new Date(expiryDate),
                remainingUsage
            }
        });

        res.status(201).json({ status: 'success', data: { voucher } });
    } catch (error) {
        next(error);
    }
};

const getVouchers = async (req, res, next) => {
    try {
        const vouchers = await prisma.voucher.findMany();
        res.status(200).json({ status: 'success', data: { vouchers } });
    } catch (error) {
        next(error);
    }
};

const createPromo = async (req, res, next) => {
    try {
        const { code, discountAmount, discountPercent, expiryDate } = req.body;

        if (!code || !expiryDate) {
            throw new ApiError('Missing required fields', 400);
        }

        if (!discountAmount && !discountPercent) {
            throw new ApiError('Must provide either discountAmount or discountPercent', 400);
        }

        const promo = await prisma.promo.create({
            data: {
                code,
                discountAmount,
                discountPercent,
                expiryDate: new Date(expiryDate)
            }
        });

        res.status(201).json({ status: 'success', data: { promo } });
    } catch (error) {
        next(error);
    }
};

const getPromos = async (req, res, next) => {
    try {
        const promos = await prisma.promo.findMany();
        res.status(200).json({ status: 'success', data: { promos } });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createVoucher,
    getVouchers,
    createPromo,
    getPromos
};
