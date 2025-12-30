# 🚂 Railway Deployment Guide

## Why Railway?

✅ **No timeout limits** - Virtual Try-On can take as long as needed
✅ **Puppeteer works** - All scraping features enabled
✅ **Cheaper** - $5-10/month vs Vercel's $20-500/month
✅ **Simpler setup** - Less configuration needed
✅ **Better for backend** - Designed for long-running processes

---

## Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

Or using Homebrew (macOS):
```bash
brew install railway
```

---

## Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate with GitHub.

---

## Step 3: Initialize Railway Project

```bash
cd Backend
railway init
```

You'll be prompted:
- **Create a new project or select existing?** → Create new project
- **Project name?** → `tryon-backend` (or whatever you prefer)

---

## Step 4: Add Environment Variables

You can add them via CLI or Railway Dashboard (easier).

### Option A: Via Railway Dashboard (Recommended)

1. Go to https://railway.app/dashboard
2. Click on your project
3. Click "Variables" tab
4. Add these variables:

```bash
# Google Cloud (for Virtual Try-On)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Database
DBHOST=your-postgres-host
DBPASSWORD=your-postgres-password

# AWS S3
S3BUCKETNAME=your-bucket-name
AWSACCESSKEY=your-aws-access-key
AWSSECRETKEY=your-aws-secret-key
AWSREGION=us-east-1

# Optional
REMOVEBGAPIKEY=your-removebg-api-key
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

### Option B: Via CLI

```bash
railway variables set GOOGLE_CLOUD_PROJECT=your-project-id
railway variables set GOOGLE_CLOUD_LOCATION=us-central1
railway variables set DBHOST=your-postgres-host
railway variables set DBPASSWORD=your-password
railway variables set S3BUCKETNAME=your-bucket
railway variables set AWSACCESSKEY=your-key
railway variables set AWSSECRETKEY=your-secret
railway variables set AWSREGION=us-east-1
railway variables set JWT_SECRET=your-secret
railway variables set NODE_ENV=production
```

---

## Step 5: Add Google Cloud Service Account

For Google Cloud authentication, you need to add your service account JSON.

### Create the service account key file:

```bash
# In your Backend directory
echo 'YOUR_SERVICE_ACCOUNT_JSON_HERE' > gcp-key.json
```

Then add it as an environment variable:

```bash
railway variables set GOOGLE_APPLICATION_CREDENTIALS=/app/gcp-key.json
```

**OR** add the JSON content directly:

```bash
railway variables set GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
```

---

## Step 6: Deploy!

```bash
railway up
```

This will:
1. Upload your code
2. Install dependencies
3. Build your app
4. Start the server

You'll see output like:
```
✓ Deployment successful
✓ Service is live at https://tryon-backend-production.up.railway.app
```

---

## Step 7: Get Your Deployment URL

```bash
railway domain
```

This will show your deployment URL. You can also:
- Add a custom domain
- Generate a Railway subdomain

---

## Step 8: View Logs

```bash
railway logs
```

This shows real-time logs from your deployment.

---

## Step 9: Update Your Frontend

Update your frontend API URL to point to Railway:

```typescript
// Frontend/src/utils/api.ts
const API_URL = __DEV__ 
  ? "https://try-on-xi.vercel.app"
  : "https://your-railway-url.railway.app";
```

---

## Common Commands

```bash
# View logs
railway logs

# Open dashboard
railway open

# Check status
railway status

# Redeploy
railway up

# Add variables
railway variables set KEY=value

# List variables
railway variables

# Link to existing project
railway link

# Unlink project
railway unlink
```

---

## Pricing

Railway uses a **usage-based pricing** model:

- **Free Trial:** $5 credit (good for testing)
- **Hobby Plan:** $5/month minimum
  - $0.000231/GB-hour for memory
  - $0.000463/vCPU-hour for CPU
  - Typical cost: $5-10/month for this app

**Estimated monthly cost for your app:** ~$7-10

---

## Troubleshooting

### Build fails with "Module not found"
```bash
# Make sure package.json is correct
railway run npm install
railway up
```

### Can't connect to database
- Check `DBHOST` is accessible from Railway
- Railway IPs are dynamic, make sure your DB allows all IPs or use Railway's PostgreSQL

### Google Cloud authentication fails
- Verify `GOOGLE_APPLICATION_CREDENTIALS_JSON` is set correctly
- Check service account has proper permissions

### Puppeteer crashes
- Railway supports Puppeteer out of the box
- If issues persist, add to `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "nixpacksPlan": {
      "phases": {
        "setup": {
          "nixPkgs": ["chromium"]
        }
      }
    }
  }
}
```

---

## Next Steps After Deployment

1. ✅ Test all endpoints
2. ✅ Update frontend API URL
3. ✅ Test virtual try-on (should work without timeout!)
4. ✅ Test product scraping (should work with Puppeteer!)
5. ✅ Monitor logs for any issues

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

**Ready to deploy?** Run these commands:

```bash
cd Backend
railway login
railway init
railway up
```

🎉 Your backend will be live in minutes!

