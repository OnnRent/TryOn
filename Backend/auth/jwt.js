const jwt = require("jsonwebtoken");

exports.createToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWTSECRET,
    { expiresIn: "30d" }
  );
};

exports.verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth)
    return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(
      auth.split(" ")[1],
      process.env.JWTSECRET
    );

    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
