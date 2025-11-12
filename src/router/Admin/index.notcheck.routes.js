const router = require("./admin.notcheck.routes");
const middleware = require("./../../middleware/admin/authAdmin");
module.exports = (app) => {
    app.use(middleware.checkaccountAdmin);
  app.use("/adminnotcheck", router);
};