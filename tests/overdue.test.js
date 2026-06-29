const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');
const { generateAccessToken } = require('../src/utils/jwt.utils');
const { resetTime } = require('../src/utils/time.utils');
const bcrypt = require('bcryptjs');

describe('Overdue Handling API Endpoints', () => {
    let adminToken;
    let adminId;

    let sellerId;
    let storeId;

    let buyerId;
    let buyerAddressId;
    let buyerWalletId;

    let productId;
    let overdueOrderId;
    let nonOverdueOrderId;

    const INITIAL_BALANCE = 500000;
    const INITIAL_STOCK = 50;

    beforeAll(async () => {
        const passwordHash = await bcrypt.hash('Password123', 10);

        const admin = await prisma.user.create({
            data: {
                email: `admin.overdue.${Date.now()}@test.com`,
                password: passwordHash,
                name: 'Admin Overdue Test',
                activeRole: 'ADMIN',
                userRoles: { create: [{ role: 'ADMIN' }] },
            },
        });
        adminId = admin.id;
        adminToken = generateAccessToken({ userId: admin.id });

        const seller = await prisma.user.create({
            data: {
                email: `seller.overdue.${Date.now()}@test.com`,
                password: passwordHash,
                name: 'Seller Overdue Test',
                activeRole: 'SELLER',
                userRoles: { create: [{ role: 'SELLER' }] },
            },
        });
        sellerId = seller.id;

        const store = await prisma.store.create({
            data: {
                name: `Overdue Test Store ${Date.now()}`,
                description: 'Test store for overdue tests',
                userId: sellerId,
            },
        });
        storeId = store.id;

        const product = await prisma.product.create({
            data: {
                name: `Overdue Test Product ${Date.now()}`,
                description: 'Test product',
                price: 50000,
                stock: INITIAL_STOCK,
                storeId,
            },
        });
        productId = product.id;

        const buyer = await prisma.user.create({
            data: {
                email: `buyer.overdue.${Date.now()}@test.com`,
                password: passwordHash,
                name: 'Buyer Overdue Test',
                activeRole: 'BUYER',
                userRoles: { create: [{ role: 'BUYER' }] },
            },
        });
        buyerId = buyer.id;

        const wallet = await prisma.wallet.create({
            data: {
                userId: buyerId,
                balance: INITIAL_BALANCE,
            },
        });
        buyerWalletId = wallet.id;

        const address = await prisma.address.create({
            data: {
                userId: buyerId,
                title: 'Home',
                recipientName: 'Buyer Overdue',
                phoneNumber: '081234567890',
                fullAddress: 'Jl. Overdue Test No 1',
            },
        });
        buyerAddressId = address.id;

        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        const overdueOrder = await prisma.order.create({
            data: {
                buyerId,
                storeId,
                addressId: buyerAddressId,
                deliveryMethod: 'INSTANT',
                deliveryFee: 50000,
                subtotal: 100000,
                discount: 0,
                tax: 12000,
                total: 162000,
                status: 'DELIVERING',
                createdAt: twoDaysAgo,
                items: {
                    create: [{ productId, quantity: 2, price: 50000 }],
                },
                statusHistory: {
                    create: [{ status: 'PACKING', createdAt: twoDaysAgo }],
                },
            },
        });
        overdueOrderId = overdueOrder.id;

        const nonOverdueOrder = await prisma.order.create({
            data: {
                buyerId,
                storeId,
                addressId: buyerAddressId,
                deliveryMethod: 'REGULAR',
                deliveryFee: 15000,
                subtotal: 50000,
                discount: 0,
                tax: 6000,
                total: 71000,
                status: 'DELIVERING',
                items: {
                    create: [{ productId, quantity: 1, price: 50000 }],
                },
                statusHistory: {
                    create: [{ status: 'PACKING' }],
                },
            },
        });
        nonOverdueOrderId = nonOverdueOrder.id;

        resetTime();
    });

    afterAll(async () => {
        resetTime();

        await prisma.walletTransaction.deleteMany({
            where: { walletId: buyerWalletId },
        }).catch(() => {});
        await prisma.deliveryJob.deleteMany({
            where: { orderId: { in: [overdueOrderId, nonOverdueOrderId] } },
        }).catch(() => {});
        await prisma.orderStatusHistory.deleteMany({
            where: { orderId: { in: [overdueOrderId, nonOverdueOrderId] } },
        }).catch(() => {});
        await prisma.orderItem.deleteMany({
            where: { orderId: { in: [overdueOrderId, nonOverdueOrderId] } },
        }).catch(() => {});
        await prisma.order.deleteMany({
            where: { id: { in: [overdueOrderId, nonOverdueOrderId] } },
        }).catch(() => {});
        await prisma.product.deleteMany({ where: { id: productId } }).catch(() => {});
        await prisma.address.deleteMany({ where: { id: buyerAddressId } }).catch(() => {});
        await prisma.wallet.deleteMany({ where: { id: buyerWalletId } }).catch(() => {});
        await prisma.store.deleteMany({ where: { id: storeId } }).catch(() => {});
        await prisma.user.deleteMany({
            where: { id: { in: [adminId, sellerId, buyerId] } },
        }).catch(() => {});
        await prisma.$disconnect();
    });

    it('POST /api/admin/simulate-day - should advance simulated time', async () => {
        const res = await request(app)
            .post('/api/admin/simulate-day')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ days: 3 });

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.offsetDays).toBe(3);
        expect(res.body.data.simulatedTime).toBeDefined();

        resetTime();
    });

    it('POST /api/admin/simulate-day/reset - should reset time', async () => {
        const res = await request(app)
            .post('/api/admin/simulate-day/reset')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.offsetMs).toBe(0);
        expect(res.body.data.offsetDays).toBe(0);
    });

    it('POST /api/admin/overdue/process - should process overdue INSTANT order', async () => {
        const res = await request(app)
            .post('/api/admin/overdue/process')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.processed).toBeGreaterThanOrEqual(1);

        const processedOrder = res.body.data.orders.find(
            (o) => o.orderId === overdueOrderId
        );
        expect(processedOrder).toBeDefined();
        expect(processedOrder.refunded).toBe(true);
    });

    it('should have set overdue order status to RETURNED', async () => {
        const order = await prisma.order.findUnique({
            where: { id: overdueOrderId },
            include: { statusHistory: { orderBy: { createdAt: 'desc' } } },
        });

        expect(order.status).toBe('RETURNED');

        const lastHistory = order.statusHistory[0];
        expect(lastHistory.status).toBe('RETURNED');
    });

    it('should have refunded buyer wallet', async () => {
        const wallet = await prisma.wallet.findUnique({
            where: { id: buyerWalletId },
        });

        expect(wallet.balance).toBe(INITIAL_BALANCE + 162000);
    });

    it('should have restored product stock', async () => {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        expect(product.stock).toBe(INITIAL_STOCK + 2);
    });

    it('should NOT have affected the non-overdue REGULAR order', async () => {
        const order = await prisma.order.findUnique({
            where: { id: nonOverdueOrderId },
        });

        expect(order.status).toBe('DELIVERING');
    });

    it('POST /api/admin/overdue/process - subsequent call should find no new overdue', async () => {
        const res = await request(app)
            .post('/api/admin/overdue/process')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);

        const alreadyProcessed = res.body.data.orders.find(
            (o) => o.orderId === overdueOrderId
        );
        expect(alreadyProcessed).toBeUndefined();
    });
});
