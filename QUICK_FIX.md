# ⚡ QUICK FIX - Virtual Try-On Timeout

## 🚨 Problem
Job stuck in "processing" status, timing out after 10 minutes.

## 🎯 Root Cause
**Vercel serverless functions kill background processes after 60 seconds**, even though we return immediately. The `setImmediate()` background task gets terminated.

---

## ✅ SOLUTION 1: Deploy Backend to Railway (5 minutes)

Railway supports long-running processes. This is the fastest fix.

### **Step 1: Deploy to Railway**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy from Backend directory
cd Backend
railway init
railway up
```

### **Step 2: Set Environment Variables on Railway**

```bash
# Google Cloud credentials (single line)
railway variables set GOOGLE_APPLICATION_CREDENTIALS_JSON="$(cat service-account-file.json | tr -d '\n')"

# GCP settings
railway variables set GCP_PROJECT_ID="gen-lang-client-0280210866"
railway variables set GOOGLE_CLOUD_LOCATION="us-central1"

# Database (get from Vercel)
railway variables set DATABASE_URL="your-postgres-connection-string"

# AWS S3 (get from Vercel)
railway variables set AWS_ACCESS_KEY_ID="your-aws-key"
railway variables set AWS_SECRET_ACCESS_KEY="your-aws-secret"
railway variables set AWS_REGION="us-east-1"
railway variables set S3BUCKETNAME="your-bucket-name"

# JWT
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set NODE_ENV="production"
```

### **Step 3: Get Railway URL**

```bash
railway domain
```

Copy the URL (e.g., `https://tryon-production.up.railway.app`)

### **Step 4: Update Frontend API URLs**

Update these files to use Railway URL:

**1. `Frontend/app/(app)/index.tsx`**
```typescript
const API_URL = "https://tryon-production.up.railway.app";
```

**2. `Frontend/app/(app)/camera.tsx`**
Replace all instances of:
```typescript
"https://try-on-xi.vercel.app"
```
with:
```typescript
"https://tryon-production.up.railway.app"
```

**3. `Frontend/app/signin.tsx`**
```typescript
const res = await fetch("https://tryon-production.up.railway.app/auth/dev", {
```

**4. `Frontend/app/(app)/wardrobe.tsx`**
```typescript
const response = await fetch(
  `https://tryon-production.up.railway.app/wardrobe?category=${active}`,
```

**5. `Frontend/app/(app)/images.tsx`**
```typescript
const response = await fetch("https://tryon-production.up.railway.app/tryon/images?limit=50", {
```

### **Step 5: Deploy Frontend to Vercel**

```bash
git add .
git commit -m "Switch backend to Railway"
git push
```

---

## ✅ SOLUTION 2: Synchronous Processing (Simpler but slower UX)

Remove async processing and wait for completion (works on Vercel Pro with 300s timeout).

### **Update `Backend/vercel.json`**
```json
{
  "functions": {
    "index.js": {
      "maxDuration": 300,
      "memory": 3008
    }
  }
}
```

### **Update `Backend/index.js`**

Replace the async endpoint with synchronous processing:

```javascript
app.post("/tryon/generate", verifyToken, upload.fields([...]), async (req, res) => {
  try {
    // ... validation code ...

    // Upload to S3
    await Promise.all([...]);

    // Create DB record
    const generatedImageId = uuidv4();
    await pool.query(`INSERT INTO generated_images ...`, [...]);

    // SYNCHRONOUS PROCESSING (wait for completion)
    const generatedImageBuffer = await generateTryOnImage(
      personImageBuffer,
      clothingImageBuffer,
      clothing_type
    );

    // Upload result
    const resultImageKey = `tryon/${req.userId}/results/${generatedImageId}.jpg`;
    await s3.upload({...}).promise();

    // Update DB
    await pool.query(`UPDATE generated_images SET status = 'completed' ...`);

    // Return result immediately
    const signedUrl = s3.getSignedUrl("getObject", {...});
    res.json({
      success: true,
      generated_image_id: generatedImageId,
      result_url: signedUrl,
      status: "completed"
    });
  } catch (err) {
    // ... error handling ...
  }
});
```

**Pros:**
- ✅ Works on Vercel
- ✅ Simpler code
- ✅ No polling needed

**Cons:**
- ❌ User waits 2-5 minutes for response
- ❌ May still timeout if Gemini takes >5 minutes
- ❌ Requires Vercel Pro plan

---

## 🎯 Recommended: Use Railway

**Why Railway?**
- ✅ Free tier available
- ✅ Supports long-running processes
- ✅ Better logging
- ✅ No timeout issues
- ✅ Easy deployment
- ✅ Auto-scaling

**Deployment time:** ~5 minutes

---

## 🧪 Test After Deployment

1. Open your app
2. Try creating a virtual try-on
3. Watch the logs:
   - Railway: `railway logs`
   - Vercel: Check Functions tab

**Expected logs:**
```
✅ Google Cloud credentials configured
🔑 Authenticating with Google Cloud...
🎨 Sending request to Vertex AI Virtual Try-On API...
✅ Successfully generated try-on image
✅ Background processing completed in 125000ms
```

---

## 📋 Quick Checklist

**For Railway Deployment:**
- [ ] Install Railway CLI
- [ ] Login to Railway
- [ ] Deploy backend (`railway up`)
- [ ] Set all environment variables
- [ ] Get Railway domain
- [ ] Update frontend API URLs
- [ ] Push to GitHub
- [ ] Test virtual try-on

**For Vercel Sync Processing:**
- [ ] Upgrade to Vercel Pro
- [ ] Update vercel.json (maxDuration: 300)
- [ ] Remove async processing code
- [ ] Remove polling from frontend
- [ ] Deploy and test

---

## 🆘 Need Help?

**Check Railway logs:**
```bash
railway logs
```

**Check Vercel logs:**
Go to: https://vercel.com/onnrent/try-on/deployments → Functions tab

**Common issues:**
- Missing environment variables
- Wrong API URL in frontend
- Credentials not set properly

