const express = require("express");
const router = express.Router();
const { createOrder, capture } = require("../controllers/paypal");
// create order
router.post("/api/orders", createOrder);

// capture payment
router.post("/api/orders/:orderID/capture", capture);

module.exports = router;
