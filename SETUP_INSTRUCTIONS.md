# 🎨 Virtual Try-On Setup Instructions

## Quick Start Guide

Follow these steps to set up the virtual try-on feature in your TryOn app.

---

## 📋 Prerequisites

- PostgreSQL database running
- AWS S3 bucket configured
- Node.js and npm installed
- Expo CLI for React Native

---

## 🔧 Step 1: Database Setup

### Option A: Run the SQL file

```bash
cd Backend
psql -U postgres -d wardrobe_db -f database_schema.sql
```

### Option B: Run SQL manually

Open your PostgreSQL client and run the queries in `Backend/database_schema.sql`

**What this does:**
- Creates `generated_images` table to store try-on results
- Creates `api_usage` table for tracking API costs (optional)
- Adds `avatar_path` column to `users` table
- Creates necessary indexes for performance

---

## 🔑 Step 2: Get Gemini API Key

1. **Go to Google AI Studio:**
   - Visit: https://aistudio.google.com/apikey
   - Sign in with your Google account

2. **Create API Key:**
   - Click "Get API Key" or "Create API Key"
   - Copy the generated key

3. **Add to Environment Variables:**
   - Open `Backend/.env`
   - Add this line:
     ```env
     GEMINI_API_KEY=your_api_key_here
     ```

**Free Tier:**
- 1,500 requests per day
- Perfect for development and testing!

---

## 📦 Step 3: Install Dependencies (if needed)

All required dependencies should already be installed, but if you encounter issues:

```bash
cd Backend
npm install axios multer uuid
```

---

## 🧪 Step 4: Test Gemini API

### Quick Test:

```bash
cd Backend
node test_gemini.js
```

This will check if your API key is configured correctly.

### Full Test with Images:

1. **Create test images directory:**
   ```bash
   mkdir -p Backend/test_images
   ```

2. **Add test images:**
   - Place a person photo: `Backend/test_images/person.jpg`
   - Place a clothing photo: `Backend/test_images/clothing.jpg`

3. **Run the test:**
   ```bash
   node test_gemini.js
   ```

4. **Check the result:**
   - Generated image will be saved to: `Backend/test_images/result.jpg`

---

## 🚀 Step 5: Start the Application

### Start Backend:

```bash
cd Backend
npm run dev
```

Server should start on `https://try-on-xi.vercel.app`

### Start Frontend:

```bash
cd Frontend
npx expo start
```

---

## 📱 Step 6: Test in the App

1. **Open the app** on your device/simulator

2. **Go to Camera tab**

3. **Take a photo** of yourself (or use a test photo)

4. **Tap "Select Clothes"**

5. **Choose "From Wardrobe"**

6. **Select a clothing item** (top or bottom)

7. **Wait for processing** (15-30 seconds)

8. **View your virtual try-on!** 🎉

---

## 🔍 Verify Everything Works

### Check Backend Logs:

You should see:
```
🎨 Virtual Try-On Request: { userId: '...', wardrobeItemId: '...', clothingType: 'top' }
📤 Uploading source images to S3...
✅ Source images uploaded
🤖 Generating try-on image with Gemini API...
🎨 Sending request to Gemini API for virtual try-on...
✅ Successfully generated try-on image
📤 Uploading generated image to S3...
✅ Try-on completed in 5432ms
```

### Check Database:

```sql
SELECT * FROM generated_images ORDER BY created_at DESC LIMIT 5;
```

You should see your generated images with status "completed"

---

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY not found"

**Solution:**
- Make sure you added the key to `Backend/.env`
- Restart the backend server
- Check for typos in the variable name

### Issue: "Failed to generate try-on image"

**Possible causes:**
1. **API quota exceeded** - Check your Google AI Studio dashboard
2. **Invalid images** - Ensure images are valid JPEGs
3. **Network issues** - Check your internet connection
4. **API key invalid** - Verify your API key is correct

**Debug:**
```bash
# Check backend logs for detailed error
cd Backend
npm run dev
# Look for error messages in the console
```

### Issue: "No clothing image found"

**Solution:**
- Make sure the wardrobe item has images uploaded
- Check S3 bucket permissions
- Verify the wardrobe item ID is correct

### Issue: Slow generation (>60 seconds)

**Possible causes:**
- Gemini API is experiencing high load
- Large image files (>5MB)
- Slow internet connection

**Solutions:**
- Compress images before uploading
- Try again during off-peak hours
- Increase timeout in `Backend/geminiTryOn.js` (line 63)

---

## 📊 Monitor API Usage

### Check API Usage:

```sql
SELECT 
  api_name,
  COUNT(*) as requests,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost
FROM api_usage
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY api_name;
```

### Set Up Alerts:

You can create a cron job to monitor daily usage:

```sql
-- Get today's usage
SELECT COUNT(*) as today_requests
FROM generated_images
WHERE created_at::date = CURRENT_DATE;
```

---

## 💡 Tips for Best Results

### Image Quality:

1. **Person photos:**
   - Good lighting
   - Clear view of body
   - Neutral background
   - Standing straight

2. **Clothing photos:**
   - High resolution
   - Clear product image
   - Minimal background
   - Front view preferred

### Performance:

1. **Compress images** before uploading (use Sharp or similar)
2. **Cache results** to avoid regenerating same combinations
3. **Use background jobs** for batch processing
4. **Monitor API quota** to avoid hitting limits

---

## 🎯 Next Steps

Now that virtual try-on is working, you can:

1. **Add a gallery** to view all generated images
2. **Implement favorites** to save best try-ons
3. **Add sharing** to social media
4. **Batch processing** for multiple items
5. **Quality settings** (fast vs high-quality)
6. **Background removal** for cleaner results

Check `VIRTUAL_TRYON_IMPLEMENTATION.md` for more details!

---

## 📚 Additional Resources

- **Gemini API Docs:** https://ai.google.dev/gemini-api/docs
- **Google AI Studio:** https://aistudio.google.com/
- **Image Generation Guide:** https://ai.google.dev/gemini-api/docs/image-generation

---

## ✅ Checklist

- [ ] Database schema created
- [ ] Gemini API key added to .env
- [ ] Test script runs successfully
- [ ] Backend server starts without errors
- [ ] Frontend app connects to backend
- [ ] Can take photo in camera screen
- [ ] Can select wardrobe item
- [ ] Virtual try-on generates successfully
- [ ] Result image displays correctly

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the backend logs for detailed errors
2. Verify all environment variables are set
3. Test the Gemini API with `test_gemini.js`
4. Check database connections
5. Verify S3 bucket permissions

---

**Happy Virtual Try-On! 🎉**

