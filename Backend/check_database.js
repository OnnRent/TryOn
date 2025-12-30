/**
 * Check database tables and data
 */

const pool = require("./db");

async function checkDatabase() {
  try {
    console.log("🔍 Checking database...\n");

    // Check if generated_images table exists
    console.log("1️⃣ Checking if 'generated_images' table exists...");
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'generated_images'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log("✅ Table 'generated_images' EXISTS\n");
      
      // Get table structure
      console.log("2️⃣ Table structure:");
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'generated_images'
        ORDER BY ordinal_position;
      `);
      console.table(structure.rows);
      
      // Count records
      console.log("\n3️⃣ Counting records...");
      const count = await pool.query(`SELECT COUNT(*) FROM generated_images`);
      console.log(`Total records: ${count.rows[0].count}`);
      
      if (parseInt(count.rows[0].count) > 0) {
        console.log("\n4️⃣ Sample records:");
        const samples = await pool.query(`
          SELECT id, user_id, status, created_at, generation_time_ms
          FROM generated_images
          ORDER BY created_at DESC
          LIMIT 5
        `);
        console.table(samples.rows);
      } else {
        console.log("\n⚠️ No records found in 'generated_images' table");
        console.log("This means NO virtual try-on has been generated yet!");
      }
      
    } else {
      console.log("❌ Table 'generated_images' DOES NOT EXIST");
      console.log("\nYou need to create the table first!");
      console.log("\nRun this SQL:");
      console.log(`
CREATE TABLE generated_images (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  person_image_path TEXT NOT NULL,
  wardrobe_item_id UUID REFERENCES wardrobe_items(id) ON DELETE SET NULL,
  clothing_image_path TEXT NOT NULL,
  result_image_path TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'processing',
  error_message TEXT,
  generation_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX idx_generated_images_status ON generated_images(status);
      `);
    }
    
    // Check wardrobe tables
    console.log("\n\n5️⃣ Checking wardrobe data...");
    const wardrobeCount = await pool.query(`SELECT COUNT(*) FROM wardrobe_items`);
    console.log(`Wardrobe items: ${wardrobeCount.rows[0].count}`);
    
    const wardrobeImagesCount = await pool.query(`SELECT COUNT(*) FROM wardrobe_images`);
    console.log(`Wardrobe images: ${wardrobeImagesCount.rows[0].count}`);
    
    console.log("\n✅ Database check complete!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();

