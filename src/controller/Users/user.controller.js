const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const user = require("./../../model/User");
// lưu ý payload có thể là algorithm (default: HS256) hoặc expiresInMinutes
module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  const response = {};
  if (!email || !password) {
    Object.assign(response, {
      status: 404,
      message: "Not Found",
    });
  } else {
    try {
      const users = await user.findOne({
        email: email,
        status: "active",
      });
      const result = bcrypt.compareSync(password, users.password);
      if (!result) {
        Object.assign(response, {
          state: 404,
          message: "Not Found",
        });
      } else {
        const accesstoken = jwt.sign(
          { userId: users.id, roleId: users.role_id },
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_EXPRIRE,
          }
        );
        const refresh_token = jwt.sign(
          { random: new Date().getTime + Math.random() },
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_REFRESH_JWT_EXPRIRE,
          }
        );
        await user.updateOne(
          { _id: users },
          {
            refresh_token: refresh_token,
          }
        );
        Object.assign(response, {
          state: 200,
          message: "Success",
          access_Token: accesstoken,
          refresh_token: refresh_token,
        });
      }
    } catch (e) {
      console.log("lỗi trong chương trình trên là : ", e);
      Object.assign(response, {
        state: 400,
        message: "Bad request",
      });
    }
  }
  res.status(response.state).json({ response });
};
module.exports.register = async (req, res) => {
  try {
    const { fullname, email, password, phone, role_id } = req.body;
    // Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    password = bcrypt.hash(password, 10);
    // Tạo user
    const newUser = new user({
      fullname,
      email,
      password,
      phone,
      role_id: role_id || null,
    });
    await newUser.save();
    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
