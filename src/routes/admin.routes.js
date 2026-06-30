const express = require('express');
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/orders', adminController.getAllOrders);
router.get('/overdue-orders', adminController.getOverdueOrders);
router.get('/stores', adminController.getAllStores);
router.get('/products', adminController.getAllProducts);
router.get('/delivery-jobs', adminController.getAllDeliveryJobs);

router.post('/overdue/process', adminController.processOverdue);
router.post('/simulate-day', adminController.simulateNextDay);
router.post('/simulate-day/reset', adminController.resetSimulatedTime);
router.get('/time-info', adminController.getTimeInfo);

module.exports = router;
