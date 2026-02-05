const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: [true, "Product name is required"],
      lowercase: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    /* ================= PRICING ================= */
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

    // 🔥 Derived discount percentage (used in flash sale sorting)
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

   
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
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

 
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },


    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },


    isFlashSale: {
      type: Boolean,
      default: false,
    },


    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
  },
  { timestamps: true }
);


productSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }

  // 🔥 Auto-calculate discount percentage
  if (this.discountPrice && this.price) {
    this.discountPercentage = Math.round(
      ((this.price - this.discountPrice) / this.price) * 100
    );
  } else {
    this.discountPercentage = 0;
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);
