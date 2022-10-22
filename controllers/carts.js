const Security = require("../utils/Security");
const Cart = require("../utils/cart");
const Products = require("../models/Product");
const asyncError = require("../utils/AsyncError.js");
const paypal = require("../utils/paypal-api");
const { router } = require("microrouter");

exports.showCart = (req, res) => {
  let sess = req.session;
  let cart = typeof sess.cart !== "undefined" ? sess.cart : false;
  // console.log(cart);
  res.render("tarpit/cart", {
    pageTitle: "Cart",
    cart: cart,
    nonce: Security.md5(req.sessionID + req.headers["user-agent"]),
  });
};
exports.getCartData = (req, res) => {
  let sess = req.session;
  let cart = typeof sess.cart !== "undefined" ? sess.cart : false;
  res.json(cart);
};

exports.showCheckout = asyncError(async (req, res) => {
  let sess = req.session;
  if (!sess.checkoutData) {
    sess.checkoutData = {
      email: "",
      Shipping: "",
      Billing: "",
    };
  }
  let checkoutData =
    typeof sess.checkoutData !== "undefined" ? sess.checkoutData : false;
  let cart = typeof sess.cart !== "undefined" ? sess.cart : false;
  // console.log("checkout", cart);

  res.render("tarpit/checkout", {
    pageTitle: "Checkout",
    cart: cart,
    checkoutData,

    enter: true,
    emailCheck: false,
    shippingCheck: false,
    billingCheck: false,
    checkoutDone: false,
    nonce: Security.md5(req.sessionID + req.headers["user-agent"]),
  });
});

exports.putCartData = asyncError(async (req, res) => {
  req.session.cart = req.body.data;
  await req.session.save();
  res.end();
});

exports.addToCart = asyncError(async (req, res) => {
  let qty = parseInt(req.body.qty, 10);
  let product = req.body.product_id;
  if (qty > 0 && Security.isValidNonce(req.body.nonce, req)) {
    const mypro = await Products.findOne({ _id: product });
    let cart = req.session.cart ? req.session.cart : null;
    const prod = {
      id: mypro._id,
      title: mypro.title,
      price: mypro.price,
      qty: qty,
      image: mypro.image[0].url,
    };
    Cart.addToCart(prod, qty, cart);
    res.redirect("/cart");
  } else {
    res.redirect("/");
  }
});

exports.addToCheckout = asyncError(async (req, res) => {
  let sess = req.session;
  let cart = typeof sess.cart !== "undefined" ? sess.cart : false;
  let checkoutData =
    typeof sess.checkoutData !== "undefined" ? sess.checkoutData : false;
  let position = req.body.position;
  // console.log(req.body);
  const clientId = process.env.CLIENT_ID;
  const clientToken = await paypal.generateClientToken();
  if (Security.isValidNonce(req.body.nonce, req) && position === "emailCheck") {
    checkoutData.email = req.body.email;
    console.log(req.session.checkoutData);
    res.render("tarpit/checkout", {
      pageTitle: "Checkout",
      cart: cart,
      checkoutData,
      enter: false,
      emailCheck: true,
      shippingCheck: false,
      billingCheck: false,
      checkoutDone: false,
      nonce: Security.md5(req.sessionID + req.headers["user-agent"]),
    });
  } else if (
    Security.isValidNonce(req.body.nonce, req) &&
    position === "shippingCheck"
  ) {
    checkoutData.Shipping = req.body.shipping;
    console.log(req.session.checkoutData);

    res.render("tarpit/checkout", {
      pageTitle: "Checkout",
      cart: cart,
      enter: false,
      checkoutData,
      clientId,
      clientToken,
      emailCheck: false,
      shippingCheck: true,
      billingCheck: false,
      checkoutDone: false,
      nonce: Security.md5(req.sessionID + req.headers["user-agent"]),
    });
  } else if (
    Security.isValidNonce(req.body.nonce, req) &&
    position === "checkoutDone"
  ) {
    res.redirect("/products");
  } else {
    res.redirect("/");
  }
});
