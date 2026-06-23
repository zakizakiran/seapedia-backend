const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');

describe('Store API Endpoints (Seller Experience)', () => {
    let accessTokenBuyer;
    let accessTokenSeller;
    let sellerUserId;
    let createdStoreId;
    const testStoreName = 'Jest Test Store ' + Date.now();

    beforeAll(async () => {
        
        const resBuyer = await request(app).post('/api/auth/register').send({
            email: 'buyer-store@seapedia.test',
            password: 'Password123!',
            name: 'Buyer Store Test',
            roles: ['BUYER'],
        });
        accessTokenBuyer = resBuyer.body.data.accessToken;

        const selResBuyer = await request(app).post('/api/auth/select-role')
            .set('Authorization', `Bearer ${accessTokenBuyer}`)
            .send({ role: 'BUYER' });
        accessTokenBuyer = selResBuyer.body.data.accessToken;

        const resSeller = await request(app).post('/api/auth/register').send({
            email: 'seller-store@seapedia.test',
            password: 'Password123!',
            name: 'Seller Store Test',
            roles: ['SELLER'],
        });
        accessTokenSeller = resSeller.body.data.accessToken;
        sellerUserId = resSeller.body.data.user.id;

        const selResSeller = await request(app).post('/api/auth/select-role')
            .set('Authorization', `Bearer ${accessTokenSeller}`)
            .send({ role: 'SELLER' });
        accessTokenSeller = selResSeller.body.data.accessToken;
    });

    afterAll(async () => {
        
        if (createdStoreId) {
            await prisma.store.delete({ where: { id: createdStoreId } }).catch(() => {});
        }
        
        await prisma.user.deleteMany({
            where: { email: { in: ['buyer-store@seapedia.test', 'seller-store@seapedia.test'] } }
        }).catch(() => {});
        
        await prisma.$disconnect();
    });

    it('GET /api/stores/seller/my-store - should fail for BUYER (RBAC)', async () => {
        const res = await request(app)
            .get('/api/stores/seller/my-store')
            .set('Authorization', `Bearer ${accessTokenBuyer}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toContain('not authorized to access this resource');
    });

    it('GET /api/stores/seller/my-store - should return 404 for SELLER with no store', async () => {
        const res = await request(app)
            .get('/api/stores/seller/my-store')
            .set('Authorization', `Bearer ${accessTokenSeller}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toContain('Store not found');
    });

    it('POST /api/stores/seller - should create a new store for SELLER', async () => {
        const res = await request(app)
            .post('/api/stores/seller')
            .set('Authorization', `Bearer ${accessTokenSeller}`)
            .send({
                name: testStoreName,
                description: 'Test Description',
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.store.name).toBe(testStoreName);
        expect(res.body.data.store.userId).toBe(sellerUserId);

        createdStoreId = res.body.data.store.id;
    });

    it('POST /api/stores/seller - should fail if SELLER creates another store', async () => {
        const res = await request(app)
            .post('/api/stores/seller')
            .set('Authorization', `Bearer ${accessTokenSeller}`)
            .send({
                name: testStoreName + ' 2',
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toContain('already have a store');
    });

    it('PUT /api/stores/seller - should update the store profile', async () => {
        const newName = testStoreName + ' Updated';
        const res = await request(app)
            .put('/api/stores/seller')
            .set('Authorization', `Bearer ${accessTokenSeller}`)
            .send({
                name: newName,
                description: 'Updated Description',
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.store.name).toBe(newName);
        expect(res.body.data.store.description).toBe('Updated Description');
    });
});
