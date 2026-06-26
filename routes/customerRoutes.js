const express = require("express");
const router = express.Router();
const { getCustomers } = require("../controllers/customerController");
const auth = require("../middleware/authMiddleware");

// Customer listing (protected)
router.get("/", auth, getCustomers);

module.exports = router;
