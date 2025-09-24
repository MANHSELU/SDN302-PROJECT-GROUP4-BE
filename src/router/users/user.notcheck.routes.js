const express = require("express");
const router = express.Router();
const Usercontroller = require("./../../controller/Users/user.controller");
const bookController = require("../../controller/Users/book.controller");
router.post("/loginUser", Usercontroller.login);

router.post("/register", Usercontroller.register);

router.get("/books/:slug", bookController.getBookBySlug);
module.exports = router;
