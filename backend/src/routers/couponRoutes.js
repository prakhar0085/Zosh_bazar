// routes/adminCouponRoutes.js
const express = require('express');
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middlewares/userAuthMiddleware');
const router = express.Router();

// Route to apply or remove coupon (requires auth)
router.post('/apply', authMiddleware, couponController.applyCoupon);

// Seller routes (must be authenticated as seller)
const sellerAuthMiddleware = require('../middlewares/sellerAuthMiddleware');
router.post('/seller/create', sellerAuthMiddleware, couponController.createCoupon);
router.delete('/seller/delete/:id', sellerAuthMiddleware, couponController.deleteCoupon);
router.get('/seller/all', sellerAuthMiddleware, couponController.getAllCoupons);

module.exports = router;
