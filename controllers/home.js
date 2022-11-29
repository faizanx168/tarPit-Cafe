const asyncError = require("../utils/AsyncError.js");
const cloudinary = require("cloudinary").v2;
const Product = require("../models/Product");
const Blog = require("../models/blog");

exports.home = asyncError(async (req, res) => {
  if (!req.session.cart) {
    req.session.cart = {
      items: [],
      totals: 0.0,
      formattedTotals: "",
      formattedTaxedTotals: "",
      taxedTotal: 0.0,
    };
  }
  let uri = [];
  var options = {
    resource_type: "image",
    folder: "tarpitCafe/Home",
    max_results: 8,
  };
  const result = await cloudinary.api.resources(options);
  result.resources.forEach((image) => {
    const url = image.url;
    uri.push(url);
  });
  const products = await Product.find().limit(4).sort({
    createdAt: -1,
  });
  const blogs = await Blog.find().sort({ _id: -1 }).limit(3);

  res.render("tarpit/home", { uri, products, blogs });
});

exports.checkoutData = (req, res) => {
  let sess = req.session;
  let data = [];
  let cart = typeof sess.cart !== "undefined" ? sess.cart : false;
  let checkoutData =
    typeof sess.checkoutData !== "undefined" ? sess.checkoutData : false;
  data.push(cart);
  data.push(checkoutData);
  res.json(data);
};
