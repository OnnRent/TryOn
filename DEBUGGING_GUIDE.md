# 🔍 Debugging Virtual Try-On Timeout Issue

## 🚨 Current Problem

Your job is stuck in "processing" status and timing out after 10 minutes.

**Possible Causes:**
1. ❌ Google Cloud credentials not set on Vercel
2. ❌ Background processing killed by Vercel (serverless timeout)
3. ❌ Gemini API taking too long or failing silently

---

## ✅ Step 1: Check Vercel Environment Variables

Go to: https://vercel.com/vansh-karnwals-projects/try-on/settings/environment-variables

**Required Variables:**
- [ ] `GOOGLE_APPLICATION_CREDENTIALS_JSON` - Service account JSON (single line)
- [ ] `GCP_PROJECT_ID` - Value: `gen-lang-client-0280210866`
- [ ] `GOOGLE_CLOUD_LOCATION` - Value: `us-central1`
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `AWS_ACCESS_KEY_ID` - S3 access key
- [ ] `AWS_SECRET_ACCESS_KEY` - S3 secret key
- [ ] `AWS_REGION` - AWS region
- [ ] `S3BUCKETNAME` - S3 bucket name
- [ ] `JWT_SECRET` - JWT secret

**If `GOOGLE_APPLICATION_CREDENTIALS_JSON` is missing:**
```bash
cd Backend
cat service-account-file.json | tr -d '\n' | pbcopy
```
Then paste it in Vercel settings.

---

## ✅ Step 2: Check Vercel Function Logs

1. Go to: https://vercel.com/onnrent/try-on/deployments
2. Click on your latest deployment
3. Go to "Functions" tab
4. Look for errors in the logs

**What to look for:**
- ✅ `✅ Google Cloud credentials configured from JSON env var`
- ✅ `🔑 Authenticating with Google Cloud...`
- ✅ `🎨 Sending request to Vertex AI Virtual Try-On API...`
- ❌ `❌ Failed to write GCP credentials`
- ❌ `❌ Credentials file not found`
- ❌ `❌ Virtual Try-On API Error`

---

## ✅ Step 3: The Real Problem - Vercel Serverless Limitations

**Issue:** Vercel serverless functions have a **60-second execution limit** (even with Pro plan set to 300s, background processing gets killed).

When you use `setImmediate()` for background processing:
1. Function returns immediately ✅
2. Background task starts ✅
3. **Vercel kills the function after 60s** ❌
4. Background task never completes ❌
5. Job stuck in "processing" forever ❌

---

## 🎯 Solution Options

### **Option 1: Use a Queue Service (Recommended)**

Use an external queue to handle long-running tasks:

**Services:**
- **AWS SQS** (Simple Queue Service)
- **Redis Queue** (Bull/BullMQ)
- **Google Cloud Tasks**
- **Inngest** (serverless queue)

**How it works:**
1. Vercel creates job → Sends to queue → Returns immediately
2. Queue worker (separate service) processes job
3. Worker updates database when done
4. Frontend polls for status

### **Option 2: Deploy Backend Separately**

Deploy your backend to a service that supports long-running processes:

**Services:**
- **Railway** (easiest, supports long processes)
- **Render** (free tier available)
- **Fly.io** (global deployment)
- **AWS EC2/ECS** (more control)
- **Google Cloud Run** (up to 60 minutes timeout)

**Steps:**
1. Deploy backend to Railway/Render
2. Update frontend API_URL to point to new backend
3. Keep Vercel for frontend only

### **Option 3: Increase Vercel Timeout (Limited)**

**Vercel Pro Plan:**
- Max timeout: 300 seconds (5 minutes)
- May not be enough for Gemini API (2-5 minutes typical)

**Vercel Enterprise:**
- Max timeout: 900 seconds (15 minutes)
- Expensive ($$$)

---

## 🚀 Quick Fix: Deploy to Railway

Railway supports long-running processes and is free to start.

### **Step 1: Install Railway CLI**
```bash
npm install -g @railway/cli
```

### **Step 2: Login to Railway**
```bash
railway login
```

### **Step 3: Deploy Backend**
```bash
cd Backend
railway init
railway up
```

### **Step 4: Set Environment Variables**
```bash
railway variables set GOOGLE_APPLICATION_CREDENTIALS_JSON="$(cat service-account-file.json | tr -d '\n')"
railway variables set GCP_PROJECT_ID="gen-lang-client-0280210866"
railway variables set GOOGLE_CLOUD_LOCATION="us-central1"
railway variables set DATABASE_URL="your-postgres-url"
railway variables set AWS_ACCESS_KEY_ID="your-key"
railway variables set AWS_SECRET_ACCESS_KEY="your-secret"
railway variables set AWS_REGION="us-east-1"
railway variables set S3BUCKETNAME="your-bucket"
railway variables set JWT_SECRET="your-secret"
railway variables set NODE_ENV="production"
```

### **Step 5: Get Railway URL**
```bash
railway domain
```

### **Step 6: Update Frontend**
Update `Frontend/app/(app)/camera.tsx` and other files:
```typescript
const API_URL = "https://your-app.railway.app";
```

---

## 🧪 Test Locally First

Before deploying, test locally to ensure it works:

```bash
# Terminal 1: Start backend
cd Backend
npm start

# Terminal 2: Start frontend
cd Frontend
npm start
```

Try creating a virtual try-on. Check backend logs for:
```
✅ Google Cloud credentials configured
🔑 Authenticating with Google Cloud...
🎨 Sending request to Vertex AI Virtual Try-On API...
✅ Successfully generated try-on image
```

---

## 📊 Recommended Architecture

```
Frontend (Vercel)
    ↓
Backend (Railway/Render)
    ↓
Gemini API (Google Cloud)
    ↓
S3 (AWS)
    ↓
PostgreSQL (Neon/Supabase)
```

**Why?**
- ✅ Vercel: Great for static frontend
- ✅ Railway: Supports long-running processes
- ✅ No timeout issues
- ✅ Better logging and debugging

---

## 🆘 Immediate Action

**Right now, do this:**

1. **Check if credentials are set on Vercel**
   - Go to environment variables
   - Verify `GOOGLE_APPLICATION_CREDENTIALS_JSON` exists

2. **If credentials are missing:**
   - Run: `cd Backend && cat service-account-file.json | tr -d '\n' | pbcopy`
   - Add to Vercel
   - Redeploy

3. **If credentials are set but still failing:**
   - Deploy backend to Railway (see steps above)
   - Update frontend API_URL
   - Test again

---

## 📝 Summary

**The core issue:** Vercel serverless functions can't handle long-running background tasks.

**Best solution:** Deploy backend to Railway/Render where processes can run for minutes/hours.

**Quick test:** Check Vercel logs to see if credentials are the issue first.

