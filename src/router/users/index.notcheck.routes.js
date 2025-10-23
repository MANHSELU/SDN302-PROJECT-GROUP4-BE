const userRouterNotCheck = require("./user.notcheck.routes");

module.exports = (app) => {
  app.use("/api/user/notcheck", userRouterNotCheck);
};
