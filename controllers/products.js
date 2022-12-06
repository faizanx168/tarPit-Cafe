const asyncError = require("../utils/AsyncError.js");
const Product = require("../models/Product");
const multer = require("multer");
const { storage } = require("../config/cloudinary-config");
const upload = multer({ storage });
const { cloudinary } = require("../config/cloudinary-config");
const user = require("../models/user.js");
const Security = require("../utils/Security");
const Comment = require("../models/comments");
const Category = require("../models/category");
const ErrorHander = require("../utils/Errorhandler");
const Cloudinary = require("cloudinary");

exports.getShop = asyncError(async (req, res) => {
  let filter = {};
  const cat = req.query.query;
  if (req.query.query) {
    const category = await Category.find({ name: cat });
    if (category.length) {
      const catid = category[0]._id;
      filter = { category: catid };
    } else {
      filter = {};
    }
  }
  const category = await Category.find();
  const products = await Product.find(filter);
  let uri = [];
  var options = {
    resource_type: "image",
    folder: "tarpitCafe/Home",
    max_results: 8,
  };
  const result = await Cloudinary.v2.search
    .expression(
      "folder: tarpitCafe/Home" // add your folder
    )
    .sort_by("public_id", "desc")
    .max_results(10)
    .execute();

  result.resources.forEach((image) => {
    const url = image.url;
    uri.push(url);
  });
  res.render("tarpit/index", {
    pageTitle: "Shop",
    products: products,
    cat: cat,
    category,
    uri,
  });
});

exports.newForm = asyncError(async (req, res) => {
  const category = await Category.find();
  // res.send(category);
  res.render("tarpit/new", { category });
});

exports.addProduct = asyncError(async (req, res) => {
  // res.send(req.body.product);
  const newProduct = new Product(req.body.product);
  newProduct.image = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  await newProduct.save();
  req.flash("success", "Successfully create a new products");
  res.redirect(`/products/${newProduct._id}`);
});

exports.getProduct = asyncError(async (req, res) => {
  if (!req.session.cart) {
    req.session.cart = {
      items: [],
      totals: 0.0,
      formattedTotals: "",
      formattedTaxedTotals: "",
      taxedTotal: 0.0,
    };
  }
  const { id } = req.params;
  const products = await Product.findById(id).populate({
    path: "review",
    populate: {
      path: "author",
    },
  });
  let comments = [];

  for (i = 0; i < products.review.length; i++) {
    comments = await Comment.find({
      review: { _id: products.review[i]._id },
    }).populate("review");
  }
  if (!products) {
    req.flash("error", "Sorry! Product not found");
    return res.redirect("/products");
  }
  const nonce = Security.md5(req.sessionID + req.headers["user-agent"]);
  res.render("tarpit/show", {
    pageTitle: `${products.title}`,
    products,
    comments,
    nonce,
  });
});

exports.showEdit = asyncError(async (req, res) => {
  const { id } = req.params;
  const products = await Product.findById(id);
  const category = await Category.find();
  if (!products) {
    req.flash("error", "Sorry! Product not found");
    return res.redirect("/");
  }
  res.render("tarpit/edit", { products, category });
});

exports.editProduct = asyncError(async (req, res) => {
  const { id } = req.params;
  // console.log(req.body);
  const products = await Product.findByIdAndUpdate(id, {
    ...req.body.product,
  });
  images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  products.image.push(...images);
  if (req.body.deleteImage) {
    for (let file of req.body.deleteImage) {
      await cloudinary.uploader.destroy(file);
    }
    await products.updateOne({
      $pull: { image: { filename: { $in: req.body.deleteImage } } },
    });
  }
  await products.save();
  req.flash("success", "Successfully edited the products");
  res.redirect(`/products/${products._id}`);
});

exports.deleteProduct = asyncError(async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the products");
  res.redirect("/products");
});
