const { OAuth2Client } = require("google-auth-library");

// Verify Google access token by fetching user info
exports.verifyGoogleToken = async (accessToken) => {
  try {
    // Use the userinfo endpoint to verify the token and get user data
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Invalid access token");
    }

    const userInfo = await response.json();

    // userInfo contains: sub, email, email_verified, name, picture, given_name, family_name
    if (!userInfo.sub) {
      throw new Error("Could not get user ID from Google");
    }

    console.log("Google user verified:", {
      sub: userInfo.sub,
      email: userInfo.email,
    });

    return {
      sub: userInfo.sub,
      email: userInfo.email || null,
      name: userInfo.name || null,
      picture: userInfo.picture || null,
    };
  } catch (error) {
    console.error("Google token verification failed:", error.message);
    throw error;
  }
};

