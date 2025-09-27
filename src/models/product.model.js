const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    currency: {
      type: String,
      default: "INR", 
      uppercase: true,
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      validate: {
        validator: function (value) {
          return value <= this.price; 
        },
        message: "Discount price cannot be greater than price",
      },
    },
    images: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: String, 
    },
    attributes: {
      type: Map, 
      of: String,
      default: {},
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Product", productSchema);
