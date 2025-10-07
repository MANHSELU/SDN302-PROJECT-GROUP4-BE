const express = require("express");
const routerLibCheck = express.Router();
const LibrarianController = require('../../controller/Librarian/librarian.controller');
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

routerLibCheck.patch("/returnBook",LibrarianController.returnBorrowBook);
routerLibCheck.post("/addNewBooks",upload.array("images"),LibrarianController.AddNewBooks);
routerLibCheck.patch("/updateBooks/:bookIdInput",LibrarianController.UpdateBooks);
routerLibCheck.delete("/deleteBooks/:bookIdInput",LibrarianController.DeleteBook);
routerLibCheck.get("/getAllBooks",LibrarianController.GetAllBook);
module.exports = routerLibCheck;