const express = require("express");
const router = express.Router();

const {
  getInventory,
  reduceInventory,
  addInventory,
  updateInventory,
  deleteInventory,
  getInventoryById
} = require("../controllers/inventoryController");

const auth = require("../middleware/authMiddleware");

// Get all inventory
router.get("/", getInventory);

// Reduce stock (protected)
router.post("/reduce", auth, reduceInventory);

// Add inventory
router.post("/add", addInventory);

// Update inventory
router.put("/:id", updateInventory);

// Delete inventory
router.delete("/:id", deleteInventory);

// Get single product
router.get("/:id", getInventoryById);

module.exports = router;