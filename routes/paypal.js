const express = require("express");
const router = express.Router();
const {
  createOrder,
  capture,
  thank_you,
  paypalRefund,
} = require("../controllers/paypal");
const { isAdmin, isLoggedIn } = require("../utils/Middleware");
// create order
router.post("/api/orders", isLoggedIn, createOrder);
// capture payment
router.post("/api/orders/:orderID/capture", isLoggedIn, capture);
router.get("/paypal/success", isLoggedIn, thank_you);

router.post("/paypal/refund", isAdmin, isLoggedIn, paypalRefund);

module.exports = router;
/* last */
