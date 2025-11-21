const Coupon = require('../models/Coupon');
const User = require('../models/User');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const mongoose = require('mongoose');
const CouponNotValidException = require('../exceptions/CouponNotValidException');

const couponService = {
  /**
   * Apply a coupon to the user's cart (seller-specific)
   * - Only applies discount to items sold by the coupon's seller
   * @param {String} code - Coupon code
   * @param {Number} orderValue - Order value (ignored; computed from cart)
   * @param {Object} user - User object (mongoose document)
   * @throws {CouponNotValidException} - Throws an exception if coupon is not valid
   */
  async applyCoupon(code, orderValue, user) {
    try {
      // Find coupon by code
      const coupon = await Coupon.findOne({ code });
      const cart = await Cart.findOne({ user: user._id });

      if (!coupon) {
        throw new CouponNotValidException('Coupon not found');
      }
      if (!cart) {
        throw new Error('Cart not found');
      }

      if (user.usedCoupons.includes(coupon._id)) {
        throw new CouponNotValidException('Coupon already used');
      }

      // Compute subtotal for items belonging to the coupon's seller
      const cartItems = await CartItem.find({ _id: { $in: cart.cartItems } }).populate('product', 'seller');
      const sellerSubtotal = cartItems
        .filter((item) => item.product && String(item.product.seller) === String(coupon.seller))
        .reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);

      if (sellerSubtotal <= 0) {
        throw new CouponNotValidException('Coupon not applicable to items in cart');
      }

      if (sellerSubtotal <= coupon.minimumOrderValue) {
        throw new CouponNotValidException(
          `Valid for minimum order value ${coupon.minimumOrderValue}`
        );
      }

      const currentDate = new Date();

      if (
        coupon.isActive &&
        currentDate >= coupon.validityStartDate &&
        currentDate <= coupon.validityEndDate
      ) {
        // Add the coupon to user's used coupons
        user.usedCoupons.push(coupon._id);
        await user.save();

        // Calculate discounted price on seller subtotal and update cart
        const discount = Math.round((sellerSubtotal * coupon.discountPercentage) / 100);
        cart.totalSellingPrice = Math.max(0, cart.totalSellingPrice - discount);
        cart.couponCode = code;
        cart.couponPrice = discount;

        return await cart.save();
      }

      throw new CouponNotValidException('Coupon not valid');
    } catch (error) {
      throw new Error(error.message);
    }
  },

 
  async removeCoupon(code, user) {
    try {
      const coupon = await Coupon.findOne({ code });

      if (!coupon) {
        throw new Error('Coupon not found');
      }

      user.usedCoupons = user.usedCoupons.filter((usedCoupon) => !usedCoupon.equals(coupon._id));
      await user.save();

      const cart = await Cart.findOne({ user: user._id });
      if (!cart) {
        throw new Error('Cart not found');
      }
      cart.totalSellingPrice += cart.couponPrice; // Add the discount back to the cart's total
      cart.couponCode = null;
      cart.couponPrice = 0;

      return await cart.save();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Create a new coupon (admin only)
   * @param {Object} couponData - Coupon data (mongoose document)
   * @returns {Object} - Newly created coupon
   */
  async createCoupon(couponData) {
    try {
      const newCoupon = new Coupon(couponData);
      return await newCoupon.save();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getSellerCoupons(sellerId) {
    try {
      return await Coupon.find({ seller: sellerId });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Delete a coupon by ID (admin only)
   * @param {String} couponId - Coupon ID
   */
  async deleteCoupon(couponId) {
    try {
      await Coupon.findByIdAndDelete(couponId);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Get all coupons (admin only)
   * @returns {Array} - List of all coupons
   */
  async getAllCoupons() {
    try {
      return await Coupon.find();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Get a coupon by ID
   * @param {String} couponId - Coupon ID
   * @returns {Object|null} - Coupon object or null if not found
   */
  async getCouponById(couponId) {
    try {
      return await Coupon.findById(couponId);
    } catch (error) {
      throw new Error('Coupon not found');
    }
  }
};

module.exports = couponService;
