# 🚀 Razorpay Integration Setup Guide

## 📋 Prerequisites

1. **Razorpay Account**: Sign up at [https://razorpay.com](https://razorpay.com)
2. **API Keys**: Get your Key ID and Key Secret from Razorpay Dashboard

## 🔧 Configuration Steps

### 1. Update Environment Variables

Edit your `.env` file and add your Razorpay credentials:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 2. Get Razorpay Credentials

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** → **API Keys**
3. Generate **Test Keys** for development
4. Copy **Key ID** and **Key Secret**

## 🛠️ API Endpoints

### Create Payment Order
```http
POST /api/payment/create-order
Authorization: Bearer <user_jwt_token>
Content-Type: application/json

{
  "orders": [
    {
      "_id": "order_id_1",
      "totalSellingPrice": 1000
    }
  ],
  "paymentMethod": "razorpay"
}
```

**Response:**
```json
{
  "success": true,
  "paymentOrder": {
    "_id": "payment_order_id",
    "amount": 1000,
    "status": "PENDING"
  },
  "paymentLink": "https://rzp.io/i/payment_link",
  "message": "Payment order created successfully"
}
```

### Verify Payment
```http
POST /api/payment/verify
Authorization: Bearer <user_jwt_token>
Content-Type: application/json

{
  "paymentId": "pay_razorpay_payment_id",
  "paymentLinkId": "plink_razorpay_link_id"
}
```

### Get Payment Status
```http
GET /api/payment/status/:orderId
Authorization: Bearer <user_jwt_token>
```

## 🔄 Payment Flow

1. **Create Order**: User places order in cart
2. **Create Payment**: Call `/api/payment/create-order`
3. **Redirect**: User redirected to Razorpay payment page
4. **Payment**: User completes payment on Razorpay
5. **Callback**: Razorpay redirects to success URL
6. **Verification**: Backend verifies payment status
7. **Update**: Order status updated to PLACED

## 🎯 Frontend Integration

### Example Frontend Code (React/JavaScript)

```javascript
// Create payment order
const createPayment = async (orders) => {
  try {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        orders: orders,
        paymentMethod: 'razorpay'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Redirect to payment link
      window.location.href = data.paymentLink;
    }
  } catch (error) {
    console.error('Payment creation failed:', error);
  }
};

// Handle payment success (on success page)
const handlePaymentSuccess = async (paymentId, paymentLinkId) => {
  try {
    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        paymentId,
        paymentLinkId
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Payment verified successfully
      console.log('Payment successful!');
      // Redirect to order confirmation page
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
  }
};
```

## 🔐 Security Features

- ✅ **Webhook Verification**: Validates Razorpay webhook signatures
- ✅ **Payment Verification**: Double-checks payment status with Razorpay
- ✅ **User Authentication**: All endpoints require valid JWT tokens
- ✅ **Order Validation**: Ensures user owns the orders being paid for

## 🧪 Testing

### Test Cards (Razorpay Test Mode)

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test UPI IDs

- **Success**: success@razorpay
- **Failure**: failure@razorpay

## 🚨 Important Notes

1. **Test Mode**: Use test credentials for development
2. **Live Mode**: Switch to live credentials for production
3. **Webhooks**: Configure webhook URL in Razorpay Dashboard
4. **SSL**: Use HTTPS in production for security
5. **Amount**: Always in paise (₹1 = 100 paise)

## 📞 Support

- **Razorpay Docs**: [https://razorpay.com/docs](https://razorpay.com/docs)
- **Integration Guide**: [https://razorpay.com/docs/payments/payment-links](https://razorpay.com/docs/payments/payment-links)
- **Test Cards**: [https://razorpay.com/docs/payments/payments/test-card-details](https://razorpay.com/docs/payments/payments/test-card-details)

## ✅ Setup Checklist

- [ ] Razorpay account created
- [ ] API keys obtained
- [ ] Environment variables updated
- [ ] Backend server restarted
- [ ] Test payment attempted
- [ ] Webhook configured (optional)
- [ ] Frontend integration completed

---

**🎉 Your Razorpay integration is ready to use!**