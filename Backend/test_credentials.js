// Test Google Cloud credentials
require("dotenv").config();
const { GoogleAuth } = require("google-auth-library");

async function testCredentials() {
  console.log("\n🔍 Testing Google Cloud Credentials...\n");
  
  console.log("Environment Variables:");
  console.log("  GCP_PROJECT_ID:", process.env.GCP_PROJECT_ID);
  console.log("  GOOGLE_CLOUD_LOCATION:", process.env.GOOGLE_CLOUD_LOCATION);
  console.log("  GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
  console.log("");

  try {
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    console.log("🔑 Getting access token...");
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (accessToken.token) {
      console.log("✅ Successfully authenticated with Google Cloud!");
      console.log("✅ Access token obtained (first 20 chars):", accessToken.token.substring(0, 20) + "...");
      console.log("\n✅ Credentials are working correctly!");
    } else {
      console.error("❌ Failed to get access token");
    }
  } catch (error) {
    console.error("\n❌ Authentication failed:");
    console.error("Error:", error.message);
    console.error("\nPossible solutions:");
    console.error("1. Make sure GOOGLE_APPLICATION_CREDENTIALS points to a valid service account JSON file");
    console.error("2. Run: gcloud auth application-default login");
    console.error("3. Check that the service account has 'Vertex AI User' role");
  }
}

testCredentials();

