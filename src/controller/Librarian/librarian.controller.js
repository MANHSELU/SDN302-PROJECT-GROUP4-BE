const Book = require("../../model/Book");
const userBook = require("../../model/User_book");
const cloudinary = require("../../config/cloudinaryConfig");

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
    if (!req.files || req.files.length < 5) {
      return res.status(400).json({ message: "Phải upload ít nhất 5 ảnh." });
    }
    if (quantityInput <= 0) {
      return res.status(400).json({ message: "Số lượng sách phải lớn hơn 0." });
    }
    if (priceInput <= 0) {
      return res
        .status(400)
        .json({ message: "Giá tiền của sách phải lơn hơn 0." });
    }
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
  try {
    const allBook = await Book.find().populate("categori_id","title").populate("authors","name");
    if (!allBook) {
      return res.status(404).json({ message: "Không tìm thấy sách." });
    }
    return res
      .status(200)
      .json(allBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
