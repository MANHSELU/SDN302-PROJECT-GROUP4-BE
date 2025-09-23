const mongoose = require("mongoose");
const reviewbookSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: "books" },
    text: String,
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const FaouriteBook = mongoose.model("reviewbooks", reviewbookSchema);
module.exports = FaouriteBook;
