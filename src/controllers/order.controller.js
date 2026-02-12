const Order = require("../models/order.model.js");
const Cart = require("../models/cart.model.js");
const Product = require("../models/product.model.js");
const sendEmail = require("../utils/sendEmail.js");

exports.placeOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { shippingAddress } = req.body;

        // 1. Get User's Cart
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // 2. Calculate Total and Prepare Order Items
        let totalAmount = 0;
        const orderItems = [];
        const emailOrderItems = []; // For email with populated product details

        for (const item of cart.items) {
            if (!item.product) continue; // Skip if product deleted

            const price = item.product.discountPrice || item.product.price;

            // Check stock (Optional but recommended)
            // if (item.product.stock < item.quantity) {
            //   return res.status(400).json({ message: `Insufficient stock for ${item.product.name}` });
            // }

            totalAmount += price * item.quantity;

            const orderItem = {
                product: item.product._id,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                price: price // Snapshot price at time of order !!
            };

            orderItems.push(orderItem);

            // Push populated item for email
            emailOrderItems.push({
                product: item.product, // Full product object
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                price: price
            });
        }

        // 3. Create Order
        const order = await Order.create({
            user: userId,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod: "COD",
            paymentStatus: "pending",
            status: "placed"
        });

        // 4. Clear Cart
        cart.items = [];
        await cart.save();

        res.status(201).json({ message: "Order placed successfully", order });

        // 5. Send Email Notification
        // 5. Send Email Notification
        try {
            const { getOrderConfirmationEmailHtml, getAdminOrderEmailHtml } = require("../utils/emailTemplates");

            // Fetch the user to get name and email
            const user = await require("../models/user.model").findById(userId);

            // 1. Send Confirmation to User
            const userEmailHtml = getOrderConfirmationEmailHtml(order, user, emailOrderItems);
            await sendEmail({
                email: user.email,
                subject: `Order Confirmation - #${order._id}`,
                message: `Thank you for your order! Your Order ID is ${order._id}.`,
                html: userEmailHtml
            });

            // 2. Send Alert to Admin
            const adminEmailHtml = getAdminOrderEmailHtml(order, user, emailOrderItems);
            await sendEmail({
                email: "raliteeofficial@gmail.com",
                subject: `ACTION REQUIRED: New Order #${order._id}`,
                message: `New Order Received! Order ID: ${order._id}`,
                html: adminEmailHtml
            });

        } catch (emailError) {
            console.error("Error sending email:", emailError);
            // Don't fail the request if email fails, but log it
        }

    } catch (error) {
        res.status(500).json({ message: "Error placing order", error: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate("items.product");
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
}
