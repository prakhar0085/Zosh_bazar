// paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/userAuthMiddleware');

// Payment success handler
router.get('/:paymentId', authMiddleware, paymentController.paymentSuccessHandler);

// Create payment order
router.post('/create-order', authMiddleware, paymentController.createPaymentOrder);

// Verify payment
router.post('/verify', authMiddleware, paymentController.verifyPayment);

// Get payment status
router.get('/status/:orderId', authMiddleware, paymentController.getPaymentStatus);

// Webhook for Razorpay (no auth required)
router.post('/webhook/razorpay', paymentController.razorpayWebhook);

module.exports = router;
