# Razorpay Integration Setup Guide

This guide will help you complete the Razorpay payment integration for the TryOn app.

## Prerequisites

1. Razorpay account (Sign up at https://razorpay.com)
2. Razorpay API credentials (Key ID and Key Secret)
3. Node.js and npm installed

## Backend Setup

### 1. Install Razorpay SDK

```bash
cd Backend
npm install razorpay
```

### 2. Configure Environment Variables

Add the following to your `Backend/.env` file:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**How to get these credentials:**

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to Settings → API Keys
3. Generate API Keys (Test Mode for development, Live Mode for production)
4. Copy the Key ID and Key Secret

### 3. Create Database Table

Run the updated database schema to create the `payment_orders` table:

```bash
psql -U your_username -d your_database -f Backend/database_schema.sql
```

Or manually run:

```sql
CREATE TABLE IF NOT EXISTS payment_orders (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  tryons INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'created',
  payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Setup Webhook

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Click "Create New Webhook"
3. Enter your webhook URL: `https://api.tryonapp.in/payment/webhook`
4. Select events to listen to:
   - `payment.captured`
   - `payment.failed`
5. Copy the Webhook Secret and add it to your `.env` file

## Frontend Setup

### 1. Install React Native Razorpay

```bash
cd Frontend
npm install react-native-razorpay
```

For iOS (if using):
```bash
cd ios
pod install
cd ..
```

### 2. Update Pricing Page

The pricing page (`Frontend/app/(app)/pricing.tsx`) is already set up with placeholder code.

Uncomment the Razorpay integration code in the `openRazorpayCheckout` function (lines 120-145).

### 3. Get User Details

Update the `openRazorpayCheckout` function to include actual user details:

```typescript
const userResult = await fetch(`${API_URL}/auth/me`, {
  headers: { Authorization: `Bearer ${token}` },
});
const userData = await userResult.json();

const options = {
  description: `${tier.name} - ${tier.tryons} try-ons`,
  image: 'https://your-logo-url.com/logo.png',
  currency: orderData.currency,
  key: orderData.key_id,
  amount: orderData.amount,
  name: 'TryOn',
  order_id: orderData.order_id,
  prefill: {
    email: userData.user.email,
    contact: '', // Add phone number if available
    name: userData.user.name || 'User'
  },
  theme: { color: '#D4AF37' }
};
```

## Testing

### Test Mode

1. Use Razorpay Test API Keys
2. Use test card numbers:
   - Success: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date

### Test the Flow

1. Open the app and navigate to Pricing page
2. Select a package (Starter or Pro)
3. Click Purchase
4. Complete payment with test card
5. Verify credits are added to your account

## Production Checklist

- [ ] Switch to Live API Keys in production
- [ ] Update webhook URL to production domain
- [ ] Test webhook delivery
- [ ] Add error logging and monitoring
- [ ] Implement refund functionality (if needed)
- [ ] Add transaction history page
- [ ] Test payment failure scenarios
- [ ] Add receipt/invoice generation
- [ ] Comply with payment regulations

## API Endpoints

### Create Order
```
POST /payment/create-order
Authorization: Bearer <token>
Body: { "package_id": "starter" | "pro" }
```

### Verify Payment
```
POST /payment/verify
Authorization: Bearer <token>
Body: {
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

### Webhook
```
POST /payment/webhook
Headers: { "x-razorpay-signature": "signature" }
```

## Troubleshooting

### Payment not completing
- Check if webhook is properly configured
- Verify webhook secret matches
- Check server logs for errors

### Credits not added
- Check database for order status
- Verify webhook is being received
- Check if order is already processed

### Signature verification failed
- Ensure Key Secret is correct
- Check if signature is being passed correctly
- Verify webhook secret matches

## Support

For Razorpay-specific issues, refer to:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [React Native Integration](https://razorpay.com/docs/payments/payment-gateway/react-native-integration/)
- [Webhooks Guide](https://razorpay.com/docs/webhooks/)

