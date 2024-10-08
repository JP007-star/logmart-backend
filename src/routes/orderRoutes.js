// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Get all orders
router.get('/orders', orderController.getAllOrders);

router.get('/invoice/:orderId', orderController.generateInvoicePdf);



// Create a new order
router.post('/order', orderController.createOrder);

module.exports = router;
