const Product = require("../../model/Book");
const Category = require("../../model/Category");

//Hàm search Book
exports.searchProduct = async (req, res) => {
  try {
    const { keyword } = req.body; 
    const query = { title: { $regex: keyword, $options: "i" },status : "active"}
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Hàm Filter Book theo category
exports.filterProductPaginated = async(req,res) =>{
  try {
    const {categoryTitle, page =1} = req.body;
    const pageSize = 5;
    const skip = (page - 1) * pageSize; // ==> Bỏ qua sản phẩm để phân trang,Ví dụ: page = 2, limit = 5 → skip = 5 
                                              // → bỏ 5 sản phẩm đầu, lấy sản phẩm từ thứ 6 trở đi.
    const categoryQuery = {title : categoryTitle};
    const category = await Category.findOne(categoryQuery);
      if (!category) {
      return res.status(404).json({ message: "Category not found" });
    };
    const query = {categori_id: category._id,status : "active"};
    const products = await Product.find(query).skip(skip).limit(pageSize);
    const totalItems = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalItems/pageSize); // Tính tổng số page dựa trên sản phẩm đã tính
   res.json({
      page: page,   // trang hiện tại
      pageSize: pageSize,    // số sản phẩm/trang
      totalItems,         // tổng sản phẩm
      totalPages,         // tổng page
      data: products      // danh sách sản phẩm phân trang
    });  } catch (err) {
    res.status(500).json({message: err.message});
  }
}
