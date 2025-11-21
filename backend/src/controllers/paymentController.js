// paymentController.js
const PaymentService = require("../services/PaymentService");
const UserService = require("../services/UserService");
const SellerService = require("../services/SellerService");
const OrderService = require("../services/OrderService");
const SellerReportService = require("../services/SellerReportService");
const TransactionService = require("../services/TransactionService");
const Cart = require("../models/Cart");

const paymentSuccessHandler = async (req, res) => {
  const { paymentId } = req.params;
  const { paymentLinkId } = req.query;

  try {
    // Get the user from JWT token
    const user = await req.user;

    const paymentOrder = await PaymentService.getPaymentOrderByPaymentId(
      paymentLinkId
    );

    const paymentSuccess = await PaymentService.proceedPaymentOrder(
      paymentOrder,
      paymentId,
      paymentLinkId
    );

    if (paymentSuccess) {
      for (let orderId of paymentOrder.orders) {
        const order = await OrderService.findOrderById(orderId);

        // Create transaction for the order
        await TransactionService.createTransaction(order);

        // Get seller and update seller report
        const seller = await SellerService.getSellerById(order.seller);
        const sellerReport = await SellerReportService.getSellerReport(seller);

        // Update the seller's report
        sellerReport.totalOrders += 1;
        sellerReport.totalEarnings += order.totalSellingPrice;
        sellerReport.totalSales += order.orderItems.length;

        const updatedReport = await SellerReportService.updateSellerReport(sellerReport);
        console.log("updated report: " + updatedReport)
      }
      // const cart=await c
      await Cart.findOneAndUpdate(
        { user: user._id },
        { cartItems: [] },
        { new: true }
      );

      return res.status(201).json({
        message: "Payment successful",
      });
    } else {
      return res.status(400).json({
        message: "Payment failed",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// Create payment order
const createPaymentOrder = async (req, res) => {
  try {
    const user = await req.user;
    const { orders, paymentMethod = 'razorpay' } = req.body;

    console.log('🛒 Creating payment order for user:', user.email);
    console.log('- Orders count:', orders?.length);
    console.log('- Payment method:', paymentMethod);

    if (!orders || orders.length === 0) {
      return res.status(400).json({ error: 'No orders provided' });
    }

    // Create payment order
    const paymentOrder = await PaymentService.createOrder(user, orders);
    console.log('✅ Payment order created:', paymentOrder._id);

    let paymentLink;
    if (paymentMethod === 'razorpay') {
      paymentLink = await PaymentService.createRazorpayPaymentLink(
        user, 
        paymentOrder.amount, 
        paymentOrder._id
      );
    } else if (paymentMethod === 'stripe') {
      paymentLink = await PaymentService.createStripePaymentLink(
        user, 
        paymentOrder.amount, 
        paymentOrder._id
      );
    }

    res.status(201).json({
      success: true,
      paymentOrder: paymentOrder,
      paymentLink: paymentLink?.short_url || paymentLink,
      message: 'Payment order created successfully'
    });

  } catch (error) {
    console.error('❌ Payment order creation failed:', error);
    res.status(500).json({ 
      error: 'Payment order creation failed',
      message: error.message 
    });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { paymentId, paymentLinkId, signature } = req.body;
    const user = await req.user;

    console.log('🔍 Verifying payment...');
    console.log('- Payment ID:', paymentId);
    console.log('- Payment Link ID:', paymentLinkId);

    const paymentOrder = await PaymentService.getPaymentOrderByPaymentId(paymentLinkId);
    const paymentSuccess = await PaymentService.proceedPaymentOrder(
      paymentOrder,
      paymentId,
      paymentLinkId
    );

    if (paymentSuccess) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    res.status(500).json({ 
      error: 'Payment verification failed',
      message: error.message 
    });
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = await req.user;

    const paymentOrder = await PaymentService.getPaymentOrderById(orderId);
    
    if (paymentOrder.user.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.status(200).json({
      success: true,
      paymentOrder: paymentOrder
    });

  } catch (error) {
    console.error('❌ Get payment status failed:', error);
    res.status(500).json({ 
      error: 'Failed to get payment status',
      message: error.message 
    });
  }
};

// Razorpay webhook handler
const razorpayWebhook = async (req, res) => {
  try {
    const crypto = require('crypto');
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (signature === expectedSignature) {
      const event = req.body.event;
      const paymentEntity = req.body.payload.payment.entity;

      console.log('🔔 Razorpay webhook received:', event);

      if (event === 'payment.captured') {
        // Handle successful payment
        console.log('✅ Payment captured:', paymentEntity.id);
        // Additional processing can be added here
      } else if (event === 'payment.failed') {
        // Handle failed payment
        console.log('❌ Payment failed:', paymentEntity.id);
        // Additional processing can be added here
      }

      res.status(200).json({ success: true });
    } else {
      console.error('❌ Invalid webhook signature');
      res.status(400).json({ error: 'Invalid signature' });
    }

  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

module.exports = {
  paymentSuccessHandler,
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  razorpayWebhook,
};
