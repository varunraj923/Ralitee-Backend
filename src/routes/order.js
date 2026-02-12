const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller.js");
const userAuth = require("../middleware/auth.middleware.js");

router.post("/place", userAuth, orderController.placeOrder);
router.get("/", userAuth, orderController.getOrders);

module.exports = router;
