const myError = require("../utils/ExtendedError");
const asyncError = require("../utils/AsyncError.js");
const User = require("../models/user");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const sendEmail = require("../config/sendEmail");
const Order = require("../models/orders");
const Address = require("../models/address");
const crypto = require("crypto");
const { registerSchema } = require("../joiSchema");

exports.getRegister = (req, res) => {
  res.render("users/registration");
};

exports.registerUser = asyncError(async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      const message = error.details.map((el) => el.message).join(",");
      throw new myError(message, 400);
    }
    const { firstName, lastName, email, username, password, password2 } =
      req.body;
    const isEmail = await User.findOne({ email });
    if (isEmail) {
      req.flash(
        "error",
        "An account with this email already exists! Try again."
      );
      return res.redirect("/register");
    }
    if (password === password2) {
      const token = jwt.sign(
        { username, email, password, firstName, lastName },
        process.env.JWT_ACTIVATE,
        { expiresIn: "10m" }
      );

      subject = "Tarpit Account Activation Link";
      html = `
    <h2>Please click on the given token to activate your account</h2>

    <form action=${process.env.CLIENT_URL}/activate method="post">
    <input type="hidden" value="${token}" name="token">
    <button class = "btn">Activate Account</button>
    </form>
    `;
      message = "Welcome to Tarpit!";
      const sent = sendEmail(email, subject, message, html);
      if (sent) {
        req.flash(
          "success",
          "Email has been sent! Kindly activate your account. Token expires in 10 mins!"
        );
        res.redirect("/login");
      } else {
        req.flash("error", "Sorry!! Could not send email.");
        res.redirect("/register");
      }
    } else {
      req.flash("error", "Sorry!! Passwords do not match!");
      res.redirect("/register");
    }
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
          const { firstName, lastName, username, email, password } =
            decodedToken;
          const user = new User({ email, username, firstName, lastName });
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

// update Password
exports.updatePassword = asyncError(async (req, res) => {
  User.findById(req.user._id, (err, user) => {
    if (err) {
      req.flash("error", "Sorry! user does not exist.");
      res.redirect("/");
    } else {
      const pass1 = req.body.newpassword;
      const pass2 = req.body.newpassword2;
      if (pass1 === pass2) {
        user.changePassword(
          req.body.oldpassword,
          req.body.newpassword,
          (err) => {
            if (err) {
              req.flash("error", "Old password does not match!");
              res.redirect("/account");
            } else {
              req.flash("success", "Successfully changed password!");
              res.redirect("/account");
            }
          }
        );
      } else {
        req.flash("error", "Passwords do not match!");
        res.redirect("/account");
      }
    }
  });
});

// Get User Detail
exports.getUserDetails = asyncError(async (req, res) => {
  if (req.user) {
    const user = await User.findById(req.user._id);
    const orders = await Order.find({ user: user._id });
    const address = await Address.find({ user: user._id });
    const myaddress = address[0];
    res.status(200).render("users/showAccount", {
      success: true,
      user,
      orders,
      address: myaddress,
    });
  } else {
    req.flash("error", "You are not logged in!");
    res.redirect("/");
  }
});

exports.getAddress = asyncError(async (req, res) => {
  const address = req.body.address;
  const useraddress = await Address.find({ user: req.user._id });
  if (!useraddress.length) {
    const saveAddress = new Address(address);
    saveAddress.user = req.user._id;
    await saveAddress.save();
    req.flash("success", "Successfully saved new address");
    res.redirect("/account");
  } else {
    await Address.findOneAndUpdate({ user: req.user._id }, address);
    req.flash("success", "Successfully updated new address");
    res.redirect("/account");
  }
});

// Get all Users
exports.getAllUsers = asyncError(async (req, res) => {
  const users = await User.find({}).select("email username firstName lastName");
  res.render("dashboard/allusers", { users, classes: "users" });
});

// Forgot Password
exports.forgotPassword = asyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new myError("User not found", 404));
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  const subject = "Tarpit Password Reset Link";
  const html = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
  Please click on the following link, or paste this into your browser to complete the process:\n\n Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
  const message = "Welcome to Tarpit!";

  try {
    await sendEmail(req.body.email, subject, message, html);

    req.flash("success", "Reset email has been sent!");
    return res.redirect("/login");
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new myError(error.message, 500));
  }
});

// Reset Password
exports.getforgotPassword = (req, res) => {
  res.render("users/forgotPass");
};

exports.getResetPassword = asyncError(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    req.flash("error", "Password reset token is invalid or has expired.");
    return res.redirect("/login");
  }
  res.render("users/resetPass", { token: req.params.token });
});

exports.resetPassword = asyncError(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new myError("Reset Password Token is invalid or has been expired", 400)
    );
  }
  if (req.body.password === req.body.password2) {
    user.setPassword(req.body.password, function (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      user.save(function (err) {
        req.flash("success", "Password has been updated successfully!");
        return res.redirect("/login");
      });
    });
  } else {
    return next(new myError("Password does not match! Try Again", 400));
  }
});
