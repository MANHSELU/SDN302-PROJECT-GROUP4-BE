const express = require("express");
const routerLibCheck = express.Router();
const LibrarianController = require('../../controller/Librarian/librarian.controller');

routerLibCheck.patch("/returnBook",LibrarianController.returnBorrowBook);

module.exports = routerLibCheck;