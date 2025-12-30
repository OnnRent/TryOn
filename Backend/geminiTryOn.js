const axios = require("axios");
const fs = require("fs");
const sharp = require("sharp");

/**
 * Generate virtual try-on image using Gemini 2.5 Flash Image (Nano Banana Pro)
 * @param {Buffer} personImageBuffer - The person's photo buffer
 * @param {Buffer} clothingImageBuffer - The clothing item buffer
 * @param {string} clothingType - Type of clothing ('top' or 'bottom')
 * @returns {Promise<Buffer>} - The generated try-on image buffer
 */
async function generateTryOnImage(personImageBuffer, clothingImageBuffer, clothingType) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    console.log("🔧 Preprocessing images for Gemini API...");

    // Preprocess images: resize and optimize for Gemini API
    // Gemini API has limits: max 4MB per image, recommended 1024x1024 or smaller
    const processedPersonImage = await sharp(personImageBuffer)
      .resize(1024, 1024, {
        fit: "inside", // Maintain aspect ratio
        withoutEnlargement: true, // Don't upscale small images
      })
      .jpeg({ quality: 85 }) // Convert to JPEG with good quality
      .toBuffer();

    const processedClothingImage = await sharp(clothingImageBuffer)
      .resize(1024, 1024, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    console.log(`📊 Image sizes: Person=${(processedPersonImage.length / 1024).toFixed(1)}KB, Clothing=${(processedClothingImage.length / 1024).toFixed(1)}KB`);

    // Convert buffers to base64
    const personImageBase64 = processedPersonImage.toString("base64");
    const clothingImageBase64 = processedClothingImage.toString("base64");

    // Create detailed prompt based on clothing type
    const prompt = createTryOnPrompt(clothingType);

    // Prepare request payload
    const requestBody = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: personImageBase64,
              },
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: clothingImageBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    console.log("🎨 Sending request to Gemini API for virtual try-on...");
    console.log(`📝 Prompt length: ${prompt.length} characters`);

    // Call Gemini API with image generation model
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent`,
      requestBody,
      {
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        timeout: 120000, // 120 second timeout (increased for image generation)
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    // Extract generated image from response
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates.length > 0
    ) {
      const parts = response.data.candidates[0].content.parts;

      for (const part of parts) {
        if (part.inline_data && part.inline_data.data) {
          console.log("✅ Successfully generated try-on image");
          return Buffer.from(part.inline_data.data, "base64");
        }
      }
    }

    console.error("❌ No image data in Gemini API response");
    console.error("Response structure:", JSON.stringify(response.data, null, 2));
    throw new Error("No image data in Gemini API response");
  } catch (error) {
    if (error.response?.data) {
      console.error("❌ Gemini API Error Response:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("❌ Gemini API Error:", error.message);
    }
    throw new Error(`Failed to generate try-on image: ${error.response?.data?.error?.message || error.message}`);
  }
}

/**
 * Create a detailed prompt for virtual try-on based on clothing type
 * @param {string} clothingType - 'top' or 'bottom'
 * @returns {string} - The prompt for Gemini API
 */
function createTryOnPrompt(clothingType) {
  if (clothingType === "top") {
    return `Create a photorealistic virtual try-on image. Show the person from the first image wearing the clothing item (shirt/top) from the second image. Replace only their current top/shirt with the new clothing. Keep their face, hair, body, pants, and background exactly the same. Make the clothing fit naturally with realistic lighting, shadows, and fabric folds. The result should look like a professional fashion photograph.`;
  } else {
    return `Create a photorealistic virtual try-on image. Show the person from the first image wearing the clothing item (pants/bottom) from the second image. Replace only their current pants/bottom with the new clothing. Keep their face, hair, body, shirt/top, and background exactly the same. Make the clothing fit naturally with realistic lighting, shadows, and fabric folds. The result should look like a professional fashion photograph.`;
  }
}

module.exports = { generateTryOnImage };

