const express = require("express");
const router = express.Router({ mergeParams: true });
const multer = require("multer");
const { storage } = require("../utils/cloudinary-config");
const upload = multer({ storage });
const { cloudinary } = require("../utils/cloudinary-config");
const { isAdmin, validateProduct, isLoggedIn } = require("../utils/Middleware");
const {
  getShop,
  newForm,
  addProduct,
  getProduct,
  showEdit,
  editProduct,
  deleteProduct,
} = require("../controllers/products");

router.get("/", getShop);

router.get("/new", isLoggedIn, isAdmin, newForm);

router.post(
  "/",
  isLoggedIn,
  isAdmin,
  upload.array("image"),
  validateProduct,
  addProduct
);

router.get("/:id", getProduct);

router.get("/:id/edit", isLoggedIn, isAdmin, showEdit);

router.put(
  "/:id",
  isLoggedIn,
  isAdmin,
  upload.array("image"),
  validateProduct,
  editProduct
);

router.delete("/:id", isLoggedIn, isAdmin, deleteProduct);

module.exports = router;
