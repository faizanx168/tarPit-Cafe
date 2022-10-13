const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews");

const productSchema = new Schema(
  {
    title: String,
    price: Number,
    description: String,
    category: String,
    image: [
      {
        url: String,
        filename: String,
      },
    ],
    review: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
