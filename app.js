const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/inventory", require("./routes/inventoryRoutes"));
app.use("/order", require("./routes/orderRoutes"));
app.use("/customers", require("./routes/customerRoutes"));

app.get("/", (req, res) => {
  res.send("OrderGuard API Running 🚀");
});

const connectMongo = require("./config/mongo");
connectMongo();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



