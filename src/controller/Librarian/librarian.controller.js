const userBook = require("../../model/User_book");

module.exports.returnBorrowBook = async (req, res) => {
  try {
    const { user_id } = req.body;
    const userBooking = await userBook.findOne({user_id});
    if (!userBooking) {
      return res.status(404).json({ messsage: "Không tìm thấy lịch đặt" });
    }
    if (userBooking.status === "returned") {
      return res
        .status(400)
        .json({ messsage: "Lịch đặt này đã được hủy trước đó" });
    }
    userBooking.status = "returned";
    userBooking.return_date = new Date();
    userBooking.save();
    res.status(200).json({message: "Xác nhận trả sách thành công"});
  } catch (error) {
    res.status(500).json({ message : error.message});
  }
};
