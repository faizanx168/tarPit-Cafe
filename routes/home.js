const express = require("express");
const { checkoutData, home } = require("../controllers/home");

const router = express.Router({ mergeParams: true });

router.get("/", home);
router.get("/checkoutData", checkoutData);
module.exports = router;
