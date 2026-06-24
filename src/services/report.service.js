const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

const getBuyerSpendingReport = async (buyerId) => {
    const orders = await prisma.order.findMany({
        where: { buyerId },
        include: {
            store: { select: { name: true } },
            items: { include: { product: { select: { name: true } } } },
            statusHistory: { orderBy: { createdAt: 'desc' } }
        },
        orderBy: { createdAt: 'desc' }
    });

    let totalSpent = 0;
    orders.forEach(order => {
        if (order.status !== 'CANCELLED' && order.status !== 'RETURNED') {
            totalSpent += order.total;
        }
    });

    return { totalSpent, orders };
};

const getSellerIncomeReport = async (sellerId) => {
    const store = await prisma.store.findUnique({ where: { userId: sellerId } });
    if (!store) {
        throw ApiError.notFound('Store not found');
    }

    const orders = await prisma.order.findMany({
        where: { storeId: store.id },
        include: {
            buyer: { select: { name: true, email: true } },
            items: { include: { product: { select: { name: true } } } },
            statusHistory: { orderBy: { createdAt: 'desc' } }
        },
        orderBy: { createdAt: 'desc' }
    });

    let totalIncome = 0;
    orders.forEach(order => {
        if (order.status === 'COMPLETED') {
            totalIncome += order.subtotal;
        }
    });

    return { totalIncome, orders };
};

module.exports = {
    getBuyerSpendingReport,
    getSellerIncomeReport,
};
