const Cart = require('../models/Cart');
const Product = require('../models/Product');

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

// Add items to the cart and reduce product quantity in stock
async function addToCart(req, res) {
  const userId = req.params.userId;
  const items = req.body.items; // Expecting an array of items

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items array is required." });
  }

  try {
    let cart = await Cart.findOne({ userId }) || new Cart({ userId, items: [] });

    for (const item of items) {
      const { productId, quantity, price, productName, discount, image } = item;

      if (!productId || quantity == null) {
        return res.status(400).json({ message: "productId and quantity are required for each item." });
      }

      // Find if the item already exists in the cart
      const existingItem = cart.items.find(cartItem => cartItem.productId === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, price, productName, discount, image });
      }
    }

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

    // Calculate the difference in quantity
    const quantityDifference = quantity - item.quantity;

    // Update product stock based on quantity change
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.quantity < -quantityDifference) {
      return res.status(400).json({ message: 'Insufficient stock for product' });
    }

    // Adjust the stock quantity
    product.quantity -= quantityDifference;
    await product.save();

    // Update the cart item quantity
    item.quantity = quantity;

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
}


async function updateCartQuantity(req, res)  {
  const { userId, productId } = req.params;
  const { quantityChange } = req.body;

  try {
      // Find the cart for the given user
      const cart = await Cart.findOne({ userId });

      if (!cart) {
          return res.status(404).json({ message: 'Cart not found' });
      }

      // Find the item in the cart
      const item = cart.items.find(i => i.productId === productId);

      if (!item) {
          return res.status(404).json({ message: 'Item not found in cart' });
      }

      // Update the quantity
      item.quantity += quantityChange;

      // Prevent the quantity from being less than 1
      if (item.quantity < 1) {
          return res.status(400).json({ message: 'Quantity must be at least 1' });
      }

      // Save the updated cart
      await cart.save();

      // Respond with the updated cart
      res.status(200).json(cart);
  } catch (error) {
      res.status(500).json({ message: 'An error occurred while updating the cart', error });
  }
};

// Clear the entire cart and restore stock
async function clearCart(req, res) {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Restore stock quantities
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }

    // Delete the cart
    await Cart.deleteOne({ userId });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
}

// Delete a specific item from the cart and update stock
async function deleteCartItem(req, res) {
  const { userId, productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    const item = cart.items[itemIndex];

    // Restore the stock quantity for the product
    const product = await Product.findById(productId);
    if (product) {
      product.quantity += item.quantity;
      await product.save();
    }

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);

    // If cart is empty, delete it
    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId });
      return res.json({ message: 'Cart is empty and has been deleted' });
    }

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
  updateCartQuantity,
  clearCart,
  deleteCartItem
};
