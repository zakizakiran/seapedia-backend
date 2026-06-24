const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');
const { generateAccessToken } = require('../src/utils/jwt.utils');
const bcrypt = require('bcryptjs');

describe('Seller Order Processing API', () => {
    let buyerId, buyerToken;
    let sellerId, sellerToken, storeId;
    let productId, addressId, orderId;

    beforeAll(async () => {
        const passwordHash = await bcrypt.hash('Password123', 10);

        const seller = await prisma.user.create({
            data: {
                email: `seller.process.${Date.now()}@test.com`,
                password: passwordHash,
                name: 'Seller Process Test',
                activeRole: 'SELLER',
                userRoles: { create: [{ role: 'SELLER' }] },
                store: { create: { name: 'Process Store Test ' + Date.now() } }
            },
            include: { store: true }
        });
        sellerId = seller.id;
        sellerToken = generateAccessToken({ userId: seller.id });
        storeId = seller.store.id;

        const buyer = await prisma.user.create({
            data: {
                email: `buyer.process.${Date.now()}@test.com`,
                password: passwordHash,
                name: 'Buyer Process Test',
                activeRole: 'BUYER',
                userRoles: { create: [{ role: 'BUYER' }] },
                wallet: { create: { balance: 500000 } }
            }
        });
        buyerId = buyer.id;
        buyerToken = generateAccessToken({ userId: buyer.id });

        const product = await prisma.product.create({
            data: { name: 'Process Product Test', price: 50000, stock: 20, storeId }
        });
        productId = product.id;

        const address = await prisma.address.create({
            data: {
                userId: buyerId,
                title: 'Home',
                recipientName: 'Buyer',
                phoneNumber: '123',
                fullAddress: 'Test Address',
                isDefault: true
            }
        });
        addressId = address.id;

        await prisma.cart.create({
            data: {
                userId: buyerId,
                storeId,
                items: { create: { productId, quantity: 1 } }
            }
        });

        const orderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ addressId, deliveryMethod: 'REGULAR' });

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

    it('PATCH /api/orders/seller/:id/process - should process order from PACKING to WAITING_FOR_DRIVER', async () => {
        const res = await request(app)
            .patch(`/api/orders/seller/${orderId}/process`)
            .set('Authorization', `Bearer ${sellerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('WAITING_FOR_DRIVER');
    });

    it('PATCH /api/orders/seller/:id/process - should reject processing an already processed order', async () => {
        const res = await request(app)
            .patch(`/api/orders/seller/${orderId}/process`)
            .set('Authorization', `Bearer ${sellerToken}`);

        expect(res.statusCode).toEqual(400);
    });

    it('PATCH /api/orders/seller/:id/process - should reject non-owner seller', async () => {
        const passwordHash = await bcrypt.hash('Password123', 10);
        const otherSeller = await prisma.user.create({
            data: {
                email: `other.seller.process.${Date.now()}@test.com`,
                password: passwordHash,
                name: 'Other Seller',
                activeRole: 'SELLER',
                userRoles: { create: [{ role: 'SELLER' }] },
                store: { create: { name: 'Other Process Store ' + Date.now() } }
            },
            include: { store: true }
        });
        const otherSellerToken = generateAccessToken({ userId: otherSeller.id });

        const res = await request(app)
            .patch(`/api/orders/seller/${orderId}/process`)
            .set('Authorization', `Bearer ${otherSellerToken}`);

        expect(res.statusCode).toEqual(404);

        await prisma.store.deleteMany({ where: { userId: otherSeller.id } });
        await prisma.user.deleteMany({ where: { id: otherSeller.id } });
    });

    it('GET /api/orders/buyer/:id - should show WAITING_FOR_DRIVER in status history', async () => {
        const res = await request(app)
            .get(`/api/orders/buyer/${orderId}`)
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.status).toBe('WAITING_FOR_DRIVER');

        const statuses = res.body.data.statusHistory.map(h => h.status);
        expect(statuses).toContain('PACKING');
        expect(statuses).toContain('WAITING_FOR_DRIVER');
    });
});
