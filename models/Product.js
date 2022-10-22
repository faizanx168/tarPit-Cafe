const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews");

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please Enter product Name"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please Enter product Price"],
      maxLength: [8, "Price cannot exceed 8 characters"],
    },
    description: {
      type: String,
      required: [true, "Please Enter product Description"],
    },
    ratings: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Please Enter Product Category"],
    },
    Stock: {
      type: Number,
      required: [true, "Please Enter product Stock"],
      maxLength: [4, "Stock cannot exceed 4 characters"],
      default: 1,
    },
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
