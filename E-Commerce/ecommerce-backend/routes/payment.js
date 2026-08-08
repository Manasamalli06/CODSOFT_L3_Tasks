const express = require('express');
const {
  createPaymentIntent,
  getStripeConfig,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/config', getStripeConfig);
router.post('/create-intent', protect, createPaymentIntent);

module.exports = router;
