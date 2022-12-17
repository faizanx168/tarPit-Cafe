const Security = require("../utils/Security");
const Cart = require("../utils/cart");
const Products = require("../models/Product");
const asyncError = require("../utils/AsyncError.js");
const paypal = require("../utils/paypal-api");
const axios = require("axios");
const { query } = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

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
    };
  }
  let checkoutData =
    typeof sess.checkoutData !== "undefined" ? sess.checkoutData : false;
  let cart = typeof sess.cart !== "undefined" ? sess.cart : false;

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
  let cart = req.session.cart ? req.session.cart : null;
  const mypro = await Products.findOne({ _id: product }).populate("category");
  let myitem;
  let query;
  if (cart.items.length) {
    cart.items.forEach((item) => {
      if (item.id === product) {
        myitem = item;
        query =
          qty > 0 &&
          qty < mypro.stock &&
          myitem.qty < mypro.stock &&
          Security.isValidNonce(req.body.nonce, req);
      } else {
        query =
          qty > 0 &&
          qty <= mypro.stock &&
          Security.isValidNonce(req.body.nonce, req);
      }
    });
  } else {
    query =
      qty > 0 &&
      qty <= mypro.stock &&
      Security.isValidNonce(req.body.nonce, req);
  }

  if (query) {
    const taxed = mypro.category.tax;

    const prod = {
      id: mypro._id,
      title: mypro.title,
      price: mypro.price,
      qty: qty,
      image: mypro.image[0].url,
      isTaxed: taxed,
      stock: mypro.stock,
    };
    Cart.addToCart(prod, qty, cart);
    res.redirect("/cart");
  } else {
    req.flash("error", "Product quantity exceeded!");
    res.redirect(`/products/${product}`);
  }
});

exports.addToCheckout = asyncError(async (req, res) => {
  const key = process.env.TAX_RATE;
  let sess = req.session;
  let cart = typeof sess.cart !== "undefined" ? sess.cart : false;
  let checkoutData =
    typeof sess.checkoutData !== "undefined" ? sess.checkoutData : false;
  let position = req.body.position;
  to_tax = false;
  let format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  if (Security.isValidNonce(req.body.nonce, req) && position === "emailCheck") {
    checkoutData.email = req.body.email;
    const url = "https://api.sendinblue.com/v3/contacts";
    const details = {
      email: req.body.email,
      attributes: {
        FNAME: req.user.FirstName,
        LNAME: req.user.LastName,
      },
      emailBlacklisted: false,
      smsBlacklisted: false,
      listIds: [36],
      updateEnabled: true,
    };
    const body = JSON.stringify(details);
    await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.SEND_API_KEY,
      },
      body: body,
    });
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
    cart.items.forEach((element) => {
      if (element.isTaxed) {
        to_tax = true;
      }
    });
    const clientId = process.env.CLIENT_ID;
    const clientToken = await paypal.generateClientToken();
    const shippingData = req.body.shipping;
    if (shippingData.method) {
      const shipping = {
        firstname: req.user.FirstName,
        lastname: req.user.LastName,
        address: "135 Woodpoint Road",
        address2: "_",
        country: "US",
        zip: "11211",
        city: "Brooklyn",
        state: "NY",
        phone: 9177058031,
      };
      checkoutData.Shipping = shipping;
    } else {
      checkoutData.Shipping = shippingData;
    }

    const Shipping = checkoutData.Shipping;
    zip = Shipping.zip;
    if (to_tax) {
      const { data } = await axios.get(
        `https://www.taxrate.io/api/v1/rate/getratebyzip?api_key=${key}&zip=${zip}`
      );
      const taxrate = data.rate;
      let price = 0;
      cart.items.forEach((item) => {
        if (item.isTaxed) {
          price =
            price +
            (parseInt(item.price * 100) * (taxrate / 100) +
              parseInt(item.price * 100)) *
              parseInt(item.qty);
          item.taxrate = taxrate;
        } else {
          price = price + parseInt(item.price * 100) * parseInt(item.qty);
        }
      });
      if (cart.items.length > 1) {
        price = Math.ceil(price);
        cart.taxedTotal = price;
        cart.taxPrice = price - cart.totals;
        cart.formattedTaxedTotal = format.format(cart.taxedTotal / 100);
      } else {
        price = round(price);
        cart.taxedTotal = price;
        cart.taxPrice = price - cart.totals;
        cart.formattedTaxedTotal = format.format(cart.taxedTotal / 100);
      }
    } else {
      cart.taxPrice = 0.0;
      cart.taxedTotal = parseInt(cart.totals);
      cart.formattedTaxedTotal = format.format(cart.taxedTotal / 100);
    }
    if (shippingData.method) {
      cart.ShippingTotal = 0.0;
    } else {
      if (cart.items.length === 1 && cart.items[0].id == process.env.GIFTCARD) {
        cart.ShippingTotal = 0.0;
      } else {
        cart.ShippingTotal = 1000;
        cart.taxedTotal =
          parseInt(cart.taxedTotal) + parseInt(cart.ShippingTotal);
        cart.formattedTaxedTotal = format.format(
          parseInt(cart.taxedTotal) / 100
        );
      }
    }
    const clientURL = process.env.CLIENT_URL;
    res.render("tarpit/checkout", {
      pageTitle: "Checkout",
      cart: cart,
      enter: false,
      checkoutData,
      clientId,
      clientToken,
      clientURL,
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
function round(number) {
  const decimal = number - Math.floor(number);
  if (decimal === 0.5) {
    number = number + 0.499;
  } else {
    number = number + 0.5;
  }
  return parseInt(number);
}
