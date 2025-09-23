const Book = require("../../models/Book");
// chi tiết sách
exports.getBookBySlug = async (req, res) => {
  try {
    const book = await Book.findOne({
      slug: req.params.slug,
      deleted: false,
    }).populate("category_id");
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
