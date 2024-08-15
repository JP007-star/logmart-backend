// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products
router.get('/products', productController.getAllProducts);

// Get a single product by ID
router.get('/products/:id', productController.getProductById);

// Create a new product
router.post('/products', productController.createProduct);

// Update a product by ID
router.put('/products/:id', productController.updateProductById);
router.get('/generate-pdf', productController.generatePdfForAllProducts);

// Delete a product by ID
router.delete('/products/:id', productController.deleteProductById);

module.exports = router;
