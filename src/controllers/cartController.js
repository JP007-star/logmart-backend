// controllers/cartController.js

const Cart = require('../models/Cart');

// Get user's cart
async function getUserCart(req, res) {
  const userId = req.params.userId;

  try {
    const cart = await Cart.findOne({ userId });
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Add items to the cart
async function addToCart(req, res) {
  const userId = req.params.userId;
  const { productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity }] });
    } else {
      const existingItem = cart.items.find((item) => item.productId === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update item quantity in the cart
async function updateCartItem(req, res) {
  const userId = req.params.userId;
  const productId = req.params.productId;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: 'Item not found in the cart' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Clear the entire cart
async function clearCart(req, res) {
  const userId = req.params.userId;

  try {
    await Cart.findOneAndDelete({ userId });
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getUserCart,
  addToCart,
  updateCartItem,
  clearCart,
};
