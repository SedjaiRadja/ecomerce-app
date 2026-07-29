const express = require("express");
const {
  createOrder,
  getMyOrders,
  getMyOrder,
  cancelMyOrder,
  getAllOrders,
  getOrder,
  updateOrderStatus,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

/* ===========================
   User Routes
=========================== */

router.post("/", authMiddleware, createOrder);

router.get("/my-orders", authMiddleware, getMyOrders);

router.get("/my-orders/:orderId", authMiddleware, getMyOrder);

router.put("/my-orders/:orderId/cancel", authMiddleware, cancelMyOrder);

/* ===========================
   Admin Routes
=========================== */

router.get("/", authMiddleware, adminMiddleware, getAllOrders);

router.get("/:orderId", authMiddleware, adminMiddleware, getOrder);

router.put("/:orderId", authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;
