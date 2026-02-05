const express = require("express");
const Category = require("../models/category.model");
const userAuth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Get all categories
router.get("/", userAuth, async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" });
    res.json(categories);
  } catch (error) {
    console.error("Fetch categories error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create category
router.post(
  "/",
  userAuth,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, status } = req.body;

      const categoryData = {
        name,
        status: status || "active",
        image: "",
        images: [],
      };

      // ✅ Upload image ONLY if file exists
      if (req.file) {
        const result = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
          { folder: "categories" }
        );

        categoryData.image = result.secure_url;
        categoryData.images = [result.secure_url];
      }

      const category = await Category.create(categoryData);

      res.status(201).json(category);
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);


module.exports = router;
