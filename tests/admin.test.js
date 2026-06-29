const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');
const { generateAccessToken } = require('../src/utils/jwt.utils');
const bcrypt = require('bcryptjs');

describe('Admin Dashboard API Endpoints', () => {
    let adminToken;
    let adminId;
    let buyerToken;
    let buyerId;

    beforeAll(async () => {
        const passwordHash = await bcrypt.hash('Password123', 10);

        const admin = await prisma.user.create({
            data: {
                email: `admin.dashboard.${Date.now()}@test.com`,
                password: passwordHash,
                name: 'Admin Dashboard Test',
                activeRole: 'ADMIN',
                userRoles: { create: [{ role: 'ADMIN' }] },
            },
        });
        adminId = admin.id;
        adminToken = generateAccessToken({ userId: admin.id });

        const buyer = await prisma.user.create({
            data: {
                email: `buyer.dashboard.${Date.now()}@test.com`,
                password: passwordHash,
                name: 'Buyer Dashboard Test',
                activeRole: 'BUYER',
                userRoles: { create: [{ role: 'BUYER' }] },
            },
        });
        buyerId = buyer.id;
        buyerToken = generateAccessToken({ userId: buyer.id });
    });

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [adminId, buyerId] } } });
        await prisma.$disconnect();
    });

    it('GET /api/admin/dashboard - should return dashboard stats', async () => {
        const res = await request(app)
            .get('/api/admin/dashboard')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.stats).toBeDefined();
        expect(typeof res.body.data.stats.totalUsers).toBe('number');
        expect(typeof res.body.data.stats.totalStores).toBe('number');
        expect(typeof res.body.data.stats.totalProducts).toBe('number');
        expect(typeof res.body.data.stats.totalOrders).toBe('number');
        expect(typeof res.body.data.stats.totalVouchers).toBe('number');
        expect(typeof res.body.data.stats.totalPromos).toBe('number');
        expect(typeof res.body.data.stats.totalDeliveryJobs).toBe('number');
        expect(typeof res.body.data.stats.overdueCount).toBe('number');
        expect(res.body.data.stats.ordersByStatus).toBeDefined();
    });

    it('GET /api/admin/users - should return all users', async () => {
        const res = await request(app)
            .get('/api/admin/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data.users)).toBe(true);
        expect(res.body.data.users.length).toBeGreaterThanOrEqual(2);

        const user = res.body.data.users[0];
        expect(user.id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.userRoles).toBeDefined();
    });

    it('GET /api/admin/orders - should return all orders', async () => {
        const res = await request(app)
            .get('/api/admin/orders')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data.orders)).toBe(true);
    });

    it('GET /api/admin/overdue-orders - should return overdue (returned) orders', async () => {
        const res = await request(app)
            .get('/api/admin/overdue-orders')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data.orders)).toBe(true);
    });

    it('GET /api/admin/time-info - should return time simulation info', async () => {
        const res = await request(app)
            .get('/api/admin/time-info')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.simulatedTime).toBeDefined();
        expect(res.body.data.realTime).toBeDefined();
    });

    it('GET /api/admin/dashboard - should reject non-ADMIN', async () => {
        const res = await request(app)
            .get('/api/admin/dashboard')
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(403);
    });

    it('GET /api/admin/users - should reject non-ADMIN', async () => {
        const res = await request(app)
            .get('/api/admin/users')
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(403);
    });

    it('POST /api/admin/overdue/process - should reject non-ADMIN', async () => {
        const res = await request(app)
            .post('/api/admin/overdue/process')
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(403);
    });

    it('POST /api/admin/simulate-day - should reject non-ADMIN', async () => {
        const res = await request(app)
            .post('/api/admin/simulate-day')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ days: 1 });

        expect(res.statusCode).toEqual(403);
    });
});
