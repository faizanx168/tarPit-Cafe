const asyncError = require("../utils/AsyncError.js");
const multer = require("multer");
const { storage } = require("../config/cloudinary-config");
const upload = multer({ storage });
const { cloudinary } = require("../config/cloudinary-config");
const Blog = require("../models/blog");

exports.showBlogPage = asyncError(async (req, res) => {
  let filter = {};
  cat = req.query.query;
  if (req.query.query) {
    filter = { category: cat };
  }
  const blog1 = await Blog.findOne().sort({ _id: -1 }).limit(1);
  let Blogs;
  if (blog1) {
    Blogs = await Blog.find({ _id: { $ne: blog1._id } }).sort({
      _id: -1,
    });
  }
  res.render("blogs/all", { pageTitle: "Blog Page", blog1, Blogs });
});

exports.newForm = (req, res) => {
  res.render("blogs/new");
};

exports.getBlog = asyncError(async (req, res) => {
  const { id } = req.params;
  const Blogs = await Blog.findById(id);
  res.render("blogs/show", { pageTitle: Blogs.title, Blogs });
});

exports.postBlog = asyncError(async (req, res) => {
  const newBlog = new Blog(req.body.Blog);
  newBlog.image = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  await newBlog.save();
  req.flash("success", "Successfully create a new Blogs");
  res.redirect(`/blogs/${newBlog._id}`);
});

exports.showEditBlog = asyncError(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  res.render("blogs/editBlog", { blog });
});
exports.editBlog = asyncError(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findByIdAndUpdate(id, {
    ...req.body.Blog,
  });
  images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  blog.image.push(...images);
  if (req.body.deleteImage) {
    for (let file of req.body.deleteImage) {
      await cloudinary.uploader.destroy(file);
    }
    await blog.updateOne({
      $pull: { image: { filename: { $in: req.body.deleteImage } } },
    });
  }
  await blog.save();
  req.flash("success", "Successfully edited the blog");
  res.redirect(`/blogs/${blog._id}`);
});
exports.deleteBlog = asyncError(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the products");
  res.redirect("/admin/blogs");
});
// last
