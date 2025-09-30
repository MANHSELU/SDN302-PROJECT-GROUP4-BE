const express = require("express");
const routerUserCheck = express.Router();
const userController = require("../../controller/Users/user.controller");

routerUserCheck.post("/borrowBook", userController.borrowBookFunction);
routerUserCheck.get("/getuser", userController.getUser);
routerUserCheck.get("/slottime", userController.getslotTime);
module.exports = routerUserCheck;
