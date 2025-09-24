const express = require("express");
const router  = express.Router();
const productController = require('../../controller/Users/user.controller')

// router.get("/search", productController.searchProduct);
router.get("/filterPaginated", productController.findAndFilterProductPaginated);
module.exports = router;
 