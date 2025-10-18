const express = require("express");
const app = express();
const port = 3000;
const database = require("./src/config/database");
require("dotenv").config();
const cors = require("cors");

const whitelist = ["http://localhost:3000", "http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,

  // ✅ Cho phép tất cả các method cần thiết
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  // ✅ Cho phép các header phổ biến
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const adminRouterNotCheck = require("./src/router/Admin/index.notcheck.routes");
const userRouterNotCheck = require("./src/router/users/index.notcheck.routes");
const userRouterCheck = require("./src/router/users/index.check.routes");
const librarianRouterCheck = require("./src/router/Librarian/index.check.routes");
const librarianRouterNotCheck = require("./src/router/Librarian/index.notcheck.routes");
userRouterNotCheck(app);
adminRouterNotCheck(app);
userRouterCheck(app);
librarianRouterNotCheck(app);
librarianRouterCheck(app);
database.connect();
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
