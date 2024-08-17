// routes/cartRoutes.js

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { validateCartRequest } = require('../middleware/validator');

// Get user's cart
router.get('/cart/:userId', cartController.getUserCart);

// Add items to the cart
router.post('/cart/add-cart/:userId', cartController.addToCart);

// Update item quantity in the cart
router.put('/cart/:userId/update/:productId', validateCartRequest, cartController.updateCartItem);


router.put('/cart/:userId/item/:productId', cartController.updateCartQuantity);

// Clear the entire cart
router.delete('/cart/:userId', cartController.clearCart);

// Delete a specific item from the cart
router.delete('/cart/:userId/item/:productId', cartController.deleteCartItem);

module.exports = router;
