const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');

describe('Product API Endpoints', () => {
    let dummyStoreId;
    let dummyProductId;

    let sellerToken;
    let sellerUserId;
    let sellerStoreId;
    let createdProductId;

    beforeAll(async () => {
        
        const product = await prisma.product.findFirst({
            include: { store: true },
        });

        if (product) {
            dummyProductId = product.id;
            dummyStoreId = product.storeId;
        }


        await prisma.product.deleteMany({
            where: { store: { user: { email: 'seller-product@seapedia.test' } } }
        }).catch(() => {});
        await prisma.store.deleteMany({
            where: { user: { email: 'seller-product@seapedia.test' } }
        }).catch(() => {});
        await prisma.user.deleteMany({
            where: { email: 'seller-product@seapedia.test' }
        }).catch(() => {});

        const resSeller = await request(app).post('/api/auth/register').send({
            email: 'seller-product@seapedia.test',
            password: 'Password123!',
            name: 'Seller Product Test',
            roles: ['SELLER'],
        });
        sellerToken = resSeller.body.data.accessToken;
        sellerUserId = resSeller.body.data.user.id;

        const selRes = await request(app).post('/api/auth/select-role')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({ role: 'SELLER' });
        sellerToken = selRes.body.data.accessToken;

        const storeRes = await request(app).post('/api/stores/seller')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({ name: 'Seller Product Test Store' });
        sellerStoreId = storeRes.body.data.store.id;
    });

    afterAll(async () => {
        
        await prisma.product.deleteMany({ where: { storeId: sellerStoreId } }).catch(() => {});
        
        if (sellerStoreId) {
            await prisma.store.delete({ where: { id: sellerStoreId } }).catch(() => {});
        }
        
        await prisma.user.deleteMany({ where: { email: 'seller-product@seapedia.test' } }).catch(() => {});

        await prisma.$disconnect();
    });

    it('GET /api/products - should return list of products with pagination', async () => {
        const res = await request(app).get('/api/products?page=1&limit=5');

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data.products)).toBe(true);
        expect(res.body.data.pagination).toBeDefined();
        expect(res.body.data.pagination.limit).toBe(5);
        expect(res.body.data.pagination.page).toBe(1);
    });

    it('GET /api/products?search= - should search for products', async () => {
        
        const res = await request(app).get('/api/products?search=ikan');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.data.products)).toBe(true);
    });

    it('GET /api/products?storeId= - should filter products by store', async () => {
        if (!dummyStoreId) {
            console.warn('Skipping store filter test - no dummy store found');
            return;
        }

        const res = await request(app).get(`/api/products?storeId=${dummyStoreId}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.data.products)).toBe(true);
        res.body.data.products.forEach((p) => {
            expect(p.store.id).toBe(dummyStoreId);
        });
    });

    it('GET /api/products/:id - should get product details', async () => {
        if (!dummyProductId) {
            console.warn('Skipping product detail test - no dummy product found');
            return;
        }

        const res = await request(app).get(`/api/products/${dummyProductId}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.product).toBeDefined();
        expect(res.body.data.product.id).toBe(dummyProductId);
        expect(res.body.data.product.store).toBeDefined();
    });

    it('GET /api/products/:id - should return 404 for nonexistent product', async () => {
        const res = await request(app).get('/api/products/nonexistent-id-123');

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('Product not found');
    });

    it('GET /api/products/seller/my-products - should return empty list initially', async () => {
        const res = await request(app)
            .get('/api/products/seller/my-products')
            .set('Authorization', `Bearer ${sellerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.products.length).toBe(0);
    });

    it('POST /api/products/seller - should create a new product', async () => {
        const res = await request(app)
            .post('/api/products/seller')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({
                name: 'Fresh Tuna',
                description: 'Very fresh',
                price: 50000,
                stock: 10,
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.product.name).toBe('Fresh Tuna');
        expect(res.body.data.product.storeId).toBe(sellerStoreId);

        createdProductId = res.body.data.product.id;
    });

    it('GET /api/products/seller/my-products - should list newly created product', async () => {
        const res = await request(app)
            .get('/api/products/seller/my-products')
            .set('Authorization', `Bearer ${sellerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.products.length).toBe(1);
        expect(res.body.data.products[0].id).toBe(createdProductId);
    });

    it('PUT /api/products/seller/:id - should update product', async () => {
        const res = await request(app)
            .put(`/api/products/seller/${createdProductId}`)
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({
                price: 60000,
                stock: 5,
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.product.price).toBe(60000);
        expect(res.body.data.product.stock).toBe(5);
        
        expect(res.body.data.product.name).toBe('Fresh Tuna');
    });

    it('DELETE /api/products/seller/:id - should delete product', async () => {
        const res = await request(app)
            .delete(`/api/products/seller/${createdProductId}`)
            .set('Authorization', `Bearer ${sellerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toContain('deleted successfully');

        const checkRes = await request(app).get(`/api/products/${createdProductId}`);
        expect(checkRes.statusCode).toEqual(404);
    });
});
