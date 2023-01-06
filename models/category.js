const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    name: String,
    options: {
      Type: String,
      values: [],
    },

    tax: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
// last
