const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);
const bookSchema = new mongoose.Schema(
  {
    user_id: String,
    title: String,
    quantity: Number,
    author: String,
    published_year: String,
    decription: String,
    date: Date,
    image: [{ type: "String" }],
    categori_id: [
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
