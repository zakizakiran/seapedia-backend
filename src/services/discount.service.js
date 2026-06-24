const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

const createVoucher = async (data) => {
    const { code, discountAmount, discountPercent, expiryDate, remainingUsage } = data;

    const existing = await prisma.voucher.findUnique({ where: { code } });
    if (existing) {
        throw ApiError.badRequest('Voucher code already exists');
    }

    return await prisma.voucher.create({
        data: {
            code,
            discountAmount,
            discountPercent,
            expiryDate: new Date(expiryDate),
            remainingUsage
        }
    });
};

const getVouchers = async () => {
    return await prisma.voucher.findMany({
        orderBy: { createdAt: 'desc' }
    });
};

const getVoucherById = async (id) => {
    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
        throw ApiError.notFound('Voucher not found');
    }
    return voucher;
};

const createPromo = async (data) => {
    const { code, discountAmount, discountPercent, expiryDate } = data;

    const existing = await prisma.promo.findUnique({ where: { code } });
    if (existing) {
        throw ApiError.badRequest('Promo code already exists');
    }

    return await prisma.promo.create({
        data: {
            code,
            discountAmount,
            discountPercent,
            expiryDate: new Date(expiryDate)
        }
    });
};

const getPromos = async () => {
    return await prisma.promo.findMany({
        orderBy: { createdAt: 'desc' }
    });
};

const getPromoById = async (id) => {
    const promo = await prisma.promo.findUnique({ where: { id } });
    if (!promo) {
        throw ApiError.notFound('Promo not found');
    }
    return promo;
};

module.exports = {
    createVoucher,
    getVouchers,
    getVoucherById,
    createPromo,
    getPromos,
    getPromoById
};
