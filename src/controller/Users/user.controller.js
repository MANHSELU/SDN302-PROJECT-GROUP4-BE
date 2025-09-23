const Product = require("../../model/Book");

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
