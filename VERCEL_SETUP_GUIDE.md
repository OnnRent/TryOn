# 🚀 Vercel Deployment Setup Guide

## ❌ Current Error
```
Failed to generate try-on image: The file at ./service-account-file.json does not exist
```

**Cause:** Vercel serverless functions can't access local files. Google Cloud credentials must be set as environment variables.

---

## ✅ Solution: Set Environment Variables on Vercel

### **Step 1: Get Your Service Account JSON**

Your service account file is at: `Backend/service-account-file.json`

You need to copy its contents as a **single-line string** for Vercel.

### **Step 2: Convert JSON to Single Line**

Run this command in your terminal:

```bash
cd Backend
cat service-account-file.json | tr -d '\n' | pbcopy
```

This copies the JSON as a single line to your clipboard.

**OR** manually:
1. Open `Backend/service-account-file.json`
2. Copy all contents
3. Remove all newlines (make it one line)

---

### **Step 3: Add Environment Variables to Vercel**

Go to your Vercel project dashboard:
👉 https://vercel.com/vansh-karnwals-projects/try-on/settings/environment-variables

Add these environment variables:

#### **1. GOOGLE_APPLICATION_CREDENTIALS_JSON**
- **Name:** `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- **Value:** Paste the single-line JSON from Step 2
- **Environment:** Production, Preview, Development (select all)

#### **2. GCP_PROJECT_ID**
- **Name:** `GCP_PROJECT_ID`
- **Value:** Your Google Cloud project ID (found in service-account-file.json under `project_id`)
- **Environment:** Production, Preview, Development (select all)

#### **3. GOOGLE_CLOUD_LOCATION**
- **Name:** `GOOGLE_CLOUD_LOCATION`
- **Value:** `us-central1`
- **Environment:** Production, Preview, Development (select all)

#### **4. Other Required Variables**
Make sure these are also set:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Your JWT secret key
- `AWS_ACCESS_KEY_ID` - AWS S3 access key
- `AWS_SECRET_ACCESS_KEY` - AWS S3 secret key
- `AWS_REGION` - AWS region (e.g., `us-east-1`)
- `S3BUCKETNAME` - Your S3 bucket name
- `NODE_ENV` - Set to `production`

---

### **Step 4: Redeploy**

After adding environment variables:

1. **Option A: Redeploy from Vercel Dashboard**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment

2. **Option B: Push a new commit**
   ```bash
   git add .
   git commit -m "Update environment variables"
   git push
   ```

---

## 🔍 Verify Environment Variables

After deployment, check the logs:
1. Go to Vercel Dashboard → Deployments
2. Click on your latest deployment
3. Go to "Functions" tab
4. Check the logs for:
   ```
   ✅ Google Cloud credentials configured from JSON env var
   ✅ Credentials file exists
   ```

---

## 🧪 Test the Fix

1. Open your app
2. Try creating a virtual try-on
3. Check the logs - should see:
   ```
   ✅ Google Cloud credentials configured from JSON env var
   🔑 Authenticating with Google Cloud...
   🎨 Sending request to Vertex AI Virtual Try-On API...
   ✅ Successfully generated try-on image
   ```

---

## 📋 Quick Checklist

- [ ] Copy service-account-file.json as single line
- [ ] Add GOOGLE_APPLICATION_CREDENTIALS_JSON to Vercel
- [ ] Add GCP_PROJECT_ID to Vercel
- [ ] Add GOOGLE_CLOUD_LOCATION to Vercel
- [ ] Verify all other env vars are set
- [ ] Redeploy
- [ ] Test virtual try-on
- [ ] Check logs for success messages

---

## 🆘 Troubleshooting

### Error: "Failed to get access token"
- Check that GOOGLE_APPLICATION_CREDENTIALS_JSON is valid JSON
- Verify the service account has Vertex AI permissions

### Error: "Project not found"
- Check GCP_PROJECT_ID matches your Google Cloud project
- Verify Vertex AI API is enabled in your project

### Error: "Permission denied"
- Service account needs these roles:
  - Vertex AI User
  - Service Account Token Creator

### Still not working?
- Check Vercel function logs for detailed error messages
- Verify the JSON is properly formatted (no extra quotes or escapes)
- Make sure you selected all environments when adding variables

---

## 📝 Alternative: Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variables
vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON
# Paste the single-line JSON when prompted

vercel env add GCP_PROJECT_ID
# Enter your project ID

vercel env add GOOGLE_CLOUD_LOCATION
# Enter: us-central1

# Redeploy
vercel --prod
```

---

## ✅ Expected Result

After setup, your virtual try-on should work without errors! The polling will show:
```
🔄 Polling attempt 1/60...
Status: processing
🔄 Polling attempt 2/60...
Status: processing
...
🔄 Polling attempt 15/60...
Status: completed
✅ Virtual try-on completed!
```

