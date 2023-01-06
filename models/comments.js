const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    body: String,
    author: String,
    review: {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
// last
