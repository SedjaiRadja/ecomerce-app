const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
router.get("/test", authMiddleware, adminMiddleware, (req, res) => {
  res.send("welcome admin");
});
module.exports = router;
