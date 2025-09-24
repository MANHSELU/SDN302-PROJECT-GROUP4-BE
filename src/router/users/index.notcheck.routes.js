const express = require("express");
const router = express.Router();
const bookController = require("../../controller/Users/book.controller");
const authController = require("../../controllers/user/auth.controller");

router.post("/register", authController.register);

router.get("/books/:slug", bookController.getBookBySlug);

module.exports = router;
