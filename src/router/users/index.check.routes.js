const router = require("./user.check.routes");
const middleware = require("./../../middleware/client/checkaccount");
module.exports = (app) => {
  app.use("/api/user/check", middleware.checkaccount, router);
};
