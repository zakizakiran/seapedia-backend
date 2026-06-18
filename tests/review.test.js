const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/config/database');

describe('Review API Endpoints', () => {
    let createdReviewId;
    const testReviewerName = 'Jest Test Reviewer';

    afterAll(async () => {
        // Cleanup test review
        if (createdReviewId) {
            await prisma.review.delete({ where: { id: createdReviewId } }).catch(() => {});
        }
        await prisma.$disconnect();
    });

    it('POST /api/reviews - should submit a guest review', async () => {
        const res = await request(app)
            .post('/api/reviews')
            .send({
                reviewerName: testReviewerName,
                rating: 5,
                comment: 'Automated test comment',
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.review.reviewerName).toBe(testReviewerName);
        expect(res.body.data.review.rating).toBe(5);
        expect(res.body.data.review.userId).toBeNull();

        createdReviewId = res.body.data.review.id;
    });

    it('POST /api/reviews - should fail validation for missing fields', async () => {
        const res = await request(app)
            .post('/api/reviews')
            .send({
                rating: 10, // Invalid rating
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Validation error');
        expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('GET /api/reviews - should return list of reviews with stats', async () => {
        const res = await request(app).get('/api/reviews?page=1&limit=5&sort=newest');

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data.reviews)).toBe(true);
        expect(res.body.data.stats).toBeDefined();
        expect(res.body.data.stats.totalReviews).toBeGreaterThanOrEqual(1);
        expect(res.body.data.pagination).toBeDefined();
        
        // Ensure the one we just created is in the system
        const found = res.body.data.reviews.find(r => r.id === createdReviewId);
        expect(found).toBeDefined();
    });
});
