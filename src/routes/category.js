const express = require("express");
const Category = require("../models/category.model");
const userAuth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");

const router = express.Router();

// Create category
router.post("/", userAuth, adminOnly, async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

// Get all categories
router.get("/", userAuth, async (req, res) => {
  const categories = await Category.find({ status: "active" });
  res.json(categories);
});

// Delete category
router.delete("/:id", userAuth, adminOnly, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted" });
});

module.exports = router;
