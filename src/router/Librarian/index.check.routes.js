const router = require("./librarian.check.routes");
const middleware = require("./../../middleware/Librarian/authLibrarian");

module.exports = (app) => {
  app.use(middleware.checkaccountLibrarian);
  app.use("/api/librarian/check", router);
};
