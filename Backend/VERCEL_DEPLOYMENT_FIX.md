# Vercel Deployment Fix Guide

## ✅ Changes Made to Fix Crashes

### 1. **Fixed UUID Import**
- Changed from async `import()` to synchronous `require()`
- Vercel serverless functions need synchronous initialization

### 2. **Made Puppeteer Optional**
- Moved to `optionalDependencies` in package.json
- Added graceful fallback in `scrapeProductImages.js`
- Scraping endpoints will return error message on Vercel

### 3. **Updated vercel.json**
- Added proper memory allocation (1024MB)
- Set maxLambdaSize to 50MB
- Configured 60-second timeout (Pro plan)

### 4. **Fixed Module Exports**
- Added both `module.exports` and `module.exports.handler`
- Ensures compatibility with Vercel's serverless runtime

### 5. **Added .vercelignore**
- Excludes test files and unnecessary dependencies

## 🚀 Deploy to Vercel

### Step 1: Set Environment Variables in Vercel Dashboard

Go to your Vercel project settings and add:

```bash
# Google Cloud
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Database
DBHOST=your-postgres-host
DBPASSWORD=your-postgres-password

# AWS S3
S3BUCKETNAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1

# Remove.bg (optional)
REMOVEBGAPIKEY=your-removebg-key

# JWT
JWT_SECRET=your-jwt-secret

# Node Environment
NODE_ENV=production
```

### Step 2: Add Google Cloud Service Account

For Vertex AI authentication, you need to add your service account JSON:

**Option A: As JSON string (recommended)**
1. Copy your service account JSON file content
2. Minify it (remove all whitespace/newlines)
3. Add as environment variable: `GOOGLE_APPLICATION_CREDENTIALS_JSON`

**Option B: As base64**
```bash
# Encode your service account file
cat service-account.json | base64

# Add to Vercel as: GOOGLE_APPLICATION_CREDENTIALS_BASE64
```

Then update `geminiTryOn.js` to decode it:
```javascript
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = '/tmp/gcp-key.json';
  require('fs').writeFileSync(
    '/tmp/gcp-key.json',
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  );
}
```

### Step 3: Deploy

```bash
cd Backend
vercel --prod
```

## ⚠️ Known Limitations on Vercel

### ❌ Features That WON'T Work:
1. **Product Scraping** (`/scrape-product`, `/wardrobe/link`)
   - Puppeteer is too large for Vercel
   - Users will get error: "Image scraping is not available"
   - **Solution:** Use direct image upload instead

### ⚠️ Features That MIGHT Timeout:
1. **Virtual Try-On** (`/tryon/generate`)
   - Can take 30-60 seconds
   - Vercel Pro: 60s limit (might work)
   - Vercel Hobby: 10s limit (won't work)
   - **Solution:** Upgrade to Pro or Enterprise

### ✅ Features That WILL Work:
1. Authentication (`/auth/apple`, `/auth/me`)
2. Wardrobe management (`/wardrobe`, `/wardrobe/item`)
3. Image upload (`/wardrobe/image`)
4. Background removal (if using Remove.bg API)

## 🔧 Troubleshooting

### Error: "This Serverless Function has crashed"

**Check Vercel Logs:**
```bash
vercel logs
```

**Common Causes:**
1. Missing environment variables
2. Database connection failed
3. Out of memory (increase to 1024MB in vercel.json)
4. Timeout (upgrade to Pro plan)

### Error: "Module not found: puppeteer"

This is expected on Vercel. The scraping endpoints will return a user-friendly error.

### Error: "Failed to get access token"

**Solution:**
1. Ensure `GOOGLE_APPLICATION_CREDENTIALS_JSON` is set
2. Check service account has `roles/aiplatform.user` role
3. Verify Vertex AI API is enabled

### Error: "Connection timeout" on database

**Solution:**
1. Check `DBHOST` and `DBPASSWORD` are correct
2. Ensure your PostgreSQL allows connections from Vercel IPs
3. Add Vercel IPs to your database firewall

## 📊 Cost Estimate (Vercel Pro)

- **Plan:** $20/month
- **Serverless Function Execution:** Included (100GB-hours)
- **Bandwidth:** 1TB included
- **Typical monthly cost:** $20-30

## 🎯 Better Alternative: Railway

If you're experiencing issues, consider Railway instead:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

**Railway Benefits:**
- ✅ All features work (including Puppeteer)
- ✅ No timeout limits
- ✅ Simpler configuration
- ✅ Cheaper (~$5-10/month)

## 📝 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test basic endpoints (/, /auth/me)
3. ✅ Test virtual try-on
4. ⚠️ Disable scraping features in your frontend (or show error)
5. ✅ Monitor logs for any issues

## 🆘 Still Having Issues?

If Vercel continues to crash, I recommend:
1. Deploy to Railway instead (easier, cheaper, more reliable)
2. Or use Vercel for frontend only + Railway for backend

