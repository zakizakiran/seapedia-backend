const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');
const { generateAccessToken } = require('../src/utils/jwt.utils');
const bcrypt = require('bcryptjs');

describe('Discount API Endpoints', () => {
    let adminToken;
    let adminId;
    let buyerToken;
    let buyerId;
    let voucherId;
    let promoId;

    beforeAll(async () => {
        const passwordHash = await bcrypt.hash('Password123', 10);

        const admin = await prisma.user.create({
            data: {
                email: `admin.discount.${Date.now()}@test.com`,
                password: passwordHash,
                name: 'Admin Discount Test',
                activeRole: 'ADMIN',
                userRoles: { create: [{ role: 'ADMIN' }] }
            }
        });
        adminId = admin.id;
        adminToken = generateAccessToken({ userId: admin.id });

        const buyer = await prisma.user.create({
            data: {
                email: `buyer.discount.${Date.now()}@test.com`,
                password: passwordHash,
                name: 'Buyer Discount Test',
                activeRole: 'BUYER',
                userRoles: { create: [{ role: 'BUYER' }] }
            }
        });
        buyerId = buyer.id;
        buyerToken = generateAccessToken({ userId: buyer.id });
    });

    afterAll(async () => {
        await prisma.voucher.deleteMany({ where: { code: { startsWith: 'TEST_' } } });
        await prisma.promo.deleteMany({ where: { code: { startsWith: 'TEST_' } } });
        await prisma.user.deleteMany({ where: { id: { in: [adminId, buyerId] } } });
        await prisma.$disconnect();
    });

    it('POST /api/discounts/vouchers - should create a voucher (ADMIN)', async () => {
        const res = await request(app)
            .post('/api/discounts/vouchers')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                code: 'TEST_VOUCHER_10K',
                discountAmount: 10000,
                expiryDate: '2027-12-31T00:00:00.000Z',
                remainingUsage: 100
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.voucher.code).toBe('TEST_VOUCHER_10K');
        voucherId = res.body.data.voucher.id;
    });

    it('POST /api/discounts/vouchers - should reject without required fields', async () => {
        const res = await request(app)
            .post('/api/discounts/vouchers')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ code: 'INCOMPLETE' });

        expect(res.statusCode).toEqual(400);
    });

    it('POST /api/discounts/vouchers - should reject non-ADMIN role', async () => {
        const res = await request(app)
            .post('/api/discounts/vouchers')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                code: 'TEST_BUYER_VOUCHER',
                discountAmount: 5000,
                expiryDate: '2027-12-31T00:00:00.000Z',
                remainingUsage: 10
            });

        expect(res.statusCode).toEqual(403);
    });

    it('GET /api/discounts/vouchers - should list all vouchers', async () => {
        const res = await request(app)
            .get('/api/discounts/vouchers')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data.vouchers)).toBe(true);
    });

    it('GET /api/discounts/vouchers/:id - should return voucher detail', async () => {
        const res = await request(app)
            .get(`/api/discounts/vouchers/${voucherId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.voucher.id).toBe(voucherId);
    });

    it('POST /api/discounts/promos - should create a promo (ADMIN)', async () => {
        const res = await request(app)
            .post('/api/discounts/promos')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                code: 'TEST_PROMO_20PCT',
                discountPercent: 20,
                expiryDate: '2027-12-31T00:00:00.000Z'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.promo.code).toBe('TEST_PROMO_20PCT');
        promoId = res.body.data.promo.id;
    });

    it('GET /api/discounts/promos - should list all promos', async () => {
        const res = await request(app)
            .get('/api/discounts/promos')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.data.promos)).toBe(true);
    });

    it('GET /api/discounts/promos/:id - should return promo detail', async () => {
        const res = await request(app)
            .get(`/api/discounts/promos/${promoId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.promo.id).toBe(promoId);
    });
});
