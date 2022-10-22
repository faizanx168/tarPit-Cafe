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
} = require("../controllers/users");

router.get("/register", getRegister);
router.post("/register", registerUser);

router.post("/activate", activateUser);

router.get("/login", getLogin);
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
    keepSessionInfo: true,
  }),
  login
);
router.get("/logout", logout);

module.exports = router;
