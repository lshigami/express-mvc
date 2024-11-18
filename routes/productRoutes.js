// const express = require('express');
// const router = express.Router();
// const productController = require('../controllers/productController');

// router.get('/', productController.getAllProducts);
// router.get('/new', (req, res) => res.render('products/new'));
// router.post('/', productController.createProduct);
// router.get('/:id', productController.getProduct);
// router.post('/:id/delete', productController.deleteProduct);

// module.exports = router;

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middlewares/multer"); // Import middleware upload

router.get("/", productController.getAllProducts);
router.get("/:id/edit", productController.editProduct);
router.post("/:id", upload.single("image"), productController.updateProduct);
router.get("/new", (req, res) => res.render("products/new"));
router.post("/", upload.single("image"), productController.createProduct); // Thêm middleware upload
router.get("/:id", productController.getProduct);
router.post("/:id/delete", productController.deleteProduct);

module.exports = router;
