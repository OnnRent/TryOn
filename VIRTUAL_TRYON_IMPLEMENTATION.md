# Virtual Try-On Implementation Guide

## Overview
This implementation uses **Google Gemini 2.5 Flash Image API** (also known as Nano Banana Pro) to generate realistic virtual try-on images where users can see themselves wearing different clothing items.

---

## 🗄️ Database Setup

### Step 1: Run the SQL Schema

Execute the following SQL file to create the necessary tables:

```bash
psql -U postgres -d wardrobe_db -f Backend/database_schema.sql
```

Or manually run these queries:

```sql
-- Table for storing generated try-on images
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Source images
  person_image_path TEXT NOT NULL,
  wardrobe_item_id UUID REFERENCES wardrobe_items(id) ON DELETE SET NULL,
  clothing_image_path TEXT NOT NULL,
  
  -- Generated result
  result_image_path TEXT,
  
  -- Metadata
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Additional info
  prompt_used TEXT,
  generation_time_ms INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_status ON generated_images(status);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at DESC);

-- Add avatar column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_path TEXT;

-- API usage tracking (optional)
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  api_name VARCHAR(100) NOT NULL,
  endpoint VARCHAR(255),
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at DESC);
```

---

## 🔑 Environment Variables

Add to your `Backend/.env` file:

```env
# Gemini API Key (Get from https://aistudio.google.com/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Existing variables
S3BUCKETNAME=your_bucket_name
DBHOST=your_db_host
DBPASSWORD=your_db_password
JWTSECRET=your_jwt_secret
```

### How to Get Gemini API Key:

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key or use an existing one
5. Copy the key and add it to your `.env` file

---

## 📁 Files Created/Modified

### Backend Files:

1. **`Backend/database_schema.sql`** - Database schema for generated images
2. **`Backend/geminiTryOn.js`** - Gemini API integration for virtual try-on
3. **`Backend/index.js`** - Added 3 new endpoints:
   - `POST /tryon/generate` - Generate virtual try-on image
   - `GET /tryon/images` - Fetch user's generated images
   - `DELETE /tryon/:imageId` - Delete a generated image

### Frontend Files:

1. **`Frontend/app/(app)/camera.tsx`** - Updated to call virtual try-on API

---

## 🚀 API Endpoints

### 1. Generate Virtual Try-On

**Endpoint:** `POST /tryon/generate`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
- `person_image` (file) - User's photo
- `clothing_image` (file) - Clothing item image
- `wardrobe_item_id` (string, optional) - Reference to wardrobe item
- `clothing_type` (string) - Either "top" or "bottom"

**Response:**
```json
{
  "success": true,
  "message": "Virtual try-on completed successfully",
  "generated_image_id": "uuid",
  "result_url": "https://s3-signed-url...",
  "generation_time_ms": 5432
}
```

---

### 2. Get Generated Images

**Endpoint:** `GET /tryon/images?limit=20&offset=0`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "images": [
    {
      "id": "uuid",
      "result_url": "https://s3-signed-url...",
      "created_at": "2024-12-30T10:30:00Z",
      "generation_time_ms": 5432
    }
  ]
}
```

---

### 3. Delete Generated Image

**Endpoint:** `DELETE /tryon/:imageId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Generated image deleted successfully"
}
```

---

## 🎨 How It Works

### User Flow:

1. **User takes a photo** using the camera screen
2. **User selects "Select Clothes"**
3. **User chooses a wardrobe item** (top or bottom)
4. **Frontend sends request** to `/tryon/generate` with:
   - Person's photo
   - Clothing item image
   - Clothing type (top/bottom)
5. **Backend processes**:
   - Uploads images to S3
   - Creates database record (status: "processing")
   - Calls Gemini API with detailed prompt
   - Receives generated image
   - Uploads result to S3
   - Updates database (status: "completed")
6. **Frontend displays** the generated try-on image

---

## 🧠 Gemini API Integration

The `geminiTryOn.js` module uses the Gemini 2.5 Flash Image model with a detailed prompt:

```javascript
const prompt = `
Create a professional virtual try-on image. 
Take the person from the first image and make them wear the clothing item from the second image.

Specific requirements:
- Replace the person's current top/shirt with the clothing item
- Ensure the clothing fits naturally on the person's body
- Maintain realistic lighting, shadows, and fabric folds
- Preserve the person's face, hair, skin tone, and body proportions exactly
- Keep the background and lower body unchanged
- Make the clothing look like it's naturally worn

Quality requirements:
- Generate a high-quality, photorealistic image
- Ensure proper color matching and lighting consistency
- Maintain sharp details and natural textures
`;
```

---

## 📊 Database Schema

### `generated_images` Table:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| person_image_path | TEXT | S3 path to person's photo |
| wardrobe_item_id | UUID | Optional reference to wardrobe item |
| clothing_image_path | TEXT | S3 path to clothing image |
| result_image_path | TEXT | S3 path to generated result |
| status | VARCHAR(50) | pending, processing, completed, failed |
| error_message | TEXT | Error details if failed |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| prompt_used | TEXT | Prompt sent to Gemini |
| generation_time_ms | INTEGER | Time taken to generate |

---

## 🧪 Testing

### Test the Virtual Try-On:

1. **Start the backend:**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd Frontend
   npx expo start
   ```

3. **Test flow:**
   - Open the app
   - Go to Camera tab
   - Take a photo of yourself
   - Tap "Select Clothes"
   - Choose "From Wardrobe"
   - Select a clothing item
   - Wait for processing (15-30 seconds)
   - View the generated try-on image!

---

## 💰 Pricing

**Gemini 2.5 Flash Image API:**
- Free tier: 1,500 requests per day
- Paid tier: ~$0.002 per image generation
- Very cost-effective for virtual try-on!

---

## 🔧 Troubleshooting

### Common Issues:

1. **"GEMINI_API_KEY not found"**
   - Make sure you added the API key to `.env`
   - Restart the backend server

2. **"Failed to generate try-on image"**
   - Check your Gemini API quota
   - Verify images are valid JPEGs
   - Check backend logs for detailed error

3. **Slow generation**
   - Normal: 15-30 seconds per image
   - Gemini API can be slow during peak times

4. **Database errors**
   - Make sure you ran the SQL schema
   - Check PostgreSQL connection

---

## 📝 Next Steps

### Enhancements you can add:

1. **Batch processing** - Generate multiple try-ons at once
2. **Image history** - Show all generated images in a gallery
3. **Favorites** - Let users save favorite try-ons
4. **Share** - Allow sharing generated images
5. **Quality settings** - Let users choose speed vs quality
6. **Background removal** - Auto-remove background from person photos
7. **Multiple items** - Try on top + bottom together

---

## 📚 Resources

- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini Image Generation Guide](https://ai.google.dev/gemini-api/docs/image-generation)

---

## ✅ Summary

You now have a fully functional virtual try-on feature powered by Google's Gemini AI! Users can:
- Take photos of themselves
- Select clothing from their wardrobe
- Generate realistic try-on images
- View and manage generated images

The system stores everything in PostgreSQL and S3, with proper error handling and status tracking.

