const express = require("express");
const router = express.Router({ mergeParams: true });
const multer = require("multer");
const { storage } = require("../config/cloudinary-config");
const upload = multer({ storage });
const { cloudinary } = require("../config/cloudinary-config");
const { isAdmin, isLoggedIn } = require("../utils/Middleware");
const {
  showBlogPage,
  newForm,
  getBlog,
  postBlog,
  deleteBlog,
  editBlog,
  showEditBlog,
} = require("../controllers/blogs");

router.get("/", showBlogPage);
router.get("/new", isLoggedIn, isAdmin, newForm);
router.get("/:id", getBlog);
router.get("/:id/edit", showEditBlog);
router.post("/", upload.array("image"), isLoggedIn, isAdmin, postBlog);
router.put("/:id", isLoggedIn, isAdmin, upload.array("image"), editBlog);
router.delete("/:id", isLoggedIn, isAdmin, deleteBlog);

module.exports = router;
