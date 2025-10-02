const express = require("express");
const routerUserCheck = express.Router();
const userController = require("../../controller/Users/user.controller");

routerUserCheck.post("/borrowBook", userController.borrowBookFunction);
routerUserCheck.get("/getuser", userController.getUser);
routerUserCheck.get("/slottime", userController.getslotTime);
routerUserCheck.get("/getTable", userController.getTables);
routerUserCheck.post("/getUerTable", userController.getUserTable);
routerUserCheck.post("/postTableUser", userController.postUserTable);
module.exports = routerUserCheck;
