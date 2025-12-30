// Test Vertex AI Virtual Try-On API
require("dotenv").config();
const { GoogleAuth } = require("google-auth-library");
const axios = require("axios");

async function testVertexAI() {
  console.log("\n🧪 Testing Vertex AI Virtual Try-On API...\n");

  const projectId = process.env.GCP_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

  console.log("Project ID:", projectId);
  console.log("Location:", location);
  console.log("");

  try {
    // Get access token
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    console.log("🔑 Getting access token...");
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error("Failed to get access token");
    }

    console.log("✅ Access token obtained");

    // Test API endpoint
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/virtual-try-on-001:predict`;

    console.log("\n📡 Testing API endpoint:");
    console.log(endpoint);
    console.log("");

    // Create a minimal test request (this will fail but tells us if API is accessible)
    console.log("🔍 Checking API accessibility...");
    
    try {
      const response = await axios.post(
        endpoint,
        {
          instances: [
            {
              person_image: { bytes: "test" },
              garment_image: { bytes: "test" }
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
            "Content-Type": "application/json",
          },
          validateStatus: () => true, // Accept any status
        }
      );

      console.log("Response status:", response.status);
      
      if (response.status === 400) {
        console.log("✅ API is accessible! (Got expected 400 error for invalid test data)");
        console.log("\n✅ Vertex AI Virtual Try-On API is ready to use!");
      } else if (response.status === 403) {
        console.log("❌ API returned 403 Forbidden");
        console.log("Response:", response.data);
        console.log("\nPossible issues:");
        console.log("1. Vertex AI API is not enabled for this project");
        console.log("2. Service account doesn't have 'Vertex AI User' role");
        console.log("\nTo fix:");
        console.log("  gcloud services enable aiplatform.googleapis.com --project=" + projectId);
      } else if (response.status === 404) {
        console.log("❌ API endpoint not found (404)");
        console.log("Response:", response.data);
        console.log("\nPossible issues:");
        console.log("1. Virtual Try-On model might not be available in region:", location);
        console.log("2. Try changing GOOGLE_CLOUD_LOCATION to 'us-central1'");
      } else {
        console.log("Response:", response.data);
      }
    } catch (apiError) {
      console.error("❌ API request failed:", apiError.message);
      if (apiError.response) {
        console.error("Status:", apiError.response.status);
        console.error("Data:", apiError.response.data);
      }
    }

  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error("Error:", error.message);
  }
}

testVertexAI();

