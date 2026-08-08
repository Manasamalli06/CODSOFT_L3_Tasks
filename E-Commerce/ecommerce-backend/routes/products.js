const express = require('express');
const {
  getProducts,
  getProduct,
  getCategories,
} = require('../controllers/productController');

const router = express.Router();

router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProduct);

module.exports = router;
