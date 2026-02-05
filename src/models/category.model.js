const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
   image: {
    type: String,
    required: true,
  },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
