const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/new', (req, res) => res.render('products/new'));
router.post('/', productController.createProduct);
router.get('/:id', productController.getProduct);
router.post('/:id/delete', productController.deleteProduct);

module.exports = router;