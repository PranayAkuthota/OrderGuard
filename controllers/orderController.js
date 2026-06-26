const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/Product");
const { canTransition } = require("../services/ruleEngine");

// GET ALL ORDERS (with search, pagination, status filtering)
exports.getOrders = async (req, res) => {
  try {
    const { search, status, sort = "createdAt_desc", page = 1, limit = 10 } = req.query;

    const query = {};

    // Restrict customer role to their own orders
    if (req.user && req.user.role === "CUSTOMER") {
      query.userId = req.user.id;
    }

    // Filter by status
    if (status && status !== "All") {
      query.status = status;
    }

    // Search filter (customer name, customer email, or order ID)
    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        query._id = search;
      } else {
        query.$or = [
          { customerName: { $regex: search, $options: "i" } },
          { customerEmail: { $regex: search, $options: "i" } }
        ];
      }
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split("_");
      sortOption = { [field]: order === "desc" ? -1 : 1 };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("items.productId")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      orders,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error("getOrders error:", err);
    res.status(500).send("Error fetching orders ❌");
  }
};

// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid Order ID ❌");
    }

    const order = await Order.findById(id).populate("items.productId");
    if (!order) {
      return res.status(404).send("Order not found ❌");
    }

    // Check customer access authorization
    if (req.user && req.user.role === "CUSTOMER" && order.userId?.toString() !== req.user.id) {
      return res.status(403).send("Access denied: You can only view your own orders ❌");
    }

    res.json(order);
  } catch (err) {
    console.error("getOrderById error:", err);
    res.status(500).send("Error fetching order details ❌");
  }
};

// CREATE ORDER
exports.createOrder = async (req, res) => {
  const { customerName, customerEmail, phone, address, paymentMethod, items } = req.body;

  if (!customerName || !customerEmail || !address || !items || items.length === 0) {
    return res.status(400).send("Customer metadata and order items are required ❌");
  }

  // Bind userId from authentication session
  req.body.userId = req.user?.id;

  // Attempt using replica set transactions if supported, otherwise fallback to compensatory logic
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const result = await processOrderCreation(req.body, session);
    await session.commitTransaction();
    session.endSession();
    return res.status(201).json(result);

  } catch (err) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        // Transaction abort failed (usually because transactions aren't supported on local standalone mongodb)
      }
      session.endSession();
    }

    // If the error indicates transaction support issues, run without transaction session using manual compensation
    if (err.message.includes("Transaction") || err.codeName === "CommandNotSupportedOnReplicaSetMember" || err.message.includes("does not support retryable writes")) {
      console.warn("MongoDB replica sets are not configured. Falling back to compensatory atomic stock updates...");
      try {
        const result = await processOrderCreationWithCompensation(req.body);
        return res.status(201).json(result);
      } catch (fallbackErr) {
        console.error("Order creation failed on fallback compensation:", fallbackErr);
        return res.status(400).send(fallbackErr.message);
      }
    }

    console.error("Order creation failed:", err);
    return res.status(400).send(err.message);
  }
};

// Transaction-based order creation
async function processOrderCreation(body, session) {
  const { customerName, customerEmail, phone, address, paymentMethod, items, userId } = body;

  let totalPrice = 0;
  const orderItemsSnapshot = [];

  for (let item of items) {
    const product = await Product.findById(item.productId).session(session);
    if (!product) {
      throw new Error(`Product not found: ${item.productId} ❌`);
    }

    // Check and atomically reserve stock
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, reservedStock: item.quantity } },
      { session, new: true }
    );

    if (!updatedProduct) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock} ❌`);
    }

    totalPrice += product.price * item.quantity;
    orderItemsSnapshot.push({
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      price: product.price,
      quantity: item.quantity
    });
  }

  const order = new Order({
    userId,
    customerName,
    customerEmail,
    phone,
    address,
    paymentMethod,
    items: orderItemsSnapshot,
    totalPrice,
    status: "PENDING"
  });

  await order.save({ session });
  return order;
}

// Fallback manual stock adjustment with compensation rollback on failure (for standalone MongoDB)
async function processOrderCreationWithCompensation(body) {
  const { customerName, customerEmail, phone, address, paymentMethod, items, userId } = body;

  let totalPrice = 0;
  const orderItemsSnapshot = [];
  const modifiedProducts = [];

  try {
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId} ❌`);
      }

      // Atomically deduct stock and add to reserved
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, reservedStock: item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock} ❌`);
      }

      // Track modified product for rollback
      modifiedProducts.push({
        productId: product._id,
        quantity: item.quantity
      });

      totalPrice += product.price * item.quantity;
      orderItemsSnapshot.push({
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        price: product.price,
        quantity: item.quantity
      });
    }

    const order = new Order({
      userId,
      customerName,
      customerEmail,
      phone,
      address,
      paymentMethod,
      items: orderItemsSnapshot,
      totalPrice,
      status: "PENDING"
    });

    await order.save();
    return order;

  } catch (err) {
    // Rollback stock updates for products processed before error
    console.log("Rolling back stock updates for products:", modifiedProducts);
    for (let mod of modifiedProducts) {
      await Product.findByIdAndUpdate(mod.productId, {
        $inc: { stock: mod.quantity, reservedStock: -mod.quantity }
      });
    }
    throw err;
  }
}

// UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;

    if (!orderId || !newStatus) {
      return res.status(400).send("Order ID and new status are required ❌");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send("Order not found ❌");
    }

    const currentStatus = order.status;

    if (!canTransition(currentStatus, newStatus)) {
      return res.status(400).send(`Invalid status transition from ${currentStatus} to ${newStatus} ❌`);
    }

    // Apply inventory updates depending on state transition
    if (newStatus === "CANCELLED") {
      // Restore stock, release reserve
      for (let item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity, reservedStock: -item.quantity }
        });
      }
    } else if ((newStatus === "SHIPPED" || newStatus === "DELIVERED") && 
               (currentStatus === "PENDING" || currentStatus === "CONFIRMED" || currentStatus === "PACKED")) {
      // Release reserve (stock was already deducted at purchase time, reserve is now cleared)
      for (let item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { reservedStock: -item.quantity }
        });
      }
    }

    order.status = newStatus;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).send("Error updating order status ❌");
  }
};