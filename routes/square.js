const express = require("express");
const router = express.Router();
const { isAdmin, isLoggedIn } = require("../utils/Middleware");
const {
  createPayment,
  refundPayment,
  createOrder,
  capturePayments,
} = require("../controllers/square");

// export routes
router.post("/payment", isLoggedIn, createPayment);
router.post("/square/refund", isLoggedIn, isAdmin, refundPayment);
router.post("/square/createOrder", isLoggedIn, createOrder);
router.post("/square/success", isLoggedIn, capturePayments);
module.exports = router;
/* last */
