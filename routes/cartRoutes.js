const express = require("express");
const {
  addProductToCart,
  getCart,
  updateCartQuantity,
  removeProductToCart,
  clearCart,
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, addProductToCart);
router.get("/", authMiddleware, getCart);

router.put("/:productId", authMiddleware, updateCartQuantity);

router.delete("/clear", authMiddleware, clearCart);
router.delete("/:productId", authMiddleware, removeProductToCart);

module.exports = router;
