const express = require('express');
const connectDB = require('./config/db.js');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send({message:'Welcome To Zosh Bazaar Backend System!'});
});

app.use(bodyParser.json());

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const productRouters=require("./routers/productRoutes.js")
const authRouters=require("./routers/authRouters.js")
const adminRouters=require("./routers/adminRouters.js")
const cartRouters=require("./routers/cartRoutes.js")
const revenueRouters=require("./routers/revenueRoutes.js")
const sellerOrderRouters=require("./routers/sellerOrderRoutes.js")
const sellerProductRouters=require("./routers/sellerProductRoutes.js")
const sellerReportRouters=require("./routers/sellerReportRoutes.js")
const sellerRouters=require("./routers/sellerRoutes.js")
const transactionRouters=require("./routers/transactionRoutes.js")
const userRouters=require("./routers/userRoutes.js")
const wishlistRouters=require("./routers/wishlistRoutes.js")
const orderRouters=require("./routers/orderRoutes.js")
const paymentRouters=require("./routers/paymentRoutes.js")
const dealRouters=require("./routers/dealRoutes.js")
const couponRouters=require("./routers/couponRoutes.js")
const homeRouters=require("./routers/homeCategoryRoutes.js")
const chatbotRouters=require("./routers/chatbotRoutes.js")
const reviewRouters=require("./routers/reviewRouters.js")

app.use('/auth', authRouters);
app.use("/api/users",userRouters)
app.use("/sellers", sellerRouters)
app.use("/products", productRouters)
app.use("/api/sellers/product", sellerProductRouters)
app.use("/api/cart", cartRouters);
app.use("/api/orders", orderRouters);
app.use("/api/seller/orders",sellerOrderRouters)
app.use("/api/transactions", transactionRouters)
app.use("/api/wishlist", wishlistRouters)
app.use("/api/sellers/report",sellerReportRouters)

app.use("/api/payment", paymentRouters)
app.use("/home",homeRouters)
app.use("/admin/deals",dealRouters)
app.use("/admin",adminRouters)

app.use("/api/coupons",couponRouters)
app.use("/api/sellers/revenue",revenueRouters)

app.use("/api/reviews",reviewRouters)

// chatbot
app.use("/chat",chatbotRouters)

// Global error handler to prevent server crashes
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const port = process.env.PORT || 8080;
app.listen(port, async() => {
    await connectDB()
  console.log(`Server is running on port ${port}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  // Don't exit the process, just log the error
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});
// 
