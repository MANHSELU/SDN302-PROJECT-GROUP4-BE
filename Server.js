const express = require("express");
const app = express();
const port = 3000;
const database = require("./src/config/database");
require("dotenv").config();
var cors = require("cors");
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
const { initWebSocket } = require("./src/config/websocket");
const http = require("http");
const server = http.createServer(app);
userRouterNotCheck(app);
adminRouterNotCheck(app);
userRouterCheck(app);
librarianRouterNotCheck(app);
librarianRouterCheck(app);
database.connect();
initWebSocket(server);
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
