const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');
const { generateAccessToken } = require('../src/utils/jwt.utils');
const bcrypt = require('bcryptjs');

describe('Address API Endpoints', () => {
    let buyerToken;
    let buyerId;
    let addressId;

    beforeAll(async () => {
        const passwordHash = await bcrypt.hash('Password123', 10);
        const user = await prisma.user.create({
            data: {
                email: 'buyer.address@test.com',
                password: passwordHash,
                name: 'Buyer Address Test',
                activeRole: 'BUYER',
                userRoles: {
                    create: [{ role: 'BUYER' }]
                }
            }
        });
        buyerId = user.id;
        buyerToken = generateAccessToken({ userId: user.id });
    });

    afterAll(async () => {
        await prisma.address.deleteMany({
            where: { userId: buyerId }
        });
        await prisma.user.delete({ where: { id: buyerId } }).catch(() => {});
        await prisma.$disconnect();
    });

    it('POST /api/addresses - should create an address', async () => {
        const res = await request(app)
            .post('/api/addresses')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                title: 'Home',
                recipientName: 'John Doe',
                phoneNumber: '081234567890',
                fullAddress: 'Jl. Test No. 1, Jakarta'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe('Home');
        // First address should be default
        expect(res.body.data.isDefault).toBe(true);
        addressId = res.body.data.id;
    });

    it('POST /api/addresses - should create a second address not default by default', async () => {
        const res = await request(app)
            .post('/api/addresses')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                title: 'Office',
                recipientName: 'Jane Doe',
                phoneNumber: '081234567891',
                fullAddress: 'Jl. Test No. 2, Jakarta'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.isDefault).toBe(false);
    });

    it('GET /api/addresses - should list addresses', async () => {
        const res = await request(app)
            .get('/api/addresses')
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(2);
    });

    it('PUT /api/addresses/:id/default - should change default address', async () => {
        // First list addresses to get the second one
        const listRes = await request(app)
            .get('/api/addresses')
            .set('Authorization', `Bearer ${buyerToken}`);
        
        const nonDefaultId = listRes.body.data.find(a => !a.isDefault).id;

        const res = await request(app)
            .put(`/api/addresses/${nonDefaultId}/default`)
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.isDefault).toBe(true);

        // Check if the other one is not default anymore
        const listRes2 = await request(app)
            .get('/api/addresses')
            .set('Authorization', `Bearer ${buyerToken}`);
        
        const defaults = listRes2.body.data.filter(a => a.isDefault);
        expect(defaults.length).toBe(1);
        expect(defaults[0].id).toBe(nonDefaultId);
    });
});
