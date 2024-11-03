const { Product } = require('../models');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.render('products/index', { products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      res.render('products/show', { product });
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price
    });
    res.redirect('/products');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.destroy({
      where: { id: req.params.id }
    });
    res.redirect('/products');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};