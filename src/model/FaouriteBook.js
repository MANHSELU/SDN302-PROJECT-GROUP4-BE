const mongoose = require("mongoose");
const faouritebookSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    book_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "books",
      required: true,
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Unique chỉ áp dụng với bản ghi chưa deleted (cho phép restore)
faouritebookSchema.index(
  { user_id: 1, book_id: 1 },
  { unique: true, partialFilterExpression: { deleted: false } }
);
// Hỗ trợ truy vấn theo user + trạng thái + sort thời gian
faouritebookSchema.index({ user_id: 1, deleted: 1, createdAt: -1 });

const FaouriteBook = mongoose.model("faouritebooks", faouritebookSchema);
module.exports = FaouriteBook;
