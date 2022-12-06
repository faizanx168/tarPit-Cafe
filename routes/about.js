const express = require("express");
const router = express.Router({ mergeParams: true });
const multer = require("multer");
const { storage } = require("../config/cloudinary-config");
const upload = multer({ storage });
const { isAdmin, isLoggedIn } = require("../utils/Middleware");
const {
  about,
  newForm,
  addNew,
  privacy,
  terms,
} = require("../controllers/about");

router.get("/", about);
router.get("/privacy-policy", privacy);
router.get("/terms-and-conditions", terms);
router.get("/new", isLoggedIn, isAdmin, newForm);
router.post("/", isLoggedIn, isAdmin, upload.array("image"), addNew);
router.delete("/:id", isLoggedIn, isAdmin, addNew);
module.exports = router;
