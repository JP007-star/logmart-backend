// routes/cartRoutes.js

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { validateCartRequest } = require('../middleware/validator');

// Get user's cart
router.get('/cart/:userId', cartController.getUserCart);

// Add items to the cart
router.post('/add-cart/:userId', cartController.addToCart);

// Update item quantity in the cart
router.put('/:userId/update/:productId', validateCartRequest, cartController.updateCartItem);

// Clear the entire cart
router.delete('/:userId/clear', cartController.clearCart);

module.exports = router;
