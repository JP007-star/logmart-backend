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
  const items = req.body.items; // Expecting an array of items

  // Validate the request body
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items array is required." });
  }

  try {
    // Find the existing cart for the user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create a new cart if none exists
      cart = new Cart({ userId, items });
    } else {
      // Process each item from the request
      for (const item of items) {
        const { productId, quantity, price, productName, discount, image } = item;

        if (!productId || quantity == null) {
          return res.status(400).json({ message: "productId and quantity are required for each item." });
        }

        // Find if the item already exists in the cart
        const existingItemIndex = cart.items.findIndex(cartItem => cartItem.productId === productId);

        if (existingItemIndex !== -1) {
          // Update the quantity of the existing item
          cart.items[existingItemIndex].quantity += quantity;
          // Optionally update other fields if necessary
          cart.items[existingItemIndex].price = price;
          cart.items[existingItemIndex].productName = productName;
          cart.items[existingItemIndex].discount = discount;
          cart.items[existingItemIndex].image = image;
        } else {
          // Add a new item if it doesn't already exist
          cart.items.push({ productId, quantity, price, productName, discount, image });
        }
      }
    }

    // Remove duplicate items by consolidating quantities
    cart.items = cart.items.reduce((acc, current) => {
      const existingItem = acc.find(item => item.productId === current.productId);
      if (existingItem) {
        existingItem.quantity += current.quantity;
      } else {
        acc.push(current);
      }
      return acc;
    }, []);

    // Save the updated cart
    await cart.save();
    res.status(200).json(cart);
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
