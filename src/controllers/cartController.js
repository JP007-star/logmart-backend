const Cart = require('../models/Cart');

// Get user's cart
async function getUserCart(req, res) {
  const userId = req.params.userId;

  try {
    const cart = await Cart.findOne({ userId });
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
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
    // Find the existing cart for the user or create a new one
    let cart = await Cart.findOne({ userId }) || new Cart({ userId, items: [] });

    for (const item of items) {
      const { productId, quantity, price, productName, discount, image } = item;

      if (!productId || quantity == null) {
        return res.status(400).json({ message: "productId and quantity are required for each item." });
      }

      // Find if the item already exists in the cart
      const existingItem = cart.items.find(cartItem => cartItem.productId === productId);

      if (existingItem) {
        // Update the quantity and optionally other fields if necessary
        existingItem.quantity += quantity;
        existingItem.price = price;
        existingItem.productName = productName;
        existingItem.discount = discount;
        existingItem.image = image;
      } else {
        // Add a new item if it doesn't already exist
        cart.items.push({ productId, quantity, price, productName, discount, image });
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
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
}

// Update item quantity in the cart
async function updateCartItem(req, res) {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(item => item.productId === productId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.quantity = quantity;

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
}

// Clear the entire cart
async function clearCart(req, res) {
  const { userId } = req.params;

  try {
    const result = await Cart.deleteOne({ userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
}

// Delete a specific item from the cart
async function deleteCartItem(req, res) {
  const { userId, productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const updatedItems = cart.items.filter(item => item.productId !== productId);

    if (updatedItems.length === 0) {
      await Cart.deleteOne({ userId });
      return res.json({ message: 'Cart is empty and has been deleted' });
    }

    cart.items = updatedItems;
    await cart.save();

    res.json({ message: 'Item deleted from cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item from cart', error: error.message });
  }
}

module.exports = {
  getUserCart,
  addToCart,
  updateCartItem,
  clearCart,
  deleteCartItem
};
