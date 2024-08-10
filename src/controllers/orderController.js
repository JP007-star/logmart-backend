// controllers/orderController.js

const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Function to update the user's cart
async function updateCart(userId, products) {
  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // If the user doesn't have a cart, create a new one
      cart = new Cart({ userId, items: products });
    } else {
      // Update the existing cart
      products.forEach((product) => {
        const existingItem = cart.items.find((item) => item.productId === product.productId);

        if (existingItem) {
          existingItem.quantity += product.quantity;
        } else {
          cart.items.push(product);
        }
      });
    }

    // Save the updated cart
    await cart.save();
  } catch (error) {
    console.error('Error updating cart:', error.message);
  }
}

// Create a new order
async function createOrder(req, res) {
  const { userId, products, totalAmount } = req.body;

  try {
    // Save the order
    const order = new Order({ userId, products, totalAmount });
    const newOrder = await order.save();

    // Update the cart
    await updateCart(userId, products);

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Get all orders
async function getAllOrders(req, res) {
  try {
    const orders = await Order.find();
    return res.status(200).json({
      orders,
      message: 'All orders retrieved successfully'
  });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createOrder,
  getAllOrders,
};
