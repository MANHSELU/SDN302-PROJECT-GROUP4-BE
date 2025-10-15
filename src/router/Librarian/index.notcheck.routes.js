const router = require("./librarian.notcheck.routes");

module.exports = (app) => {
  app.use("/api/librarian/notcheck", router);
};
