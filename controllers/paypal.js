const paypal = require("../utils/paypal-api");
const asyncError = require("../utils/AsyncError.js");

exports.createOrder = asyncError(async (req, res) => {
  try {
    let sess = req.session;
    let cart = typeof sess.cart !== "undefined" ? sess.cart : false;
    const order = await paypal.createOrder(cart);
    res.send(order);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
exports.capture = asyncError(async (req, res) => {
  const { orderID } = req.params;
  try {
    const captureData = await paypal.capturePayment(orderID);
    res.json(captureData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
