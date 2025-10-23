const router = require("./admin.check.routes");
module.exports = (app) => {
  app.use("/admincheck", router);
};
