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

router.get("/cart", showCart);

router.get("/cartdata", getCartData);

router.get("/checkout", showCheckout);

router.put("/cartdata", putCartData);

router.post("/cart", addToCart);

router.post("/checkout", addToCheckout);

module.exports = router;
