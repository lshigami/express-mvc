const { Product } = require("../models");
const { Op } = require("sequelize");

exports.getAllProducts = async (req, res) => {
  console.log(req.query);
  const { name, brand, category, minPrice, maxPrice, description } = req.query;

  // Tạo điều kiện tìm kiếm theo các giá trị được nhập
  const filters = {};
  if (name && name.trim() !== "") filters.name = { [Op.iLike]: `%${name}%` };
  if (description && description.trim() !== "")
    filters.description = { [Op.iLike]: `%${description}%` };
  if (brand && brand.trim() !== "")
    filters.brand = { [Op.iLike]: `%${brand}%` };
  if (category && category.trim() !== "")
    filters.category = { [Op.iLike]: `%${category}%` };
  if (minPrice && !isNaN(minPrice))
    filters.price = { [Op.gte]: parseFloat(minPrice) };
  if (maxPrice && !isNaN(maxPrice))
    filters.price = { [Op.lte]: parseFloat(maxPrice) };

  try {
    const products = await Product.findAll({ where: filters });
    res.render("products/index", { products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Tìm sản phẩm hiện tại
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).render("404");
    }

    // Tìm các sản phẩm liên quan trong cùng category
    const relatedProducts = await Product.findAll({
      where: {
        category: product.category,
        id: { [Op.ne]: productId }, // Loại bỏ sản phẩm hiện tại
      },
      limit: 10, // Giới hạn số lượng sản phẩm liên quan (tùy chỉnh theo ý bạn)
    });

    // Truyền sản phẩm và các sản phẩm liên quan vào view
    res.render("products/show", { product, relatedProducts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      brand: req.body.brand,
    });
    res.redirect("/products");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.destroy({
      where: { id: req.params.id },
    });
    res.redirect("/products");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
