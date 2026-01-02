const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const sharp = require("sharp");

/**
 * Check if we should use Google AI API (with API key) or Vertex AI (with service account)
 */
function useGoogleAI() {
  return !!process.env.GOOGLE_AI_API_KEY || !!process.env.GEMINI_API_KEY;
}

/**
 * Get Google Cloud credentials for Vercel/serverless environments
 * Supports both full JSON and individual env vars
 * @returns {Object|null} credentials object or null if not found
 */
function getGoogleCredentials() {
  // If using Google AI API with API key, no credentials needed
  if (useGoogleAI()) {
    console.log("✅ Using Google AI API with API key");
    return null;
  }

  console.log("🔧 Loading Google Cloud credentials for Vertex AI...");

  // Debug: Log all GCP-related env vars (existence only, not values)
  console.log("ENV VAR CHECK:");
  console.log("  GCP_PROJECT_ID:", !!process.env.GCP_PROJECT_ID);
  console.log("  GCP_CLIENT_EMAIL:", !!process.env.GCP_CLIENT_EMAIL);
  console.log("  GCP_PRIVATE_KEY:", !!process.env.GCP_PRIVATE_KEY);
  console.log("  GCP_PRIVATE_KEY length:", process.env.GCP_PRIVATE_KEY?.length || 0);
  console.log("  GOOGLE_APPLICATION_CREDENTIALS_JSON:", !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

  // Also check common alternative names
  console.log("  private_key:", !!process.env.private_key);
  console.log("  client_email:", !!process.env.client_email);
  console.log("  project_id:", !!process.env.project_id);

  let credentials = null;

  // Option 1: Full JSON in single env var
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      console.log("✅ Using GOOGLE_APPLICATION_CREDENTIALS_JSON");
    } catch (err) {
      console.error("❌ Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:", err.message);
    }
  }

  // Option 2: Build from individual env vars (try multiple naming conventions)
  const clientEmail = process.env.GCP_CLIENT_EMAIL || process.env.client_email;
  const privateKey = process.env.GCP_PRIVATE_KEY || process.env.private_key;
  const projectId = process.env.GCP_PROJECT_ID || process.env.project_id;

  if (!credentials && clientEmail && privateKey) {
    console.log("✅ Building credentials from individual env vars");
    console.log("  Using client_email:", clientEmail);
    console.log("  Using project_id:", projectId);
    console.log("  Private key length:", privateKey?.length);

    // Handle escaped newlines in private key
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    credentials = {
      type: "service_account",
      project_id: projectId,
      private_key_id: process.env.GCP_PRIVATE_KEY_ID || process.env.private_key_id || "",
      private_key: formattedPrivateKey,
      client_email: clientEmail,
      client_id: process.env.GCP_CLIENT_ID || process.env.client_id || "",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`
    };
  }

  if (credentials) {
    console.log("✅ Credentials loaded successfully");
    console.log("  Project ID:", credentials.project_id);
    console.log("  Client Email:", credentials.client_email);
  } else {
    console.error("❌ No credentials found! Set either:");
    console.error("   - GOOGLE_APPLICATION_CREDENTIALS_JSON (full JSON)");
    console.error("   - OR: GCP_PROJECT_ID, GCP_CLIENT_EMAIL, GCP_PRIVATE_KEY");
    console.error("   - OR: project_id, client_email, private_key");
  }

  return credentials;
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
    const isGoogleAI = useGoogleAI();
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    const credentials = isGoogleAI ? null : getGoogleCredentials();

    if (!isGoogleAI && !credentials) {
      throw new Error("No credentials configured. Set GEMINI_API_KEY for Google AI, or GCP_PROJECT_ID + GCP_CLIENT_EMAIL + GCP_PRIVATE_KEY for Vertex AI.");
    }

    console.log(`🔧 Using ${isGoogleAI ? 'Google AI API' : 'Vertex AI'}`);
    console.log("👕 Clothing type:", clothingType || "top");

    console.log("🔧 Preprocessing images...");

    // Process images in parallel
    const imageProcessing = Promise.all([
      sharp(personImageBuffer)
        .rotate()
        .resize(768, 1024, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer(),
      sharp(clothingImageBuffer)
        .rotate()
        .resize(768, 1024, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer(),
    ]);

    // Get auth token if using Vertex AI
    let accessToken = null;
    if (!isGoogleAI) {
      const auth = new GoogleAuth({
        credentials: credentials,
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      });
      const client = await auth.getClient();
      accessToken = await client.getAccessToken();
      if (!accessToken.token) {
        throw new Error("Failed to get access token for Vertex AI");
      }
    }

    const [processedPersonImage, processedClothingImage] = await imageProcessing;

    console.log(`📊 Image sizes: Person=${(processedPersonImage.length / 1024).toFixed(1)}KB, Clothing=${(processedClothingImage.length / 1024).toFixed(1)}KB`);

    const personImageBase64 = processedPersonImage.toString("base64");
    const clothingImageBase64 = processedClothingImage.toString("base64");

    // Build the prompt
    const clothingDescription = clothingType === "bottom" ? "pants/bottom wear" :
                                clothingType === "full" ? "full outfit" : "top/shirt";

    const prompt = `You are a professional virtual try-on system. Generate a photorealistic image of the person in the first image wearing the ${clothingDescription} shown in the second image.

CRITICAL REQUIREMENTS:
1. FACE PRESERVATION: Keep the person's face EXACTLY as it appears.
2. CLOTHING COLOR: Use the EXACT colors from the clothing image.
3. CLOTHING DESIGN: Preserve all patterns, textures, logos exactly.
4. BODY POSITION: Maintain the person's exact pose.
5. BACKGROUND: Keep the original background.
6. REALISTIC FIT: Make the clothing fit naturally.

Generate a single high-quality photorealistic image.`;

    // Prepare request body
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: personImageBase64 } },
            { inlineData: { mimeType: "image/jpeg", data: clothingImageBase64 } }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
        temperature: 0.2,
      }
    };

    const modelVersion = process.env.GEMINI_IMAGE_MODEL || "gemini-2.0-flash-exp";
    let endpoint, headers;

    if (isGoogleAI) {
      // Google AI API (simpler, uses API key)
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`;
      headers = { "Content-Type": "application/json" };
    } else {
      // Vertex AI (uses service account)
      const projectId = credentials.project_id || process.env.GCP_PROJECT_ID;
      const location = process.env.GOOGLE_CLOUD_LOCATION || "global";
      const hostname = location === "global" ? "aiplatform.googleapis.com" : `${location}-aiplatform.googleapis.com`;
      endpoint = `https://${hostname}/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelVersion}:generateContent`;
      headers = {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      };
    }

    console.log("🎨 Sending request to Gemini API...");
    console.log(`📍 Model: ${modelVersion}`);
    console.log(`📍 Endpoint: ${endpoint.replace(apiKey || '', '***')}`);

    const response = await axios.post(endpoint, requestBody, {
      headers,
      timeout: 180000,
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

