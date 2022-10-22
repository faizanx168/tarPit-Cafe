const Review = require("../models/reviews");
const Product = require("../models/Product");
const asyncError = require("../utils/AsyncError.js");
const Comment = require("../models/comments");

exports.addReview = asyncError(async (req, res) => {
  const product = await Product.findById(req.params.id);
  const review = new Review(req.body.review);
  // res.send(review);
  review.author = req.user._id;
  product.review.push(review);
  await review.save();
  await product.save();
  req.flash("success", "Successfully added the review");
  res.redirect(`/products/${product._id}`);
});

exports.deleteReview = asyncError(async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, {
    $pull: { review: req.params.reviewId },
  });
  await Review.findByIdAndDelete(req.params.reviewId);
  req.flash("success", "Successfully deleted the review");
  res.redirect(` Productgrounds/${req.params.id}`);
});

exports.addComment = asyncError(async (req, res) => {
  const product = await Product.findById(req.params.id);
  const reviews = await Review.findById(req.params.reviewId);
  // console.log('my',reviews)
  const comment = new Comment(req.body.comment);
  comment.author = req.user.username;
  comment.review = reviews;
  // console.log('my reviws',comment.review)
  await comment.save();
  req.flash("success", "Successfully added the review");
  res.redirect(`/products/${product._id}`);
});
