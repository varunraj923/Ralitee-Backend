const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller.js");
const userAuth = require("../middleware/auth.middleware.js");

router.get("/", userAuth, cartController.getCart);
router.post("/add", userAuth, cartController.addToCart);
router.put("/update", userAuth, cartController.updateCartItem);
router.delete("/remove/:itemId", userAuth, cartController.removeFromCart);

module.exports = router;
