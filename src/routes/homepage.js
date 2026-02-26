const express = require("express");
const userAuth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");
const Homepage = require("../models/homepage.model");

const homepageRouter = express.Router();

/**
 * GET HOMEPAGE DATA (PUBLIC)
 * Creates default data if none exists
 */
homepageRouter.get("/", async (req, res) => {
    try {
        let homepageData = await Homepage.findOne();

        // Create default document if it doesn't exist yet
        if (!homepageData) {
            homepageData = await Homepage.create({});
        }

        res.json(homepageData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * UPDATE HOMEPAGE DATA (ADMIN ONLY)
 */
homepageRouter.put("/", userAuth, adminOnly, async (req, res) => {
    try {
        let homepageData = await Homepage.findOne();

        if (!homepageData) {
            homepageData = await Homepage.create(req.body);
        } else {
            homepageData = await Homepage.findOneAndUpdate(
                {},
                req.body,
                { new: true, runValidators: true }
            );
        }

        res.json({
            message: "Homepage data updated successfully",
            homepageData,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = homepageRouter;
