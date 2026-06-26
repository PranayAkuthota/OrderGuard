const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    default: "Uncategorized"
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  reservedStock: {
    type: Number,
    default: 0,
    min: 0
  },
  reorderThreshold: {
    type: Number,
    default: 10
  },
  imageUrl: {
    type: String,
    default: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"
  },
  status: {
    type: String,
    enum: ["ACTIVE", "OUT_OF_STOCK", "DRAFT"],
    default: "ACTIVE"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);
