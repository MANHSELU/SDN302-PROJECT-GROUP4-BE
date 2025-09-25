const express = require("express");
const routerUserCheck = express.Router();
const userController = require("../../controller/Users/user.controller");

routerUserCheck.post("/borrowBook",userController.borrowBookFunction);

module.exports = routerUserCheck;
