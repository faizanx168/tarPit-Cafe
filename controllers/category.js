const asyncError = require("../utils/AsyncError.js");
const Category = require("../models/category");
const mongoose = require("mongoose");

exports.getForm = (req, res) => {
  res.render("categories/new");
};

exports.addCategory = asyncError(async (req, res) => {
  // res.send(req.body);
  const { name, categoryType, values, tax } = req.body;
  const category = new Category({
    name: name,
    options: {
      Type: categoryType,
      values: values,
    },
    tax: tax,
  });
  await category.save();
  req.flash("success", "Successfully create a new category");
  res.redirect(`/`);
});
exports.deleteCategory = asyncError(async (req, res) => {
  const id = req.params.id;
  await Category.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted Categgory");
  res.redirect("/admin/categories");
});
