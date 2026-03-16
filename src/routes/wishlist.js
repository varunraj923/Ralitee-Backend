const express = require("express");
const wishlistRouter = express.Router();
const userAuth = require("../middleware/auth.middleware");

const Product = require("../models/product.model");
const Wishlist = require("../models/wishlist.model");

wishlistRouter.post("/:productId", userAuth, async (req, res) => {
    try {

        const userId = req.user._id;
        const productId = req.params.productId;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const existing = await Wishlist.findOne({
            user: userId,
            product: productId
        });

        if (existing) {
            return res.status(400).json({
                message: "Product already in wishlist"
            });
        }

        const wishlistItem = new Wishlist({
            user: userId,
            product: productId
        });

        await wishlistItem.save();

        res.status(201).json({
            message: "Wishlist added successfully",
            wishlist: wishlistItem
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

module.exports = wishlistRouter;