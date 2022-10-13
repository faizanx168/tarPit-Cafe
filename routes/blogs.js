const express = require("express");
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });
const asyncError = require("../utils/AsyncError.js");
const multer = require("multer");
const { storage } = require("../utils/cloudinary-config");
const upload = multer({ storage });
const { cloudinary } = require("../utils/cloudinary-config");
const { isAdmin, isLoggedIn } = require("../utils/Middleware");
const Blog = require("../models/blog");

router.get(
  "/",
  asyncError(async (req, res) => {
    let filter = {};
    cat = req.query.query;
    if (req.query.query) {
      filter = { category: cat };
    }
    const blog1 = await Blog.findOne().sort({ _id: -1 }).limit(1);
    const Blogs = await Blog.find({ _id: { $ne: blog1._id } }).sort({
      _id: -1,
    });
    // console.log(blog1._id);
    // // res.send(Blogs);
    res.render("blogs/all", { pageTitle: "Blog Page", blog1, Blogs });
  })
);
router.get("/new", (req, res) => {
  res.render("blogs/new");
});
router.get(
  "/:id",
  asyncError(async (req, res) => {
    const { id } = req.params;
    const Blogs = await Blog.findById(id);
    res.render("blogs/show", { pageTitle: Blogs.title, Blogs });
  })
);

router.post(
  "/",
  upload.array("image"),
  asyncError(async (req, res) => {
    const newBlog = new Blog(req.body.Blog);
    newBlog.image = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));
    await newBlog.save();
    req.flash("success", "Successfully create a new Blogs");
    res.redirect(`/blogs/${newBlog._id}`);
  })
);

router.delete(
  "/:id",
  asyncError(async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the products");
    res.redirect("/blogs");
  })
);

module.exports = router;
