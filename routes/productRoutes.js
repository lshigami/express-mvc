const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middlewares/upload');

// GET routes
router.get('/', productController.getAllProducts);
router.get('/new', (req, res) => {
  res.render('products/new');
});
router.get('/:id', productController.getProduct);
router.get('/:id/edit', productController.editProduct);

// POST routes
router.post('/', upload.single('image'), productController.createProduct);
router.post('/:id', upload.single('image'), productController.updateProduct);
router.post('/:id/delete', productController.deleteProduct);

module.exports = router;
