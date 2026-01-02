const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const sharp = require("sharp");

/**
 * Get Google Cloud credentials for Vertex AI Virtual Try-On
 * @returns {Object|null} credentials object or null if not found
 */
function getGoogleCredentials() {
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

  // Option 2: Build from individual env vars
  const clientEmail = process.env.GCP_CLIENT_EMAIL || process.env.client_email;
  const privateKey = process.env.GCP_PRIVATE_KEY || process.env.private_key;
  const projectId = process.env.GCP_PROJECT_ID || process.env.project_id;

  if (!credentials && clientEmail && privateKey) {
    console.log("✅ Building credentials from individual env vars");
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    credentials = {
      type: "service_account",
      project_id: projectId,
      private_key_id: process.env.GCP_PRIVATE_KEY_ID || "",
      private_key: formattedPrivateKey,
      client_email: clientEmail,
      client_id: process.env.GCP_CLIENT_ID || "",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`
    };
  }

  return credentials;
}

/**
 * Generate virtual try-on image using Vertex AI Virtual Try-On API
 * Model: virtual-try-on-preview-08-04
 *
 * @param {Buffer} personImageBuffer - The person's photo buffer
 * @param {Buffer} clothingImageBuffer - The clothing item buffer
 * @param {string} clothingType - Type of clothing ('top', 'bottom', or 'full')
 * @returns {Promise<Buffer>} - The generated try-on image buffer
 */
async function generateTryOnImage(personImageBuffer, clothingImageBuffer, clothingType) {
  try {
    const credentials = getGoogleCredentials();

    if (!credentials) {
      throw new Error("Google Cloud credentials not configured. Set GCP_PROJECT_ID, GCP_CLIENT_EMAIL, and GCP_PRIVATE_KEY.");
    }

    const projectId = credentials.project_id || process.env.GCP_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

    console.log("🔧 Using Vertex AI Virtual Try-On API");
    console.log("📍 Project:", projectId);
    console.log("📍 Location:", location);
    console.log("👕 Clothing type:", clothingType || "top");

    console.log("🔧 Preprocessing images...");

    // Optimized image size - 768px is sufficient for good results and faster processing
    const imageSize = parseInt(process.env.VTON_IMAGE_SIZE) || 768;

    // Process images in parallel with optimized settings
    const [processedPersonImage, processedClothingImage] = await Promise.all([
      sharp(personImageBuffer)
        .rotate()
        .resize(imageSize, imageSize, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })  // JPEG is faster than PNG
        .toBuffer(),
      sharp(clothingImageBuffer)
        .rotate()
        .resize(imageSize, imageSize, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer(),
    ]);

    console.log(`📊 Image sizes: Person=${(processedPersonImage.length / 1024).toFixed(1)}KB, Clothing=${(processedClothingImage.length / 1024).toFixed(1)}KB`);

    const personImageBase64 = processedPersonImage.toString("base64");
    const clothingImageBase64 = processedClothingImage.toString("base64");

    // Get access token
    console.log("🔑 Authenticating with Google Cloud...");
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error("Failed to get access token for Vertex AI");
    }
    console.log("✅ Authenticated successfully");

    // Virtual Try-On API request body
    // Note: This API doesn't accept text prompts - it's designed to preserve product image automatically
    // Higher baseSteps = better quality/preservation but slower
    const requestBody = {
      instances: [
        {
          personImage: {
            image: {
              bytesBase64Encoded: personImageBase64
            }
          },
          productImages: [
            {
              image: {
                bytesBase64Encoded: clothingImageBase64
              }
            }
          ]
        }
      ],
      parameters: {
        sampleCount: 1,
        // baseSteps: lower = faster, higher = better quality
        // 20-25: Fast (~15-20s), acceptable quality
        // 32: Default (~25-35s), good quality
        // 50: Slow (~45-60s), best quality
        baseSteps: parseInt(process.env.VTON_BASE_STEPS) || 25,
        personGeneration: "allow_adult",
        outputOptions: {
          mimeType: "image/jpeg",  // JPEG is faster than PNG
          compressionQuality: 85
        }
      }
    };

    // Virtual Try-On model
    const modelVersion = "virtual-try-on-preview-08-04";
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelVersion}:predict`;

    console.log("🎨 Sending request to Virtual Try-On API...");
    console.log(`📍 Model: ${modelVersion}`);
    console.log(`📍 Endpoint: ${endpoint}`);

    const response = await axios.post(endpoint, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      timeout: 180000, // 3 minute timeout
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Extract generated image from response
    if (response.data?.predictions?.[0]?.bytesBase64Encoded) {
      console.log("✅ Successfully generated try-on image!");

      const resultBuffer = Buffer.from(response.data.predictions[0].bytesBase64Encoded, "base64");

      // Post-process for correct orientation
      const processedResult = await sharp(resultBuffer).rotate().toBuffer();
      const metadata = await sharp(processedResult).metadata();
      console.log(`📐 Result image dimensions: ${metadata.width}x${metadata.height}`);

      return processedResult;
    }

    console.error("❌ No image data in Virtual Try-On response");
    console.error("Response:", JSON.stringify(response.data, null, 2));
    throw new Error("No image data in Virtual Try-On response");
  } catch (error) {
    if (error.response?.data) {
      console.error("❌ Virtual Try-On API Error:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("❌ Virtual Try-On Error:", error.message);
    }
    throw new Error(`Failed to generate try-on image: ${error.response?.data?.error?.message || error.message}`);
  }
}

module.exports = { generateTryOnImage };

