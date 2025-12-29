const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    callback(null, key.getPublicKey());
  });
}

exports.verifyAppleToken = (identityToken) =>
  new Promise((resolve, reject) => {
    jwt.verify(
      identityToken,
      getKey,
      {
        audience: process.env.APPLECLIENTID,
        issuer: "https://appleid.apple.com",
      },
      (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      }
    );
  });
