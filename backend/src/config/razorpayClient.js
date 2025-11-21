const Razorpay = require('razorpay');
require('dotenv').config();

const apiKey = process.env.RAZORPAY_KEY_ID;
const apiSecret = process.env.RAZORPAY_KEY_SECRET;

if (!apiKey || !apiSecret) {
    console.error('❌ Razorpay credentials not found in environment variables');
    console.error('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
}

const razorpay = new Razorpay({
    key_id: apiKey,
    key_secret: apiSecret,
});

console.log('✅ Razorpay client initialized');

module.exports = razorpay;