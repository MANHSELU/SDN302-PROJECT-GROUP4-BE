const user = require("./../../model/User");
const jwt = require("jsonwebtoken");
module.exports.checkaccountAdmin = async (req, res, next) => {
  const response = {};
  const authorizationHeader = req.get("Authorization");
  const token = authorizationHeader && authorizationHeader?.split(" ")[1];
  if (!token) {
    Object.assign(response, {
      state: 401,
      message: "Unthorization",
    });
  } else {
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET); // bỏi vì mình mã hóa có 2 giá trị
      if (decode.roleId != "68fc9ff0fd537a52f13daa56") {
        return res
          .status(401)
          .json({ message: " authorization denied , no Chuyengia" });
      }
      const users = await user
        .findOne({ _id: decode.userId })
        .select("-password -refresh_token");
      if (!users) {
        throw new Error("User not exist ");
      }
      res.locals.user = users;
      res.locals.exp = decode.exp;
      return next();
    } catch (e) {
      console.log("chương trình đang bị lỗi ");
      Object.assign(response, {
        state: 401,
        message: "Unthorization",
      });
      return res.status(response.state).json(response);
    }
  }
};
