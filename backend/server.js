const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Optional: 監聽後續錯誤
mongoose.connection.on("error", (err) => {
  console.error("❗ MongoDB connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});

// Routes
const tripRoutes = require("./routes/trips");
const userRoutes = require("./routes/users");

app.get("/", (req, res) => {
  res.send("✅ Backend is running!!??");
});

console.log("JWT_SECRET is:", process.env.JWT_SECRET);

app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);

// Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
