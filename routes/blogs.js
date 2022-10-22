const express = require("express");
const router = express.Router({ mergeParams: true });
const multer = require("multer");
const { storage } = require("../utils/cloudinary-config");
const upload = multer({ storage });
const { cloudinary } = require("../utils/cloudinary-config");
const { isAdmin, isLoggedIn } = require("../utils/Middleware");
const {
  showBlogPage,
  newForm,
  getBlog,
  postBlog,
  deleteBlog,
} = require("../controllers/blogs");

router.get("/", showBlogPage);
router.get("/new", newForm);
router.get("/:id", getBlog);

router.post("/", upload.array("image"), postBlog);

router.delete("/:id", deleteBlog);

module.exports = router;
