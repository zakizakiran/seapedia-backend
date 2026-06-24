const prisma = require('../config/database');

const getBuyerSpendingReport = async (req, res, next) => {
    try {
        const orders = await prisma.order.findMany({
            where: { buyerId: req.user.id },
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

        res.status(200).json({
            status: 'success',
            data: {
                totalSpent,
                orders
            }
        });
    } catch (error) {
        next(error);
    }
};

const getSellerIncomeReport = async (req, res, next) => {
    try {
        const store = await prisma.store.findUnique({ where: { userId: req.user.id } });
        if (!store) {
            return res.status(404).json({ status: 'fail', message: 'Store not found' });
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

        res.status(200).json({
            status: 'success',
            data: {
                totalIncome,
                orders
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBuyerSpendingReport,
    getSellerIncomeReport
};
