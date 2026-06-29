const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');

describe('Delivery API Endpoints', () => {
    let driverToken;
    let driverUserId;
    
    let sellerToken;
    let sellerUserId;
    let sellerStoreId;
    
    let buyerToken;
    let buyerUserId;
    let buyerAddressId;
    
    let testProductId;
    let testOrderId;
    let testJobId;

    beforeAll(async () => {
        const testEmails = ['driver-deliv@seapedia.test', 'seller-deliv@seapedia.test', 'buyer-deliv@seapedia.test'];
        
        await prisma.deliveryJob.deleteMany({
            where: { driver: { email: { in: testEmails } } }
        }).catch(() => {});
        await prisma.orderStatusHistory.deleteMany({
            where: { order: { buyer: { email: { in: testEmails } } } }
        }).catch(() => {});
        await prisma.orderItem.deleteMany({
            where: { order: { buyer: { email: { in: testEmails } } } }
        }).catch(() => {});
        await prisma.order.deleteMany({
            where: { buyer: { email: { in: testEmails } } }
        }).catch(() => {});
        await prisma.product.deleteMany({
            where: { store: { user: { email: { in: testEmails } } } }
        }).catch(() => {});
        await prisma.address.deleteMany({
            where: { user: { email: { in: testEmails } } }
        }).catch(() => {});
        await prisma.walletTransaction.deleteMany({
            where: { wallet: { user: { email: { in: testEmails } } } }
        }).catch(() => {});
        await prisma.wallet.deleteMany({
            where: { user: { email: { in: testEmails } } }
        }).catch(() => {});
        await prisma.store.deleteMany({
            where: { user: { email: { in: testEmails } } }
        }).catch(() => {});
        await prisma.user.deleteMany({
            where: { email: { in: testEmails } }
        }).catch(() => {});

        // Setup Driver
        const resDriver = await request(app).post('/api/auth/register').send({
            email: 'driver-deliv@seapedia.test',
            password: 'Password123!',
            name: 'Driver Deliv Test',
            roles: ['DRIVER'],
        });
        driverToken = resDriver.body.data.accessToken;
        driverUserId = resDriver.body.data.user.id;
        const selResD = await request(app).post('/api/auth/select-role')
            .set('Authorization', `Bearer ${driverToken}`)
            .send({ role: 'DRIVER' });
        driverToken = selResD.body.data.accessToken;

        await prisma.wallet.create({ data: { userId: driverUserId, balance: 0 } });

        const resSeller = await request(app).post('/api/auth/register').send({
            email: 'seller-deliv@seapedia.test',
            password: 'Password123!',
            name: 'Seller Deliv Test',
            roles: ['SELLER'],
        });
        sellerToken = resSeller.body.data.accessToken;
        sellerUserId = resSeller.body.data.user.id;
        const selResS = await request(app).post('/api/auth/select-role')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({ role: 'SELLER' });
        sellerToken = selResS.body.data.accessToken;

        const storeRes = await request(app).post('/api/stores/seller')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({ name: 'Seller Deliv Test Store' });
        sellerStoreId = storeRes.body.data.store.id;

        const productRes = await request(app).post('/api/products/seller')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({ name: 'Test Product Deliv', description: 'Test', price: 10000, stock: 100 });
        testProductId = productRes.body.data.product.id;

        const resBuyer = await request(app).post('/api/auth/register').send({
            email: 'buyer-deliv@seapedia.test',
            password: 'Password123!',
            name: 'Buyer Deliv Test',
            roles: ['BUYER'],
        });
        buyerToken = resBuyer.body.data.accessToken;
        buyerUserId = resBuyer.body.data.user.id;
        const selResB = await request(app).post('/api/auth/select-role')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ role: 'BUYER' });
        buyerToken = selResB.body.data.accessToken;

        const addressRes = await request(app).post('/api/addresses')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                title: 'Home',
                fullAddress: 'Jl. Test Deliv No 123',
                recipientName: 'Buyer Deliv',
                phoneNumber: '081234567890'
            });
        buyerAddressId = addressRes.body.data.id;

        const createdOrder = await prisma.order.create({
            data: {
                buyerId: buyerUserId,
                storeId: sellerStoreId,
                addressId: buyerAddressId,
                deliveryMethod: 'REGULAR',
                deliveryFee: 15000,
                subtotal: 10000,
                tax: 1100,
                total: 26100,
                status: 'WAITING_FOR_DRIVER',
                items: {
                    create: [
                        {
                            productId: testProductId,
                            quantity: 1,
                            price: 10000
                        }
                    ]
                }
            }
        });
        testOrderId = createdOrder.id;
    });

    afterAll(async () => {
        const testEmails = ['driver-deliv@seapedia.test', 'seller-deliv@seapedia.test', 'buyer-deliv@seapedia.test'];
        await prisma.deliveryJob.deleteMany({
            where: { driver: { email: { in: testEmails } } }
        }).catch(() => {});
        await prisma.orderStatusHistory.deleteMany({
            where: { order: { buyer: { email: { in: testEmails } } } }
        }).catch(() => {});
        await prisma.orderItem.deleteMany({
            where: { order: { buyer: { email: { in: testEmails } } } }
        }).catch(() => {});
        await prisma.order.deleteMany({
            where: { buyer: { email: { in: testEmails } } }
        }).catch(() => {});
        await prisma.product.deleteMany({
            where: { store: { user: { email: { in: testEmails } } } }
        }).catch(() => {});
        await prisma.address.deleteMany({
            where: { user: { email: { in: testEmails } } }
        }).catch(() => {});
        await prisma.walletTransaction.deleteMany({
            where: { wallet: { user: { email: { in: testEmails } } } }
        }).catch(() => {});
        await prisma.wallet.deleteMany({
            where: { user: { email: { in: testEmails } } }
        }).catch(() => {});
        await prisma.store.deleteMany({
            where: { user: { email: { in: testEmails } } }
        }).catch(() => {});
        await prisma.user.deleteMany({
            where: { email: { in: testEmails } }
        }).catch(() => {});
        await prisma.$disconnect();
    });

    it('GET /api/deliveries/available - should return list of available jobs', async () => {
        const res = await request(app)
            .get('/api/deliveries/available')
            .set('Authorization', `Bearer ${driverToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data.jobs)).toBe(true);
        expect(res.body.data.jobs.some(job => job.id === testOrderId)).toBe(true);
    });

    it('GET /api/deliveries/jobs/:id - should return job details', async () => {
        const res = await request(app)
            .get(`/api/deliveries/jobs/${testOrderId}`)
            .set('Authorization', `Bearer ${driverToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.job.id).toBe(testOrderId);
        expect(res.body.data.job.address).toBeDefined();
        expect(res.body.data.job.items).toBeDefined();
    });

    it('POST /api/deliveries/jobs/:orderId/take - should take available job', async () => {
        const res = await request(app)
            .post(`/api/deliveries/jobs/${testOrderId}/take`)
            .set('Authorization', `Bearer ${driverToken}`);

        expect(res.statusCode).toEqual(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.deliveryJob.orderId).toBe(testOrderId);
        expect(res.body.data.deliveryJob.driverId).toBe(driverUserId);
        expect(res.body.data.deliveryJob.status).toBe('TAKEN');
        expect(res.body.data.deliveryJob.earnings).toBe(15000 * 0.8);

        testJobId = res.body.data.deliveryJob.id;
    });

    it('POST /api/deliveries/jobs/:orderId/take - should prevent taking job if already has active job', async () => {
        const secondOrder = await prisma.order.create({
            data: {
                buyerId: buyerUserId,
                storeId: sellerStoreId,
                addressId: buyerAddressId,
                deliveryMethod: 'REGULAR',
                deliveryFee: 15000,
                subtotal: 10000,
                tax: 1100,
                total: 26100,
                status: 'WAITING_FOR_DRIVER',
            }
        });

        const res = await request(app)
            .post(`/api/deliveries/jobs/${secondOrder.id}/take`)
            .set('Authorization', `Bearer ${driverToken}`);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('You already have an active job');
        
        await prisma.order.delete({ where: { id: secondOrder.id } }).catch(() => {});
    });

    it('GET /api/deliveries/dashboard - should return active job', async () => {
        const res = await request(app)
            .get('/api/deliveries/dashboard')
            .set('Authorization', `Bearer ${driverToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.activeJob).toBeDefined();
        expect(res.body.data.activeJob.id).toBe(testJobId);
        expect(res.body.data.jobHistory.length).toBe(0);
        expect(res.body.data.totalEarnings).toBe(0);
    });

    it('PATCH /api/deliveries/jobs/:id/complete - should complete the job and credit wallet', async () => {
        const res = await request(app)
            .patch(`/api/deliveries/jobs/${testJobId}/complete`)
            .set('Authorization', `Bearer ${driverToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.deliveryJob.status).toBe('COMPLETED');

        const order = await prisma.order.findUnique({ where: { id: testOrderId } });
        expect(order.status).toBe('COMPLETED');

        const wallet = await prisma.wallet.findUnique({ where: { userId: driverUserId } });
        expect(wallet.balance).toBe(15000 * 0.8);
    });
});
