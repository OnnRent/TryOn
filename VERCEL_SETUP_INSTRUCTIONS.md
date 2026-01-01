# 🚀 Add Razorpay Credentials to Vercel

## ⚠️ Current Issue
Your backend is returning a 500 error because Razorpay credentials are missing on Vercel.

## 📋 Step-by-Step Instructions

### 1. Open Vercel Dashboard
Go to: https://vercel.com/dashboard

### 2. Find Your Project
Look for your **TryOn** or **api.tryonapp.in** project and click on it

### 3. Go to Settings
Click on **Settings** in the top navigation menu

### 4. Open Environment Variables
Click on **Environment Variables** in the left sidebar

### 5. Add Three Variables

#### Variable 1: RAZORPAY_KEY_ID
- Click **Add New** button
- **Key:** `RAZORPAY_KEY_ID`
- **Value:** `rzp_test_RykJ8VsoMETiS5`
- **Environments:** Check all three boxes (Production, Preview, Development)
- Click **Save**

#### Variable 2: RAZORPAY_KEY_SECRET
- Click **Add New** button
- **Key:** `RAZORPAY_KEY_SECRET`
- **Value:** `hjGPujYvoRAEL9V1lJg8TAZf`
- **Environments:** Check all three boxes (Production, Preview, Development)
- Click **Save**

#### Variable 3: RAZORPAY_WEBHOOK_SECRET
- Click **Add New** button
- **Key:** `RAZORPAY_WEBHOOK_SECRET`
- **Value:** `whsecAbCdEfGhIjKlMnOpQrStUvWxYz1234567890`
- **Environments:** Check all three boxes (Production, Preview, Development)
- Click **Save**

### 6. Redeploy Your Backend
- Go to **Deployments** tab (top menu)
- Find the latest deployment
- Click the **⋯** (three dots) menu on the right
- Click **Redeploy**
- Wait for deployment to complete (usually 1-2 minutes)

### 7. Test the Payment
- Open your app
- Go to Pricing screen
- Click "Get Started"
- Payment should now work!

## ✅ Verification

After redeploying, test if credentials are loaded:

```bash
curl https://api.tryonapp.in/
```

Should return: `{"status":"OK","message":"TryOn API is running"}`

## 🎯 Expected Result

After adding credentials and redeploying:
- ✅ Backend will have Razorpay credentials
- ✅ Payment order creation will work
- ✅ Payment verification will work
- ✅ No more 500 errors

## 📞 Need Help?

If you still see errors after redeploying:
1. Check Vercel deployment logs
2. Verify all three variables are added
3. Make sure you clicked "Redeploy"
4. Wait 2-3 minutes for deployment to complete

