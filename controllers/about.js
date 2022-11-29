const asyncError = require("../utils/AsyncError.js");
const multer = require("multer");
const { storage } = require("../config/cloudinary-config");
const upload = multer({ storage });
const { isAdmin, isLoggedIn } = require("../utils/Middleware");
const Employee = require("../models/employee");

exports.about = asyncError(async (req, res) => {
  const employee = await Employee.find({});
  res.render("about/about", { employee });
});
exports.newForm = asyncError(async (req, res) => {
  res.render("about/new");
});
exports.addNew = asyncError(async (req, res) => {
  const employee = new Employee(req.body.about);
  employee.image = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  await employee.save();
  req.flash("success", "Successfully create a new products");
  res.redirect("/about");
});
