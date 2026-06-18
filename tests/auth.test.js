const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');

describe('Auth API Endpoints', () => {
    const testEmail = 'test-auth@seapedia.test.com';
    const testPassword = 'Password123!';
    let accessToken;
    let refreshToken;
    let createdUserId;

    afterAll(async () => {
        // Cleanup test user
        if (createdUserId) {
            await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
        }
        await prisma.$disconnect();
    });

    it('POST /api/auth/register - should register a new multi-role user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: testEmail,
                password: testPassword,
                name: 'Test Auth User',
                roles: ['BUYER', 'SELLER'],
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.user.email).toBe(testEmail);
        expect(res.body.data.user.roles).toContain('BUYER');
        expect(res.body.data.user.roles).toContain('SELLER');
        expect(res.body.data.requiresRoleSelection).toBe(true);

        createdUserId = res.body.data.user.id;
        accessToken = res.body.data.accessToken;
        refreshToken = res.body.data.refreshToken;
    });

    it('POST /api/auth/register - should fail with duplicate email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: testEmail,
                password: testPassword,
                name: 'Another User',
                roles: ['BUYER'],
            });

        expect(res.statusCode).toEqual(409);
        expect(res.body.message).toContain('Email is already registered');
    });

    it('POST /api/auth/login - should login user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testEmail,
                password: testPassword,
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.user.email).toBe(testEmail);
        expect(res.body.data.requiresRoleSelection).toBe(true);
        expect(res.body.data.user.activeRole).toBeNull();
    });

    it('GET /api/auth/profile - should get profile (no active role yet)', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.user.email).toBe(testEmail);
        expect(res.body.data.user.activeRole).toBeNull();
    });

    it('POST /api/auth/select-role - should set active role', async () => {
        const res = await request(app)
            .post('/api/auth/select-role')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ role: 'SELLER' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.activeRole).toBe('SELLER');
        expect(res.body.data.accessToken).toBeDefined();

        // Update token with the new one that has activeRole payload
        accessToken = res.body.data.accessToken;
    });

    it('GET /api/auth/profile - should return financial summary for SELLER', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.user.activeRole).toBe('SELLER');
        expect(res.body.data.user.financialSummary.seller).toBeDefined();
        expect(res.body.data.user.financialSummary.buyer).toBeDefined(); // because user has BUYER role too
    });

    it('POST /api/auth/refresh-token - should get new tokens', async () => {
        const res = await request(app)
            .post('/api/auth/refresh-token')
            .send({ refreshToken });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.refreshToken).toBeDefined();

        accessToken = res.body.data.accessToken;
        refreshToken = res.body.data.refreshToken;
    });

    it('DELETE /api/auth/logout - should logout user', async () => {
        const res = await request(app)
            .delete('/api/auth/logout')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ refreshToken });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Logged out successfully');
    });

    it('POST /api/auth/refresh-token - should fail with old refresh token after logout', async () => {
        const res = await request(app)
            .post('/api/auth/refresh-token')
            .send({ refreshToken });

        expect(res.statusCode).toEqual(401);
    });
});
