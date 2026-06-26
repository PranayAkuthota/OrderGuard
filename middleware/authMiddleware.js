const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) return res.status(401).send("Access denied ❌");

  // Handle 'Bearer <token>' format
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length).trim();
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).send("Invalid or expired token ❌");
  }
};