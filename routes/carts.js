const express = require("express");
const router = express.Router();
const {
  showCart,
  getCartData,
  showCheckout,
  putCartData,
  addToCart,
  addToCheckout,
} = require("../controllers/carts");
const { isAdmin, isLoggedIn } = require("../utils/Middleware");

router.get("/cart", showCart);

router.get("/cartdata", getCartData);

router.get("/checkout", isLoggedIn, showCheckout);

router.put("/cartdata", putCartData);

router.post("/cart", addToCart);

router.post("/checkout", isLoggedIn, addToCheckout);

module.exports = router;
