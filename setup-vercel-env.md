# 🚀 Quick Setup: Add Razorpay to Vercel

## ⚡ FASTEST METHOD: Use Vercel Dashboard (2 minutes)

### Step 1: Open Vercel
Go to: **https://vercel.com/dashboard**

### Step 2: Find Your Project
Click on your **TryOn** or **Backend** project

### Step 3: Add Environment Variables
1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)
3. Click **Add New** button

### Step 4: Add These 3 Variables

**Variable 1:**
```
Key: RAZORPAY_KEY_ID
Value: rzp_test_RykJ8VsoMETiS5
Environments: ✅ Production ✅ Preview ✅ Development
```

**Variable 2:**
```
Key: RAZORPAY_KEY_SECRET
Value: hjGPujYvoRAEL9V1lJg8TAZf
Environments: ✅ Production ✅ Preview ✅ Development
```

**Variable 3:**
```
Key: RAZORPAY_WEBHOOK_SECRET
Value: whsecAbCdEfGhIjKlMnOpQrStUvWxYz1234567890
Environments: ✅ Production ✅ Preview ✅ Development
```

### Step 5: Redeploy
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait 1-2 minutes

### Step 6: Test
Open your app and try payment again!

---

## 🎯 What This Fixes

Currently your backend shows:
```
RAZORPAY_KEY_ID: undefined
RAZORPAY_KEY_SECRET: undefined
```

After adding variables, it will show:
```
RAZORPAY_KEY_ID: rzp_test_RykJ8VsoMETiS5
RAZORPAY_KEY_SECRET: hjGPujYvoRAEL9V1lJg8TAZf
```

And payments will work! ✅

