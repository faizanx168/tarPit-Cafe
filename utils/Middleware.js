const myError = require("./ExtendedError");
const { reviewSchema, productSchema } = require("../joiSchema");
const Review = require("../models/reviews");
const Product = require("../models/Product");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    throw new myError(message, 400);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "Permission required to update/delete!");
    return res.redirect(`/products/${id}`);
  }
  next();
};

module.exports.isAdmin = async (req, res, next) => {
  if (!req.user._id.equals(process.env.ADMIN_ID)) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "Permission required to update/delete!");
    return res.redirect("/products/");
  }
  next();
};
module.exports.validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    throw new myError(message, 400);
  } else {
    next();
  }
};
/* last */
