const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');
const { generateAccessToken } = require('../src/utils/jwt.utils');
const bcrypt = require('bcryptjs');

describe('Report API Endpoints', () => {
    let buyerId, buyerToken;
    let sellerId, sellerToken, storeId;
    let productId, addressId, orderId;

    beforeAll(async () => {
        const passwordHash = await bcrypt.hash('Password123', 10);

        const seller = await prisma.user.create({
            data: {
                email: `seller.report.${Date.now()}@test.com`,
                password: passwordHash,
                name: 'Seller Report Test',
                activeRole: 'SELLER',
                userRoles: { create: [{ role: 'SELLER' }] },
                store: { create: { name: 'Report Store Test ' + Date.now() } }
            },
            include: { store: true }
        });
        sellerId = seller.id;
        sellerToken = generateAccessToken({ userId: seller.id });
        storeId = seller.store.id;

        const buyer = await prisma.user.create({
            data: {
                email: `buyer.report.${Date.now()}@test.com`,
                password: passwordHash,
                name: 'Buyer Report Test',
                activeRole: 'BUYER',
                userRoles: { create: [{ role: 'BUYER' }] },
                wallet: { create: { balance: 500000 } }
            }
        });
        buyerId = buyer.id;
        buyerToken = generateAccessToken({ userId: buyer.id });

        const product = await prisma.product.create({
            data: { name: 'Report Product Test', price: 30000, stock: 50, storeId }
        });
        productId = product.id;

        const address = await prisma.address.create({
            data: {
                userId: buyerId,
                title: 'Home',
                recipientName: 'Buyer',
                phoneNumber: '123',
                fullAddress: 'Report Address',
                isDefault: true
            }
        });
        addressId = address.id;

        await prisma.cart.create({
            data: {
                userId: buyerId,
                storeId,
                items: { create: { productId, quantity: 3 } }
            }
        });

        const orderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ addressId, deliveryMethod: 'INSTANT' });

        orderId = orderRes.body.data.id;
    });

    afterAll(async () => {
        await prisma.orderStatusHistory.deleteMany({ where: { orderId } });
        await prisma.orderItem.deleteMany({ where: { orderId } });
        await prisma.order.deleteMany({ where: { id: orderId } });
        await prisma.walletTransaction.deleteMany({ where: { wallet: { userId: buyerId } } });
        await prisma.wallet.deleteMany({ where: { userId: buyerId } });
        await prisma.address.deleteMany({ where: { userId: buyerId } });
        await prisma.cartItem.deleteMany({ where: { cart: { userId: buyerId } } });
        await prisma.cart.deleteMany({ where: { userId: buyerId } });
        await prisma.product.deleteMany({ where: { id: productId } });
        await prisma.store.deleteMany({ where: { id: storeId } });
        await prisma.user.deleteMany({ where: { id: { in: [buyerId, sellerId] } } });
        await prisma.$disconnect();
    });

    it('GET /api/reports/buyer/spending - should return buyer spending report', async () => {
        const res = await request(app)
            .get('/api/reports/buyer/spending')
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(typeof res.body.data.totalSpent).toBe('number');
        expect(res.body.data.totalSpent).toBeGreaterThan(0);
        expect(Array.isArray(res.body.data.orders)).toBe(true);
        expect(res.body.data.orders.length).toBeGreaterThanOrEqual(1);

        const order = res.body.data.orders[0];
        expect(order).toHaveProperty('subtotal');
        expect(order).toHaveProperty('discount');
        expect(order).toHaveProperty('deliveryFee');
        expect(order).toHaveProperty('tax');
        expect(order).toHaveProperty('total');
    });

    it('GET /api/reports/buyer/spending - should reject non-BUYER role', async () => {
        const res = await request(app)
            .get('/api/reports/buyer/spending')
            .set('Authorization', `Bearer ${sellerToken}`);

        expect(res.statusCode).toEqual(403);
    });

    it('GET /api/reports/seller/income - should return seller income report', async () => {
        const res = await request(app)
            .get('/api/reports/seller/income')
            .set('Authorization', `Bearer ${sellerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(typeof res.body.data.totalIncome).toBe('number');
        expect(Array.isArray(res.body.data.orders)).toBe(true);
        expect(res.body.data.orders.length).toBeGreaterThanOrEqual(1);

        const order = res.body.data.orders[0];
        expect(order).toHaveProperty('subtotal');
        expect(order).toHaveProperty('deliveryFee');
        expect(order).toHaveProperty('tax');
        expect(order).toHaveProperty('total');
    });

    it('GET /api/reports/seller/income - should reject non-SELLER role', async () => {
        const res = await request(app)
            .get('/api/reports/seller/income')
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(403);
    });
});
