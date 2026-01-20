const express = require("express");
const userAuth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");
const Product = require("../models/product.model");

const productRouter = express.Router();

/**
 * CREATE PRODUCT (ADMIN)
 */
productRouter.post("/", userAuth, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET ALL PRODUCTS (ADMIN + USER)
 */
productRouter.get("/", userAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET SINGLE PRODUCT
 */
productRouter.get("/:id", userAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * UPDATE PRODUCT (ADMIN)
 */
productRouter.put("/:id", userAuth, adminOnly, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE PRODUCT (ADMIN)
 */
productRouter.delete("/:id", userAuth, adminOnly, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = productRouter;
