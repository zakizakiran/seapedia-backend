const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/review.controller');
const validate = require('../middlewares/validate.middleware');
const { createReviewValidator } = require('../validators/review.validator');

router.get('/', reviewController.getReviews);
router.post('/', createReviewValidator, validate, reviewController.createReview);

module.exports = router;
