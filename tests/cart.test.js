const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');
const { generateAccessToken } = require('../src/utils/jwt.utils');
const bcrypt = require('bcryptjs');

describe('Cart API Endpoints', () => {
    let buyerToken;
    let buyerId;
    let sellerId1, sellerToken1, storeId1;
    let sellerId2, sellerToken2, storeId2;
    let productStore1;
    let productStore2;

    beforeAll(async () => {
        const passwordHash = await bcrypt.hash('Password123', 10);
        const buyer = await prisma.user.create({
            data: {
                email: 'buyer.cart@test.com',
                password: passwordHash,
                name: 'Buyer Cart Test',
                activeRole: 'BUYER',
                userRoles: { create: [{ role: 'BUYER' }] }
            }
        });
        buyerId = buyer.id;
        buyerToken = generateAccessToken({ userId: buyer.id });

        const seller1 = await prisma.user.create({
            data: {
                email: 'seller1.cart@test.com',
                password: passwordHash,
                name: 'Seller 1',
                activeRole: 'SELLER',
                userRoles: { create: [{ role: 'SELLER' }] },
                store: { create: { name: 'Store 1 for Cart' } }
            },
            include: { store: true }
        });
        sellerId1 = seller1.id;
        storeId1 = seller1.store.id;
        
        productStore1 = await prisma.product.create({
            data: { name: 'Product Store 1', price: 10000, stock: 50, storeId: storeId1 }
        });

        const seller2 = await prisma.user.create({
            data: {
                email: 'seller2.cart@test.com',
                password: passwordHash,
                name: 'Seller 2',
                activeRole: 'SELLER',
                userRoles: { create: [{ role: 'SELLER' }] },
                store: { create: { name: 'Store 2 for Cart' } }
            },
            include: { store: true }
        });
        sellerId2 = seller2.id;
        storeId2 = seller2.store.id;
        
        productStore2 = await prisma.product.create({
            data: { name: 'Product Store 2', price: 20000, stock: 50, storeId: storeId2 }
        });
    });

    afterAll(async () => {
        const cart = await prisma.cart.findUnique({ where: { userId: buyerId } });
        if (cart) {
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
            await prisma.cart.delete({ where: { userId: buyerId } });
        }
        
        await prisma.product.deleteMany({ where: { storeId: { in: [storeId1, storeId2] } } });
        await prisma.store.deleteMany({ where: { id: { in: [storeId1, storeId2] } } });
        await prisma.user.deleteMany({ where: { id: { in: [buyerId, sellerId1, sellerId2] } } });

        await prisma.$disconnect();
    });

    it('GET /api/carts - should return empty cart initially', async () => {
        const res = await request(app)
            .get('/api/carts')
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.subtotal).toBe(0);
        expect(res.body.data.storeId).toBeNull();
        expect(res.body.data.items.length).toBe(0);
    });

    it('POST /api/carts/items - should add product from store 1', async () => {
        const res = await request(app)
            .post('/api/carts/items')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ productId: productStore1.id, quantity: 2 });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.quantity).toBe(2);

        const cartRes = await request(app).get('/api/carts').set('Authorization', `Bearer ${buyerToken}`);
        expect(cartRes.body.data.storeId).toBe(storeId1);
        expect(cartRes.body.data.subtotal).toBe(20000); // 2 * 10000
    });

    it('POST /api/carts/items - should prevent adding product from store 2 (Single-Store Rule)', async () => {
        const res = await request(app)
            .post('/api/carts/items')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ productId: productStore2.id, quantity: 1 });

        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toBe('fail');
        expect(res.body.message).toContain('hanya boleh berisi produk dari satu toko');
    });

    it('POST /api/carts/items - should update quantity for same product', async () => {
        const res = await request(app)
            .post('/api/carts/items')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ productId: productStore1.id, quantity: 5 });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.quantity).toBe(5);

        const cartRes = await request(app).get('/api/carts').set('Authorization', `Bearer ${buyerToken}`);
        expect(cartRes.body.data.subtotal).toBe(50000);
    });

    it('DELETE /api/carts/items/:productId - should remove item and reset storeId if empty', async () => {
        const res = await request(app)
            .delete(`/api/carts/items/${productStore1.id}`)
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(200);

        const cartRes = await request(app).get('/api/carts').set('Authorization', `Bearer ${buyerToken}`);
        expect(cartRes.body.data.items.length).toBe(0);
        expect(cartRes.body.data.storeId).toBeNull();
    });

    it('POST /api/carts/items - should add product from store 2 after clearing store 1', async () => {
        const res = await request(app)
            .post('/api/carts/items')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ productId: productStore2.id, quantity: 1 });

        expect(res.statusCode).toEqual(200);

        const cartRes = await request(app).get('/api/carts').set('Authorization', `Bearer ${buyerToken}`);
        expect(cartRes.body.data.storeId).toBe(storeId2);
        expect(cartRes.body.data.subtotal).toBe(20000);
    });

    it('DELETE /api/carts - should clear cart', async () => {
        const res = await request(app)
            .delete('/api/carts')
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(200);

        const cartRes = await request(app).get('/api/carts').set('Authorization', `Bearer ${buyerToken}`);
        expect(cartRes.body.data.items.length).toBe(0);
        expect(cartRes.body.data.storeId).toBeNull();
        expect(cartRes.body.data.subtotal).toBe(0);
    });
});
