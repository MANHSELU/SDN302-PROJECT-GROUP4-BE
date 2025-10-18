const mongoose = require("mongoose");
const userbookSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: "books" },
    user_id_ao: { type: mongoose.Schema.Types.ObjectId, ref: "usersaos" },
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
        enum: ["active", "returned", "cancelled"], // đang mượn , đã trả , chưa lấy sách
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

const User_Book = mongoose.model("userbooks", userbookSchema);
module.exports = User_Book;
