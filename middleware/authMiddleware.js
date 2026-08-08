const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    token = req.cookies.accessToken;
  }

  console.log("TOKEN:", token);
  console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

  if (!token) {
    return res.status(401).send("No access token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);

    return res.status(401).send("Invalid or expired token");
  }
};

module.exports = authMiddleware;
