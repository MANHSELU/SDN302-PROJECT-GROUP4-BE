const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const adminNotCheck = require("./src/router/Admin/index.notcheck.routes");
const userNotCheck = require("./src/router/users/index.notcheck.routes");
adminNotCheck(app);
userNotCheck(app);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
