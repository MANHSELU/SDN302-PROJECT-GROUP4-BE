const express = require("express");
const router = express.Router();
const controller = require("./../../controller/Admin/admin.controller");
router.post("/loginAdmin", controller.login);
router.get("/getAllUser",controller.GetAllUsers);
router.get("/getTotalRevenue",controller.GetTotalRevenue);
router.get("/getAllTotalUser",controller.GetTotalUser);
router.get("/getTotalNewUser", controller.GetTotalNewUser);
router.get("/getRevenueDashboard", controller.GetAllRevenueByDashBoard);
router.patch("/banUsers/:userId", controller.BanUsers);
router.patch("/unBanUsers/:userId", controller.UnBanUsers);

module.exports = router;
