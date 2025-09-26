const Product = require("../../model/Book");
const Category = require("../../model/Category");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const user = require("./../../model/User");
const Book = require("../../model/Book");
const UserBook = require("../../model/User_book");
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
  res.status(response.state).json({ response });
};
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
    allProducts = await Product.find(query);

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

module.exports.borrowBookFunction = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách " });
    }
    if (book.quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Sách này đã hết. Vui lòng chọn sách khác" });
    }
    const userBook = new UserBook({
      user_id: res.locals.user._id,
      book_id: bookId,
      borrow_date: new Date(),
      book_detail: {
        price: book.price,
        date: book.date,
        transaction_type: "Booking_book",
      },
    });
    await userBook.save();
    book.quantity -= 1;
    await book.save();
    res.status(200).json({ message: "Mượn sách thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.get6category = async (req, res) => {
  const response = {};
  try {
    const Categorys = await Category.find({ status: "active" }).limit(6);
    Object.assign(response, {
      status: 500,
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
