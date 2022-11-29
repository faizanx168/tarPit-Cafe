const express = require("express");
const router = express.Router();
const {
  createOrder,
  capture,
  thank_you,
  paypalRefund,
} = require("../controllers/paypal");

// create order
router.post("/api/orders", createOrder);
// capture payment
router.post("/api/orders/:orderID/capture", capture);
router.get("/paypal/success", thank_you);

router.post("/paypal/refund", paypalRefund);

module.exports = router;
