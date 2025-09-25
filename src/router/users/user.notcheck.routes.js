const express = require("express");
const routerUserNotCheck = express.Router();
const Usercontroller = require("./../../controller/Users/user.controller");
const bookController = require("../../controller/Users/book.controller");
routerUserNotCheck.post("/loginUser", Usercontroller.login);

routerUserNotCheck.post("/register", Usercontroller.register);

routerUserNotCheck.get("/books/:slug", bookController.getBookBySlug);
routerUserNotCheck.get(
  "/filterPaginated",
  Usercontroller.findAndFilterProductPaginated
);
module.exports = routerUserNotCheck;
