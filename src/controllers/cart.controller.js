const Cart = require("../models/cart.model.js");
const Product = require("../models/product.model.js");

// Get Cart (with dynamic price calculation)
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate(
            "items.product"
        );

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        // Filter out items where product might have been deleted
        cart.items = cart.items.filter((item) => item.product);

        // Calculate total
        let totalAmount = 0;
        cart.items.forEach((item) => {
            const price = item.product.discountPrice || item.product.price;
            totalAmount += price * item.quantity;
        });

        res.json({ cart, totalAmount });
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart", error: error.message });
    }
};

// Add to Cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity, size, color } = req.body;
        const userId = req.user._id;

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if item exists in cart (same product, size, color)
        const itemIndex = cart.items.findIndex((item) => {
            return (
                item.product.toString() === productId &&
                item.size === size &&
                item.color === color
            );
        });

        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({ product: productId, quantity, size, color });
        }

        await cart.save();

        // Return full cart with populated products for frontend
        const updatedCart = await Cart.findById(cart._id).populate("items.product");

        // Calculate total
        let totalAmount = 0;
        updatedCart.items.forEach((item) => {
            // Check if product exists (it should, but safety first)
            if (item.product) {
                const price = item.product.discountPrice || item.product.price;
                totalAmount += price * item.quantity;
            }
        });


        res.json({ message: "Added to cart", cart: updatedCart, totalAmount });
    } catch (error) {
        res.status(500).json({ message: "Error adding to cart", error: error.message });
    }
};

// Update Cart Item Quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;
        const userId = req.user._id;

        if (quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            // Return full cart with populated products for frontend
            const updatedCart = await Cart.findById(cart._id).populate("items.product");

            // Calculate total
            let totalAmount = 0;
            updatedCart.items.forEach((item) => {
                if (item.product) {
                    const price = item.product.discountPrice || item.product.price;
                    totalAmount += price * item.quantity;
                }
            });


            res.json({ message: "Cart updated", cart: updatedCart, totalAmount });
        } else {
            res.status(404).json({ message: "Item not found in cart" });
        }

    } catch (error) {
        res.status(500).json({ message: "Error updating cart", error: error.message });
    }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate("items.product");

        // Calculate total
        let totalAmount = 0;
        updatedCart.items.forEach((item) => {
            if (item.product) {
                const price = item.product.discountPrice || item.product.price;
                totalAmount += price * item.quantity;
            }
        });

        res.json({ message: "Item removed", cart: updatedCart, totalAmount });

    } catch (error) {
        res.status(500).json({ message: "Error removing item", error: error.message });
    }
}
