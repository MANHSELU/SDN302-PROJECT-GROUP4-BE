const user = require("./../../model/User");
const jwt = require("jsonwebtoken");
module.exports.checkaccount = async (req, res, next) => {
  console.log("chạy qua middle token client");
  console.log("🔥 Middleware chạy ở:", req.originalUrl);

  try {
    const authHeader = req.get("Authorization");
    console.log("Header Authorization:", authHeader);

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Unauthorized, no token provided" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized, no token provided" });
    }

    // ✅ verify token (tự động kiểm tra hết hạn)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded.roleId)
    // ✅ Nếu có role check, xử lý ở đây
    if (decoded.roleId && decoded.roleId !== "user") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const users = await user
      .findOne({ _id: decoded.userId })
      .select("-password -refresh_token");
    if (!users) {
      return res.status(404).json({ message: "User not exist" });
    }
    console.log("user",users);
    
    if(users.status != "active"){
        throw new Error("Your account is not active");
    }
    res.locals.user = users;
    res.locals.exp = decoded.exp;
    next();
  } catch (e) {
    console.error("❌ Lỗi xác thực token:", e.name);
    if (e.name === "TokenExpiredError") {
      return res.status(401).json({ message:  e.message});
    }
    return res.status(403).json({ message: e.message });
  }
};
