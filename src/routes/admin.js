const express = require("express");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const userAuth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");

const router = express.Router();

router.get("/dashboard", userAuth, adminOnly, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    const productsByCategory = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json({
      totalProducts,
      totalCategories,
      productsByCategory,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
});

module.exports = router; // ✅ 🔥 THIS WAS MISSING
