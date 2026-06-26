const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  createOrder,
  updateOrderStatus,
  getOrders,
  getOrderById
} = require("../controllers/orderController");

// Create order
router.post("/", auth, createOrder);

// Update order status
router.post("/status", auth, updateOrderStatus);

// Get orders list
router.get("/", auth, getOrders);

// Get order details
router.get("/:id", auth, getOrderById);

module.exports = router;