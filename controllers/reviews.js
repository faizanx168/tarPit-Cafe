const Review = require("../models/reviews");
const Product = require("../models/Product");
const asyncError = require("../utils/AsyncError.js");
const Comment = require("../models/comments");

exports.addReview = asyncError(async (req, res) => {
  const product = await Product.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  const allReviews = await Review.find();
  product.review.push(review);
  await review.save();
  const rating = await Review.find();
  let avg = 0;
  if (rating.length) {
    rating.forEach((rev) => {
      avg += rev.rating;
    });
    product.ratings = (avg / rating.length).toFixed(2);
  } else {
    product.ratings = rating.rating;
  }
  await product.save({ validateBeforeSave: false });
  req.flash("success", "Successfully added the review");
  res.redirect(`/products/${product._id}`);
});

exports.deleteReview = asyncError(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, {
    $pull: { review: req.params.reviewId },
  });
  await Review.findByIdAndDelete(req.params.reviewId);
  req.flash("success", "Successfully deleted the review");
  res.redirect(`/products/${product._id}`);
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
