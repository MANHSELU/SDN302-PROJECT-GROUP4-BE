const router = require("./librarian.check.routes");
const middleware = require("./../../middleware/client/checkaccount");

module.exports = (app) =>{
    app.use("/api/librarian/check", router);
}