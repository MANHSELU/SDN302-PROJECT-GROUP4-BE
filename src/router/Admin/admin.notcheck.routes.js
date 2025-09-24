const express = require("express");
const router = express.Router();
const controller = require("./../../controller/Admin/admin.controller");
const bookController = require("../../controller/Users/book.controller");
router.post("/loginAdmin", controller.login);
router.post("/register", authController.register);
router.get("/books/:slug", bookController.getBookBySlug);
module.exports = router;
