const express = require("express");
const router = express.Router({ mergeParams: true });
const myError = require("../utils/ExtendedError");
const asyncError = require("../utils/AsyncError.js");
const User = require("../models/user");
const passport = require("passport");
// const mailgun = require("mailgun-js");
// const DOMAIN = "sandbox55e9898f3a2c4fafaf4c3a631e28fe49.mailgun.org";
// const mg = mailgun({ apiKey: process.env.MailGunApi, domain: DOMAIN });
const jwt = require("jsonwebtoken");
const mailchimp = require("@mailchimp/mailchimp_transactional")(
  process.env.MailChimpApi
);

router.get("/register", (req, res) => {
  res.render("users/registration");
});
router.post(
  "/register",
  asyncError(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const isEmail = await User.findOne({ email });
      if (isEmail) {
        req.flash(
          "error",
          "An account with this email already exists! Try again."
        );
        return res.redirect("/register");
      }
      const token = jwt.sign(
        { username, email, password },
        process.env.JWT_ACTIVATE,
        { expiresIn: "20m" }
      );
      const message = {
        from_email: "hello@tarpitcoffee.com",
        subject: "Tarpit Account Activation Link",
        // html: `
        // <h2>Please click on the given token to activate your account</h2>

        // <form action=${process.env.CLIENT_URL}/activate method="post">
        // <input type="hidden" value="${token}" name="token">
        // <button class = "btn">Activate Account</button>
        // </form>
        // `,
        text: "Welcome to Mailchimp Transactional!",
        to: [
          {
            email: email,
            type: "to",
          },
        ],
      };
      const response = await mailchimp.messages
        .send({
          message,
        })
        .then((message) => {
          console.log(message);
          if (message[0].status === "rejected") {
            req.flash("error", "Sorry!! Could not send email.");
            res.redirect("/register");
          } else {
            req.flash(
              "success",
              "Email has been sent! Kindly activate your account."
            );
            res.redirect("/login");
          }
        });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/register");
    }
  })
);

router.post(
  "/activate",
  asyncError(async (req, res) => {
    const token = req.body.token;
    if (token) {
      jwt.verify(
        token,
        process.env.JWT_ACTIVATE,
        async function (err, decodedToken) {
          try {
            if (err) {
              req.flash("error", "The link is expired! try Again");
              return res.redirect("/");
            }
            const { username, email, password } = decodedToken;
            const user = new User({ email, username });
            const registered = await User.register(user, password);
            req.login(registered, function (err) {
              if (err) {
                req.flash("error", err.message);
                return res.redirect("/");
              }
              req.flash("success", "Welcome to Tarpit!");
              res.redirect("/");
            });
          } catch (err) {
            req.flash("error", err.message);
            res.redirect("/");
          }
        }
      );
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
    keepSessionInfo: true,
  }),
  (req, res) => {
    req.flash("success", "Successfully logged in, enjoyy!");
    res.redirect("/");
  }
);
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Successfully logged out!");
    res.redirect("/");
  });
});

module.exports = router;
