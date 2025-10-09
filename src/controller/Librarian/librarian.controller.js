const Book = require("../../model/Book");
const userBook = require("../../model/User_book");
const Table = require("../../model/Table");

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
