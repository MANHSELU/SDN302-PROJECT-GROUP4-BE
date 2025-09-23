const express = require("express");
const router = express.Router();
const bookController = require("../controller/Book/book.controller");

router.get("/books/:slug", bookController.getBookBySlug);

module.exports = router;
