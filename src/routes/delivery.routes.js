const express = require('express');
const deliveryController = require('../controllers/delivery.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate, authorize('DRIVER'));

router.get('/dashboard', deliveryController.getDashboard);
router.get('/available', deliveryController.getAvailableJobs);
router.get('/jobs/:id', deliveryController.getJobDetail);
router.post('/jobs/:orderId/take', deliveryController.takeJob);
router.patch('/jobs/:id/complete', deliveryController.completeJob);

module.exports = router;
