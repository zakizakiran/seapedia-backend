const prisma = require('../config/database');

const getDashboardStats = async () => {
    const [
        totalUsers,
        totalStores,
        totalProducts,
        totalOrders,
        totalVouchers,
        totalPromos,
        totalDeliveryJobs,
        ordersByStatus,
        overdueCount,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.store.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.voucher.count(),
        prisma.promo.count(),
        prisma.deliveryJob.count(),
        prisma.order.groupBy({
            by: ['status'],
            _count: { id: true },
        }),
        prisma.order.count({
            where: { status: 'RETURNED' },
        }),
    ]);

    const statusCounts = {};
    ordersByStatus.forEach((group) => {
        statusCounts[group.status] = group._count.id;
    });

    return {
        totalUsers,
        totalStores,
        totalProducts,
        totalOrders,
        totalVouchers,
        totalPromos,
        totalDeliveryJobs,
        overdueCount,
        ordersByStatus: statusCounts,
    };
};

const getAllUsers = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            activeRole: true,
            isActive: true,
            createdAt: true,
            userRoles: { select: { role: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
};

const getAllOrders = async () => {
    return await prisma.order.findMany({
        include: {
            buyer: { select: { id: true, name: true, email: true } },
            store: { select: { id: true, name: true } },
            items: {
                include: { product: { select: { name: true } } },
            },
            statusHistory: { orderBy: { createdAt: 'desc' } },
            deliveryJob: {
                select: {
                    id: true,
                    status: true,
                    driver: { select: { id: true, name: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

const getOverdueOrders = async () => {
    return await prisma.order.findMany({
        where: { status: 'RETURNED' },
        include: {
            buyer: { select: { id: true, name: true, email: true } },
            store: { select: { id: true, name: true } },
            statusHistory: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { updatedAt: 'desc' },
    });
};

const getAllStores = async () => {
    return await prisma.store.findMany({
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
};

const getAllProducts = async () => {
    return await prisma.product.findMany({
        include: {
            store: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
};

const getAllDeliveryJobs = async () => {
    return await prisma.deliveryJob.findMany({
        include: {
            driver: { select: { id: true, name: true, email: true } },
            order: { select: { id: true, total: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    getAllOrders,
    getOverdueOrders,
    getAllStores,
    getAllProducts,
    getAllDeliveryJobs,
};
