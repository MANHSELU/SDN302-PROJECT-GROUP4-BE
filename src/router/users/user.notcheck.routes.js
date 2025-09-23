const express = require("express");
const router = express.Router();
const controller = require("./../../controller/Users/user.controller");
router.post("/loginUser", controller.login);
module.exports = router;
