const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');

describe('Product API Endpoints', () => {
    let dummyStoreId;
    let dummyProductId;

    beforeAll(async () => {
        // Check if there are any products in the DB from seeding
        const product = await prisma.product.findFirst({
            include: { store: true },
        });

        if (product) {
            dummyProductId = product.id;
            dummyStoreId = product.storeId;
        }
    });

    afterAll(async () => {
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
        // Since we don't know exactly what seed data is there, we search for a common letter or assume it returns 200
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
});
