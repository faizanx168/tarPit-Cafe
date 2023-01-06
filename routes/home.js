const express = require("express");
const { checkoutData, home } = require("../controllers/home");
const { isAdmin, isLoggedIn } = require("../utils/Middleware");
const router = express.Router({ mergeParams: true });

router.get("/", home);
router.get("/checkoutData", isLoggedIn, checkoutData);
module.exports = router;
/* last */
