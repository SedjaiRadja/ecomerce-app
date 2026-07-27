const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send("No access token provided");
  }
  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send("no token provided");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send("Invalid or expired token");
  }
};
module.exports = authMiddleware;
