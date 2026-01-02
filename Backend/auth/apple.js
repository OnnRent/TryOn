const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
  cache: true,
  rateLimit: true,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("Error getting Apple signing key:", err);
      return callback(err);
    }
    callback(null, key.getPublicKey());
  });
}

exports.verifyAppleToken = (identityToken) =>
  new Promise((resolve, reject) => {
    const audience = process.env.APPLECLIENTID;

    console.log("Verifying token with audience:", audience);

    jwt.verify(
      identityToken,
      getKey,
      {
        audience: audience,
        issuer: "https://appleid.apple.com",
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) {
          console.error("JWT verification failed:", err.message);
          reject(err);
        } else {
          console.log("JWT verified successfully for user:", decoded.sub);
          resolve(decoded);
        }
      }
    );
  });
