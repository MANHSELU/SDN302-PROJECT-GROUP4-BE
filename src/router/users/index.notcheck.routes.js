const userNotCheckRoutes = require("./users.notcheck.routes");

module.exports = (app) => {
  app.use("/api/notCheck", userNotCheckRoutes);
};
