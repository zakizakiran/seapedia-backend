const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');
const { generateAccessToken } = require('../src/utils/jwt.utils');
const bcrypt = require('bcryptjs');

describe('Wallet API Endpoints', () => {
    let buyerToken;
    let buyerId;

    beforeAll(async () => {
        const passwordHash = await bcrypt.hash('Password123', 10);
        const user = await prisma.user.create({
            data: {
                email: 'buyer.wallet@test.com',
                password: passwordHash,
                name: 'Buyer Wallet Test',
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
        await prisma.walletTransaction.deleteMany({
            where: { wallet: { userId: buyerId } }
        });
        await prisma.wallet.deleteMany({
            where: { userId: buyerId }
        });
        await prisma.user.delete({ where: { id: buyerId } }).catch(() => {});
        await prisma.$disconnect();
    });

    it('GET /api/wallets - should get empty wallet details initially', async () => {
        const res = await request(app)
            .get('/api/wallets')
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.balance).toBe(0);
        expect(Array.isArray(res.body.data.transactions)).toBe(true);
        expect(res.body.data.transactions.length).toBe(0);
    });

    it('POST /api/wallets/top-up - should top up wallet', async () => {
        const res = await request(app)
            .post('/api/wallets/top-up')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                amount: 50000
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.wallet.balance).toBe(50000);
        expect(res.body.data.transaction.amount).toBe(50000);
        expect(res.body.data.transaction.type).toBe('TOP_UP');
    });

    it('POST /api/wallets/top-up - should fail if amount is less than 1000', async () => {
        const res = await request(app)
            .post('/api/wallets/top-up')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                amount: 500
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Validation error');
    });
});
