const mongoose = require("mongoose");
const passortLocal = require("passport-local-mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");
const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    firstName: {
      type: String,
      unique: false,
      required: true,
    },
    lastName: {
      type: String,
      unique: false,
      required: true,
    },
    password: String,
    username: { type: String, unique: true, required: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

UserSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

UserSchema.plugin(passortLocal);
module.exports = mongoose.model("User", UserSchema);
// last
