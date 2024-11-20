const { Product } = require("../models");
const { Op } = require("sequelize");

exports.getAllProducts = async (req, res) => {
  console.log(req.query);
  const { name, brand, category, minPrice, maxPrice, description, sort } =
    req.query;

  // Tạo điều kiện tìm kiếm theo các giá trị được nhập
  const filters = {};
  if (name && name.trim() !== "") {
    filters[Op.or] = [
      { name: { [Op.iLike]: `%${name}%` } },
      { description: { [Op.iLike]: `%${name}%` } }
    ];
  }
  if (brand && brand.trim() !== "")
    filters.brand = { [Op.iLike]: `%${brand}%` };
  if (category && category.trim() !== "")
    filters.category = { [Op.iLike]: `%${category}%` };
  if (minPrice && !isNaN(minPrice))
    filters.price = { [Op.gte]: parseFloat(minPrice) };
  if (maxPrice && !isNaN(maxPrice))
    filters.price = { [Op.lte]: parseFloat(maxPrice) };

  try {
    let order = [];
    if (sort === "asc") {
      order = [["price", "ASC"]]; // Giá tăng dần
    } else if (sort === "desc") {
      order = [["price", "DESC"]]; // Giá giảm dần
    }
    const products = await Product.findAll({ where: filters, order: order });
    res.render("products/index", {
      products,
      sort,
      name,
      brand,
      category,
      minPrice,
      maxPrice,
      description,
    });
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

// exports.createProduct = async (req, res) => {
//   try {
//     await Product.create({
//       name: req.body.name,
//       description: req.body.description,
//       price: req.body.price,
//       category: req.body.category,
//       brand: req.body.brand,
//     });
//     res.redirect("/products");
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null; // Lấy đường dẫn ảnh từ req.file
    console.log(image);
    console.log(req.body); // In dữ liệu từ form (text fields)
    console.log(req.file);

    // Tạo sản phẩm mới với ảnh (nếu có)
    await Product.create({
      name,
      description,
      price,
      category,
      brand,
      image, // Lưu đường dẫn ảnh vào cơ sở dữ liệu
    });

    res.redirect("/products");
  } catch (error) {
    console.error(error);
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

exports.editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).render("404"); // Nếu không tìm thấy sản phẩm
    }

    res.render("products/edit", { product }); // Render trang chỉnh sửa
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, category, brand } = req.body;

    // Kiểm tra xem có ảnh mới được upload không
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).render("404"); // Nếu không tìm thấy sản phẩm
    }

    // Cập nhật sản phẩm
    await product.update({
      name,
      description,
      price,
      category,
      brand,
      image: image || product.image, // Giữ nguyên ảnh cũ nếu không upload ảnh mới
    });

    res.redirect(`/products/${productId}`); // Quay lại trang chi tiết sản phẩm
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
