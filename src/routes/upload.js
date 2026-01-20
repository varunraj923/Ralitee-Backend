const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const userAuth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");

const router = express.Router();

// store image in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/",
  userAuth,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "products",
        }
      );

      res.json({
        message: "Image uploaded successfully",
        imageUrl: result.secure_url,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
