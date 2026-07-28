const express = require("express");
const {
  createOrder,
  getMyOrders,
  getMyOrder,
  cancelMyOrder,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/:orderId", authMiddleware, getMyOrder);
router.put("/:orderId/cancel", authMiddleware, cancelMyOrder);
module.exports = router;
