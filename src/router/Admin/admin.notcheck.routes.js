const express = require("express");
const router = express.Router();
const controller = require("./../../controller/Admin/admin.controller");
router.post("/loginAdmin", controller.login);
module.exports = router;
