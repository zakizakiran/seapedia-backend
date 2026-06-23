const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');
const { generateAccessToken } = require('../src/utils/jwt.utils');
const bcrypt = require('bcryptjs');

describe('Order API Endpoints', () => {
    let buyerId, buyerToken;
    let sellerId, sellerToken, storeId;
    let productId;
    let addressId;

    beforeAll(async () => {
        const passwordHash = await bcrypt.hash('Password123', 10);
        
        const buyer = await prisma.user.create({
            data: {
                email: 'buyer.order@test.com',
                password: passwordHash,
                name: 'Buyer Order Test',
                activeRole: 'BUYER',
                userRoles: { create: [{ role: 'BUYER' }] },
                wallet: { create: { balance: 200000 } }
            }
        });
        buyerId = buyer.id;
        buyerToken = generateAccessToken({ userId: buyer.id });

        const seller = await prisma.user.create({
            data: {
                email: 'seller.order@test.com',
                password: passwordHash,
                name: 'Seller Order Test',
                activeRole: 'SELLER',
                userRoles: { create: [{ role: 'SELLER' }] },
                store: { create: { name: 'Order Store Test' } }
            },
            include: { store: true }
        });
        sellerId = seller.id;
        sellerToken = generateAccessToken({ userId: seller.id });
        storeId = seller.store.id;

        const product = await prisma.product.create({
            data: { name: 'Product Order Test', price: 50000, stock: 10, storeId }
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
                items: {
                    create: { productId, quantity: 2 } 
                }
            }
        });
    });

    afterAll(async () => {
        const order = await prisma.order.findFirst({ where: { buyerId } });
        if (order) {
            await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
            await prisma.orderStatusHistory.deleteMany({ where: { orderId: order.id } });
            await prisma.order.deleteMany({ where: { buyerId } });
        }
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

    it('POST /api/orders - should create an order successfully', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ addressId, deliveryMethod: 'NEXT_DAY' });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.subtotal).toBe(100000);
        expect(res.body.data.tax).toBe(12000);
        expect(res.body.data.deliveryFee).toBe(30000);
        expect(res.body.data.total).toBe(142000);
        expect(res.body.data.status).toBe('PACKING');

        const wallet = await prisma.wallet.findUnique({ where: { userId: buyerId } });
        expect(wallet.balance).toBe(58000);

        const product = await prisma.product.findUnique({ where: { id: productId } });
        expect(product.stock).toBe(8);

        const cart = await prisma.cart.findUnique({ where: { userId: buyerId }, include: { items: true } });
        expect(cart.storeId).toBeNull();
        expect(cart.items.length).toBe(0);
    });

    it('GET /api/orders/buyer - should return buyer orders', async () => {
        const res = await request(app)
            .get('/api/orders/buyer')
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(1);
    });

    it('GET /api/orders/seller - should return seller incoming orders', async () => {
        const res = await request(app)
            .get('/api/orders/seller')
            .set('Authorization', `Bearer ${sellerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].total).toBe(142000);
    });
});
