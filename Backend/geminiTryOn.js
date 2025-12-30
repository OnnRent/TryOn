const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

/**
 * Setup Google Cloud credentials for Vercel/serverless environments
 */
function setupGoogleCredentials() {
  // If credentials JSON is provided as environment variable (for Vercel)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credPath = '/tmp/gcp-key.json';
    try {
      fs.writeFileSync(credPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
      console.log("✅ Google Cloud credentials configured from JSON env var");
    } catch (err) {
      console.error("❌ Failed to write GCP credentials:", err.message);
    }
  }

  // Log credential status
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("✅ Using credentials file:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
    // Check if file exists
    if (fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      console.log("✅ Credentials file exists");
    } else {
      console.error("❌ Credentials file not found:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
    }
  } else {
    console.warn("⚠️ GOOGLE_APPLICATION_CREDENTIALS not set, will try default credentials");
  }
}

/**
 * Generate virtual try-on image using Vertex AI Virtual Try-On (Nano Banana Pro)
 * @param {Buffer} personImageBuffer - The person's photo buffer
 * @param {Buffer} clothingImageBuffer - The clothing item buffer
 * @param {string} clothingType - Type of clothing ('top' or 'bottom') - currently not used by the API
 * @returns {Promise<Buffer>} - The generated try-on image buffer
 */
async function generateTryOnImage(personImageBuffer, clothingImageBuffer, clothingType) {
  try {
    // Setup credentials for serverless environments
    setupGoogleCredentials();

    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
    console.log("GCP_PROJECT_ID:", projectId);
    console.log("GOOGLE_CLOUD_LOCATION:", location);
    if (!projectId) {
      throw new Error("GOOGLE_CLOUD_PROJECT or GCP_PROJECT_ID not found in environment variables");
    }

    console.log("🔧 Preprocessing images for Vertex AI Virtual Try-On...");

    // Preprocess images: resize and optimize
    // Virtual Try-On API works best with high-quality images
    const processedPersonImage = await sharp(personImageBuffer)
      .resize(1024, 1024, {
        fit: "inside", // Maintain aspect ratio
        withoutEnlargement: true, // Don't upscale small images
      })
      .jpeg({ quality: 90 }) // High quality for better results
      .toBuffer();

    const processedClothingImage = await sharp(clothingImageBuffer)
      .resize(1024, 1024, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log(`📊 Image sizes: Person=${(processedPersonImage.length / 1024).toFixed(1)}KB, Clothing=${(processedClothingImage.length / 1024).toFixed(1)}KB`);

    // Convert buffers to base64
    const personImageBase64 = processedPersonImage.toString("base64");
    const clothingImageBase64 = processedClothingImage.toString("base64");

    console.log("🔑 Authenticating with Google Cloud...");
    console.log("Person Image Base64:",personImageBase64);
    console.log("Clothing Image Base64:",clothingImageBase64);

    // Get access token for Vertex AI
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error("Failed to get access token for Vertex AI");
    }

    // Prepare request payload for Virtual Try-On API
    const requestBody = {
      instances: [
        {
          personImage: {
            image: {
              bytesBase64Encoded: personImageBase64,
            },
          },
          productImages: [
            {
              image: {
                bytesBase64Encoded: clothingImageBase64,
              },
            },
          ],
        },
      ],
      parameters: {
        sampleCount: 1, // Number of images to generate (1-4)
      },
    };

    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/virtual-try-on-preview-08-04:predict`;

    console.log("🎨 Sending request to Vertex AI Virtual Try-On API...");
    console.log(`📍 Endpoint: ${endpoint}`);

    // Call Vertex AI Virtual Try-On API
    const response = await axios.post(endpoint, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      timeout: 120000, // 120 second timeout
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Extract generated image from response
    if (
      response.data &&
      response.data.predictions &&
      response.data.predictions.length > 0
    ) {
      const prediction = response.data.predictions[0];

      if (prediction.bytesBase64Encoded) {
        console.log("✅ Successfully generated try-on image with Virtual Try-On");
        return Buffer.from(prediction.bytesBase64Encoded, "base64");
      }
    }

    console.error("❌ No image data in Virtual Try-On API response");
    console.error("Response structure:", JSON.stringify(response.data, null, 2));
    throw new Error("No image data in Virtual Try-On API response");
  } catch (error) {
    if (error.response?.data) {
      console.error("❌ Virtual Try-On API Error Response:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("❌ Virtual Try-On API Error:", error.message);
    }
    throw new Error(`Failed to generate try-on image: ${error.response?.data?.error?.message || error.message}`);
  }
}

module.exports = { generateTryOnImage };

