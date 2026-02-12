const express = require("express");
const User = require("../models/user.model");
const userAuth = require("../middleware/auth.middleware");

const userRouter = express.Router();

// Add a new address
userRouter.post("/add-address", userAuth, async (req, res) => {
    try {
        const { fullName, street, city, state, zip, country, phone } = req.body;

        // Server-side validation
        if (!fullName || !street || !city || !state || !zip || !country || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.addresses.push({ fullName, street, city, state, zip, country, phone });
        await user.save();

        res.status(201).json({ message: "Address added successfully", addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ message: "Error adding address", error: error.message });
    }
});

// Get all addresses
userRouter.get("/addresses", userAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ message: "Error fetching addresses", error: error.message });
    }
});

// Delete an address
userRouter.delete("/delete-address/:addressId", userAuth, async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
        await user.save();

        res.json({ message: "Address deleted successfully", addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ message: "Error deleting address", error: error.message });
    }
});

module.exports = userRouter;
