const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");

mongoose.plugin(slug);

const bookSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    title: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    author: String,
    published_year: String,
    description: String,
    date: { type: Date, default: Date.now },
    image: [{ type: String }],
    category_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categorys",
      },
    ],
    shelf: Number,
    row: Number,
    column: Number,
    price: Number,
    deleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
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
