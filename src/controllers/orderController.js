const Order = require('../models/Order');

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
async function createOrder(req, res) {
  const { userId, user, products, shippingAddress, totalAmount } = req.body;

  try {
    // Create and save the order with the additional fields
    const order = new Order({
      userId,
      user,                // Adding user information
      products,            // Products array with detailed product info
      shippingAddress,     // Adding shipping address
      totalAmount,
    });

    const newOrder = await order.save();

    // Update the cart with the new products
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
      message: 'All orders retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createOrder,
  getAllOrders,
};