const stripe = require('stripe');

// @desc    Create payment intent
// @route   POST /api/payment/create-intent
// @access  Private
const createPaymentIntent = async (req, res, next) => {
  try {
    const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount',
      });
    }

    // If Stripe is not configured, simulate payment
    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here'
    ) {
      // Simulate a successful payment for demo purposes
      return res.json({
        success: true,
        data: {
          clientSecret: 'demo_simulated_payment_' + Date.now(),
          simulated: true,
        },
      });
    }

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      metadata: {
        userId: req.user._id.toString(),
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        simulated: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Stripe publishable key
// @route   GET /api/payment/config
// @access  Public
const getStripeConfig = (req, res) => {
  const key = process.env.STRIPE_PUBLISHABLE_KEY;
  const isConfigured =
    key && key !== 'pk_test_your_stripe_publishable_key_here';

  res.json({
    success: true,
    data: {
      publishableKey: isConfigured ? key : null,
      isConfigured,
    },
  });
};

module.exports = { createPaymentIntent, getStripeConfig };
