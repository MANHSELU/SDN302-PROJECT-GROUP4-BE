const express = require("express");
const router = express.Router();
const adminController = require("./../../controller/Admin/admin.controller");
router.post("/loginAdmin", adminController.login);
module.exports = router;