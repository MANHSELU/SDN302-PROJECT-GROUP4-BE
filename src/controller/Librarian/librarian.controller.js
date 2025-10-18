const Book = require("../../model/Book");
const userBook = require("../../model/User_book");
const cloudinary = require("../../config/cloudinaryConfig");
const Table = require("../../model/Table");
const user = require("./../../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Author = require("./../../model/Author");
const Category = require("./../../model/Category");
const Conversation = require("../../model/Conversation");
const { sendToUser } = require("../../config/websocket");
//login thủ thư
module.exports.login = async (req, res) => {
  console.log("đang chạy vào login");
  const { email, password } = req.body;
  console.log("email và password là : ", email, password);
  const response = {};
  if (!email || !password) {
    Object.assign(response, {
      state: 404,
      message: "Email hoặc mật khẩu không được bỏ trống",
    });
  } else {
    try {
      const users = await user.findOne({ email });
      console.log("user là : ", users);
      // Không tìm thấy user
      if (!users) {
        Object.assign(response, {
          state: 404,
          message: "Email không tồn tại",
        });
      }

      // Check role_id nếu đây là login admin
      else if (users.role_id.toString() !== "68eccb84887849ea8f813f9c") {
        Object.assign(response, {
          state: 403,
          message: "Bạn không có quyền truy cập trang Admin",
        });
      }
      // Check mật khẩu
      else {
        const result = bcrypt.compareSync(password, users.password);
        if (!result) {
          Object.assign(response, {
            state: 400,
            message: "Sai mật khẩu",
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
      }
    } catch (e) {
      console.log("Lỗi server:", e.message);
      Object.assign(response, {
        state: 500,
        message: "Lỗi server",
      });
    }
  }
  res.status(response.state).json({ response });
};

// profile
module.exports.getProfile = async (req, res) => {
  const response = {
    status: 200,
    message: "Success",
    data: res.locals.user,
  };
  res.status(response.status).json(response);
};
const Message = require("../../model/Messages");
//Hàm trả sách
module.exports.returnBorrowBook = async (req, res) => {
  try {
    const { user_id, book_id, borrow_Date } = req.body;
    const userBooking = await userBook.findOne({
      user_id,
      book_id,
      borrow_date: new Date(borrow_Date),
    });
    if (!userBooking) {
      return res.status(404).json({ messsage: "Không tìm thấy lịch đặt" });
    }
    if (userBooking.status === "returned") {
      return res
        .status(400)
        .json({ messsage: "Lịch đặt này đã được hủy trước đó" });
    }
    const returnQuantity = userBooking.quantity;
    userBooking.quantity = 0;
    userBooking.status = "returned";
    userBooking.return_date = new Date();
    const book = await Book.findById(book_id);
    book.quantity += Number(returnQuantity);
    await book.save();
    await userBooking.save();
    res.status(200).json({ message: "Xác nhận trả sách thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Hàm thêm sách
module.exports.AddNewBooks = async (req, res) => {
  try {
    const {
      tittleInput,
      quantityInput,
      published_yearInput,
      categoryInput,
      authorsInput,
      shelfInput,
      rowInput,
      columnInput,
      priceInput,
      descriptionInput,
    } = req.body;
    if (
      !tittleInput ||
      !quantityInput ||
      !published_yearInput ||
      !categoryInput ||
      !authorsInput ||
      !shelfInput ||
      !rowInput ||
      !columnInput ||
      !priceInput ||
      !descriptionInput
    ) {
      return res.status(400).json({ message: "Không được để trống các ô." });
    }
    console.log("1");
    console.log("req file là : ", req.files);
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ message: "Phải upload ít nhất 5 ảnh." });
    }
    console.log("2");
    if (quantityInput <= 0) {
      return res.status(400).json({ message: "Số lượng sách phải lớn hơn 0." });
    }
    console.log("3");
    if (priceInput <= 0) {
      return res
        .status(400)
        .json({ message: "Giá tiền của sách phải lơn hơn 0." });
    }
    console.log("5");
    const imgUrls = [];
    for (const file of req.files) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "SDN302-PROJECT-IMAGES" },
          (error, result) => {
            if (error) reject(error); // nếu upload thất bại -> reject promise
            else resolve(result); // nếu thành công -> resolve với result (thông tin ảnh)
          }
        );
        stream.end(file.buffer); // đưa dữ liệu ảnh từ RAM (buffer) vào stream
      });
      imgUrls.push(uploadResult.secure_url); // lấy URL trả về từ Cloudinary, thêm vào mảng
    }
    const newBook = new Book({
      title: tittleInput,
      quantity: quantityInput,
      published_year: published_yearInput,
      categori_id: categoryInput,
      authors: authorsInput,
      shelf: shelfInput,
      row: rowInput,
      column: columnInput,
      price: priceInput,
      decription: descriptionInput,
      image: imgUrls,
    });
    await newBook.save();
    res.status(200).json({ message: "Thêm sách thành công", data: newBook });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Hàm cập nhật sách
module.exports.UpdateBooks = async (req, res) => {
  try {
    const { bookIdInput } = req.params;
    const {
      tittleInput,
      quantityInput,
      published_yearInput,
      categoryInput,
      authorsInput,
      shelfInput,
      rowInput,
      columnInput,
      priceInput,
      descriptionInput,
    } = req.body;

    if (quantityInput <= 0) {
      return res.status(400).json({ message: "Số lượng sách phải lớn hơn 0." });
    }
    if (priceInput <= 0) {
      return res
        .status(400)
        .json({ message: "Giá tiền của sách phải lơn hơn 0." });
    }
    const updateBooked = await Book.findByIdAndUpdate(
      bookIdInput,
      {
        title: tittleInput,
        quantity: quantityInput,
        published_year: published_yearInput,
        categori_id: categoryInput,
        authors: authorsInput,
        shelf: shelfInput,
        row: rowInput,
        column: columnInput,
        price: priceInput,
        decription: descriptionInput,
      },
      { new: true }
    );

    if (!updateBooked) {
      return res.status(500).json({ message: "Không tìm thấy sách." });
    }
    return res
      .status(200)
      .json({ message: "Update sách thành công.", data: updateBooked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Hàm xóa sách
module.exports.DeleteBook = async (req, res) => {
  try {
    const { bookIdInput } = req.params;
    const deleteBook = await Book.findByIdAndDelete(bookIdInput);
    if (!deleteBook) {
      return res.status(404).json({ message: "Không tìm thấy sách." });
    }
    return res.status(200).json({ message: "Xóa sách thành công" });
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};
module.exports.GetAllBook = async (req, res) => {
  console.log("chạy vào getallboook");
  try {
    const allBook = await Book.find()
      .populate("categori_id", "title")
      .populate("authors", "name");
    if (!allBook) {
      return res.status(404).json({ message: "Không tìm thấy sách." });
    }
    return res.status(200).json(allBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Tạo bàn
module.exports.createTable = async (req, res) => {
  try {
    let { title, price = 0, status = "active" } = req.body;
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Tiêu đề không hợp lệ" });
    }
    const p = Number(price);
    if (Number.isNaN(p) || p < 0) {
      return res.status(400).json({ message: "Giá phải lớn hơn hoặc bằng 0" });
    }
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }
    const table = await Table.create({ title: title.trim(), price: p, status });
    return res.status(201).json({ message: "Tạo bàn thành công", data: table });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Danh sách
module.exports.listTables = async (req, res) => {
  console.log("chạy vào list table ");
  try {
    const { page = 1, limit = 10, includeDeleted = "false" } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const query = includeDeleted === "true" ? {} : { deleted: false };

    const [data, total] = await Promise.all([
      Table.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Table.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "Lấy danh sách bàn thành công",
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.max(Math.ceil(total / limitNum), 1),
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Chi tiết
module.exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Không tìm thấy bàn" });
    return res
      .status(200)
      .json({ message: "Lấy chi tiết bàn thành công", data: table });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Cập nhật
module.exports.updateTable = async (req, res) => {
  try {
    const update = {};
    if (req.body.title !== undefined) {
      if (typeof req.body.title !== "string" || !req.body.title.trim()) {
        return res.status(400).json({ message: "Tiêu đề không hợp lệ" });
      }
      update.title = req.body.title.trim();
    }
    if (req.body.price !== undefined) {
      const p = Number(req.body.price);
      if (Number.isNaN(p) || p < 0) {
        return res
          .status(400)
          .json({ message: "Giá phải lớn hơn hoặc bằng 0" });
      }
      update.price = p;
    }
    if (req.body.status !== undefined) {
      if (!["active", "inactive"].includes(req.body.status)) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }
      update.status = req.body.status;
    }
    // không cho update trực tiếp 'deleted'
    const table = await Table.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!table) return res.status(404).json({ message: "Không tìm thấy bàn" });
    return res.json({ message: "Cập nhật bàn thành công", data: table });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Khôi phục
module.exports.restoreTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Không tìm thấy bàn" });
    if (!table.deleted) {
      return res.status(400).json({ message: "Bàn chưa bị xóa" });
    }
    table.deleted = false;
    await table.save();
    return res
      .status(200)
      .json({ message: "Khôi phục bàn thành công", data: table });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Xóa cứng
module.exports.hardDeleteTable = async (req, res) => {
  try {
    const deleted = await Table.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy bàn" });
    return res.status(200).json({ message: "Xóa vĩnh viễn bàn thành công" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Xóa mềm
module.exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Không tìm thấy bàn" });
    if (table.deleted) {
      return res.status(400).json({ message: "Bàn đã bị xóa mềm" });
    }
    table.deleted = true;
    await table.save();
    return res
      .status(200)
      .json({ message: "Xóa mềm bàn thành công", data: table });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
// lấy ra tác giả
module.exports.getauthor = async (req, res) => {
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
module.exports.getcategory = async (req, res) => {
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

// Lấy tất cả cuộc hội thoại
module.exports.getAllConversations = async (req, res) => {
  try {
    const conversation = await Conversation.find()
      .populate("user_id", "fullname avatar")
      .populate()
      .sort({ lastMessagesTime: -1 });
    if (!conversation) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy cuộc hội thoại." });
    }
    res
      .status(200)
      .json({
        message: "Lấy danh sách cuộc hội thoại thành công.",
        data: conversation,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Gửi tin nhắn
module.exports.sendMessage = async (req, res) => {
  try {
    const senderIdInput = res.locals.user.id;
    const { userIdInput } = req.params;
    const { contentInput } = req.body;
    const message = new Message({
      sender_id: senderIdInput,
      receiver_id: userIdInput,
      content: contentInput,
      read: false,
    });
    await message.save();
    sendToUser(userIdInput, {
      type: "new_message",
      data: message,
    });
    res.status(200).json({ message: "Gửi tin nhắn thành công", data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy tin nhắn
module.exports.getMessageHistory = async (req, res) => {
  try {
    const senderIdInput = res.locals.user.id;
    //const {senderIdInput} = req.body; // Dùng body để test trước
    const { userIdInput } = req.params;
    const messages = await Message.find({
      $or: [
        { sender_id: senderIdInput, receiver_id: userIdInput },
        { sender_id: userIdInput, receiver_id: senderIdInput },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json({ message: "Lịch sử tin nhắn", data: messages });
  } catch (error) {}
};
