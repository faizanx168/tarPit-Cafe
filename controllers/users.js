const myError = require("../utils/ExtendedError");
const asyncError = require("../utils/AsyncError.js");
const User = require("../models/user");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const mailchimp = require("@mailchimp/mailchimp_transactional")(
  process.env.MailChimpApi
);

exports.getRegister = (req, res) => {
  res.render("users/registration");
};

exports.registerUser = asyncError(async (req, res) => {
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
    // const token = jwt.sign(
    //   { username, email, password },
    //   process.env.JWT_ACTIVATE,
    //   { expiresIn: "20m" }
    // );
    // const message = {
    //   from_email: "hello@tarpitcoffee.com",
    //   subject: "Tarpit Account Activation Link",
    //   html: `
    //   <h2>Please click on the given token to activate your account</h2>

    //   <form action=${process.env.CLIENT_URL}/activate method="post">
    //   <input type="hidden" value="${token}" name="token">
    //   <button class = "btn">Activate Account</button>
    //   </form>
    //   `,
    //   text: "Welcome to Mailchimp Transactional!",
    //   to: [
    //     {
    //       email: email,
    //       type: "to",
    //     },
    //   ],
    // };
    // const response = await mailchimp.messages
    //   .send({
    //     message,
    //   })
    //   .then((message) => {
    //     console.log(message);
    //     if (message[0].status === "rejected") {
    //       req.flash("error", "Sorry!! Could not send email.");
    //       res.redirect("/register");
    //     } else {
    //       req.flash(
    //         "success",
    //         "Email has been sent! Kindly activate your account."
    //       );
    //       res.redirect("/login");
    //     }
    //   });
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
    res.redirect("/register");
  }
});

exports.activateUser = asyncError(async (req, res) => {
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
});

exports.getLogin = (req, res) => {
  res.render("users/login");
};

exports.login = (req, res) => {
  req.flash("success", "Successfully logged in, enjoyy!");
  res.redirect("/");
};

exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Successfully logged out!");
    res.redirect("/");
  });
};
