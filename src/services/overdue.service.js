const prisma = require('../config/database');
const ApiError = require('../utils/apiError');
const { getCurrentTime } = require('../utils/time.utils');

const DELIVERY_SLA_DAYS = {
    INSTANT: 1,
    NEXT_DAY: 2,
    REGULAR: 7,
};

const getOverdueCandidates = async () => {
    const now = getCurrentTime();

    const activeOrders = await prisma.order.findMany({
        where: {
            status: {
                in: ['PACKING', 'WAITING_FOR_DRIVER', 'DELIVERING'],
            },
        },
        include: {
            buyer: { select: { id: true, name: true, email: true } },
            store: { select: { id: true, name: true } },
            items: { include: { product: { select: { id: true, name: true } } } },
            deliveryJob: true,
        },
    });

    return activeOrders.filter((order) => {
        const slaDays = DELIVERY_SLA_DAYS[order.deliveryMethod];
        const deadline = new Date(order.createdAt.getTime() + slaDays * 24 * 60 * 60 * 1000);
        return now > deadline;
    });
};

const processOverdueOrders = async () => {
    const overdueOrders = await getOverdueCandidates();

    if (overdueOrders.length === 0) {
        return { processed: 0, orders: [] };
    }

    const results = [];

    for (const order of overdueOrders) {
        const result = await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: order.id },
                data: { status: 'RETURNED' },
            });

            await tx.orderStatusHistory.create({
                data: {
                    orderId: order.id,
                    status: 'RETURNED',
                },
            });

            const wallet = await tx.wallet.findUnique({
                where: { userId: order.buyerId },
            });

            if (wallet) {
                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: { balance: { increment: order.total } },
                });

                await tx.walletTransaction.create({
                    data: {
                        walletId: wallet.id,
                        amount: order.total,
                        type: 'REFUND',
                        description: `Auto refund for overdue order ${order.id}`,
                    },
                });
            }

            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } },
                });
            }

            if (order.deliveryJob && order.deliveryJob.status === 'TAKEN') {
                await tx.deliveryJob.update({
                    where: { id: order.deliveryJob.id },
                    data: { status: 'COMPLETED' },
                });
            }

            return {
                orderId: order.id,
                buyerName: order.buyer.name,
                storeName: order.store.name,
                deliveryMethod: order.deliveryMethod,
                total: order.total,
                refunded: true,
            };
        }, { maxWait: 15000, timeout: 30000 });

        results.push(result);
    }

    return {
        processed: results.length,
        orders: results,
    };
};

module.exports = {
    processOverdueOrders,
    getOverdueCandidates,
    DELIVERY_SLA_DAYS,
};
