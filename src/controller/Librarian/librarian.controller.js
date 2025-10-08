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
    const { title, price = 0, status = "active" } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });
    const table = await Table.create({
      title,
      price: Number(price) || 0,
      status,
    });
    return res.status(201).json(table);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Danh sách (có thể xem cả deleted qua query)
module.exports.listTables = async (req, res) => {
  try {
    const { page = 1, limit = 10, includeDeleted = "false" } = req.query;
    const query = includeDeleted === "true" ? {} : { deleted: false };
    const [data, total] = await Promise.all([
      Table.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Table.countDocuments(query),
    ]);
    return res.json({
      data,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Chi tiết
module.exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });
    return res.json(table);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Cập nhật
module.exports.updateTable = async (req, res) => {
  try {
    const { title, price, status, deleted } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (price !== undefined) update.price = Number(price);
    if (status !== undefined) update.status = status;
    if (deleted !== undefined) update.deleted = Boolean(deleted);
    const table = await Table.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!table) return res.status(404).json({ message: "Table not found" });
    return res.json(table);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
//khôi phục
module.exports.restoreTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });
    if (!table.deleted)
      return res.status(400).json({ message: "Table is not deleted" });
    table.deleted = false;
    await table.save();
    return res.json({ message: "Restored", table });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
//xóa cứng
module.exports.hardDeleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });

    await Table.findByIdAndDelete(req.params.id);
    return res.json({ message: "Hard deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
// Xóa mềm
module.exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table || table.deleted)
      return res.status(404).json({ message: "Table not found" });
    table.deleted = true;
    await table.save();
    return res.json({ message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
