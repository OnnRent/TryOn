# Vertex AI Virtual Try-On Setup Guide

## ✅ What Changed

Your backend has been updated to use **Vertex AI Virtual Try-On** (the "Nano Banana Pro" model) instead of Gemini for image generation.

### Updated Files:
- `Backend/geminiTryOn.js` - Now uses Vertex AI Virtual Try-On API
- `Backend/package.json` - Added `google-auth-library` dependency

## 🔑 Required Environment Variables

Add these to your `.env` file:

```bash
# Google Cloud Project Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Keep your existing variables
DBHOST=your-db-host
DBPASSWORD=your-db-password
S3BUCKETNAME=your-bucket-name
# ... other existing variables
```

## 📋 Setup Steps

### 1. Enable Vertex AI API

```bash
gcloud services enable aiplatform.googleapis.com --project=YOUR_PROJECT_ID
```

### 2. Set Up Authentication

**For Local Development:**
```bash
gcloud auth application-default login
```

**For Production (Vercel/Railway/etc):**
You'll need to create a service account and add credentials.

#### Create Service Account:
```bash
# Create service account
gcloud iam service-accounts create tryon-backend \
    --display-name="TryOn Backend Service Account" \
    --project=YOUR_PROJECT_ID

# Grant Vertex AI User role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:tryon-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

# Create and download key
gcloud iam service-accounts keys create ~/tryon-key.json \
    --iam-account=tryon-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

#### For Vercel/Railway Deployment:
1. Copy the contents of `~/tryon-key.json`
2. Add as environment variable: `GOOGLE_APPLICATION_CREDENTIALS_JSON` (paste the entire JSON)
3. Or upload the file and set `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`

### 3. Test Locally

```bash
cd Backend
node test_gemini.js
```

## 💰 Pricing

**Vertex AI Virtual Try-On:**
- **Cost:** ~$0.04 per image generated
- **Much cheaper than Gemini image generation**
- Dedicated model specifically for virtual try-on

## ⚡ Performance

- **Generation Time:** 10-30 seconds (faster than Gemini)
- **Quality:** Optimized specifically for clothing try-on
- **Timeout:** Still needs 60-120 seconds max

## 🚀 Deployment Considerations

### Vercel Limitations Still Apply:
❌ **Puppeteer** - Still too large for Vercel
❌ **Timeout** - Pro plan (60s) might be tight, Enterprise (900s) works
✅ **Virtual Try-On** - Works on Vercel Pro/Enterprise

### Recommended: Deploy to Railway/Render
- ✅ No timeout issues
- ✅ Puppeteer works
- ✅ Cheaper than Vercel Enterprise
- ✅ Better for long-running processes

## 🔧 Troubleshooting

### Error: "GOOGLE_CLOUD_PROJECT not found"
- Add `GOOGLE_CLOUD_PROJECT=your-project-id` to `.env`

### Error: "Failed to get access token"
- Run `gcloud auth application-default login` locally
- For production, ensure service account key is properly configured

### Error: "Permission denied"
- Ensure Vertex AI API is enabled
- Check service account has `roles/aiplatform.user` role

### Error: "Model not found"
- Virtual Try-On is in preview and may not be available in all regions
- Try changing `GOOGLE_CLOUD_LOCATION` to `us-central1` or `us-east1`

## 📚 API Documentation

- [Virtual Try-On Documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/image/generate-virtual-try-on-images)
- [Vertex AI Pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)

## 🎯 Next Steps

1. ✅ Update your `.env` file with Google Cloud credentials
2. ✅ Enable Vertex AI API in your Google Cloud project
3. ✅ Set up authentication (local or service account)
4. ✅ Test the implementation
5. ✅ Deploy to Railway/Render (recommended) or Vercel Enterprise

