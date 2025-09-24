const User = require("../../model/User");

exports.register = async (req, res) => {
  try {
    const { fullname, email, password, phone, avatar, role_id } = req.body;

    // Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Tạo user
    const newUser = new User({
      fullname,
      email,
      password,
      phone,
      avatar,
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
