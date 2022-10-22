const express = require("express");
const router = express.Router();
const { createPayment, storeCard } = require("../controllers/square");
// export routes
router.post("/payment", createPayment);
router.post("/card", storeCard);

module.exports = router;
