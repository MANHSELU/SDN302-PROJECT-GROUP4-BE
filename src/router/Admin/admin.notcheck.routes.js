const express = require("express");
const router = express.Router();
const controller = require("./../../controller/Admin/admin.controller");
router.post("/loginAdmin", controller.login);
router.get("/getAllUser",controller.GetAllUsers);
router.get("/getTotalRevenue",controller.GetTotalRevenue);

module.exports = router;
