/**
 * Test script for Gemini Virtual Try-On API
 * 
 * Usage:
 * 1. Make sure you have GEMINI_API_KEY in your .env file
 * 2. Run: node test_gemini.js
 * 
 * This will test the Gemini API connection and image generation capability
 */

require("dotenv").config();
const { generateTryOnImage } = require("./geminiTryOn");
const fs = require("fs");
const path = require("path");

async function testGeminiAPI() {
  console.log("🧪 Testing Gemini Virtual Try-On API...\n");

  // Check if API key exists
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY not found in .env file");
    console.log("\n📝 To fix this:");
    console.log("1. Go to https://aistudio.google.com/apikey");
    console.log("2. Create a new API key");
    console.log("3. Add it to your Backend/.env file:");
    console.log("   GEMINI_API_KEY=your_api_key_here\n");
    process.exit(1);
  }

  console.log("✅ GEMINI_API_KEY found");
  console.log(`   Key: ${process.env.GEMINI_API_KEY.substring(0, 10)}...`);

  // For testing, we'll use placeholder images
  // In a real scenario, you would load actual image files
  console.log("\n⚠️  NOTE: This test requires actual image files to work properly");
  console.log("To test with real images:");
  console.log("1. Place a person photo at: Backend/test_images/person.jpg");
  console.log("2. Place a clothing photo at: Backend/test_images/clothing.jpg");
  console.log("3. Run this script again\n");

  // Check if test images exist
  const personImagePath = path.join(__dirname, "test_images", "person.jpg");
  const clothingImagePath = path.join(__dirname, "test_images", "clothing.jpg");

  if (!fs.existsSync(personImagePath) || !fs.existsSync(clothingImagePath)) {
    console.log("❌ Test images not found");
    console.log("\n📁 Creating test_images directory...");
    
    const testImagesDir = path.join(__dirname, "test_images");
    if (!fs.existsSync(testImagesDir)) {
      fs.mkdirSync(testImagesDir);
      console.log("✅ Created Backend/test_images/");
    }

    console.log("\n📝 Next steps:");
    console.log("1. Add person.jpg to Backend/test_images/");
    console.log("2. Add clothing.jpg to Backend/test_images/");
    console.log("3. Run: node test_gemini.js\n");
    
    return;
  }

  console.log("✅ Test images found");
  console.log(`   Person: ${personImagePath}`);
  console.log(`   Clothing: ${clothingImagePath}`);

  try {
    console.log("\n🎨 Generating virtual try-on image...");
    console.log("⏳ This may take 15-30 seconds...\n");

    const startTime = Date.now();

    // Load images
    const personImageBuffer = fs.readFileSync(personImagePath);
    const clothingImageBuffer = fs.readFileSync(clothingImagePath);

    // Generate try-on image
    const resultBuffer = await generateTryOnImage(
      personImageBuffer,
      clothingImageBuffer,
      "top" // or "bottom"
    );

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✅ SUCCESS! Generated in ${duration} seconds`);
    console.log(`   Result size: ${(resultBuffer.length / 1024).toFixed(2)} KB`);

    // Save result
    const outputPath = path.join(__dirname, "test_images", "result.jpg");
    fs.writeFileSync(outputPath, resultBuffer);

    console.log(`   Saved to: ${outputPath}`);
    console.log("\n🎉 Gemini API is working correctly!");
    console.log("   You can now use the virtual try-on feature in your app.\n");

  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    
    if (error.response?.data) {
      console.error("\n📋 API Response:");
      console.error(JSON.stringify(error.response.data, null, 2));
    }

    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check your API key is valid");
    console.log("2. Verify you have API quota remaining");
    console.log("3. Ensure images are valid JPEGs");
    console.log("4. Check your internet connection\n");
    
    process.exit(1);
  }
}

// Run the test
testGeminiAPI().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});

