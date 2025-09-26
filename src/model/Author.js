const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tên tác giả
    image_author: String,
    bio: { type: String }, // Tiểu sử
    birthdate: { type: Date }, // Ngày sinh
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
); // tự động thêm createdAt, updatedAt

const Author = mongoose.model("authors", authorSchema);

module.exports = Author;
