const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Address = require("../models/Address");
const User = require("../models/User");
const OrderItem = require("../models/OrderItem");
const CartService = require("../services/CartService");
const OrderError = require("../exceptions/OrderError");
const OrderStatus = require("../domain/OrderStatus");
const PaymentStatus = require("../domain/PaymentStatus");
const mongoose = require("mongoose");
const TransactionService = require("./TransactionService");

class OrderService {
  async createOrder(user, shippingAddress, cart) {
    console.log("shpping address: start", shippingAddress);
   try {
     if (shippingAddress._id && !user.addresses.includes(shippingAddress._id)) {
      user.addresses.push(shippingAddress._id);
      await User.findByIdAndUpdate(user._id, user);
    }

    // let shippingAddress;

    if (!shippingAddress._id) {
      shippingAddress = await Address.create(shippingAddress);
       user.addresses.push(shippingAddress._id);
      await User.findByIdAndUpdate(user._id, user);
    }

    const itemsBySeller = cart.cartItems.reduce((acc, item) => {
      const sellerId = item.product.seller._id.toString();
      acc[sellerId] = acc[sellerId] || [];
      acc[sellerId].push(item);
      return acc;
    }, {});

    const orders = new Set();

    for (const [sellerId, cartItems] of Object.entries(itemsBySeller)) {
      const totalOrderPrice = cartItems.reduce(
        (sum, item) => sum + item.sellingPrice,
        0
      );
      const totalItemCount = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      // Create the new order
      const newOrder = new Order({
        user: user._id,
        seller: sellerId,
        totalMrpPrice: totalOrderPrice,
        totalSellingPrice: totalOrderPrice,
        totalItem: totalItemCount,
        shippingAddress: shippingAddress._id,
        orderStatus: OrderStatus.PENDING,
        paymentDetails: { status: PaymentStatus.PENDING },
        orderItems: [],
      });

      // Save each order item
      const orderItems = await Promise.all(
        cartItems.map(async (cartItem) => {
          const orderItem = new OrderItem({
            // order: savedOrder._id,
            mrpPrice: cartItem.mrpPrice,
            product: cartItem.product._id,
            quantity: cartItem.quantity,
            size: cartItem.size,
            userId: cartItem.userId,
            sellingPrice: cartItem.sellingPrice,
          });

          const savedOrderItem = await orderItem.save();
          newOrder.orderItems.push(savedOrderItem._id);
          return savedOrderItem;
        })
      );

      const savedOrder = await newOrder.save();
      TransactionService.createTransaction(savedOrder._id)
      orders.add(savedOrder);
    }

    return Array.from(orders);
    
   } catch (error) {
    console.log("orderr error ", error)
    throw new Error(error.message)
   }
  }

  async findOrderById(orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new OrderError("Invalid Order ID...");
    }
    // console.log("order id ",orderId)
    const order = await Order.findById(orderId).populate([
      { path: "seller" },
      { path: "shippingAddress" },
      { path: "orderItems", populate: { path: "product" } },
    ]);

    if (!order) {
      throw new OrderError(`Order not found with id ${orderId}`);
    }
    return order;
  }

  async findOrderItemById(orderItemId) {
    if (!mongoose.Types.ObjectId.isValid(orderItemId)) {
      throw new OrderError("Invalid Order Item ID...");
    }
    // console.log("order id ",orderId)
    const order = await OrderItem.findById(orderItemId).populate([
      { path: "product", populate: { path: "seller" } },
    ]);

    if (!order) {
      throw new OrderError(`Order not found with id ${orderId}`);
    }
    return order;
  }

  async usersOrderHistory(userId) {
    return await Order.find({ user: userId }).populate([
      { path: "seller" },
      { path: "shippingAddress" },
      { path: "orderItems", populate: { path: "product" } },
    ]);
  }

  async getShopsOrders(sellerId) {
    return await Order.find({ seller: sellerId })
      .sort({ orderDate: -1 })
      .populate([
        { path: "seller" },
        { path: "shippingAddress" },
        { path: "orderItems", populate: { path: "product" } },
      ]);
  }

  async updateOrderStatus(orderId, orderStatus) {
    const order = await this.findOrderById(orderId);

    order.orderStatus = orderStatus;

   
    return await Order.findByIdAndUpdate(orderId, order, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "seller" },
      { path: "shippingAddress" },
      { path: "orderItems", populate: { path: "product" } },
    ]);
  }

  async deleteOrder(orderId) {
    const order = await this.findOrderById(orderId);
    if (!order) {
      throw new OrderError(`Order not found with id ${orderId}`);
    }
    return await Order.deleteOne({ _id: orderId });
  }

  async cancelOrder(orderId, user) {
    const order = await this.findOrderById(orderId);
    if (user._id.toString() !== order.user.toString()) {
      throw new OrderError(
        `You can't perform this action on order id ${orderId}`
      );
    }
    order.orderStatus = OrderStatus.CANCELLED;
    return await Order.findByIdAndUpdate(orderId, order, { new: true });
  }
}

module.exports = new OrderService();
