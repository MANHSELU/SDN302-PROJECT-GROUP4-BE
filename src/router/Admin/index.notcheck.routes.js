const router = require("./admin.notcheck.routes");
module.exports = (app) => {
  app.use("/adminnotcheck", router);
};
