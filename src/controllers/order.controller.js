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

        for (const item of cart.items) {
            if (!item.product) continue; // Skip if product deleted

            const price = item.product.discountPrice || item.product.price;

            // Check stock (Optional but recommended)
            // if (item.product.stock < item.quantity) {
            //   return res.status(400).json({ message: `Insufficient stock for ${item.product.name}` });
            // }

            totalAmount += price * item.quantity;

            orderItems.push({
                product: item.product._id,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                price: price // Snapshot price at time of order !!
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
        const message = `
            <h1>New Order Placed</h1>
            <p>Order ID: ${order._id}</p>
            <p>User ID: ${userId}</p>
            <h2>Shipping Address</h2>
            <p>${shippingAddress.fullName}</p>
            <p>${shippingAddress.addressLine1}, ${shippingAddress.addressLine2}</p>
            <p>${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.postalCode}</p>
            <p>${shippingAddress.country}</p>
            <p>Phone: ${shippingAddress.phoneNumber}</p>
            <h2>Order Details</h2>
            <ul>
                ${orderItems.map(item => `
                    <li>
                        Product ID: ${item.product} <br>
                        Quantity: ${item.quantity} <br>
                        Price: ${item.price} <br>
                        Size: ${item.size} <br>
                        Color: ${item.color}
                    </li>
                `).join('')}
            </ul>
            <p><strong>Total Amount: ${totalAmount}</strong></p>
        `;

        try {
            await sendEmail({
                email: "raliteeofficial@gmail.com",
                subject: "New Order Placed",
                message: "New Order Placed",
                html: message
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
