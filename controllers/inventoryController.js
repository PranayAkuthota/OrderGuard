const Product = require("../models/Product");

// Get all inventory with pagination, filtering, search, and sorting
exports.getInventory = async (req, res) => {
  try {
    const { search, category, status, sort, page = 1, limit = 10 } = req.query;

    const query = {};

    // Search filter (name or SKU)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } }
      ];
    }

    // Category filter
    if (category && category !== "All") {
      query.category = category;
    }

    // Status filter
    if (status && status !== "All") {
      query.status = status;
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default
    if (sort) {
      const [field, order] = sort.split("_");
      sortOption = { [field]: order === "desc" ? -1 : 1 };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error("getInventory error:", err);
    res.status(500).send("Error fetching inventory ❌");
  }
};

// Reduce stock (protected/atomic update)
exports.reduceInventory = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).send("Product ID and valid quantity required ❌");
    }

    // Atomically check if stock >= quantity and update
    const product = await Product.findOneAndUpdate(
      { _id: product_id, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    );

    if (!product) {
      return res.status(400).send("Not enough stock available ❌");
    }

    res.send("Stock updated successfully ✅");
  } catch (err) {
    console.error("reduceInventory error:", err);
    res.status(500).send("Error reducing inventory ❌");
  }
};

// Add inventory (Create Product)
exports.addInventory = async (req, res) => {
  try {
    const { name, sku, description, category, price, stock, imageUrl, status, reorderThreshold } = req.body;

    if (!name || !sku || price === undefined || stock === undefined) {
      return res.status(400).send("Name, SKU, Price, and Stock are required fields ❌");
    }

    // Check unique SKU
    const existing = await Product.findOne({ sku });
    if (existing) {
      return res.status(400).send("Product with this SKU already exists ❌");
    }

    const product = new Product({
      name,
      sku,
      description,
      category,
      price,
      stock,
      imageUrl,
      status: status || (stock > 0 ? "ACTIVE" : "OUT_OF_STOCK"),
      reorderThreshold: reorderThreshold || 10
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("addInventory error:", err);
    res.status(500).send("Error adding product ❌");
  }
};

// Update inventory
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If stock is updated, adjust status automatically if needed
    if (updateData.stock !== undefined) {
      updateData.stock = parseInt(updateData.stock);
      if (updateData.stock <= 0) {
        updateData.status = "OUT_OF_STOCK";
      } else if (updateData.status === "OUT_OF_STOCK") {
        updateData.status = "ACTIVE";
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!product) {
      return res.status(404).send("Product not found ❌");
    }

    res.json(product);
  } catch (err) {
    console.error("updateInventory error:", err);
    res.status(500).send("Error updating product ❌");
  }
};

// Delete inventory
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).send("Product not found ❌");
    }

    res.send("Product deleted successfully ✅");
  } catch (err) {
    console.error("deleteInventory error:", err);
    res.status(500).send("Error deleting product ❌");
  }
};

// Get single product
exports.getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).send("Product not found ❌");
    }

    res.json(product);
  } catch (err) {
    console.error("getInventoryById error:", err);
    res.status(500).send("Error fetching product ❌");
  }
};