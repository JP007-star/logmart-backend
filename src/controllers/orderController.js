const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Create order and reduce stock quantities
async function createOrder(req, res) {
  const { userId, user, products, shippingAddress, totalAmount } = req.body;

  try {
    // Check and update stock quantities
    for (const product of products) {
      const { productId, quantity } = product;
      const dbProduct = await Product.findById(productId);

      if (!dbProduct) {
        return res.status(404).json({ message: `Product with ID ${productId} not found` });
      }

      if (dbProduct.quantity < quantity) {
        return res.status(400).json({ message: `Insufficient stock for product with ID ${productId}` });
      }

      // Reduce the product quantity in stock
      dbProduct.quantity -= quantity;
      await dbProduct.save();
    }

    // Create and save the order
    const order = new Order({
      userId,
      user,                // Adding user information
      products,            // Products array with detailed product info
      shippingAddress,     // Adding shipping address
      totalAmount,
    });

    const newOrder = await order.save();

    // Optionally, clear the cart after placing an order
    await Cart.findOneAndDelete({ userId });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(400).json({ message: error.message });
  }
}

// Get all orders
async function getAllOrders(req, res) {
  try {
    const orders = await Order.find();
    return res.status(200).json({
      orders,
      message: 'All orders retrieved successfully',
    });
  } catch (error) {
    console.error('Error retrieving orders:', error.message);
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createOrder,
  getAllOrders,
};
