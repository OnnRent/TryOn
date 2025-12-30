-- Table for storing generated try-on images
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Source images
  person_image_path TEXT NOT NULL,  -- S3 path to the person's photo
  wardrobe_item_id UUID REFERENCES wardrobe_items(id) ON DELETE SET NULL,  -- Reference to wardrobe item
  clothing_image_path TEXT NOT NULL,  -- S3 path to the clothing item
  
  -- Generated result
  result_image_path TEXT,  -- S3 path to the generated try-on image
  
  -- Metadata
  status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, completed, failed
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Additional info
  prompt_used TEXT,  -- The prompt sent to Gemini API
  generation_time_ms INTEGER  -- Time taken to generate
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_status ON generated_images(status);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at DESC);

-- Add avatar_path column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_path TEXT;

-- Table for tracking API usage (optional but recommended)
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  api_name VARCHAR(100) NOT NULL,  -- 'gemini', 'remove_bg', etc.
  endpoint VARCHAR(255),
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at DESC);

