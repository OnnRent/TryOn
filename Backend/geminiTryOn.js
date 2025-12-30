const axios = require("axios");
const fs = require("fs");

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

    // Convert buffers to base64
    const personImageBase64 = personImageBuffer.toString("base64");
    const clothingImageBase64 = clothingImageBuffer.toString("base64");

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

    // Call Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`,
      requestBody,
      {
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        timeout: 60000, // 60 second timeout
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

    throw new Error("No image data in Gemini API response");
  } catch (error) {
    console.error("❌ Gemini API Error:", error.response?.data || error.message);
    throw new Error(`Failed to generate try-on image: ${error.message}`);
  }
}

/**
 * Create a detailed prompt for virtual try-on based on clothing type
 * @param {string} clothingType - 'top' or 'bottom'
 * @returns {string} - The prompt for Gemini API
 */
function createTryOnPrompt(clothingType) {
  const basePrompt = `Create a professional virtual try-on image. Take the person from the first image and make them wear the clothing item from the second image.`;

  const specificInstructions = {
    top: `
      - Replace the person's current top/shirt with the clothing item from the second image
      - Ensure the clothing fits naturally on the person's body
      - Maintain realistic lighting, shadows, and fabric folds
      - Preserve the person's face, hair, skin tone, and body proportions exactly
      - Keep the background and lower body (pants/skirt) unchanged
      - Make the clothing look like it's naturally worn, following body contours
      - Adjust the clothing size to fit the person's body realistically
    `,
    bottom: `
      - Replace the person's current bottom/pants/skirt with the clothing item from the second image
      - Ensure the clothing fits naturally on the person's lower body
      - Maintain realistic lighting, shadows, and fabric folds
      - Preserve the person's face, hair, skin tone, upper body, and body proportions exactly
      - Keep the background and upper body (shirt/top) unchanged
      - Make the clothing look like it's naturally worn, following body contours
      - Adjust the clothing size to fit the person's body realistically
    `,
  };

  const qualityInstructions = `
    - Generate a high-quality, photorealistic image
    - Ensure proper color matching and lighting consistency
    - Maintain sharp details and natural textures
    - The result should look like a professional fashion photograph
  `;

  return (
    basePrompt +
    "\n\nSpecific requirements:\n" +
    (specificInstructions[clothingType] || specificInstructions.top) +
    "\n\nQuality requirements:\n" +
    qualityInstructions
  );
}

module.exports = { generateTryOnImage };

