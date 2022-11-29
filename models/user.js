const mongoose = require("mongoose");
const passortLocal = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

UserSchema.plugin(passortLocal);
module.exports = mongoose.model("User", UserSchema);
