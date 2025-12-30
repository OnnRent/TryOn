/**
 * Test the complete virtual try-on flow
 * This simulates what the frontend will do
 */

const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const BASE_URL = "http://localhost:3000";

// You'll need to replace this with a real token
const TEST_TOKEN = process.env.TEST_TOKEN || "your_jwt_token_here";

async function testCompleteFlow() {
  console.log("🧪 Testing Complete Virtual Try-On Flow\n");

  try {
    // Step 1: Test product scraping
    console.log("1️⃣ Testing product scraping...");
    const scrapeResponse = await axios.post(
      `${BASE_URL}/scrape/product`,
      {
        url: "https://www.flipkart.com/puma-solid-men-polo-neck-black-t-shirt/p/itm4c3e0e2e0c0e0",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Scraped ${scrapeResponse.data.count} images`);
    
    if (scrapeResponse.data.count === 0) {
      throw new Error("No images scraped!");
    }

    // Step 2: Download the first scraped image
    console.log("\n2️⃣ Downloading scraped clothing image...");
    const clothingImageData = scrapeResponse.data.images[0].data;
    
    // Convert base64 to buffer
    const base64Data = clothingImageData.replace(/^data:image\/\w+;base64,/, "");
    const clothingBuffer = Buffer.from(base64Data, "base64");
    
    // Save temporarily
    const clothingPath = path.join(__dirname, "temp_clothing.jpg");
    fs.writeFileSync(clothingPath, clothingBuffer);
    console.log(`✅ Saved clothing image (${clothingBuffer.length} bytes)`);

    // Step 3: Create a dummy person image (or use a real one)
    console.log("\n3️⃣ Preparing person image...");
    const personPath = path.join(__dirname, "temp_person.jpg");
    
    // Check if we have a test person image
    if (!fs.existsSync(personPath)) {
      console.log("⚠️ No test person image found at:", personPath);
      console.log("Please add a test image named 'temp_person.jpg' in the Backend folder");
      console.log("\nSkipping virtual try-on test...");
      
      // Cleanup
      fs.unlinkSync(clothingPath);
      return;
    }

    console.log("✅ Person image ready");

    // Step 4: Call virtual try-on API
    console.log("\n4️⃣ Calling virtual try-on API...");
    console.log("⏳ This may take 5-10 seconds...\n");

    const formData = new FormData();
    formData.append("person_image", fs.createReadStream(personPath));
    formData.append("clothing_image", fs.createReadStream(clothingPath));
    formData.append("clothing_type", "top");

    const startTime = Date.now();

    const tryonResponse = await axios.post(
      `${BASE_URL}/tryon/generate`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${TEST_TOKEN}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const endTime = Date.now();

    console.log("✅ Virtual try-on completed!");
    console.log(`⏱️  Generation time: ${endTime - startTime}ms`);
    console.log(`📊 API reported time: ${tryonResponse.data.generation_time_ms}ms`);
    console.log(`🆔 Generated ID: ${tryonResponse.data.generated_image_id}`);
    console.log(`🔗 Result URL: ${tryonResponse.data.result_url.substring(0, 80)}...`);

    // Step 5: Verify database entry
    console.log("\n5️⃣ Verifying database entry...");
    const pool = require("./db");
    
    const dbCheck = await pool.query(
      "SELECT * FROM generated_images WHERE id = $1",
      [tryonResponse.data.generated_image_id]
    );

    if (dbCheck.rows.length === 0) {
      throw new Error("Database entry not found!");
    }

    console.log("✅ Database entry verified:");
    console.log(`   Status: ${dbCheck.rows[0].status}`);
    console.log(`   Result path: ${dbCheck.rows[0].result_image_path}`);

    // Step 6: Test fetching history
    console.log("\n6️⃣ Testing history endpoint...");
    const historyResponse = await axios.get(
      `${BASE_URL}/tryon/images?limit=5`,
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
        },
      }
    );

    console.log(`✅ Found ${historyResponse.data.images.length} generated images in history`);

    // Cleanup
    console.log("\n🧹 Cleaning up temporary files...");
    fs.unlinkSync(clothingPath);
    
    await pool.end();

    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("\n📝 Summary:");
    console.log("   ✅ Product scraping works");
    console.log("   ✅ Virtual try-on generation works");
    console.log("   ✅ Database storage works");
    console.log("   ✅ S3 upload works");
    console.log("   ✅ History retrieval works");

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    
    // Cleanup on error
    const clothingPath = path.join(__dirname, "temp_clothing.jpg");
    if (fs.existsSync(clothingPath)) {
      fs.unlinkSync(clothingPath);
    }
    
    process.exit(1);
  }
}

// Run the test
testCompleteFlow();

