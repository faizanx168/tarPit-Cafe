const express = require("express");
const router = express.Router({ mergeParams: true });
const { isAdmin, isLoggedIn } = require("../utils/Middleware");
const {
  getForm,
  addCategory,
  deleteCategory,
} = require("../controllers/category");

router.get("/new", isAdmin, isLoggedIn, getForm);
router.post("/", isAdmin, isLoggedIn, addCategory);
router.delete("/:id", isAdmin, isLoggedIn, deleteCategory);

module.exports = router;
/* last */
