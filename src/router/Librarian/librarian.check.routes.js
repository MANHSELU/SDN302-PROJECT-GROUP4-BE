const express = require("express");
const routerLibCheck = express.Router();
const LibrarianController = require("../../controller/Librarian/librarian.controller");

routerLibCheck.patch("/returnBook", LibrarianController.returnBorrowBook);

// CRUD Table
routerLibCheck.post("/tables", LibrarianController.createTable);
routerLibCheck.get("/tables", LibrarianController.listTables);
routerLibCheck.get("/tables/:id", LibrarianController.getTableById);
routerLibCheck.put("/tables/:id", LibrarianController.updateTable);
routerLibCheck.delete("/tables/:id", LibrarianController.deleteTable);
//khôi phục (restore) + xóa hẳn (hard delete)
routerLibCheck.patch("/tables/:id/restore", LibrarianController.restoreTable);
routerLibCheck.delete("/tables/:id/hard", LibrarianController.hardDeleteTable);

module.exports = routerLibCheck;
