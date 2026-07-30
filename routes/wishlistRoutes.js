const express = require("express");

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, addToWishlist);

router.get("/", authMiddleware, getWishlist);

router.delete("/:productId", authMiddleware, removeFromWishlist);

router.delete("/", authMiddleware, clearWishlist);

module.exports = router;
