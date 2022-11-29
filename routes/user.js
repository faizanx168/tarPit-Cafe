const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const {
  getRegister,
  registerUser,
  activateUser,
  getLogin,
  login,
  logout,
  getUserDetails,
  getAddress,
  updatePassword,
  getAllUsers,
} = require("../controllers/users");

router.get("/register", getRegister);
router.post("/register", registerUser);
router.post("/updatePassword", updatePassword);
router.post("/activate", activateUser);
router.get("/account", getUserDetails);
router.get("/login", getLogin);
router.get("/admin/users", getAllUsers);
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
    keepSessionInfo: true,
  }),
  login
);
router.post("/address", getAddress);
router.get("/logout", logout);

module.exports = router;
