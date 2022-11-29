const express = require("express");
const router = express.Router({ mergeParams: true });
const { isAdmin, validateProduct, isLoggedIn } = require("../utils/Middleware");
const { getForm, addCategory } = require("../controllers/category");

router.get("/new", getForm);
router.post("/", addCategory);
module.exports = router;
