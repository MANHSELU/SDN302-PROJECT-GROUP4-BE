const Book = require("../../model/Book");
const userBook = require("../../model/User_book");

module.exports.returnBorrowBook = async (req, res) => {
  try {
    const { user_id,book_id,borrow_Date} = req.body;
    const userBooking = await userBook.findOne({user_id,book_id,borrow_date: new Date(borrow_Date)});
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
    res.status(200).json({message: "Xác nhận trả sách thành công"});
  } catch (error) {
    res.status(500).json({ message : error.message});
  }
};
