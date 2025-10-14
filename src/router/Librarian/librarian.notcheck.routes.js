const express = require("express");
const router = express.Router();
const controller = require("./../../controller/Librarian/librarian.controller");
router.post("/loginLibrarian", controller.login);
module.exports = router;
