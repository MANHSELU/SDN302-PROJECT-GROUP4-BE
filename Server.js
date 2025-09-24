const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const adminRouterNotCheck = require("./src/router/Admin/index.notcheck.routes");
const userRouterNotCheck = require("./src/router/users/index.notcheck.routes");
adminRouterNotCheck(app);
userRouterNotCheck(app);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
