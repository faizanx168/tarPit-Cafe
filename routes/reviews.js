const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isReviewAuthor } = require("../utils/Middleware");
const { validateReview } = require("../utils/Middleware");
const {
  addReview,
  deleteReview,
  addComment,
} = require("../controllers/reviews");

router.post("/", validateReview, isLoggedIn, addReview);

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, deleteReview);

router.post("/:reviewId/comments", isLoggedIn, addComment);

module.exports = router;
/* last */
