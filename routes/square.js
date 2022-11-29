const express = require("express");
const router = express.Router();
const {
  createPayment,

  refundPayment,
  createOrder,
  capturePayments,
} = require("../controllers/square");

// export routes
router.post("/payment", createPayment);
router.post("/square/refund", refundPayment);
router.post("/square/createOrder", createOrder);
router.post("/square/success", capturePayments);
module.exports = router;
