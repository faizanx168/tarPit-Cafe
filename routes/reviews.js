const express = require('express');
const router = express.Router({mergeParams: true});
const Review = require('../models/reviews');
const Product = require('../models/Product');
const { isLoggedIn, isReviewAuthor } = require('../utils/Middleware');
const {validateReview} = require('../utils/Middleware');
const asyncError = require('../utils/AsyncError.js');
const Comment = require('../models/comments');


router.post('/',validateReview,isLoggedIn, asyncError(async(req,res)=>{
    const product =  await Product.findById(req.params.id);
    const review = new Review(req.body.review);
    // res.send(review);
    review.author = req.user._id;
    product.review.push(review)
    await review.save();
    await product.save();
    req.flash('success', "Successfully added the review")
    res.redirect(`/products/${product._id}`);
}))
router.delete('/:reviewId',isLoggedIn,isReviewAuthor, asyncError(async(req, res) =>{
    await Product.findByIdAndUpdate(req.params.id, {$pull: {review: req.params.reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', "Successfully deleted the review")
    res.redirect(` Productgrounds/${req.params.id}`);
}))
router.post('/:reviewId/comments', asyncError(async(req, res)=>{
    const product =  await Product.findById(req.params.id);
    const review = await Review.findById(req.params.reviewId);
    const comment = new Comment(req.body.comment);
    // console.log(req.user)
    comment.author = req.user.username;
    console.log(comment.author)
    // res.send(comment_
    // res.send(comment);
    review.comments.push(comment);
    await review.save();
    await comment.save();
    req.flash('success', "Successfully added the review")
    res.redirect(`/products/${product._id}`);
}))

module.exports = router;