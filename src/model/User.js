const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
const bookSchema = new mongoose.Schema(
  {
    user_id: String,
    title: String,
    quantity: Number,
    author: String,
    published_year: String,
    decription: String,
    date: date,
    image: [{ type: "String" }],
    shelf: Number,
    row: Number,
    column: Number,
    price: Number,
    status: {
      type: "String",
      default: "active",
    },
    slug: { type: String, slug: "title", unique: true },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model("books", bookSchema);
module.exports = Book;
