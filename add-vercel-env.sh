#!/bin/bash

# Script to add Razorpay environment variables to Vercel
# Run this script to automatically add all required environment variables

echo "🚀 Adding Razorpay Environment Variables to Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "📝 Please login to Vercel..."
vercel login

# Add environment variables
echo ""
echo "Adding RAZORPAY_KEY_ID..."
vercel env add RAZORPAY_KEY_ID production <<< "rzp_test_RykJ8VsoMETiS5"

echo "Adding RAZORPAY_KEY_SECRET..."
vercel env add RAZORPAY_KEY_SECRET production <<< "hjGPujYvoRAEL9V1lJg8TAZf"

echo "Adding RAZORPAY_WEBHOOK_SECRET..."
vercel env add RAZORPAY_WEBHOOK_SECRET production <<< "whsecAbCdEfGhIjKlMnOpQrStUvWxYz1234567890"

echo ""
echo "✅ Environment variables added successfully!"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Open your project"
echo "3. Go to Settings → Deployments"
echo "4. Click 'Redeploy' on the latest deployment"
echo ""
echo "Or run: vercel --prod"

