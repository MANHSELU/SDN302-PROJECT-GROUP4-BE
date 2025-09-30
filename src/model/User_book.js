const mongoose = require("mongoose");
const userbookSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: "books" },
    borrow_date: Date,
    return_date: Date,
    status: {
      type: String,
      default: "active",
    },
    quantity: Number,
    book_detail: {
      price: Number,
      date: Date,
      status: {
        type: String,
        enum: ["active", "returned", "cancelled"],
        default: "active",
      },
      transaction_type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const FaouriteBook = mongoose.model("userbooks", userbookSchema);
module.exports = FaouriteBook;
