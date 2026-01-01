# 🚀 Razorpay Production Setup Guide

## ✅ What's Already Done

1. **Backend Integration** - Complete
   - `/payment/create-order` - Creates Razorpay orders
   - `/payment/verify` - Verifies payments and adds credits
   - `/payment/webhook` - Handles Razorpay webhooks
   - All code is production-ready

2. **Frontend Integration** - Complete
   - Payment flow implemented
   - Native Razorpay SDK integrated
   - Automatic fallback for Expo Go

## 🔧 Required Steps for Production

### Step 1: Add Environment Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Open your **TryOn** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
RAZORPAY_KEY_ID=rzp_test_RykJ8VsoMETiS5
RAZORPAY_KEY_SECRET=hjGPujYvoRAEL9V1lJg8TAZf
RAZORPAY_WEBHOOK_SECRET=whsecAbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

5. Click **Save**
6. **Redeploy** your backend (Settings → Deployments → Redeploy)

### Step 2: Create Development Build (For Native Razorpay)

Since `react-native-razorpay` is a native module, you need a development build:

#### Option A: Local Development Build

```bash
cd Frontend

# Install dependencies
npx expo install expo-dev-client

# Prebuild native code
npx expo prebuild

# Run on iOS
npx expo run:ios

# Or run on Android
npx expo run:android
```

#### Option B: EAS Build (Cloud Build)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Create development build for iOS
eas build --profile development --platform ios

# Or for Android
eas build --profile development --platform android
```

### Step 3: Test Payment Flow

1. Install the development build on your device
2. Go to Pricing screen
3. Click "Get Started" on any tier
4. Razorpay payment sheet will open
5. Use test card: `4111 1111 1111 1111`
6. CVV: Any 3 digits
7. Expiry: Any future date
8. Complete payment
9. Credits will be added to your account

## 📱 Current Behavior

### With Expo Go (Current)
- Shows error: "Development Build Required"
- Provides instructions to create development build

### With Development Build (After Step 2)
- Opens native Razorpay payment sheet
- Full payment integration works
- Real payments processed

## 🔐 Production Checklist

- [ ] Add Razorpay credentials to Vercel
- [ ] Redeploy backend on Vercel
- [ ] Create development build
- [ ] Test payment with test credentials
- [ ] Switch to live Razorpay credentials (when ready for production)
- [ ] Test live payment
- [ ] Submit app to App Store/Play Store

## 🎯 Next Steps

1. **Add credentials to Vercel** (5 minutes)
2. **Create development build** (30 minutes)
3. **Test payment flow** (5 minutes)

## 📞 Support

If you encounter any issues:
1. Check Vercel logs for backend errors
2. Check app console for frontend errors
3. Verify Razorpay credentials are correct
4. Ensure development build is installed (not Expo Go)

