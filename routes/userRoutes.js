const middAuth = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

router.get("/profile", middAuth, (req, res) => {
  res.send(req.user);
});
module.exports = router;
