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
  forgotPassword,
  getAllUsers,
  resetPassword,
  getforgotPassword,
  getResetPassword,
} = require("../controllers/users");
const { isAdmin, isLoggedIn } = require("../utils/Middleware");

router.get("/register", getRegister);
router.post("/register", registerUser);
// facebook
router.get(
  "/login/federated/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
  })
);
// Google
router.get(
  "/login/federated/google",
  passport.authenticate("google", { scope: ["openid", "profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
  })
);
router.get("/password/forgot", getforgotPassword);
router.post("/password/forgot", forgotPassword);

router.get("/password/reset/:token", getResetPassword);
router.put("/password/reset/:token", resetPassword);

router.post("/updatePassword", isLoggedIn, updatePassword);
router.post("/activate", activateUser);
router.get("/account", isLoggedIn, getUserDetails);
router.get("/login", getLogin);
router.get("/admin/users", isLoggedIn, isAdmin, getAllUsers);
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
    keepSessionInfo: true,
  }),
  login
);
router.post("/address", isLoggedIn, getAddress);
router.get("/logout", isLoggedIn, logout);

module.exports = router;
/* last */
