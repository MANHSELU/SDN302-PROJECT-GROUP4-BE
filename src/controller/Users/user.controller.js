const Product = require("../../model/Book");
const Category = require("../../model/Category");

// Hàm Search và Filter Book theo category
exports.findAndFilterProductPaginated = async (req, res) => {
  try {
    const { categoryTitle = "",keyword = "", page = 1 } = req.query;
    const pageSize = 5;
    const skip = (page - 1) * pageSize; // ==> Bỏ qua sản phẩm để phân trang,Ví dụ: page = 2, limit = 5 → skip = 5
    // → bỏ 5 sản phẩm đầu, lấy sản phẩm từ thứ 6 trở đi.
    // Hàm lấy tất cả Product
    const allProductsQuery = { status: "active" };
    let allProducts = await Product.find(allProductsQuery).populate(
      "categori_id",
      "title"
    );
    //Hàm search product theo keyword
    const query = { title: { $regex: keyword, $options: "i" },status : "active"}
    allProducts = await Product.find(query);

    if (categoryTitle) {
      const categoryQuery = { title: categoryTitle };
      const category = await Category.findOne(categoryQuery);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    allProducts = allProducts.filter(p => // ==> Sau sửa lại 
  p.categori_id.some(cat => String(cat._id) === String(category._id))
);
    }
    const paginatedProducts = allProducts.slice(skip, skip + pageSize);
    const totalItems = allProducts.length;
    const totalPages = Math.ceil(totalItems / pageSize); // Tính tổng số page dựa trên sản phẩm đã tính
    res.json({
      page: page,  //trang hiện tại
      pageSize,   // số sản phẩm/trang
      totalItems, // tổng sản phẩm
      totalPages, // tổng page
      data: paginatedProducts, // danh sách sản phẩm phân trang
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
