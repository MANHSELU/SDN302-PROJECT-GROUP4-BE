const Product = require("../../model/Book");
const Category = require("../../model/Category");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const user = require("./../../model/User");
const Book = require("../../model/Book");
const UserBook = require("../../model/User_book");
const Author = require("../../model/Author");
const TimeSlot = require("./../../model/TimeBook");
const { response } = require("express");
const Table = require("../../model/Table");
const User_table = require("../../model/User_table");
const cloudinary = require("../../config/cloudinary");
const Message = require("../../model/Messages");
const Role = require("../../model/Role");
const Conversation = require("../../model/Conversation");
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
      if (!users) {
        console.log("không tồn tại user");
        Object.assign(response, {
          status: 404,
          message: "Not Found",
        });
        res.status(response.status).json({ response });
      }
      const result = bcrypt.compareSync(password, users.password);
      if (!result) {
        Object.assign(response, {
          status: 404,
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
          status: 200,
          message: "Success",
          access_Token: accesstoken,
          refresh_token: refresh_token,
        });
      }
    } catch (e) {
      console.log("lỗi trong chương trình trên là : ", e);
      Object.assign(response, {
        status: 400,
        message: "Bad request",
      });
    }
  }
  res.status(response.status).json({ response });
};
//đăng ký
module.exports.register = async (req, res) => {
  try {
    var { fullname, email, password, phone, role_id } = req.body;
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    password = bcrypt.hashSync(password, 10);
    const newUser = new user({
      fullname,
      email,
      password,
      phone,
      role_id: role_id || null,
    });
    if (!req.body.avatar) {
      req.body.avatar =
        "https://res.cloudinary.com/dmdogr8na/image/upload/v1746949468/hnrnjeaoymnbudrzs7v9.jpg";
    }
    await newUser.save();
    return res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
// Hàm Search và Filter Book theo category
module.exports.findAndFilterProductPaginated = async (req, res) => {
  try {
    const { categoryTitle = "", keyword = "", page = 1 } = req.query;
    console.log("req.query là : ", keyword, page, categoryTitle);
    const pageSize = 10;
    const skip = (page - 1) * pageSize; // ==> Bỏ qua sản phẩm để phân trang,Ví dụ: page = 2, limit = 5 → skip = 5
    // → bỏ 5 sản phẩm đầu, lấy sản phẩm từ thứ 6 trở đi.
    // Hàm lấy tất cả Product
    const allProductsQuery = { status: "active" };
    let allProducts = await Product.find(allProductsQuery).populate(
      "categori_id",
      "title"
    );
    //Hàm search product theo keyword
    const query = {
      title: { $regex: keyword, $options: "i" },
      status: "active",
    };
    allProducts = await Product.find(query).populate("authors");

    if (categoryTitle) {
      const categoryQuery = { title: categoryTitle };
      const category = await Category.findOne(categoryQuery);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      allProducts = allProducts.filter(
        (
          p // ==> Sau sửa lại
        ) =>
          p.categori_id.some((cat) => String(cat._id) === String(category._id))
      );
    }
    console.log("sản phẩm trả về là : ", allProducts);
    const paginatedProducts = allProducts.slice(skip, skip + pageSize);
    const totalItems = allProducts.length;
    const totalPages = Math.ceil(totalItems / pageSize); // Tính tổng số page dựa trên sản phẩm đã tính
    res.json({
      page: page, //trang hiện tại
      pageSize, // số sản phẩm/trang
      totalItems, // tổng sản phẩm
      totalPages, // tổng page
      data: paginatedProducts, // danh sách sản phẩm phân trang
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// mượn sách
module.exports.borrowBookFunction = async (req, res) => {
  try {
    const { bookId, quantityInput } = req.body;
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách " });
    }
    if (book.quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Sách này đã hết. Vui lòng chọn sách khác" });
    }
    if (book.quantity < quantityInput) {
      return res.status(400).json({
        message: `Chỉ còn ${book.quantity} cuốn trong kho, không thể mượn ${quantityInput} cuốn`,
      });
    }
    const userBook = new UserBook({
      user_id: res.locals.user._id,
      book_id: bookId,
      quantity: quantityInput,
      borrow_date: new Date(),
      book_detail: {
        price: book.price * quantityInput,
        date: book.date,
        transaction_type: "Booking_book",
      },
    });
    await userBook.save();
    book.quantity -= Number(quantityInput);
    await book.save();
    res.status(200).json({ message: "Mượn sách thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// lấy ra loại sách
module.exports.getcategory = async (req, res) => {
  const response = {};
  try {
    const Categorys = await Category.find({ status: "active" });
    Object.assign(response, {
      status: 200,
      message: "Successfully",
      data: Categorys,
    });
  } catch (err) {
    console.log("lỗi trong chương trình là: ", err);
    Object.assign(response, {
      status: 500,
      message: "Serrver error",
    });
  }
  return res.status(response.status).json(response);
};

module.exports.getNewBook = async (req, res) => {
  const response = {};
  try {
    const Books = await Book.find({ status: "active" })
      .sort({ createAt: -1 })
      .limit(6);
    Object.assign(response, {
      status: 200,
      message: "successfull",
      data: Books,
    });
  } catch (err) {
    console.log("lỗi trong chương trình trên là : ", err);
    Object.assign(response, {
      status: 500,
      message: "Serror error",
    });
  }
  return res.status(response.status).json(response);
};
// lấy ra tác giả
module.exports.getauthor = async (req, res) => {
  const response = {};
  try {
    const Authors = await Author.find({ status: "active" });
    Object.assign(response, {
      status: 200,
      message: "success",
      data: Authors,
    });
  } catch (err) {
    console.log("lỗi trong chương trình trên là : ", err);
    Object.assign(response, {
      status: 500,
      message: "Server error",
    });
  }
  return res.status(response.status).json(response);
};
// lấy ra profile
module.exports.getUser = async (req, res) => {
  console.log("đang vào profile");
  const response = {
    status: 200,
    message: "Success",
    data: res.locals.user,
  };
  res.status(response.status).json(response);
};
// lấy ra giờ đặt bàn
module.exports.getslotTime = async (req, res) => {
  const response = {};
  try {
    const timeslot = await TimeSlot.find();
    Object.assign(response, {
      status: 200,
      message: "success",
      data: timeslot,
    });
  } catch (err) {
    console.log("lỗi trong chương trình là : ", err);
    Object.assign(response, {
      status: 500,
      message: "success",
    });
  }
  return res.status(response.status).json(response);
};
// lấy ra bàn
module.exports.getTables = async (req, res) => {
  const response = {};
  try {
    const tables = await Table.find({ status: "active", deleted: false });
    if (!tables) {
      Object.assign(response, {
        status: 404,
        message: "Not Found",
      });
    }
    Object.assign(response, {
      status: 200,
      message: "Success",
      data: tables,
    });
  } catch (err) {
    console.log("lỗi trong chương trên là : ", err);
    Object.assign(response, {
      status: 500,
      message: "Serrver error",
    });
  }
  return res.status(response.status).json(response);
};
// lấy ra người dùng danh sách bàn
module.exports.getUserTable = async (req, res) => {
  console.log("đang vào useTable");
  try {
    const { time_date, table_id } = req.body; // "2025-10-01"
    console.log("time_date là:", time_date);
    console.log("table _id là : ", table_id);

    if (!time_date || !table_id) {
      return res.status(400).json({ status: 404, message: "Not Found" });
    }

    // Parse "YYYY-MM-DD" an toàn
    const [year, month, day] = time_date.split("-").map(Number);

    const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const query = {
      status: "active",
      table_id: table_id,
      time_date: { $gte: start, $lt: end },
    };

    console.log("query là:", query);

    const userTable = await User_table.find(query).populate({
      path: "user_id",
      select: "-password",
    });

    return res.status(200).json({
      status: 200,
      message: "success",
      data: userTable,
    });
  } catch (err) {
    console.error("Lỗi trong chương trình:", err);

    // response lỗi
    return res.status(500).json({
      status: 500,
      message: "error",
      error: err.message,
    });
  }
};

// đặt bàn
module.exports.postUserTable = async (req, res) => {
  const { table_id, time_date, slot_time } = req.body;
  console.log("req.body là : ", table_id, time_date, slot_time);

  const [year, month, day] = time_date.split("-").map(Number);

  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

  let userTable = await User_table.findOne({
    user_id: res.locals.user.id,
    table_id: table_id,
    time_date: { $gte: start, $lt: end },
  });

  if (!userTable) {
    console.log("chạy vào if");
    userTable = new User_table({
      user_id: res.locals._id,
      table_id,
      time_slot: Array.isArray(slot_time) ? slot_time : [slot_time],
      time_date: start, // lưu ngày chuẩn
      status: "active",
    });
    await userTable.save();
    console.log("✅ Tạo mới lịch:", userTable);
  } else {
    // Nếu đã có -> push thêm slot_time (tránh trùng lặp)
    const newSlots = Array.isArray(slot_time) ? slot_time : [slot_time];
    userTable.time_slot = Array.from(
      new Set([...userTable.time_slot, ...newSlots])
    );
    await userTable.save();
    console.log("✅ Cập nhật slot_time:", userTable);
  }
  const query = {
    status: "active",
    table_id: table_id,
    time_date: { $gte: start, $lt: end },
  };

  console.log("query là:", query);

  const newuserTable = await User_table.find(query).populate({
    path: "user_id",
    select: "-password",
  });
  return res.status(200).json({
    status: 200,
    message: "success",
    data: newuserTable,
  });
};

module.exports.updateProfile = async (req, res) => {
  try {
    const me = await user.findById(res.locals.user._id);
    if (!me) return res.status(404).json({ message: "User not found" });
    const { fullname, phone } = req.body;
    if (fullname !== undefined) me.fullname = fullname;
    if (phone !== undefined) me.phone = phone;

    // Nếu có file avatar, upload lên Cloudinary
    if (req.file && req.file.buffer) {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profiles" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      me.avatar = uploaded.secure_url;
    }

    await me.save();
    const safe = await user.findById(me._id).select("-password -refresh_token");
    return res.json({ message: "Profile updated", data: safe });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

// PUT /api/user/check/profile/password
module.exports.changePassword = async (req, res) => {
  try {
    const me = await user.findById(res.locals.user._id);
    if (!me) return res.status(404).json({ message: "User not found" });
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "Missing password fields" });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New password mismatch" });
    }

    const ok = bcrypt.compareSync(oldPassword, me.password);
    if (!ok) return res.status(400).json({ message: "Old password incorrect" });

    me.password = bcrypt.hashSync(newPassword, 10);
    await me.save();
    return res.json({ message: "Password updated" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports.sendMessage = async (req, res) => {
  try {
    // const senderIdInput = res.locals.user.id;
    const {senderIdInput} = req.body;
    const { contentInput } = req.body; // Dùng body để test trước
    const librarian = await user.findOne({
      _id: "68ef8d8d6846ef07d26538c8",
      status: "active",
    });
    if (!librarian) {
      return res.status(404).json({ message: "Không tìm thấy thủ thư" });
    }
    const message = new Message({
      sender_id: senderIdInput,
      receiver_id: librarian._id,
      content: contentInput,
      read: false,
    });
    await message.save();
    const conversation = await Conversation.findOne({
      librarian_id: librarian._id,
      user_id: senderIdInput,
    });
    if (!conversation) {
      const newConversation = new Conversation({
        librarian_id: librarian._id,
        user_id: senderIdInput,
        lastMessages: contentInput,
        lastMessagesTime: new Date(),
      });
      await newConversation.save();
    } else {
      conversation.lastMessages = contentInput;
      conversation.lastMessagesTime = new Date();
      await conversation.save();
    }

    res.status(200).json({ message: "Gửi tin nhắn thành công", data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.getMessageHistory = async (req, res) => {
  try {
    // const { senderIdInput } = res.locals.user.id;
    const senderIdInput = res.locals.user.id;
    const mongoose = require("mongoose");

    const librarian = await user.findOne({
      _id: new mongoose.Types.ObjectId("68ef8d8d6846ef07d26538c8"),
      status: "active",
    });

    if (!librarian) {
      return res.status(404).json({ message: "Không tìm thấy thủ thư" });
    }
    const messages = await Message.find({
      $or: [
        { sender_id: senderIdInput, receiver_id: librarian._id },
        { sender_id: librarian._id, receiver_id: senderIdInput },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json({ message: "Lịch sử tin nhắn", data: messages });
  } catch (error) {}
};
