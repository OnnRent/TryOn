const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const sharp = require("sharp");
const fs = require("fs");

/**
 * Setup Google Cloud credentials for Vercel/serverless environments
 */
function setupGoogleCredentials() {
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

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("✅ Using credentials file:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
    if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      console.error("❌ Credentials file not found:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
    }
  } else {
    console.warn("⚠️ GOOGLE_APPLICATION_CREDENTIALS not set, will try default credentials");
  }
}

/**
 * Generate virtual try-on image using Gemini 3 Pro Image model
 * @param {Buffer} personImageBuffer - The person's photo buffer
 * @param {Buffer} clothingImageBuffer - The clothing item buffer
 * @param {string} clothingType - Type of clothing ('top', 'bottom', or 'full')
 * @returns {Promise<Buffer>} - The generated try-on image buffer
 */
async function generateTryOnImage(personImageBuffer, clothingImageBuffer, clothingType) {
  try {
    setupGoogleCredentials();

    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
    console.log("GCP_PROJECT_ID:", projectId);
    console.log("GOOGLE_CLOUD_LOCATION:", location);
    console.log("👕 Clothing type:", clothingType || "top");

    if (!projectId) {
      throw new Error("GCP_PROJECT_ID not found in environment variables");
    }

    console.log("🔧 Preprocessing images for Gemini 3 Pro Image...");

    // Preprocess person image - higher quality for face preservation
    const processedPersonImage = await sharp(personImageBuffer)
      .rotate()
      .resize(1024, 1365, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 95 })
      .toBuffer();

    // Preprocess clothing image - PNG for exact color preservation
    const processedClothingImage = await sharp(clothingImageBuffer)
      .rotate()
      .resize(1024, 1365, { fit: "inside", withoutEnlargement: true })
      .png({ quality: 100 })
      .toBuffer();

    console.log(`📊 Image sizes: Person=${(processedPersonImage.length / 1024).toFixed(1)}KB, Clothing=${(processedClothingImage.length / 1024).toFixed(1)}KB`);

    // Convert to base64
    const personImageBase64 = processedPersonImage.toString("base64");
    const clothingImageBase64 = processedClothingImage.toString("base64");

    // Get access token
    console.log("🔑 Authenticating with Google Cloud...");
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error("Failed to get access token for Vertex AI");
    }

    // Build the prompt for virtual try-on with strict preservation instructions
    const clothingDescription = clothingType === "bottom" ? "pants/bottom wear" :
                                clothingType === "full" ? "full outfit" : "top/shirt";

    const prompt = `You are a professional virtual try-on system. Generate a photorealistic image of the person in the first image wearing the ${clothingDescription} shown in the second image.

CRITICAL REQUIREMENTS - YOU MUST FOLLOW THESE EXACTLY:
1. FACE PRESERVATION: Keep the person's face EXACTLY as it appears - same expression, same features, same lighting on face. Do NOT modify, enhance, or change the facial expression in any way.
2. CLOTHING COLOR: Use the EXACT colors from the clothing image. Do NOT change, adjust, or modify the clothing colors at all. The colors must match the original clothing image precisely.
3. CLOTHING DESIGN: Preserve all patterns, textures, logos, and design elements from the clothing image exactly as shown.
4. BODY POSITION: Maintain the person's exact pose and body position from the original photo.
5. BACKGROUND: Keep the original background from the person's photo.
6. LIGHTING: Match the lighting conditions from the person's original photo.
7. REALISTIC FIT: Make the clothing fit naturally on the person's body while maintaining all the above requirements.

Generate a single high-quality photorealistic image.`;

    // Prepare request for Gemini 3 Pro Image
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: personImageBase64
              }
            },
            {
              inlineData: {
                mimeType: "image/png",
                data: clothingImageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
        temperature: 0.2, // Lower temperature for more consistent/faithful output
      }
    };

    const modelVersion = process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview";
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelVersion}:generateContent`;

    console.log("🎨 Sending request to Gemini 3 Pro Image API...");
    console.log(`📍 Model: ${modelVersion}`);
    console.log(`📍 Endpoint: ${endpoint}`);

    const response = await axios.post(endpoint, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      timeout: 180000, // 3 minute timeout for image generation
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Extract generated image from response
    if (response.data?.candidates?.[0]?.content?.parts) {
      const parts = response.data.candidates[0].content.parts;

      for (const part of parts) {
        if (part.inlineData?.data) {
          console.log("✅ Successfully generated try-on image with Gemini 3 Pro Image");

          const resultBuffer = Buffer.from(part.inlineData.data, "base64");

          // Post-process for correct orientation
          const processedResult = await sharp(resultBuffer)
            .rotate()
            .toBuffer();

          const metadata = await sharp(processedResult).metadata();
          console.log(`📐 Result image dimensions: ${metadata.width}x${metadata.height}`);

          // Rotate if landscape
          if (metadata.width > metadata.height) {
            console.log("🔄 Rotating landscape image to portrait orientation");
            return await sharp(processedResult).rotate(90).toBuffer();
          }

          return processedResult;
        }
      }
    }

    console.error("❌ No image data in Gemini response");
    console.error("Response structure:", JSON.stringify(response.data, null, 2));
    throw new Error("No image data in Gemini 3 Pro Image response");
  } catch (error) {
    if (error.response?.data) {
      console.error("❌ Gemini API Error Response:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("❌ Gemini API Error:", error.message);
    }
    throw new Error(`Failed to generate try-on image: ${error.response?.data?.error?.message || error.message}`);
  }
}

module.exports = { generateTryOnImage };

