const mongoose = require("mongoose");
const Product = require("../models/Product");

const connectMongo = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/orderguard";
    await mongoose.connect(uri);
    console.log("MongoDB Connected ✅");

    // Seed products if catalog is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log("Seeding default products to MongoDB...");
      const starterProducts = [
        {
          name: "iPhone 15 Pro",
          sku: "IPHONE15PRO-128",
          description: "Latest Apple flagship smartphone with Titanium design and A17 Pro chip.",
          category: "Electronics",
          price: 999.99,
          stock: 50,
          reservedStock: 0,
          reorderThreshold: 10,
          imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80",
          status: "ACTIVE"
        },
        {
          name: "Samsung Galaxy S24",
          sku: "SAMS24-256",
          description: "Flagship Galaxy device featuring Galaxy AI and dynamic AMOLED display.",
          category: "Electronics",
          price: 899.99,
          stock: 40,
          reservedStock: 0,
          reorderThreshold: 10,
          imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80",
          status: "ACTIVE"
        },
        {
          name: "Sony WH-1000XM5",
          sku: "SONYWH1000XM5",
          description: "Industry-leading noise cancelling wireless over-ear headphones.",
          category: "Accessories",
          price: 349.99,
          stock: 30,
          reservedStock: 0,
          reorderThreshold: 5,
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
          status: "ACTIVE"
        },
        {
          name: "Dell XPS 15 Laptop",
          sku: "DELLXPS15-16GB",
          description: "Powerful performance laptop with infinity-edge display and core i7 processor.",
          category: "Computers",
          price: 1899.99,
          stock: 15,
          reservedStock: 0,
          reorderThreshold: 5,
          imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80",
          status: "ACTIVE"
        },
        {
          name: "Nike Air Max Sneaker",
          sku: "NIKEAIRMAX-10",
          description: "Classic Nike comfort lifestyle sneakers with iconic visible air cushioning.",
          category: "Footwear",
          price: 129.99,
          stock: 100,
          reservedStock: 0,
          reorderThreshold: 15,
          imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
          status: "ACTIVE"
        },
        {
          name: "Ergonomic Office Chair",
          sku: "CHAIR-ERG-01",
          description: "Premium mesh office chair with lumbar support and adjustable armrests.",
          category: "Furniture",
          price: 249.99,
          stock: 8,
          reservedStock: 0,
          reorderThreshold: 10,
          imageUrl: "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=400&q=80",
          status: "ACTIVE"
        },
        {
          name: "Hydro Flask Water Bottle",
          sku: "HYDROFLASK-32",
          description: "32oz vacuum insulated stainless steel wide mouth water bottle.",
          category: "Fitness",
          price: 39.99,
          stock: 75,
          reservedStock: 0,
          reorderThreshold: 10,
          imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80",
          status: "ACTIVE"
        },
        {
          name: "Leather Wallet",
          sku: "WALLET-LTHR-01",
          description: "Genuine full-grain leather bifold wallet with RFID blocking layer.",
          category: "Accessories",
          price: 49.99,
          stock: 3,
          reservedStock: 0,
          reorderThreshold: 5,
          imageUrl: "https://images.unsplash.com/photo-1627124118304-4f40f3465685?auto=format&fit=crop&w=400&q=80",
          status: "ACTIVE"
        }
      ];
      await Product.insertMany(starterProducts);
      console.log("Starter products successfully seeded! 🌱");
    }
  } catch (err) {
    console.error("MongoDB Connection/Seeding Error:", err);
  }
};

module.exports = connectMongo;