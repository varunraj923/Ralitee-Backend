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
        let wishlist = await Wishlist.findOne({ user: userId });

        if (wishlist) {
            const alreadyAdded = wishlist.products.some(
                (item) => item.product.toString() === productId
            );

            if (alreadyAdded) {
                return res.status(400).json({
                    message: "Product already in wishlist"
                });
            }
            wishlist.products.push({ product: productId });
            await wishlist.save();

        } else {
            wishlist = new Wishlist({
                user: userId,
                products: [{ product: productId }]
            });

            await wishlist.save();
        }

        res.status(201).json({
            message: "Wishlist added successfully",
            wishlist: wishlist
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

wishlistRouter.get("/", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const wishlist = await Wishlist.findOne({ user: userId }).populate("products.product");

        if (!wishlist) {
            return res.status(200).json({
                message: "wishlist is empty",
                products: []
            })

        }
        res.status(200).json({
            message: "product fetched successfully",
            count: wishlist.products.length,
            products: wishlist.products
        })


    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "something went wrong while fetching wishlist"
        })
    }

})

wishlistRouter.delete("/:productId", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                message: "Wishlist not found"
            });
        }

        wishlist.products = wishlist.products.filter(
            item => item.product.toString() !== productId
        );

        await wishlist.save();

        res.status(200).json({
            message: "Product removed from wishlist",
            products: wishlist.products
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

module.exports = wishlistRouter;