const Order = require("../models/order");

// Get all customers (aggregated from orders)
exports.getCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    // MongoDB Aggregation Pipeline
    const pipeline = [
      {
        $group: {
          _id: "$customerEmail",
          name: { $last: "$customerName" },
          email: { $last: "$customerEmail" },
          phone: { $last: "$phone" },
          ordersCount: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [
                { $ne: ["$status", "CANCELLED"] },
                "$totalPrice",
                0
              ]
            }
          },
          lastOrderDate: { $max: "$createdAt" }
        }
      }
    ];

    // Filter by search term
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        }
      });
    }

    // Run aggregation
    const allCustomers = await Order.aggregate(pipeline);
    
    // Sort by last order date desc
    allCustomers.sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate));

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = allCustomers.length;
    const skip = (pageNum - 1) * limitNum;
    
    const paginatedCustomers = allCustomers.slice(skip, skip + limitNum);

    // Format with status
    const customersWithStatus = paginatedCustomers.map(c => ({
      ...c,
      status: c.totalSpent > 0 ? "Active" : "Inactive"
    }));

    res.json({
      customers: customersWithStatus,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error("getCustomers error:", err);
    res.status(500).send("Error fetching customers ❌");
  }
};
