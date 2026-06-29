const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

const getAvailableJobs = async (driverId) => {
    return await prisma.order.findMany({
        where: {
            status: 'WAITING_FOR_DRIVER',
            buyerId: { not: driverId },
            store: { userId: { not: driverId } }
        },
        include: {
            store: { select: { name: true } },
            address: { select: { title: true, fullAddress: true, recipientName: true, phoneNumber: true } },
        },
        orderBy: { createdAt: 'desc' }
    });
};

const getAvailableJobById = async (orderId) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            store: { select: { name: true } },
            address: true,
            items: {
                include: { product: { select: { name: true, imageUrl: true } } }
            }
        }
    });

    if (!order || order.status !== 'WAITING_FOR_DRIVER') {
        throw ApiError.notFound('Job not found or no longer available');
    }

    return order;
};

const takeJob = async (driverId, orderId) => {
    return await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
            where: { id: orderId },
            include: { store: true }
        });

        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        if (order.buyerId === driverId) {
            throw ApiError.badRequest('Anda tidak dapat mengambil pekerjaan pengiriman untuk pesanan Anda sendiri.');
        }

        if (order.store.userId === driverId) {
            throw ApiError.badRequest('Anda tidak dapat mengambil pekerjaan pengiriman dari toko Anda sendiri.');
        }

        if (order.status !== 'WAITING_FOR_DRIVER') {
            throw ApiError.badRequest('Job is no longer available');
        }

        const existingJob = await tx.deliveryJob.findFirst({
            where: {
                driverId,
                status: 'TAKEN'
            }
        });

        if (existingJob) {
            throw ApiError.badRequest('You already have an active job');
        }

        const earnings = order.deliveryFee * 0.8;

        const deliveryJob = await tx.deliveryJob.create({
            data: {
                orderId,
                driverId,
                status: 'TAKEN',
                earnings
            }
        });

        await tx.order.update({
            where: { id: orderId },
            data: { status: 'DELIVERING' }
        });

        await tx.orderStatusHistory.create({
            data: {
                orderId,
                status: 'DELIVERING'
            }
        });

        return deliveryJob;
    }, { maxWait: 15000, timeout: 30000 });
};

const completeJob = async (driverId, jobId) => {
    return await prisma.$transaction(async (tx) => {
        const deliveryJob = await tx.deliveryJob.findUnique({
            where: { id: jobId },
            include: { order: true }
        });

        if (!deliveryJob || deliveryJob.driverId !== driverId) {
            throw ApiError.notFound('Delivery job not found');
        }

        if (deliveryJob.status !== 'TAKEN') {
            throw ApiError.badRequest('Job is not in taken state');
        }

        const updatedJob = await tx.deliveryJob.update({
            where: { id: jobId },
            data: { status: 'COMPLETED' }
        });

        await tx.order.update({
            where: { id: deliveryJob.orderId },
            data: { status: 'COMPLETED' }
        });

        await tx.orderStatusHistory.create({
            data: {
                orderId: deliveryJob.orderId,
                status: 'COMPLETED'
            }
        });

        const wallet = await tx.wallet.findUnique({
            where: { userId: driverId }
        });

        if (wallet) {
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: deliveryJob.earnings } }
            });

            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount: deliveryJob.earnings,
                    type: 'TOP_UP',
                    description: `Earnings from delivery job ${deliveryJob.id}`
                }
            });
        }

        return updatedJob;
    }, { maxWait: 15000, timeout: 30000 });
};

const getDriverDashboard = async (driverId) => {
    const activeJob = await prisma.deliveryJob.findFirst({
        where: {
            driverId,
            status: 'TAKEN'
        },
        include: {
            order: {
                include: {
                    store: { select: { name: true } },
                    address: { select: { fullAddress: true, recipientName: true, phoneNumber: true } }
                }
            }
        }
    });

    const jobHistory = await prisma.deliveryJob.findMany({
        where: {
            driverId,
            status: 'COMPLETED'
        },
        include: {
            order: { select: { id: true, total: true, deliveryFee: true } }
        },
        orderBy: { updatedAt: 'desc' }
    });

    const totalEarnings = jobHistory.reduce((sum, job) => sum + job.earnings, 0);

    return {
        activeJob,
        jobHistory,
        totalEarnings
    };
};

module.exports = {
    getAvailableJobs,
    getAvailableJobById,
    takeJob,
    completeJob,
    getDriverDashboard
};
